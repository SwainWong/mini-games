# Mini Games

一个持续迭代的纯静态小游戏合集，每个游戏独立一个目录。

- **在线主页**：https://swainwong.github.io/mini-games/
- **沙里有珠**：https://swainwong.github.io/mini-games/sand-marbles/

## 目录

```text
index.html             # 游戏入口主页
home.css               # 主页样式
sand-marbles/          # 沙里有珠：三个关卡的挖沙落珠游戏
  index.html
  style.css
  game.js
  cover.png
  README.md
```

## 本地开发

不需要安装 npm 依赖或构建工具，在仓库根目录运行：

```sh
python3 -m http.server 4188 --bind 127.0.0.1
```

打开 http://127.0.0.1:4188/ 。游戏使用相对路径，同时兼容 GitHub Pages 项目子路径。

## 新增游戏

1. 在根目录创建独立的英文目录，例如 `new-game/`。
2. 在该目录提供 `index.html`，所有脚本、样式、图片和游戏说明放在同一目录。
3. 在主页 `index.html` 的 `#games` 区域追加一个游戏卡片，链接到 `./new-game/`；更新游戏数量。
4. 游戏内提供返回主页的 `../` 链接。
5. 验证桌面和触屏操作、刷新重置、主页往返链接，再合并到 `main`。

## 数据约定

- 不使用后端、数据库、用户账户、云存档或排行榜。
- 当前所有游戏状态仅保存在内存，刷新重新开始。
- 当前不读写 localStorage、sessionStorage、IndexedDB 或 Cookie，不注册 Service Worker，不接入分析或遥测。
- 后续如需本地偏好，最多使用 localStorage；不得引入远端数据存储。

## 发布

GitHub Pages 发布源为 `main` 分支根目录 `/`，`.nojekyll` 禁用 Jekyll。推送到 `main` 后由 GitHub Pages 自动更新。

无需 API 密钥、环境变量、服务端或第三方运行时依赖。
