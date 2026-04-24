# Resonant Sips

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

Recommended setup (safe for GitHub):

1. Copy `.env.example` to `.env.local`
2. Fill real keys in `.env.local`
3. Run `npm run dev`

Notes:
- `.env.local` is ignored by Git and will not be uploaded.
- `src/config/localApiKeys.js` should stay as placeholders only.
- No need to set provider manually; app auto-selects from available keys.
- If both keys are empty, the app will block AI calls and ask you to configure keys.

### Share One Key With Teammates

Use this process:

1. Keep real key only in your local `.env.local`
2. Share key to teammates via private channel (password manager, encrypted chat, 1Password vault, etc.)
3. Teammates create their own `.env.local` from `.env.example`
4. Never commit real key into tracked files

If AI is unavailable, configure `.env.local` and restart dev server.

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

## Copyright Notice

The character library used in this project is sourced from the
PolyU MSc IME course: AI Tools for Creative Process and Transmedia (SD5976).

The original copyright and authorship of the characters belong to their respective creators.
Our use of these characters in this project constitutes derivative creation / secondary creation based on the course character library, and is intended solely for academic, learning, and presentation purposes.

This project does not claim ownership of the original character designs or narratives,
and fully respects the creative rights and intellectual property of the original authors.
