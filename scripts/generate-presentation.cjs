const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const templatePath = path.join(__dirname, 'PRESENTATION_TEMPLATE.md');
const outputPath = path.join(__dirname, '..', 'PRESENTATION.md');
const packageJsonPath = path.join(__dirname, '..', 'package.json');

/**
 * Validates that a URL matches expected GitHub repository URL patterns
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if URL is valid
 */
function isValidRepoUrl(url) {
  // Match GitHub HTTPS URLs: https://github.com/owner/repo
  const githubPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/;
  return githubPattern.test(url);
}

/**
 * Gets the default repository URL from package.json
 * @returns {string|null} - The repository URL or null if not found
 */
function getDefaultRepoUrl() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (packageJson.repository && packageJson.repository.url) {
      let url = packageJson.repository.url;
      // Handle git+https:// prefix
      if (url.startsWith('git+')) {
        url = url.slice(4);
      }
      // Handle .git suffix
      if (url.endsWith('.git')) {
        url = url.slice(0, -4);
      }
      return url;
    }
  } catch (err) {
    console.warn(`Warning: Could not read package.json: ${err.message}`);
  }
  return null;
}

/**
 * Gets the repository URL from git remote or falls back to package.json
 * @returns {string} - The repository URL
 */
function getRepoUrl() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    let url;

    // Convert SSH to HTTPS
    if (remoteUrl.startsWith('git@')) {
      url = remoteUrl.replace(':', '/').replace('git@', 'https://').replace('.git', '');
    } else if (remoteUrl.endsWith('.git')) {
      // Handle HTTPS ending in .git
      url = remoteUrl.slice(0, -4);
    } else {
      url = remoteUrl;
    }

    // Validate the URL before using it
    if (isValidRepoUrl(url)) {
      return url;
    }
    console.warn(`Warning: Git remote URL "${url}" does not match expected pattern.`);
  } catch (error) {
    console.warn(`Warning: Could not detect git remote URL: ${error.message}`);
  }

  // Fall back to package.json repository URL
  const defaultUrl = getDefaultRepoUrl();
  if (defaultUrl && isValidRepoUrl(defaultUrl)) {
    console.log('Using repository URL from package.json');
    return defaultUrl;
  }

  console.error('Error: Could not determine a valid repository URL.');
  console.error('Please ensure git remote is configured or package.json has a valid repository.url');
  process.exit(1);
}

// Verify template file exists
if (!fs.existsSync(templatePath)) {
  console.error(`Error: Template file not found: ${templatePath}`);
  process.exit(1);
}

const repoUrl = getRepoUrl();
console.log(`Using repository URL: ${repoUrl}`);

try {
  const content = fs.readFileSync(templatePath, 'utf8');
  const processedContent = content.replaceAll('{{REPO_URL}}', repoUrl);
  fs.writeFileSync(outputPath, processedContent);
  console.log(`PRESENTATION.md generated successfully at: ${outputPath}`);
} catch (err) {
  console.error(`Error generating presentation: ${err.message}`);
  console.error(`  Template: ${templatePath}`);
  console.error(`  Output: ${outputPath}`);
  process.exit(1);
}
