# Fallout Store Checker

Checks a set of items in the Bethesda store, and sends an email for results on availability.

## Adding Modules to Lambda Layer

Create `python` folder (or any name), install modules to it, then add onto layer in AWS console.

- `mkdir python`
- `pip install -t python requests`
- `pip install -t python beautifulsoup4`
- Zip it
- Upload to AWS layer