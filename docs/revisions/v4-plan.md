# 国王消消乐 v4 Implementation Plan

> **For agentic workers:** 使用 superpowers:executing-plans 在主 Agent 内逐项执行。同一制作人负责方案与最终审查，不新增子 Agent。

**Goal:** 无实体穿插、宝石全清通关、完整人物帧动画与低血概率推盾。
**Architecture:** 提取共享几何，保留固定步长；规则层新增全清搜索，动画读取HP/盾速度/爆发时钟。
**Tech Stack:** 原生JS/Canvas、Node tests、Playwright、image PNG、Pages。
**Spec:** docs/revisions/v4-design.md

## Global Constraints

免费、不删除原资源；无后台/存储/遥测；真实输入验收；随机力不改砖；HP0失败优先；八帧整身图集；用户最新全清胜利覆盖v3规则。

## 1. 碰撞边界
- [x] 写失败复现：颗粒在厚斜坡内部、砖联合边缘/密集落位/运动盾内；记录旧最大穿透。
- [x] geometry.js 输出 RAMP / BEAM / circlePolygon / projectUnion；绘制复用轮廓。solver每步移动砖/盾后约束全部颗粒，保留守恒。
- [x] 用 sweep + 邻近可行空间解困；测试固体最大穿透<=0.05画布像素，普通静止/下落/推盾均覆盖。

## 2. 全清规则与关图
- [x] 失败测试：排出超过旧目标但剩砖仍playing，全部清且存活即won，HP0同帧lost。
- [x] match.solveClear(board) 返回全清 path / null；搜索采用剩余数量与颜色残量剪枝，resolve含重力连锁。
- [x] 构造两张经过全清验证的棋盘，更新solutions与布局回归；hint/remix使用全清解，remix未验证不提交。
- [x] HUD/玩法/结果改剩砖和全清，更新星级并实测两关。

## 3. 高能与帧动画
- [x] image 生成八格完整身体图集，检查 alpha/锚点/脚型，原样复制assets并记provenance。
- [x] 测试真实伤害后HP<=40且随机<.35触发，冷却8秒/持续2.2秒/上限2次；随机>=.35不触发，致死不触发。
- [x] 高能提高实际盾力/速度，移动碰撞推出粒子；加入整帧步态与受伤/蓄力/推盾反馈，暂停冻结。

## 4. 独立复审与发布
- [x] 规则/碰撞/守恒/残局/物理随机种子测试；实际鼠标和触屏全清、失败、爆发、暂停重置；保存重叠近景。
- [x] 制作人先盲玩并复评，修阻塞直至批准。
- [x] 更新文档和主页；保留main并行更新；push与Pages精确构建、hash、线上两关独立验证。
