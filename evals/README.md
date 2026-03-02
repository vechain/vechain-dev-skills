# Evals

Evaluation suites for testing VeChain dev skill quality using [Promptfoo](https://promptfoo.dev/).

## Structure

```text
evals/
├── promptfoo.yaml                    # Main config
├── scripts/
│   └── anthropic-provider.ts         # Custom Anthropic provider
├── suites/
│   └── dapp-development/             # Per-skill test suites
│       └── basic.yaml
└── templates/
    └── suite/
        └── basic.yaml                # Template for new suites
```

## Usage

```bash
# Install promptfoo
npm install -g promptfoo

# Run all evals
cd evals
promptfoo eval

# Run a specific suite
promptfoo eval --tests suites/dapp-development/basic.yaml

# View results
promptfoo view
```

## Adding a New Suite

1. Copy `templates/suite/basic.yaml` to `suites/<skill-name>/basic.yaml`
2. Update the test cases for your skill
3. Run `promptfoo eval --tests suites/<skill-name>/basic.yaml`
