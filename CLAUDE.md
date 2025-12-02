# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a community repository for [check-my-code](https://github.com/chrismlittle123/check-my-code) CLI. It contains:
- **Prompts**: Markdown coding standards for AI assistants (Claude, Cursor, Copilot)
- **Rulesets**: TOML linter configurations (ruff, eslint) that can be extended

## Commands

```bash
# Validate all rulesets against schema.json
node scripts/validate-rulesets.js

# Pull latest schema.json from check-my-code CLI repo
./scripts/pull-schema.sh

# Pull latest compatibility.yaml from check-my-code CLI repo
./scripts/pull-compatibility.sh
```

## Architecture

### Versioning System

Both prompts and rulesets use independent per-item versioning with manifests:

```
<language>/<name>@<version>
```

- `prompts/prompts.json` - manifest for all prompts
- `rulesets/rulesets.json` - manifest for all rulesets
- Version files: `<name>/<version>.md` or `<name>/<version>.toml`
- `latest` key in manifest points to current version

### Ruleset Format

Rulesets are TOML fragments matching the `[rulesets.*]` section of `cmc.toml`:

```toml
# Ruff example
[rulesets.ruff]
line-length = 100

[rulesets.ruff.lint]
select = ["E", "F"]

# ESLint example
[rulesets.eslint.rules]
"no-var" = "error"
```

### Key Files

- `schema.json` - JSON Schema for cmc.toml validation (pulled from CLI repo)
- `compatibility.yaml` - Supported language/runtime versions (pulled from CLI repo)

## Adding New Content

### New Prompt
1. Create `prompts/<language>/<name>/1.0.0.md`
2. Add entry to `prompts/prompts.json`

### New Ruleset
1. Create `rulesets/<language>/<name>/1.0.0.toml` using `[rulesets.*]` format
2. Add entry to `rulesets/rulesets.json`
3. Run `node scripts/validate-rulesets.js`

### New Version
1. Create new version file (e.g., `1.0.1.md`)
2. Update manifest: add version entry and update `latest`
