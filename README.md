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

## Environment Variables

The project supports three AI modes: `deepseek`, `gemini`, and `mock`.

If you just want to run the project quickly, you can skip all API keys.  
The app will automatically fall back to `mock` mode.

If you want to connect to real models, create a `.env.local` file in the root directory:

```bash
VITE_AI_PROVIDER=deepseek
VITE_DEEPSEEK_API_KEY=填入你的api_key
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_DEEPSEEK_ENDPOINT=https://api.deepseek.com/chat/completions
```

Optional Gemini configuration:

```bash
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=填入你的api_key
VITE_GEMINI_MODEL=gemini-2.5-flash
VITE_GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1/models
VITE_GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
VITE_GEMINI_IMAGE_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models
```

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

- The design document directory `docs/design/` is in `.gitignore`.
- `.env` and `.env.local` are also ignored and will not be committed by default.
