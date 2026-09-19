# v16 Rival Behavior Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. 主Agent执行，独立Agent审核。

**Goal:** 修复单珠追逐卡死、量化负重减速和无效体力消耗；不依赖待选的A/B/C造型。
**Architecture:** 保持Rival的World接口与120Hz物理步。路线连接实际起点与合法网格节点，首段和终段用相同碰撞边界验证；无进展/拾取失败使用目标冷却和巡查，真实移动驱动耗体力。
**Tech Stack:** 原生JS UMD、node:test、Canvas浏览器。
**Spec:** docs/superpowers/specs/2026-09-18-sand-drill-magic-design.md，第3节。

## Global Constraints

- 专业设计复审已通过；角色美术选择仍待用户，行为修复可以独立验证，不提前替换正式贴图。
- 不改变目标分数、珠子身份、岩石碰撞边界；不通过关闭敌人或降低测试要求过关。
- 仅本页状态、无后端或持久化；本阶段不发布未完成的v16。
- 全目标还包括装载、落石承载、随机轮控、固定底座、魔法袋、单铲、气泡、新美术和3位玩家>90分，另行后续阶段完成。

## Task 1: 真实起点路线与失败恢复

Files: `sand-marbles/rival.js`, `sand-marbles/tests/rival-navigation-v16.test.cjs`。

- [x] 添加失败用例：石(280,300,60,40)、人(279,247)、单珠(400,300)，检查每个路径段lineClear并在20秒内真正入袋。
- [x] 增加左右镜像石沿、目标在石外但取物路径被挡、快速珠子接触前逃脱、落石位移后重算、不可达目标和可达目标同时存在的测试。
- [x] 运行 `node --test sand-marbles/tests/rival-navigation-v16.test.cjs`，保存失败证据。
- [x] 改 `route(target)`：从实际角色坐标连接多个可见节点，成本从真实距离开始；终点必须能canReach目标，构造的第一段也必须lineClear。清空的路线不等于能拾取。
- [x] 增加 `avoidTarget(ball,seconds)` 和 `watchProgress(previous,dt)`；无进展0.75秒换路、1.5秒冷却目标，拾取取消给该目标短冷却。不能反复选择同一失败路线。
- [x] 不可达时按合法巡查路线走开，冷却结束再试；无需越过岩石或地图边缘。
- [x] 复跑新测试和旧rival/physical-loot/pressure测试，检查身份守恒及真正偷到珠子，不只验证位置变化。

## Task 2: 负重与体力

Files: `sand-marbles/rival.js`, `sand-marbles/tests/rival-navigation-v16.test.cjs`。

- [x] 添加0/3/6/10/20颗同等体力、同地形实际位移单调测试，6颗约空载63%、10颗约50%；卡住无位移不耗体力测试。
- [x] 引入 `loadFactor=max(.38,1/(1+.1*bag.length))`，平滑体力倍率.8–1.1；按真实位移/成功钻沙消耗体力，不在clear拒绝移动后照扣。
- [x] 保留完整休息等待和听声保护，后续正式坐姿素材按A/B/C选择接入。逃跑的负重倍率也统一。
- [x] 运行全部 `node --test sand-marbles/tests/*.test.cjs`。若旧15关路线因行为修正失败，分析实际过程与路线，不改目标或放松断言掩盖。

## Task 3: 独立审核与记录

- [x] Agent独立审核起点连接、冷却、目标身份、体力变化和测试覆盖；主Agent修正重要问题并复测。
- [x] 记录基线失败、新测试结果、仍待完成的素材/游戏机制，提交精确范围，不部署未完成版本。
