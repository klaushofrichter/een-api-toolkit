#!/usr/bin/env npx tsx
/**
 * Setup EEN API Toolkit agents in the current project.
 *
 * This script copies the specialized Claude agents from the toolkit to your project's
 * .claude/agents/ directory where Claude Code can discover them automatically.
 *
 * Usage:
 *   npx een-setup-agents              # After installing een-api-toolkit
 *   npm run setup-agents              # From toolkit repository
 *   npx tsx scripts/setup-agents.ts   # Direct execution
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Determine source directory (where agents are located)
// When run from node_modules, agents are in ../.claude/agents/
// When run from toolkit repo, agents are in ../.claude/agents/
const TOOLKIT_ROOT = path.dirname(__dirname)
const SOURCE_AGENTS_DIR = path.join(TOOLKIT_ROOT, '.claude', 'agents')

// Target directory is always the current working directory's .claude/agents/
const TARGET_AGENTS_DIR = path.join(process.cwd(), '.claude', 'agents')

const AGENT_FILES = [
  'een-setup-agent.md',
  'een-auth-agent.md',
  'een-users-agent.md',
  'een-devices-agent.md',
  'een-media-agent.md',
  'een-events-agent.md',
  'een-grouping-agent.md'
]

function main() {
  console.log('EEN API Toolkit - Agent Setup\n')

  // Check if source agents exist
  if (!fs.existsSync(SOURCE_AGENTS_DIR)) {
    console.error(`Error: Source agents directory not found: ${SOURCE_AGENTS_DIR}`)
    console.error('Make sure you have installed een-api-toolkit correctly.')
    process.exit(1)
  }

  // Create target directory if it doesn't exist
  if (!fs.existsSync(TARGET_AGENTS_DIR)) {
    console.log(`Creating directory: ${TARGET_AGENTS_DIR}`)
    fs.mkdirSync(TARGET_AGENTS_DIR, { recursive: true })
  }

  // Copy each agent file
  let copied = 0
  let skipped = 0
  let errors = 0

  for (const agentFile of AGENT_FILES) {
    const sourcePath = path.join(SOURCE_AGENTS_DIR, agentFile)
    const targetPath = path.join(TARGET_AGENTS_DIR, agentFile)

    if (!fs.existsSync(sourcePath)) {
      console.log(`  Skipped: ${agentFile} (not found in source)`)
      skipped++
      continue
    }

    try {
      // Check if target already exists
      if (fs.existsSync(targetPath)) {
        const sourceContent = fs.readFileSync(sourcePath, 'utf-8')
        const targetContent = fs.readFileSync(targetPath, 'utf-8')

        if (sourceContent === targetContent) {
          console.log(`  Unchanged: ${agentFile}`)
          skipped++
          continue
        }

        // Backup existing file
        const backupPath = targetPath + '.backup'
        fs.copyFileSync(targetPath, backupPath)
        console.log(`  Backed up: ${agentFile} -> ${agentFile}.backup`)
      }

      fs.copyFileSync(sourcePath, targetPath)
      console.log(`  Copied: ${agentFile}`)
      copied++
    } catch (err) {
      console.error(`  Error copying ${agentFile}: ${err}`)
      errors++
    }
  }

  console.log('')
  console.log(`Summary: ${copied} copied, ${skipped} skipped, ${errors} errors`)
  console.log('')

  if (copied > 0) {
    console.log('Agents are now available in .claude/agents/')
    console.log('Claude Code will automatically discover them.')
    console.log('')
    console.log('Available agents:')
    console.log('  - een-setup-agent     (Vue 3 project setup)')
    console.log('  - een-auth-agent      (OAuth authentication)')
    console.log('  - een-users-agent     (User management)')
    console.log('  - een-devices-agent   (Cameras & bridges)')
    console.log('  - een-media-agent     (Video & media)')
    console.log('  - een-events-agent    (Events & real-time)')
    console.log('  - een-grouping-agent  (Layouts & camera groupings)')
  }

  process.exit(errors > 0 ? 1 : 0)
}

main()
