# 国王消消乐 v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. User requests one producer/reviewer agent; implementation stays with the main agent.

**Goal:** 满仓真实石料施压、国王HP接触受伤、宝石按支撑下落并连锁，两关可玩可救回。
**Architecture:** 保留纯三消模块与固定步长颗粒引擎；加入纯重力结算与同步下落碰撞体，HP为独立接触伤害状态。渲染读取同一物理位置。
**Tech Stack:** 原生 JavaScript / Canvas、Node test、Playwright、静态 GitHub Pages。
**Spec:** `docs/revisions/king-hp-gravity-v3-design.md`

## Global Constraints

- 同一制作人审核设计和盲玩；不增加子Agent、不付费、不删除资源。
- 无新宝石补位、无假石背景、无画外队列施力、无浏览器设胜接口。
- 100HP、每次12伤害、0.8秒间隔；实际接触才扣血、离开停止。
- 不改其他游戏；相对路径；刷新清空进度；实际输入验证与线上构建分别记录。

## Task 1：纯重力和关图语义
Files: `king-match/match.js`, `king-match/tests/gravity.test.cjs`。
Interfaces: `gravity(board) -> {board,moves:[{from,to,color}]}`；`resolve(board,a,b) -> {board,cleared,cascades}|null`；`plan`使用新结算而非旧固定孔洞。
- [x] 先添加失败测试：同列 `[0,null,1,null,2,null,null]` 落为 `[null,null,null,null,0,1,2]`；梁上下独立压实且顺序不变；`resolve`消除数量与剩余数守恒、最终无三连和悬空。
- [x] 实现由列底向上扫描、遇`-1`重新设置支撑格的落位。返回实际移动映射；自动连锁反复调用matches→clear→gravity，剩余砖数严格下降以保证终止。
- [x] 运行 `node --test king-match/tests/gravity.test.cjs king-match/tests/match.test.cjs`。

## Task 2：真实满仓、动态砖、HP
Files: `king-match/engine.js`, `king-match/levels.js`, `king-match/tests/engine.test.cjs`。
Interfaces: operation为swap/cascade/fall；fall砖的`y`与碰撞共享；snapshot新增`hp/maxHp/hits/falling/stockFill`。
- [x] 先添加HP首次触刺存活、持续接触归零、脱离不扣、下落期间禁止交换、动态碰撞位置与物料守恒测试；运行确认旧版失败。
- [x] 填充错行粒子初始格点，跳过实体及保护腔；顶部空槽补给；空间索引用数值桶降低满仓成本；仅出口移除。
- [x] 清除后创建落位映射，`y=min(targetY,startY+0.5*1300*age²)`，末帧提交盘面并检测连锁；支撑梁矩形对齐格边。
- [x] 尖刺位置实体截停盾和人物，按模拟时间伤害冷却计次，HP0才lost。低压与离刺才积累安全窗口。
- [x] 重做关卡布局，用重力+连锁求解得到不同有意义选择；仿真验证正常解、受伤解和错误路线。更新旧solutions及不适用的固定洞位布局测试，保留历史文档。

## Task 3：可见反馈与实际输入
Files: `king-match/renderer.js`, `king-match/game.js`, `king-match/index.html`, `king-match/style.css`, `king-match/tests/browser-check.js`。
- [x] 绘制fall砖真实y、落地反馈、连锁数量；受伤红闪/浮字/HP条；更新玩法与卡片文案，保留余地而不把其叫HP。
- [x] 下落/连锁期间输入锁定，重排只接受落稳盘；提示应用重力结算；加载复用现有生成PNG。
- [x] 启动独立本地端口；真实鼠标/触屏验证两关、满仓可见、触刺先扣血、脱离停伤、HP0败、下落连锁、暂停重来刷新及手机布局；保留时序截图与只读日志。

## Task 4：制作人复审与发布
Files: `docs/revisions/king-hp-gravity-v3-review.md`, `king-match/README.md`, `index.html`。
- [ ] 制作人先独立盲玩，不提前给解法；处理所有阻塞意见并复测，新评分不沿用v2。
- [ ] 运行两游戏所需回归和diff检查；确认main最新改动已保留；获得制作人发布批准。
- [ ] 提交并更新既有免费Pages；确认build对应提交、资产hash、线上两关实际输入与合集返回；最终给真实上线链接和新版验收结果。
