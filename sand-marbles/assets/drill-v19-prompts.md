# v19 大钻机素材

使用内置 Image 生成工具编辑 v18 钻机图集。最终素材：`rival-drill-v19.png`、`rival-drill-aim-v19.png`、`drill-parked-v19.png`。保留原始 RGBA 输出，运行时裁取素材，没有用额外手臂或旧钻头叠加新图。

## 向下挖掘与行走图集

Edit this exact game sprite atlas, 1536x1024 RGBA transparent background. Keep all 12 complete characters in the same positions, poses, dimensions, root/feet locations, face, clothes and hands. Change only each handheld mining drill: make the golden yellow motor casing comically bulky, about twice its current thickness, bright yellow with bold dark vents; replace the thin dark spiral with a chunky wide silver conical auger, broad bright helical fins about 2.5 times thicker, recognizable when rendered small. Keep handle positions and drill tip endpoints. Retain the same four columns by three rows. No extra parts, duplicates, dust, glow, background or text. Hands grip handles. Premium 2.5D cartoon.

## 向上与横向挖掘图集

Edit target: v18 aim atlas. Style reference: new downward drill atlas. Return the original 1536x1024 four-by-three layout with same characters, poses, dimensions, feet and hand positions and transparent alpha. Replace each thin drill with an exaggerated yellow motor and thick bright silver conical auger matching the reference. Twice-thicker motor, bold vents, 2.5-times thicker spiral for mobile legibility. Keep tips within each tile, same direction and pose. Do not copy poses from the style reference or increase body size. No dust, ground, text, trails, duplicated limbs or tools. Transparent 2.5D cartoon.

## 停放钻机

Create one isolated game prop matching the large yellow reference drill: oversized bright yellow cylindrical motor casing, chunky black vents, side handles, wide bright silver conical screw auger. Upright resting on its pointed auger, tip at bottom, fully visible, no character or hands. Premium 2.5D cartoon. Center with padding. Transparent alpha background. No shadow, floor, text or other objects.

## 接入校准

模型生成的钻尖并非逐像素保留，因此在 `rival-animation.js` 分别记录新图钻尖 `artTip` 和原物理钻尖 `tip`，渲染时对齐二者。左右朝向和全部24张姿势验证接触点一致；人物保持原来的绘制比例，不改变追击速度、判定半径或挖掘距离。
