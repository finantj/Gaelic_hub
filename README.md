# Gaelic_hub
A store for Gaelic medieval sources and linkages 

This repository is a persistent location for a number of types of information that will be utilized in a research project that will link a number of different type of open data sets related to medieval Ireland, more particularly Gaelic Ireland in the period 1100-1500.  
The sources in this repository come from a number of data sets available online, and will reference those sites accordingly.

## Web Interface

The repository now includes a web interface that provides easy access to all collections. The interface is automatically deployed to preview environments for pull requests using Vercel and GitHub Actions.

### Collections Available

- **Irish Names**: Collection of Gaelic surnames and their historical context
- **Annals of Ireland**: Historical chronicles and annals from medieval Ireland
- **Bardic Poetry**: Collection of medieval Irish bardic poetry and literary sources
- **Excavations**: Archaeological excavation data from medieval Irish sites
- **National Monuments**: Records of Irish national monuments from the medieval period
- **NMI Artifacts**: National Museum of Ireland artifact collections
- **NMI Materials**: Material culture data from the National Museum of Ireland
- **Fiants**: Irish Fiants of the Tudor Sovereigns collection
- **Townlands**: Irish townland names and geographical data
- **OIR Recogito Workspace**: Interactive annotation tool for exploring and tagging people, places, and events in JSON-LD texts

## Development

To run the web interface locally:

```bash
npm install
npm run dev
```

The site will be available at `http://localhost:3000`

## Deployment

The repository is configured with automated CI/CD using GitHub Actions and Vercel. Every pull request automatically gets a preview deployment with the URL posted as a comment on the PR. See `DEPLOYMENT.md` for setup instructions.
