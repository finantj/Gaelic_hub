# CI/CD Setup for Vercel Deployments

This repository is configured to automatically deploy preview environments for pull requests using Vercel and GitHub Actions.

## How it works

1. When a pull request is opened against the `main` branch, GitHub Actions automatically triggers a deployment workflow
2. The workflow builds and deploys the site to Vercel as a preview deployment
3. A comment is posted on the pull request with the URL of the preview deployment
4. The preview deployment is automatically updated when new commits are pushed to the pull request

## Setup Requirements

To enable this functionality, the following secrets need to be configured in the GitHub repository settings:

### Required GitHub Secrets

1. **VERCEL_TOKEN**: A Vercel API token
   - Go to [Vercel Settings > Tokens](https://vercel.com/account/tokens)
   - Create a new token with appropriate permissions
   - Add it as a repository secret named `VERCEL_TOKEN`

2. **VERCEL_ORG_ID**: Your Vercel organization/team ID
   - Found in your Vercel team settings or project settings
   - Add it as a repository secret named `VERCEL_ORG_ID`

3. **VERCEL_PROJECT_ID**: The project ID for this repository on Vercel
   - Create a new project on Vercel linked to this repository
   - Copy the project ID from the project settings
   - Add it as a repository secret named `VERCEL_PROJECT_ID`

### Setting up the Vercel Project

1. Connect your GitHub repository to Vercel
2. Import the project on Vercel
3. Configure the project settings if needed
4. Note down the project ID and organization ID for the GitHub secrets

## Files Added/Modified

- `package.json`: Node.js project configuration
- `index.html`: Main landing page for the Gaelic Hub
- `vercel.json`: Vercel deployment configuration
- `.github/workflows/vercel-preview.yml`: GitHub Actions workflow for deployments
- `.gitignore`: Git ignore file for Node.js projects
- `DEPLOYMENT.md`: This documentation file

## Testing the Setup

1. Make a change to any file in the repository
2. Create a pull request against the `main` branch
3. The GitHub Actions workflow should automatically trigger
4. Check the "Actions" tab in GitHub to monitor the deployment progress
5. Once complete, a comment with the preview URL should appear on the pull request

## Troubleshooting

- Ensure all required secrets are set correctly in GitHub repository settings
- Check the GitHub Actions workflow logs for any error messages
- Verify that the Vercel project is properly connected to the GitHub repository
- Make sure the Vercel token has the necessary permissions for deployments