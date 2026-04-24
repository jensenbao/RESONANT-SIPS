# Resonant Sips

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

## 配置 API Key

推荐方式（可安全上传 GitHub）：

1. 复制一份 `.env.example` 并命名为 `.env.local`
2. 在 `.env.local` 中填写真实 key
3. 运行 `npm run dev`

说明：
- `.env.local` 已在忽略列表中，不会被提交到 Git。
- `src/config/localApiKeys.js` 建议只保留占位值。
- 不需要手动设置 provider，系统会自动选择可用 key。
- 如果两个 key 都没填，系统会阻止 AI 调用并提示先配置 key。

### 如何把同一个 Key 给同伴用

建议流程：

1. 你的真实 key 只放在你本机 `.env.local`
2. 通过私密渠道发给同伴（密码管理器、加密聊天、私有共享库等）
3. 同伴基于 `.env.example` 在本机创建自己的 `.env.local`
4. 不要把真实 key 提交到任何受 Git 跟踪的文件

如果出现 AI 不可用，请先配置 `.env.local` 后重启开发服务。

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

## 版权说明

本项目所使用的角色库来源于香港理工大学
PolyU MSc IME — AI Tools for Creative Process and Transmedia (SD5976) 课程。

项目中出现的相关角色，其原始版权与创作权归各角色原作者所有。
我们在本项目中的使用属于基于课程角色库进行的二次创作，仅用于课程学习、研究与展示目的。

本项目无意主张对原始角色设定的所有权，并尊重所有原作者的创作成果与知识产权。