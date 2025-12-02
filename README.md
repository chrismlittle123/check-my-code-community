# check-my-code-community

Community-maintained prompts and rulesets for [check-my-code](https://github.com/chrismlittle123/check-my-code).

## Structure

```
prompts/
├── prompts.json            # Prompt manifest with versioning
├── python/
│   └── prod/
│       └── 1.0.0.md
└── typescript/
    └── strict/
        └── 1.0.0.md

rulesets/
├── rulesets.json           # Ruleset manifest with versioning
├── python/
│   └── ruff-default/
│       └── 1.0.0.toml
└── typescript/
    └── eslint-default/
        └── 1.0.0.toml

schema.json                 # JSON Schema for cmc.toml validation
```

## Naming Convention

Both prompts and rulesets use the same format:

```
<language>/<name>@<version>
```

Examples:
- `python/prod@1.0.0`
- `typescript/strict@latest`
- `python/ruff-default@1.0.0`
- `typescript/eslint-default`

Version specifiers:
- `@1.0.0` - Pin to exact version
- `@latest` - Always use the latest version
- *(omitted)* - Defaults to `@latest`

## Prompts

Prompts provide coding standards and guidelines for AI coding assistants (Claude, Cursor, Copilot).

### Using Prompts

In your `cmc.toml`:

```toml
[ai-context]
templates = [
  "python/prod@1.0.0",
  "typescript/strict@latest"
]
```

### Available Prompts

| Prompt | Description |
|--------|-------------|
| `python/prod` | Production Python coding standards covering imports, type hints, error handling, and naming conventions |
| `typescript/strict` | Strict TypeScript coding standards enforcing type safety, const usage, and modern ES module patterns |

### Prompt Manifest Format

```json
{
  "schema_version": "1.0.0",
  "prompts": {
    "python/prod": {
      "description": "Production Python coding standards",
      "format": "md",
      "versions": {
        "1.0.0": { "file": "python/prod/1.0.0.md" },
        "latest": "1.0.0"
      }
    }
  }
}
```

## Rulesets

Rulesets are linter configurations that can be extended in your project. Each ruleset is a TOML fragment matching the `cmc.toml` schema.

### Using Rulesets

In your `cmc.toml`:

```toml
[extends]
ruff = "github:chrismlittle123/check-my-code-community/rulesets/python/ruff-default@1.0.0"
eslint = "github:chrismlittle123/check-my-code-community/rulesets/typescript/eslint-default@1.0.0"
```

### Available Rulesets

| Ruleset | Tool | Description |
|---------|------|-------------|
| `python/ruff-default` | ruff | Default Python linting - line length (100) and E/F rules |
| `typescript/eslint-default` | eslint | Default ESLint rules - no-var and prefer-const |

### Ruleset File Format

Rulesets are TOML fragments that match the `[rulesets.*]` section of `cmc.toml`:

**Ruff ruleset example:**
```toml
[rulesets.ruff]
line-length = 100

[rulesets.ruff.lint]
select = ["E", "F"]
```

**ESLint ruleset example:**
```toml
[rulesets.eslint.rules]
"no-var" = "error"
"prefer-const" = "error"
```

### Ruleset Manifest Format

```json
{
  "schema_version": "1.0.0",
  "rulesets": {
    "python/ruff-default": {
      "description": "Default Python linting with ruff",
      "tool": "ruff",
      "format": "toml",
      "versions": {
        "1.0.0": { "file": "python/ruff-default/1.0.0.toml" },
        "latest": "1.0.0"
      }
    }
  }
}
```

## Validation

Ruleset TOML files are validated against `schema.json`:

```bash
node scripts/validate-rulesets.js
```

## Contributing

### Adding a New Prompt

1. Create a directory under `prompts/<language>/` with your prompt name (kebab-case)
2. Add your prompt as `1.0.0.md`
3. Update `prompts/prompts.json` with the new entry

### Adding a New Ruleset

1. Create a directory under `rulesets/<language>/` with your ruleset name (kebab-case)
2. Add your ruleset as `1.0.0.toml` using the `[rulesets.*]` format
3. Update `rulesets/rulesets.json` with the new entry
4. Run `node scripts/validate-rulesets.js` to validate

### Updating Existing Prompts/Rulesets

1. Create a new version file (e.g., `1.0.1.md` or `1.0.1.toml`)
2. Update the manifest:
   - Add the new version entry
   - Update `latest` to point to the new version

### Naming Conventions

- Language directories: lowercase (`python`, `typescript`, `javascript`)
- Prompt/ruleset names: `kebab-case`
- Version files: `MAJOR.MINOR.PATCH.<ext>`
- Follow [Semantic Versioning](https://semver.org/)
