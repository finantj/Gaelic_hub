# Gaelic Hub - Medieval Irish Historical Data Repository

Gaelic Hub is a static data repository containing linked open data sets related to medieval Ireland (1100-1500). The repository stores historical sources as JSON-LD files, HTML pages for excavation sites, and various XML indices.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Repository Setup and Validation
- Clone repository: `git clone https://github.com/finantj/Gaelic_hub.git`
- Navigate to repository: `cd Gaelic_hub`
- **NO BUILD REQUIRED** - This is a static data repository with no compilation step
- Validate JSON-LD files: `jq . <filename>.jsonld > /dev/null && echo "Valid JSON" || echo "Invalid JSON"`
- Extract zip files: `unzip <filename>.zip` (for large datasets like townlands)

### Serving the Repository Locally
- Start local web server: `python3 -m http.server 8000` (starts in < 5 seconds)
- Access at: `http://localhost:8000`
- **NEVER CANCEL** - Server starts immediately, no timeout needed
- View excavation sites: Navigate to `/excavations/<site-name>/` in browser
- Stop server: `Ctrl+C` or `kill` the process

### Data Validation
- Validate all JSON-LD files: `find . -name "*.jsonld" -exec jq . {} \; > /dev/null && echo "All JSON-LD files valid"`
- Check file integrity: `file <filename>` to verify file types
- Test web accessibility: `curl -s http://localhost:8000/<path>` after starting server

## Validation Scenarios

**CRITICAL**: After making any changes to data files, always run these validation steps:

1. **JSON-LD Syntax Validation**:
   ```bash
   jq . Irish_names/surnames.jsonld > /dev/null
   jq . annals_ireland/annals_connacht.jsonld > /dev/null  
   jq . NMI_artifacts/NMI_artifact_vocab.jsonld > /dev/null
   ```

2. **Web Server Test**:
   ```bash
   python3 -m http.server 8000 &
   curl -s http://localhost:8000/ | grep "Directory listing"
   curl -s http://localhost:8000/excavations/caherconnel/ 
   kill %1
   ```

3. **Data Extraction Test**:
   ```bash
   cd townlands && unzip -t townlands_final.jsonld.zip
   ```

## Key Data Collections

### Primary Data Directories
- `Irish_names/` - Surname datasets in JSON-LD format
- `annals_ireland/` - Historical annals (large JSON-LD files ~1.3MB)
- `NMI_artifacts/` - National Museum artifact vocabularies (~44KB)
- `excavations/` - Archaeological site HTML pages with subdirectories
- `townlands/` - Geographic data (large zip files ~4MB)
- `National_Monuments/`, `fiants/`, `bardicpoetry/` - Additional collections

### File Types and Formats
- `.jsonld` - JSON-LD linked data files (primary format)
- `.html` - Simple web pages for excavation sites
- `.xml` - Index files (mostly empty placeholders)
- `.zip` - Compressed large datasets

## Timing Expectations

- **Repository clone**: < 30 seconds
- **Web server startup**: < 5 seconds (NEVER CANCEL - immediate startup)
- **JSON validation**: < 10 seconds per file
- **Large file extraction**: < 30 seconds for townlands.zip
- **Web page loading**: < 2 seconds per page

## Common Tasks

### Validating Data Changes
Always run these commands after modifying any data files:
```bash
# Validate JSON-LD syntax
find . -name "*.jsonld" -print0 | xargs -0 -I {} jq . {} > /dev/null

# Test web serving
python3 -m http.server 8000 &
sleep 2
curl -s http://localhost:8000/ > /dev/null && echo "Web server working"
kill %1
```

### Adding New Data
- Follow existing JSON-LD schema patterns
- Validate new files with `jq` before committing
- Test web accessibility if adding HTML files
- Update relevant index.xml files if needed

### Repository Contents (Reference)
```
Gaelic_hub/
├── README.md
├── Irish_names/
│   ├── surnames.jsonld (3.3KB)
│   └── index.xml
├── annals_ireland/
│   ├── annals_connacht.jsonld (1.3MB)
│   └── test.xml
├── NMI_artifacts/
│   ├── NMI_artifact_vocab.jsonld (44KB)
│   └── index.xml
├── excavations/
│   ├── caherconnel/index.html
│   ├── Kilteasheen/index.html
│   ├── RockofLoughKey/index.html
│   ├── RockinghamMoatedSite/index.html
│   ├── Tulsk/index.html
│   └── index.xml
├── townlands/
│   ├── townlands_final.jsonld.zip (3.9MB)
│   └── index.xml
└── [additional collections...]
```

## Tools and Dependencies

### Required Tools (Pre-installed)
- `python3` - For local web server
- `jq` - For JSON validation and processing  
- `unzip` - For extracting compressed datasets
- `curl` - For testing web endpoints

### Optional Tools
- `node`/`npm` - Available but not required for this repository
- Standard Unix tools: `find`, `grep`, `head`, `tail`, `cat`

## Important Notes

- **This is a data repository, not an application** - no build or compilation required
- **All JSON-LD files must validate** - use `jq` to check syntax before committing
- **Web server is for browsing only** - no dynamic functionality expected
- **Large files are compressed** - extract only when needed for validation
- **Preserve data integrity** - validate all changes thoroughly before committing

## Troubleshooting

### Common Issues
- **JSON validation fails**: Check for trailing commas or syntax errors with `jq`
- **Web server won't start**: Port 8000 may be in use, try port 8001: `python3 -m http.server 8001`
- **Zip extraction fails**: Check disk space and file permissions
- **Empty XML files**: This is normal - many index.xml files are placeholders

### Recovery Commands
- **Reset repository**: `git checkout -- .` (restores all files)
- **Clean extracted files**: `find . -name "__MACOSX" -type d -exec rm -rf {} +`
- **Kill web server**: `pkill -f "python3 -m http.server"`