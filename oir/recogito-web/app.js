(() => {
  'use strict';

  const datasetSelect = document.getElementById('dataset-select');
  const fileInput = document.getElementById('file-input');
  const searchInput = document.getElementById('search-input');
  const entriesContainer = document.getElementById('entries');
  const summaryContent = document.getElementById('summary-content');
  const exportButton = document.getElementById('export-btn');
  const resetButton = document.getElementById('reset-btn');
  const datasetLabel = document.getElementById('dataset-label');

  const BUILT_IN_DATASETS = [
    {
      id: 'annals-connacht',
      label: 'Annals of Connacht (1224-1544)',
      path: '../../annals_ireland/annals_connacht.jsonld'
    }
  ];

  const MAX_ANNOTATION_LIST = 300;

  let recogitoInstances = [];
  let currentEntries = [];
  let currentDatasetLabel = '';

  init();

  function init() {
    populateDatasetSelector();
    datasetSelect.addEventListener('change', (event) => {
      const datasetId = event.target.value;
      if (datasetId) {
        loadBuiltInDataset(datasetId);
      }
    });

    fileInput.addEventListener('change', handleFileUpload);
    searchInput.addEventListener('input', filterEntries);
    exportButton.addEventListener('click', exportAnnotations);
    resetButton.addEventListener('click', resetAnnotations);

    if (BUILT_IN_DATASETS.length) {
      datasetSelect.value = BUILT_IN_DATASETS[0].id;
      loadBuiltInDataset(BUILT_IN_DATASETS[0].id);
    } else {
      showEntriesMessage(
        'No datasets have been configured yet. Use the file picker to load a JSON-LD file.',
        false,
        { clearLabel: true, resetState: true }
      );
    }
  }

  function populateDatasetSelector() {
    datasetSelect.innerHTML = '';

    BUILT_IN_DATASETS.forEach((dataset) => {
      const option = document.createElement('option');
      option.value = dataset.id;
      option.textContent = dataset.label;
      datasetSelect.appendChild(option);
    });
  }

  async function loadBuiltInDataset(datasetId) {
    const dataset = BUILT_IN_DATASETS.find((item) => item.id === datasetId);
    if (!dataset) {
      return;
    }

    currentDatasetLabel = dataset.label || '';
    datasetLabel.textContent = dataset.label ? `${dataset.label} — loading…` : 'Loading dataset…';
    showEntriesMessage('Loading dataset…', false, { resetState: true });
    clearSummary();
    disableExport();

    try {
      const response = await fetch(dataset.path);
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const jsonld = await response.json();
      handleLoadedData(jsonld, dataset.label);
    } catch (error) {
      console.error('Failed to load dataset:', error);
      datasetLabel.textContent = dataset.label
        ? `${dataset.label} — failed to load`
        : 'Failed to load dataset';
      showEntriesMessage(
        'Unable to load the dataset. Ensure the development server is running from the repository root.',
        true,
        { resetState: true }
      );
    }
  }

  function handleFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    currentDatasetLabel = file.name || '';
    datasetLabel.textContent = file.name ? `${file.name} — loading…` : 'Reading local file…';
    showEntriesMessage('Reading local file…', false, { resetState: true });
    clearSummary();
    disableExport();

    reader.onload = () => {
      try {
        const jsonld = JSON.parse(reader.result);
        handleLoadedData(jsonld, file.name);
      } catch (error) {
        console.error('Failed to parse local JSON-LD file:', error);
        showEntriesMessage('The selected file is not valid JSON-LD.', true);
      }
    };

    reader.onerror = () => {
      console.error('Failed to read file:', reader.error);
      showEntriesMessage('The selected file could not be read.', true);
    };

    reader.readAsText(file);
  }

  function handleLoadedData(jsonld, label) {
    const entries = parseJsonLd(jsonld);
    if (!entries.length) {
      currentEntries = [];
      currentDatasetLabel = label;
      datasetLabel.textContent = label ? `${label} — 0 entries` : '';
      showEntriesMessage('The selected dataset does not contain any textual entries.', true);
      clearSummary();
      return;
    }

    currentEntries = entries;
    currentDatasetLabel = label || '';
    datasetLabel.textContent = label ? `${label} — ${entries.length} entries` : `${entries.length} entries`;
    searchInput.value = '';
    renderEntries(entries);
  }

  function parseJsonLd(payload) {
    const graph = Array.isArray(payload) ? payload : payload && payload['@graph'];
    if (!Array.isArray(graph)) {
      return [];
    }

    return graph
      .map((node, index) => {
        if (!node || typeof node !== 'object') {
          return null;
        }

        const description = getFirst(node, ['dc:description', 'description', 'text', 'value']);
        if (!description || typeof description !== 'string') {
          return null;
        }

        return {
          index,
          id: node['@id'] || node.id || '',
          date: getFirst(node, ['dc:date', 'date', 'when', 'time']),
          source: getFirst(node, ['dc:source', 'source', 'collection']),
          description: description.trim(),
          raw: node
        };
      })
      .filter((entry) => Boolean(entry));
  }

  function getFirst(node, keys) {
    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(node, key) && node[key]) {
        const value = node[key];
        if (Array.isArray(value)) {
          const first = value.find((item) => typeof item === 'string' && item.trim().length);
          if (first) {
            return first;
          }
          const nonString = value.find((item) => typeof item === 'number');
          if (typeof nonString === 'number') {
            return String(nonString);
          }
        } else if (typeof value === 'string') {
          return value;
        } else if (typeof value === 'number') {
          return String(value);
        }
      }
    }
    return '';
  }

  function renderEntries(entries) {
    destroyRecogitoInstances();
    entriesContainer.innerHTML = '';

    if (!ensureRecogitoAvailable()) {
      return;
    }

    const fragment = document.createDocumentFragment();

    entries.forEach((entry, position) => {
      const article = document.createElement('article');
      article.className = 'entry';
      article.dataset.search = [entry.date, entry.source, entry.description].join(' ').toLowerCase();
      article.dataset.entryId = entry.id || `entry-${position + 1}`;

      const header = document.createElement('div');
      header.className = 'entry-header';

      const dateElement = document.createElement('span');
      dateElement.className = 'entry-date';
      dateElement.textContent = entry.date || 'Undated';

      const sourceElement = document.createElement('span');
      sourceElement.className = 'entry-source';
      sourceElement.textContent = entry.source || currentDatasetLabel || 'Unknown source';

      const numberElement = document.createElement('span');
      numberElement.className = 'entry-number';
      numberElement.textContent = `Entry ${position + 1}${entry.id ? ` • ${entry.id}` : ''}`;

      header.append(dateElement, sourceElement, numberElement);

      const textElement = document.createElement('div');
      textElement.className = 'entry-text';
      textElement.id = `entry-text-${position + 1}`;
      textElement.textContent = entry.description;

      article.append(header, textElement);
      fragment.appendChild(article);

      const instance = new Recogito({
        content: textElement,
        widgets: [
          'COMMENT',
          {
            widget: 'TAG',
            vocabulary: ['Person', 'Place', 'Event']
          }
        ]
      });

      instance.on('createAnnotation', refreshSummary);
      instance.on('updateAnnotation', refreshSummary);
      instance.on('deleteAnnotation', refreshSummary);

      recogitoInstances.push({ instance, entry });
    });

    entriesContainer.appendChild(fragment);
    refreshSummary();
  }

  function ensureRecogitoAvailable() {
    if (typeof Recogito === 'undefined') {
      showEntriesMessage(
        'RecogitoJS could not be loaded. Please check your internet connection.',
        true
      );
      clearSummary('RecogitoJS is required for annotation. Please check your internet connection and reload the page.');
      disableExport();
      return false;
    }
    return true;
  }

  function destroyRecogitoInstances() {
    recogitoInstances.forEach(({ instance }) => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
    recogitoInstances = [];
  }

  function filterEntries() {
    const query = (searchInput.value || '').trim().toLowerCase();
    const entries = entriesContainer.querySelectorAll('.entry');
    entries.forEach((element) => {
      const haystack = element.dataset.search || '';
      if (!query) {
        element.classList.remove('hidden');
      } else {
        element.classList.toggle('hidden', !haystack.includes(query));
      }
    });
  }

  function refreshSummary() {
    const annotations = collectAnnotations();

    if (!annotations.length) {
      clearSummary('No annotations yet. Tag people, places, and events to see live counts.');
      disableExport();
      return;
    }

    const totals = {
      total: annotations.length,
      person: 0,
      place: 0,
      event: 0,
      untagged: 0,
      other: {}
    };

    annotations.forEach(({ annotation }) => {
      const tags = getAnnotationTags(annotation);
      if (!tags.length) {
        totals.untagged += 1;
      }
      tags.forEach((tag) => {
        const key = tag.toLowerCase();
        if (key === 'person') {
          totals.person += 1;
        } else if (key === 'place') {
          totals.place += 1;
        } else if (key === 'event') {
          totals.event += 1;
        } else {
          totals.other[key] = (totals.other[key] || 0) + 1;
        }
      });
    });

    summaryContent.innerHTML = '';
    summaryContent.appendChild(createCountCard('Total', totals.total, 'All annotations in view'));
    summaryContent.appendChild(createCountCard('People', totals.person, 'Annotations tagged as Person'));
    summaryContent.appendChild(createCountCard('Places', totals.place, 'Annotations tagged as Place'));
    summaryContent.appendChild(createCountCard('Events', totals.event, 'Annotations tagged as Event'));

    if (totals.untagged) {
      summaryContent.appendChild(createCountCard('Untagged', totals.untagged, 'Annotations without tags'));
    }

    Object.entries(totals.other).forEach(([key, value]) => {
      summaryContent.appendChild(
        createCountCard(capitalize(key), value, 'Custom tag')
      );
    });

    summaryContent.appendChild(createAnnotationDetails(annotations));
    exportButton.disabled = false;
  }

  function clearSummary(message) {
    summaryContent.innerHTML = '';
    const placeholder = document.createElement('p');
    placeholder.className = 'placeholder';
    placeholder.textContent = message || 'No annotations yet.';
    summaryContent.appendChild(placeholder);
  }

  function disableExport() {
    exportButton.disabled = true;
  }

  function collectAnnotations() {
    const aggregated = [];
    recogitoInstances.forEach(({ instance, entry }) => {
      if (!instance || typeof instance.getAnnotations !== 'function') {
        return;
      }
      const annotations = instance.getAnnotations() || [];
      annotations.forEach((annotation) => {
        aggregated.push({ annotation, entry });
      });
    });
    return aggregated;
  }

  function getAnnotationTags(annotation) {
    const bodies = annotation && (annotation.body || annotation.bodies);
    if (!Array.isArray(bodies)) {
      return [];
    }
    return bodies
      .filter((body) => body && body.purpose === 'tagging')
      .map((body) => body.value || body.label || body.id || '')
      .filter(Boolean);
  }

  function getAnnotationQuote(annotation) {
    if (!annotation) {
      return '';
    }

    if (annotation.quote) {
      return annotation.quote;
    }

    const target = annotation.target || {};
    const selector = target.selector;

    if (Array.isArray(selector)) {
      const quoteSelector = selector.find((item) => item && item.type === 'TextQuoteSelector');
      if (quoteSelector && quoteSelector.exact) {
        return quoteSelector.exact;
      }
    } else if (selector && selector.exact) {
      return selector.exact;
    }

    return '';
  }

  function createCountCard(title, count, description) {
    const card = document.createElement('div');
    card.className = 'tag-count';

    const valueElement = document.createElement('strong');
    valueElement.textContent = count;

    const titleElement = document.createElement('span');
    titleElement.textContent = title;

    const descriptionElement = document.createElement('small');
    descriptionElement.textContent = description;

    card.append(valueElement, titleElement, descriptionElement);
    return card;
  }

  function createAnnotationDetails(annotations) {
    const details = document.createElement('details');
    details.className = 'annotation-details';
    if (annotations.length <= 10) {
      details.open = true;
    }

    const summary = document.createElement('summary');
    summary.textContent = `Annotations (${annotations.length})`;
    details.appendChild(summary);

    const list = document.createElement('ul');
    list.className = 'annotation-list';

    const trimmed = annotations.slice(0, MAX_ANNOTATION_LIST);

    trimmed.forEach(({ annotation, entry }) => {
      const tags = getAnnotationTags(annotation);
      const quote = truncateText(getAnnotationQuote(annotation) || '(no quote selected)', 220);
      const listItem = document.createElement('li');

      const tagElement = document.createElement('span');
      tagElement.className = 'annotation-tag';
      tagElement.textContent = tags.length ? tags.join(', ') : 'Untagged';

      const quoteElement = document.createElement('span');
      quoteElement.className = 'annotation-quote';
      quoteElement.textContent = quote;

      const metaElement = document.createElement('span');
      metaElement.className = 'annotation-meta';
      metaElement.textContent = `${entry.date || 'Undated'} • Entry ${entry.index + 1}`;

      listItem.append(tagElement, quoteElement, metaElement);
      list.appendChild(listItem);
    });

    if (annotations.length > trimmed.length) {
      const remainder = document.createElement('li');
      remainder.className = 'annotation-note';
      remainder.textContent = `…and ${annotations.length - trimmed.length} more annotations.`;
      list.appendChild(remainder);
    }

    details.appendChild(list);
    return details;
  }

  function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    return `${text.slice(0, maxLength - 1)}…`;
  }

  function capitalize(text) {
    if (!text) {
      return '';
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function exportAnnotations() {
    const annotations = collectAnnotations();
    if (!annotations.length) {
      return;
    }

    const exportPayload = annotations.map(({ annotation, entry }) => ({
      entry: {
        index: entry.index,
        id: entry.id || null,
        date: entry.date || null,
        source: entry.source || null
      },
      annotation
    }));

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json'
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = slugify(currentDatasetLabel || 'annotations');
    const filename = `${baseName || 'annotations'}-${timestamp}.json`;

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  function resetAnnotations() {
    if (!currentEntries.length) {
      return;
    }
    renderEntries(currentEntries);
    disableExport();
  }

  function showEntriesMessage(message, isError, options = {}) {
    const { clearLabel = false, resetState = false } = options;

    destroyRecogitoInstances();

    if (resetState) {
      currentEntries = [];
    }

    if (clearLabel) {
      currentDatasetLabel = '';
      datasetLabel.textContent = '';
    }

    entriesContainer.innerHTML = '';
    const paragraph = document.createElement('p');
    paragraph.className = `placeholder${isError ? ' error' : ''}`;
    paragraph.textContent = message;
    entriesContainer.appendChild(paragraph);
  }
})();
