# 积分矿场 Implementation Plan

> **For agentic workers:** 使用 superpowers:executing-plans 逐项执行。用户要求由主 Agent 实现；高级游戏设计与体验 Agent 只负责方案审核和实操验收。审核通过前不实施新机制。

**Goal:** 在十五关静态挖沙游戏中实现可容错目标积分、有人性节奏的盗宝人、落石/引线/宝物、多车单轨及首次图鉴，并保留精确车沿接珠。

**Architecture:** World 是唯一物理和得分源。独立 Rival、Hazards、CartCrew 状态模块共享 World 的真实实体坐标；Canvas、HUD、图鉴仅消费实体和事件，不能另设隐形判定或结算规则。世界仍按1/120秒固定步长，暂停在帧调度层统一处理。交互经统一事件队列按步内接触时间排序，同时间按宝物、有效入车、伤害/眩晕、偷取/其他损失排序，每组后统一结算。

**Tech Stack:** HTML / CSS / Canvas2D / WebAudio；原生JS；node:test；Playwright CLI真实鼠标与CDP触屏；GitHub Pages。

**Spec:** `docs/superpowers/specs/2026-09-18-sand-score-adventure-design.md`

## Global Constraints

- 十五关，纯静态，无后端、账户、分析、遥测或浏览器持久存储；刷新重置。
- 目标分达成才通关；三星仍按实际新增玩家挖沙，机关挖沙免费。
- 车沿共同几何 y=590、内半宽46；相对运动插值接珠，无原位/低处吸附。
- 错色、漏接、被偷本身不直接结束；分值机会不足才失败。
- 没有数字倒计时、默认解法线或提示按钮。
- 所有新角色图先使用Image生成并记录来源/提示词，然后接入游戏。
- 方案先经高级设计、体验审核，通过后主Agent实施；任何审核阻断先修订方案。

## Task 1: 审核与保存基线

Files: 以上spec/plan；`sand-marbles/tests/cart-edge.test.cjs`、`browser-cart-edge.js`；`docs/sand-cart-edge-v9.md`。

- [x] 将已完成边缘修复及54项测试记录为独立提交，保留真实输入证据。
- [x] 两位Agent分别审查分数/软锁/数值和信息负担/视觉/输入体验；结论、修订和通过条件写入`docs/reviews/sand-score-design-review.md`。
- [x] 主Agent对照九项用户需求和十五关表自查；无未定义分值、事件顺序或失败条件后执行。

## Task 2: 积分契约与珠子去向

Files: `sand-marbles/core.js`、`levels.js`、`tests/scoring.test.cjs`、现有核心/边沿回归。

Interfaces: World新增`score`、`targetScore`、`treasures`、`resolveBead(b, outcome, contact)`、`remainingPotential()`、`checkOutcome()`、`queueInteraction({u,kind,apply})`、`resolveInteractions()`；独立模块只排队，不得直接结算；outcome为`collected|wrong-color|missed|stolen`。成功入车调用`resolveBead`；同一颗active=false后不能再次计分。

- [x] 先写并运行失败用例：3颗球、目标20，一颗错色/被偷后仍playing，后两颗各+10后won；若两颗损失则最高10<20而lost。
```js
const w = new World(fixture({count:3,targetScore:20}));
w.resolveBead(w.balls[0], 'stolen'); w.checkOutcome();
assert.equal(w.state,'playing');
w.resolveBead(w.balls[1], 'collected');
w.resolveBead(w.balls[2], 'collected'); w.checkOutcome();
assert.equal(w.score,20); assert.equal(w.state,'won');
```
- [x] 增加三个确定性测试：最后一颗珠子碰宝物并入车、入车/砸车先后互换、偷珠与眩晕同刻；断言按u排序且同组达标优先。
- [x] 在当前入车扫掠逻辑中接入统一去向；损失先记录contact，只有checkOutcome判负才使用冻结接触位置。World snapshot提供分数、目标、剩余最高可得和损失计数。
- [x] levels逐项填入spec目标分，保持初始珠群及沙量额度；评分测试改为按目标达成，保留边沿几何测试的满分单珠fixture。
- [x] 运行`node --test sand-marbles/tests/{core,cart-edge,scoring}.test.cjs`，提交评分契约。

