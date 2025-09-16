# OIR Components

This folder contains experimental tooling that supports working with the OIR material in this repository.

## Recogito web component

The [`recogito-web`](recogito-web/) directory bundles a small static web application that embeds the [Recogito](https://recogito.pelagios.org/) annotation environment for the JSON-LD texts that live in this repository. It allows the OIR material to be explored and annotated directly in a browser without needing to upload or download data manually.

### Running locally

1. Start a local HTTP server from the repository root so that the relative paths resolve correctly:
   ```bash
   python -m http.server 8000
   ```
2. Navigate to [http://localhost:8000/oir/recogito-web/](http://localhost:8000/oir/recogito-web/) in a modern browser.
3. Pick one of the built-in JSON-LD datasets from the drop-down or load your own `.jsonld`/`.json` file through the file picker.
4. Annotate the text with **Person**, **Place**, and **Event** tags using the Recogito interface. A summary panel keeps track of the tag counts as you work.
5. Use the export button to download the annotations for further processing.

The page loads RecogitoJS and its stylesheet from a CDN, so an internet connection is required for the annotation widget to function. The list of built-in datasets can be customised in [`recogito-web/app.js`](recogito-web/app.js).

### Features

- Parses the JSON-LD `@graph` structure and renders individual entries with their metadata.
- Embeds RecogitoJS on every entry so that entities can be tagged directly in the browser.
- Tracks Person/Place/Event tags across the whole dataset and displays live counts.
- Provides simple text/year filtering as well as annotation export in JSON format.

