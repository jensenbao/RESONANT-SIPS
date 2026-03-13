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

像模板一样，直接填上即用：

1. 打开 `src/config/localApiKeys.js`
2. 把 `your api key` 改成你的真实 key
3. 保存文件后直接运行 `npm run dev`

说明：
- 不需要理解或设置 `CONFIG.provider`。
- 默认会自动选择已填写 key 的模型。
- 如果两个 key 都没填，会自动回退到 `mock`。

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

- 游戏存档目录 `saves/` 的内容已被 Git 忽略，仅保留了基础的文件夹结构，您的本地存档不会被上传。
- `.env`、`.env.local`、`.env.development.local`、`.env.production.local` 等敏感配置文件已在忽略列表中，不会被提交到仓库，保障您的 API Key 安全。