## Task 3: 动态岩石、引线与宝物

Files: 新建`hazards.js`、`tests/hazards.test.cjs`；修改`core.js`地形与step、`levels.js`物件配置。

Interfaces: `new Hazards(world)`；`step(dt)`；`touchBead(b)`；`explode(bomb)`；`world.rocks`为动态实例，`world.terrain.solid(x,y)`同时考虑沙与动态石mask，`world.terrain.rebuildRockMask(rocks)`只更新实体遮挡不增加playerCells；世界事件`rock-warning|rock-land|cart-broken|stunned|worm-out|fuse|blast|treasure`。

- [x] 写支撑、落速、薄地面、岩石旧位清空、矿车/人/虫碰撞的失败用例。夹具由World真实地形构造，不通过直接改得分伪造通关。
```js
const w=rockFixture(); w.terrain.line([170,330],[310,330],30,'player');
for(let i=0;i<120;i++)w.step();
assert.ok(w.rocks[0].y>w.rocks[0].initialY);
assert.equal(w.terrain.rockMask[oldRockCell],0);
```
- [x] 沙网格与石遮挡分离；支撑不足立即显示预警并连续计时0.55秒后才落下，支撑恢复重置计时；重力子步、地面落定；真实impact只执行一次；动态revision通知Rival重算障碍。
- [x] 先验证布局：宝物碰撞体与40半径开口及初始珠子均不重叠；第15关首袋为(200,545)，首个物理步无自动开袋/点火。
- [x] 配置spec宝袋坐标，扫掠圆形碰撞只+20/+30一次，宝石继续运动；宝物只排队，统一resolveInteractions在对应时间组后调用checkOutcome。
- [x] 写点火/暂停/爆炸半径/重复事件失败用例，再实现压力盘、3秒火星、半径78、岩石销毁/眩晕/虫退场/车毁和免费挖土；炸药随目标岩石移动，链式爆炸有一次性guard。
```js
const w=bombFixture();const before=w.terrain.units;
w.hazards.touchBead(w.balls[0]); assert.equal(w.bombs[0].state,'burning');
for(let i=0;i<361;i++)w.step();
assert.equal(w.bombs[0].state,'spent'); assert.equal(w.terrain.units,before);
```
- [x] 运行物理/边沿/得分/机关测试，提交环境互动模块。

## Task 4: 盗宝人体力与反应

Files: `rival.js`、`tests/rival.test.cjs`、`tests/pressure.test.cjs`；新生成角色图集与`assets/README.md`。

Interfaces: Rival保留`step(world,dt)`、`toolPoint()`、`snapshot()`，新增`stamina`、`stateTimer`、`listenCooldown`、`stealCooldown`、`stun(seconds)`、`refreshObstacles(rocks)`；偷珠调用World.resolveBead而非end(false)。

- [x] 写体力快慢、低体力休息/恢复、声源阈值与冷却、单颗装袋冷却、眩晕不偷不挖的失败用例。
```js
const w=rivalFixture(); w.rival.stamina=19;
w.step(); assert.ok(['wiping','drinking','resting'].includes(w.rival.phase));
const removed=w.rival.removed; for(let i=0;i<120;i++)w.step();
assert.equal(w.rival.removed,removed);
```
- [x] 实现状态优先级：眩晕 > 装袋 > 休息 > 侧耳 > 追赶/工作。图鉴/页面隐藏的统一暂停不单独推进任何计时。
- [x] 使用Image生成匹配矿场风格的侧耳、擦汗、喝水、装袋动作图集；工具铲头继续对齐真实点；素材未加载完成不能开始。
- [x] 验证近处实际珠子可触发，静音不影响AI，空挖不能刷reaction；提交Rival状态机。

## Task 5: 多队友与单轨约束

Files: 新建`cart-crew.js`、`tests/cart-crew.test.cjs`；修改`core.js`、`levels.js`和`game.js`。

Interfaces: `new CartCrew(world,count)`、`step(dt)`、`snapshot()`；world.porters为数组，各item绑定cartIndex、phase、timer、targetX、speed；world.jars含intact/wreck；按初始x保留order，不能按当前x重排来掩盖交换。

