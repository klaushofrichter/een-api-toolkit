const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function getRepoUrl() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    // Convert SSH to HTTPS
    if (remoteUrl.startsWith('git@')) {
      return remoteUrl.replace(':', '/').replace('git@', 'https://').replace('.git', '');
    }
    // Handle HTTPS ending in .git
    if (remoteUrl.endsWith('.git')) {
      return remoteUrl.slice(0, -4);
    }
    return remoteUrl;
  } catch (error) {
    console.warn('Could not detect git remote URL, using default.');
    return 'https://github.com/klaushofrichter/een-api-toolkit';
  }
}

const repoUrl = getRepoUrl();
console.log(`Using repository URL: ${repoUrl}`);

const templatePath = path.join(__dirname, 'PRESENTATION_TEMPLATE.md');
const outputPath = path.join(__dirname, '..', 'PRESENTATION.md');

try {
  let content = fs.readFileSync(templatePath, 'utf8');
  content = content.replaceAll('{{REPO_URL}}', repoUrl);
  fs.writeFileSync(outputPath, content);
  console.log('PRESENTATION.md generated successfully.');
} catch (err) {
  console.error('Error generating presentation:', err);
  process.exit(1);
}
