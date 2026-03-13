# Mixologist

🌍 [English](README.md) | **简体中文**

一个基于 React + Vite 的赛博酒吧调酒互动游戏。

## 环境要求

- Node.js 18 或更高版本
- npm 9 或更高版本

## 安装依赖

在项目根目录执行：

```bash
npm install
```

## 环境变量

项目支持 `deepseek`、`gemini` 和 `mock` 三种 AI 模式。

如果你只是想先把项目跑起来，可以不配置任何密钥，项目会自动回退到 `mock` 模式。

如果你要接真实模型，建议在根目录新建 `.env.local`：

```bash
VITE_AI_PROVIDER=deepseek
VITE_DEEPSEEK_API_KEY=填入你的api_key
VITE_DEEPSEEK_MODEL=deepseek-chat
VITE_DEEPSEEK_ENDPOINT=https://api.deepseek.com/chat/completions
```

可选的 Gemini 配置：

```bash
VITE_AI_PROVIDER=gemini
VITE_GEMINI_API_KEY=填入你的api_key
VITE_GEMINI_MODEL=gemini-2.5-flash
VITE_GEMINI_ENDPOINT=https://generativelanguage.googleapis.com/v1/models
VITE_GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
VITE_GEMINI_IMAGE_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models
```

## 本地启动

启动开发环境：

```bash
npm run dev
```

Vite 默认会在本地输出一个开发地址，通常是：

```text
http://localhost:5173
```

打开浏览器访问这个地址即可开始调试。

## 构建与预览

生产构建：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 说明

- 设计文档目录 `docs/design/` 已加入 Git 忽略。
- `.env`、`.env.local` 已在忽略列表中，不会默认提交到仓库。
