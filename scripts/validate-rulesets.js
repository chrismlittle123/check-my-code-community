#!/usr/bin/env node

/**
 * Validates all ruleset TOML files against the cmc.toml JSON schema.
 *
 * Each ruleset file should contain a valid fragment of the cmc.toml schema
 * (e.g., [rulesets.ruff] or [rulesets.eslint.rules]).
 *
 * Usage: node scripts/validate-rulesets.js
 */

const fs = require('fs');
const path = require('path');

// Simple TOML parser for the subset we need
function parseToml(content) {
  const result = {};
  let currentPath = [];

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Section header [foo.bar.baz]
    const sectionMatch = trimmed.match(/^\[([^\]]+)\]$/);
    if (sectionMatch) {
      currentPath = sectionMatch[1].split('.');
      // Ensure nested objects exist
      let obj = result;
      for (const key of currentPath) {
        if (!obj[key]) obj[key] = {};
        obj = obj[key];
      }
      continue;
    }

    // Key-value pair
    const kvMatch = trimmed.match(/^"?([^"=]+)"?\s*=\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim().replace(/^"|"$/g, '');
      let value = kvMatch[2].trim();

      // Parse value
      if (value.startsWith('[') && value.endsWith(']')) {
        // Array
        value = JSON.parse(value.replace(/'/g, '"'));
      } else if (value.startsWith('"') && value.endsWith('"')) {
        // String
        value = value.slice(1, -1);
      } else if (!isNaN(Number(value))) {
        // Number
        value = Number(value);
      }

      // Set value at current path
      let obj = result;
      for (const pathKey of currentPath) {
        obj = obj[pathKey];
      }
      obj[key] = value;
    }
  }

  return result;
}

// Simple JSON Schema validator for our specific schema
function validateAgainstSchema(data, schema) {
  const errors = [];

  function validate(obj, schemaObj, path = '') {
    if (!schemaObj) return;

    // Check type
    if (schemaObj.type === 'object') {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        errors.push(`${path}: expected object, got ${typeof obj}`);
        return;
      }

      // Check properties
      if (schemaObj.properties) {
        for (const [key, propSchema] of Object.entries(schemaObj.properties)) {
          if (obj[key] !== undefined) {
            validate(obj[key], propSchema, path ? `${path}.${key}` : key);
          }
        }
      }

      // Check additionalProperties for rules objects
      if (schemaObj.additionalProperties !== undefined && schemaObj.additionalProperties !== false) {
        for (const [key, value] of Object.entries(obj)) {
          if (!schemaObj.properties || !schemaObj.properties[key]) {
            if (schemaObj.additionalProperties.anyOf) {
              // ESLint rule value validation
              const isValidString = typeof value === 'string' && ['off', 'warn', 'error'].includes(value);
              const isValidArray = Array.isArray(value) && value.length > 0 && typeof value[0] === 'string';
              if (!isValidString && !isValidArray) {
                errors.push(`${path}.${key}: invalid ESLint rule value`);
              }
            }
          }
        }
      }
    } else if (schemaObj.type === 'integer') {
      if (typeof obj !== 'number' || !Number.isInteger(obj)) {
        errors.push(`${path}: expected integer, got ${typeof obj}`);
      } else {
        if (schemaObj.exclusiveMinimum !== undefined && obj <= schemaObj.exclusiveMinimum) {
          errors.push(`${path}: value must be > ${schemaObj.exclusiveMinimum}`);
        }
      }
    } else if (schemaObj.type === 'array') {
      if (!Array.isArray(obj)) {
        errors.push(`${path}: expected array, got ${typeof obj}`);
      } else if (schemaObj.items) {
        obj.forEach((item, i) => validate(item, schemaObj.items, `${path}[${i}]`));
      }
    } else if (schemaObj.type === 'string') {
      if (typeof obj !== 'string') {
        errors.push(`${path}: expected string, got ${typeof obj}`);
      }
    }
  }

  validate(data, schema);
  return errors;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const schemaPath = path.join(repoRoot, 'schema.json');
  const rulesetsDir = path.join(repoRoot, 'rulesets');

  // Load schema
  if (!fs.existsSync(schemaPath)) {
    console.error('Error: schema.json not found');
    process.exit(1);
  }
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

  // Find all TOML files in rulesets
  const tomlFiles = [];
  function findTomlFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        findTomlFiles(fullPath);
      } else if (entry.name.endsWith('.toml')) {
        tomlFiles.push(fullPath);
      }
    }
  }
  findTomlFiles(rulesetsDir);

  if (tomlFiles.length === 0) {
    console.log('No TOML files found in rulesets/');
    process.exit(0);
  }

  console.log(`Validating ${tomlFiles.length} ruleset file(s) against schema.json\n`);

  let hasErrors = false;

  for (const tomlFile of tomlFiles) {
    const relativePath = path.relative(repoRoot, tomlFile);
    const content = fs.readFileSync(tomlFile, 'utf-8');

    try {
      const parsed = parseToml(content);

      // Wrap in minimal valid structure for schema validation
      // Rulesets should have [rulesets.*] structure
      const toValidate = {
        project: { name: 'validation-test' },
        ...parsed
      };

      const errors = validateAgainstSchema(toValidate, schema);

      if (errors.length > 0) {
        console.log(`❌ ${relativePath}`);
        errors.forEach(err => console.log(`   ${err}`));
        hasErrors = true;
      } else {
        console.log(`✓ ${relativePath}`);
      }
    } catch (err) {
      console.log(`❌ ${relativePath}`);
      console.log(`   Parse error: ${err.message}`);
      hasErrors = true;
    }
  }

  console.log('');
  if (hasErrors) {
    console.log('Validation failed');
    process.exit(1);
  } else {
    console.log('All rulesets valid');
    process.exit(0);
  }
}

main();
