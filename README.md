# Mixologist

🌍 **English** | [简体中文](README.zh-CN.md)

An interactive cyberpunk bartending game built with React + Vite.

## Requirements

- Node.js 18 or higher
- npm 9 or higher

## Install Dependencies

Run the following command in the project root:

```bash
npm install
```

## API Key Setup

Template-style setup: fill and use directly.

1. Open `src/config/localApiKeys.js`
2. Replace `your api key` with your real key
3. Save and run `npm run dev`

Notes:
- No need to set provider manually.
- The app auto-selects a provider from available keys.
- If both keys are empty, it falls back to `mock` mode.

## Run Locally

Start the development server:

```bash
npm run dev
```

Vite will output a local development URL, usually:

```text
http://localhost:5173
```

Open it in your browser to start testing and debugging.

## Build and Preview

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Notes

- The runtime save slots directory `saves/` is ignored by Git, keeping only the folder structure. Your local game saves will not be committed.
- `.env`, `.env.local`, `.env.development.local`, `.env.production.local` and other sensitive config files are in `.gitignore` to keep your API keys secure and will not be committed.
