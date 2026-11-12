# X-Trans (Online 线上公网部署版本)

> **分支说明**：当前分支为 `online`，专为部署到线上云服务（Railway、Render、Google Cloud Run、Fly.io、Docker 或各类 Linux 云服务器 VPS）设计。
> **100% 免 API Key 运行 · 支持公网 HTTPS 访问 · 容器化开箱即用**

本应用自带全套生产级 Docker 镜像配置与云平台部署模板，可一键发布到公网供随时随地通过手机或电脑访问，无需个人电脑持续开机。

---

## 🌐 当前实时在线预览 (Live Online Preview)

本应用当前已在线部署在 Google Cloud Run：
🔗 **线上地址**：`https://ais-pre-2v6326en4zi32md744zlr3-57032136660.asia-northeast1.run.app`

---

## 🚀 推荐线上部署平台与方法 (Cloud Hosting Guide)

### 选项 1：Railway (新手推荐 · 1 分钟一键上线)
1. 将本项目代码推送到你个人的 **GitHub** 仓库（Windows 双击 `push_to_github.bat`，Mac/Linux 执行 `./push_to_github.sh <仓库URL>`，会自动推送 `main`, `on-premise`, `online` 三个分支）。
2. 打开 [Railway.app](https://railway.app/)，用 GitHub 账号登录。
3. 点击 **「New Project」** $\rightarrow$ **「Deploy from GitHub repo」**，选中本项目仓库。
4. Railway 会自动读取项目中的 `railway.json` 和 `Dockerfile` 进行打包构建。
5. 在项目设置中点击 **「Generate Domain」**，即刻分配一个免费的专属公网 HTTPS 域名（如 `https://x-trans.up.railway.app`）！

---

### 选项 2：Render.com (含免费 Web Service 套餐)
1. 将本项目推送到 GitHub。
2. 打开 [Render.com](https://render.com/)，点击 **「New +」** $\rightarrow$ **「Web Service」**。
3. 连接 GitHub 仓库，Runtime 选择 **Docker**（或直接读取项目内的 `render.yaml`）。
4. Plan 选择 **Free**，点击 **「Create Web Service」**。
5. 构建完成后即可获得一个公网访问域名（如 `https://x-trans.onrender.com`）。

---

### 选项 3：个人云服务器 VPS (阿里云 / 腾讯云 / DigitalOcean / 搬瓦工等)

如果自己有一台 Linux 服务器（Ubuntu / Debian / CentOS）：

```bash
# 1. 登录服务器并拉取代码
git clone -b online https://github.com/your-username/x-trans-app.git
cd x-trans-app

# 2. 一键使用 Docker Compose 启动生产容器
docker compose up -d
```

启动后，访问 `http://你的服务器IP:3000` 即可使用！
可通过 Nginx 或 Caddy 配置你的自有域名与免费 SSL 证书（如 `https://video.yourdomain.com`）。

---

### 选项 4：Google Cloud Run (Serverless 极度便宜，按需计费)
```bash
# 构建镜像并一键部署到 Cloud Run
gcloud run deploy x-trans --source . --platform managed --allow-unauthenticated --region asia-northeast1
```

---

## 📁 线上版本附带的云配置文件

- **`Dockerfile`**：内置 Node 22 环境、FFmpeg 视频核心与字体支持，自动化生产打包。
- **`docker-compose.yml`**：标准单机编排容器配置，端口映射与自动重启。
- **`railway.json`**：Railway 云平台一键识别与自动重启策略。
- **`render.yaml`**：Render 云平台一键蓝图配置。

---

## 🌿 分支切换指南

- **`online` 分支**（当前分支）：专为公网线上服务器与 Docker 容器部署定制。
- **`on-premise` 分支**：专为在个人电脑本地离线/本地快速运行定制。
