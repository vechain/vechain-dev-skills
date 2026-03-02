#!/usr/bin/env node

/**
 * Validate a plugin's structure and SKILL.md frontmatter.
 *
 * Usage: node scripts/validate-plugin.cjs <plugin-path>
 * Example: node scripts/validate-plugin.cjs packages/plugins/vechain-dev
 */

'use strict';

const fs = require('fs');
const path = require('path');

const REQUIRED_FRONTMATTER = ['name', 'description', 'license'];

function parseYamlFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const result = {};

  for (const line of yaml.split('\n')) {
    // Skip empty lines and nested keys (metadata sub-keys)
    if (!line.trim() || /^\s+/.test(line)) {
      // Handle metadata sub-keys
      if (/^\s+/.test(line)) {
        const subMatch = line.match(/^\s+(\w[\w-]*):\s*(.+)/);
        if (subMatch) {
          if (!result._lastKey) continue;
          if (typeof result[result._lastKey] !== 'object') {
            result[result._lastKey] = {};
          }
          result[result._lastKey][subMatch[1]] = subMatch[2].replace(/^["']|["']$/g, '');
        }
      }
      continue;
    }

    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = kvMatch[2].trim();

      // Handle arrays like []
      if (value === '[]') {
        value = [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        value = value.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
      } else {
        value = value.replace(/^["']|["']$/g, '');
      }

      result[key] = value;
      result._lastKey = key;
    }
  }

  delete result._lastKey;
  return result;
}

function validateSkillFile(skillPath, errors) {
  const content = fs.readFileSync(skillPath, 'utf-8');
  const frontmatter = parseYamlFrontmatter(content);
  const relative = path.relative(process.cwd(), skillPath);

  if (!frontmatter) {
    errors.push(`${relative}: missing YAML frontmatter (---)`);
    return;
  }

  for (const key of REQUIRED_FRONTMATTER) {
    if (!frontmatter[key]) {
      errors.push(`${relative}: missing required frontmatter field "${key}"`);
    }
  }

  // Validate name matches directory name
  const skillDir = path.basename(path.dirname(skillPath));
  if (frontmatter.name && frontmatter.name !== skillDir) {
    errors.push(
      `${relative}: frontmatter name "${frontmatter.name}" does not match directory "${skillDir}"`,
    );
  }
}

function validatePlugin(pluginDir) {
  const errors = [];
  const abs = path.resolve(pluginDir);

  // Check plugin has package.json
  const pkgPath = path.join(abs, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    errors.push(`${pluginDir}: missing package.json`);
  }

  // Check plugin has .claude-plugin/plugin.json
  const pluginJsonPath = path.join(abs, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(pluginJsonPath)) {
    errors.push(`${pluginDir}: missing .claude-plugin/plugin.json`);
  } else {
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
    if (!pluginJson.name) errors.push(`${pluginDir}: plugin.json missing "name"`);
    if (!pluginJson.version) errors.push(`${pluginDir}: plugin.json missing "version"`);
    if (!pluginJson.skills || !Array.isArray(pluginJson.skills) || pluginJson.skills.length === 0) {
      errors.push(`${pluginDir}: plugin.json missing or empty "skills" array`);
    }
  }

  // Check skills/ directory exists
  const skillsDir = path.join(abs, 'skills');
  if (!fs.existsSync(skillsDir)) {
    errors.push(`${pluginDir}: missing skills/ directory`);
    return errors;
  }

  // Validate each skill
  const skills = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory());

  if (skills.length === 0) {
    errors.push(`${pluginDir}: no skills found in skills/ directory`);
    return errors;
  }

  const skillNames = [];

  for (const skill of skills) {
    const skillMd = path.join(skillsDir, skill.name, 'SKILL.md');
    if (!fs.existsSync(skillMd)) {
      errors.push(`${pluginDir}/skills/${skill.name}: missing SKILL.md`);
      continue;
    }
    validateSkillFile(skillMd, errors);
    skillNames.push(skill.name);

    // If references/ exists, check it's not empty
    const refsDir = path.join(skillsDir, skill.name, 'references');
    if (fs.existsSync(refsDir)) {
      const refs = fs.readdirSync(refsDir).filter((f) => f.endsWith('.md'));
      if (refs.length === 0) {
        errors.push(`${pluginDir}/skills/${skill.name}/references: directory exists but has no .md files`);
      }
    }
  }

  // Cross-check plugin.json skills against actual skill directories
  if (fs.existsSync(pluginJsonPath)) {
    const pluginJson = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf-8'));
    if (pluginJson.skills && Array.isArray(pluginJson.skills)) {
      for (const skillRef of pluginJson.skills) {
        const skillName = path.basename(skillRef);
        if (!skillNames.includes(skillName)) {
          errors.push(`${pluginDir}: plugin.json references skill "${skillName}" but no matching directory found`);
        }
      }
      for (const name of skillNames) {
        const listed = pluginJson.skills.some((s) => path.basename(s) === name);
        if (!listed) {
          errors.push(`${pluginDir}: skill "${name}" exists but is not listed in plugin.json`);
        }
      }
    }
  }

  return errors;
}

// Main
const pluginDir = process.argv[2];
if (!pluginDir) {
  console.error('Usage: node scripts/validate-plugin.cjs <plugin-path>');
  process.exit(1);
}

if (!fs.existsSync(pluginDir)) {
  console.error(`Error: "${pluginDir}" does not exist`);
  process.exit(1);
}

console.log(`Validating plugin: ${pluginDir}`);
const errors = validatePlugin(pluginDir);

if (errors.length > 0) {
  console.error(`\nValidation failed with ${errors.length} error(s):\n`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
} else {
  const skillsDir = path.join(path.resolve(pluginDir), 'skills');
  const skillCount = fs.readdirSync(skillsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).length;
  console.log(`\nValidation passed! ${skillCount} skill(s) validated.`);
}