- [x] 写2/3/4车长时间随机运动的失败用例：间距≥104、顺序不变、x在96..496、受阻/回程/破车均不瞬移。
```js
for(let i=0;i<12000;i++){w.step();const js=orderedJars(w);
 for(let k=1;k<js.length;k++)assert.ok(js[k].x-js[k-1].x>=104-1e-7);
}
```
- [x] 改为连续目标移动，受邻车/残骸/落地岩石限制；等候再择向；无任何phase-end硬设homeX。
- [x] 根据spec关卡表配置队友人数；绘制角色高度约80，手掌(x车−24,y654)、足底y706、可见范围[x车−94,x车−24]且头顶y≥622，统一面向右方、回程拉车；逐帧检查最左x96与车距104时的屏幕/相邻角色/车口安全范围。
- [x] 重跑边沿+移动接珠测试，提交单轨系统。

## Task 6: 图鉴、HUD与矿场美术

Files: 新建`codex.js`，修改`index.html`、`style.css`、`game.js`、`audio.js`、根主页版本与介绍；素材记录。

Interfaces: `SandCodex.entries`、`SandCodex.forLevel(level)`返回元素id集合；game持有sessionSeen Set和pendingIntro；dialog打开计入统一paused条件。World事件驱动+10/+0、宝物、爆炸/眩晕/破车表现。

- [x] HUD展示目标分、当前分进度、剩余最高可得与沙量；结算展示得分/目标而非“全珠收齐”，失败解释积分不足。错色/漏接本身不弹失败层，明确“错色 +0 · 已得分不扣”；不足时用当前+剩余最高<目标的具体数值解释。
- [x] 实现图鉴与一次性新发现对话框；首见暂停、确认才seen、重来不重复、刷新恢复、直接选高关不遗漏。首次提示不允许Esc/遮罩绕过，确认按钮才标记seen；常规图鉴X/Esc/遮罩都只关闭。打开对话框释放pointercapture并清空划线，恢复清空accumulator，等待新pointerdown才能挖，防止关闭误挖。没有首见时立即自动运行。
- [x] 390×844、360×800手机页头+工具≤200px，画布等比且最大高100svh−214px，分数/沙层/全部车口同屏；图鉴内部滚动、确认按钮固定可达、触控高度≥36px。
- [x] 使用原创绘制和生成素材制作棕色土层、金属木框、宝袋、压力盘/导火线/爆炸环、破车、体力条、侧耳/休息/转星。视觉危险区必须同真实半径一致。
- [x] 加本地合成宝物/点火/爆炸/眩晕/损失声音，静音全部停止；不引入浏览器自动播放依赖。
- [x] 真实鼠标/触屏检查首次提示暂停与不重弹、得分达标和损失可继续、图鉴入口、声音、刷新；提交UI。

## Task 7: 十五关平衡、复核与发布

Files: `tests/levels.test.cjs`、`tests/solutions.cjs`、`tests/timing.cjs`、浏览器输入脚本、spec布局表及`docs/reviews/sand-score-release.md`。

- [x] 逐关四组种子执行真实沙路径；若新落石/多车导致无解，调整局部物件坐标/等待时序，不关闭机关或通过测试作弊获胜。每关目标本身固定于spec；需变更则写原因与新上限。
- [x] 第8/11/14/15各4种子额外验证炸药可用但未触发仍能达标，并验证真实点火路线；回放结果含队友分配、分数、损失、宝物和点火数。
- [x] 高级设计/体验Agent进行初中后段实操，并包含至少一次：宝物开分、岩石砸车/眩晕/虫退场、珠子点火、体力休息/侧耳、多车等待、错色仍能翻盘。
- [x] 主Agent关闭阻断问题；`node --test sand-marbles/tests/*.test.cjs`全过；桌面与手机无JS异常，无后端/存储请求。
- [x] 更新完整规则/15关表/提示词/实际验证证据；审阅diff，不触碰另一款king-match游戏。
- [x] 正常提交、整合main并推送；确认准确SHA的Pages部署与线上主页入口、新素材加载、代表性交互。最终交付链接、设计Markdown和已验证范围。


执行完成记录：见 `docs/reviews/sand-score-release.md`。实际接口命名可与草案不同，以已验证的行为契约为准。第8/11/15关压力盘与分级车程校准已补入spec；目标分未改变。
