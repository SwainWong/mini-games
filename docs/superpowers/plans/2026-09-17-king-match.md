# 国王消消乐 Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement task-by-task. User requests exactly one producer reviewer; main agent implements, same producer approves and playtests.

**Goal:** 在现有静态合集加入两关有生成美术和真实排料物理的国王消消乐。
**Architecture:** 关卡固定数据；可被Node加载的纯规则/固定步长物理；独立Canvas渲染；DOM输入、音效、模态和生命周期控制。
**Tech Stack:** 原生JavaScript、Canvas2D、HTML/CSS、node:test、Playwright CLI、image生成位图。
**Spec:** docs/superpowers/specs/2026-09-17-king-match-design.md（制作人批准版本为准）

## Global Constraints
- 静态、无后台、无存储、刷新第一关，使用相对路径适配 /mini-games/。
- 仅新增 king-match/ 和首页入口/说明，不修改旧游戏。
- 仅一个制作人子Agent审批并试玩；不付费、不删除资源。
- 原始参考和测试截图不提交，生成贴图存于游戏assets并记录来源。
- 评分各项至少8/10，无重要缺陷才交付。

### Task 1: 可验证的规则与两关物理
**Files:** king-match/levels.js, engine.js, tests/engine.test.cjs, tests/solutions.cjs
**Interfaces:** Levels exports {W,H,CELL,BOARD_X,BOARD_Y,COLS,ROWS,levels}; Engine exports {Game,groupAt,stepPhysics}; Game(levelIndex) has start(), clear(index), update(dt), snapshot(). No state mutation test hooks in browser.
- [ ] 先写node:test：ready阶段不运动；正交>=2组才扣步；永久石梁不可消；不补位；粒子守恒；砖墙接触不穿透；完成只计真实出口。
- [ ] 运行 `node --test king-match/tests/engine.test.cjs`，确认缺失实现失败。
- [ ] 关卡数据给出网格、物料初始位置、障碍、目标、步数。固定seed。
- [ ] 实现固定步长物理，重力、碰撞、摩擦、低反弹、接触压力、出口统计。可枚举合法组。
- [ ] 将两条解法作为输入脚本调用clear/update，断言两关成功；空操作/错误路线分别失败；补充60/30Hz一致性。
- [ ] 通过测试，提交核心。

### Task 2: 美术、渲染及完整可玩流程
**Files:** king-match/assets/*, assets/PROVENANCE.md, renderer.js, audio.js, game.js, index.html, style.css
**Interfaces:** Renderer(canvas,assets) exposes draw(game,time,feedback); game uses pointer->logical coordinates->Game.clear; renderer never mutates game state.
- [ ] 使用image生成原创立体童话城堡背景、角色和冠盾宝石/矿石位图图集，记录prompt和生成来源，存本地静态资源。
- [ ] 使用位图sprite绘制砖和旋转石头，设计清除/碰撞/安全落点粒子及角色状态。
- [ ] DOM加入开始/暂停/选关/重来/玩法/音效，胜败弹层与下一关。
- [ ] 选择关卡/玩法弹窗和visibilitychange暂停；背景恢复保持暂停直到继续；音效首次手势初始化。
- [ ] 390px/360px布局实测，完整棋盘可操作，按钮>=36px；触摸pointer-up提交，拖动不误消。
- [ ] Playwright真实点击完成两关，观察清除和物料因果，手机触摸成功/失败/重试/刷新。

### Task 3: 集成、制作人试玩、修改与交付
**Files:** root index.html, home.css, README.md, king-match/README.md, docs/reviews/*
- [ ] 首页新增国王消消乐卡片，合集数量02，复用游戏生成美术作为封面，支持../往返。
- [ ] 启动本worktree独立端口服务，交制作人独立session试玩。
- [ ] 制作人报告真实步骤、失败案例、截图、分项分数；按意见修改，复测直到正式批准。
- [ ] 运行原游戏24项和新游戏测试，检查所有JS语法，手机桌面+子路径链接。
- [ ] 提交实现及评审文档；保留可玩服务并打开页面，明确本地/发布状态。
