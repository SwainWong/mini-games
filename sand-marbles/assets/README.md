# 当前版本 v12

新增盗宝人12单元图集和炸药4单元图集，实际接入8帧挖掘、3种拾取动作、独立可缩放背包及压力盘/爆炸效果。完整提示词、实际尺寸见 [v12-prompts.md](v12-prompts.md)。以下旧素材保留供角色休息、矿车、地形等继续使用。

# v10 积分矿场补充素材

内置 Image 生成，2026-09-18。先生成再接入；原始 PNG 保留 Alpha，不进行程序重绘。盗宝人沿用 rival-v8 的身份和暖色 2.5D 雕塑质感，新增六状态；道具采用同一光照和材质。用户的经典矿工游戏图片仅作棕色土层与木金属 HUD 的方向参考，未复制图片或标识。

- `rival-actions-v10.png`：1536×1024，3×2、512 像素单元；擦汗、喝水、侧耳、装袋、眩晕、疲惫。
- `mining-props-v10.png`：1254×1254，2×2、627 像素单元；问号袋、宝箱、炸药、破矿车。提示要求 1024，但渲染按生成文件实际尺寸切片。

### 盗宝人完整提示词

Use case: stylized-concept. Production transparent sprite atlas for a mining game. Reference image defines SAME mischievous bearded thief with purple hat brass goggles, purple jacket brown pants leather boots tan treasure sack, same warm sculpted 2.5D cartoon look. Create SIX new FULL BODY poses in exactly 3 columns x2 rows on1536x1024 (512px cells), centered consistent scale, feet baseline470, hat top55, ample transparent margins. Faces generally right, front-three-quarter. Top left: tired wiping sweat with forearm, other hand on hip. Top middle: drinking from small turquoise water flask tipped to lips. Top right: listening intently hand cupped behind ear, leaning forward wide eyes. Bottom left: opening own treasure sack and stuffing a small glowing gem inside. Bottom middle: dizzy, sitting on ground, one hand rubbing head, three small stars circling above. Bottom right: panting exhausted hands on knees, hunched but full body visible. No shovel/no extra tools, no text, no background or ground. Actual alpha transparent background, isolated clean silhouettes. Readable at60px height, expressive clearly different actions. Original cartoon game style, not flat vector.

### 道具完整提示词

Use case: stylized-concept. Game production sprite atlas, 2 columns x2 rows on1024x1024, each object isolated fully within512px square cell with generous margins. Genuine alpha transparent background. Same warm sculpted 2.5D cartoon mining adventure style, ochre earth palette, thick rounded silhouettes, soft top-left highlights and occlusion, polished but readable at40px. Top left: tied chunky tan leather treasure pouch, large embossed cream question mark '?' on its front, gold coins peeking from tied opening. Top right: small closed honey-brown oak treasure chest, antique brass corner bands and chunky blue-green clasp, no letters. Bottom left: cartoon red dynamite bundle tied with rope, curled unlit fuse ending at top right, no words, no flames. Bottom right: broken small wood and iron mining cart, squat wide open front-three-quarter view, cracked wooden front, one bent wheel, tilted rim, no gems, no character. No scenery, floor, background shadows, borders, logos, gore or people. Keep consistent warm lighting and material style across four objects.

---

# v8 · 小矿工与接珠矿车

先由内置 Image 生成以下素材，再实现游戏；均为本项目新生成并保留真实透明 Alpha。v8 游戏加载这三张及 `props-v7.png`。旧素材仅保留为历史记录。

| 文件 | 实际尺寸 | 用途 |
|---|---|---|
| `porter-v8.png` | 1536×1024 | 3×2：左右脚推行、拉车、擦汗、思考、庆祝 |
| `rival-v8.png` | 1536×1024 | 3×2：准备、下铲、回拉、两步奔跑、抢珠；铲子按实际接触点绘制 |
| `cart-v8.png` | 1572×1001 | 独立空矿车；车斗、标签和收集数跟随物理位置 |

沿用 v7 暖光雕塑感的 2.5D 风格。矿工生成时参考旧矿工身份与材质，盗宝人参考新矿工材质。手掌、开口、车轮位置以实际生成结果重新测量，不盲用提示中的坐标。动作帧固定手掌握点，脚在轨道前侧行走；矿车开口中心映射到逻辑 y=590，车轮底部在 y≈646 的轨面。图像文件直接作为静态资源，无外部图片服务或运行时生成。

## v8 最终提示词

### porter-v8.png

Use case stylized-concept. New transparent sprite atlas for same game, reference is identity/material STYLE only. Six FULL BODY SMALL SLIM miner poses in exactly 3 columns x2 rows on1536x1024, each cell512x512. Friendly bearded worker yellow helmet teal overalls brown gloves boots, polished 2.5D animated-film 3D warm left lighting. Slim agile proportions, NOT huge muscular or stocky, body about160px wide, height380px in each cell, centered. Side view facing RIGHT, pushing an invisible minecart handle to his right. NO jar, NO cart, NO wheel, NO tools, no floor, no text. BOTH HANDS to right, hands contact invisible handle at same local x400 y270 in all pushing poses, feet baseline470, helmet top70. Poses: top-left push left leg forward; top-middle push right leg forward; top-right lean backward braking/pulling handle; bottom-left hold handle with one hand and wipe forehead with other; bottom-middle one hand stays handle while other scratches chin thoughtfully; bottom-right celebrating successful catch fist raised, other hand still on handle. Entire full-body within each cell with ample transparent margin. Actual transparent alpha background. Crisp readable silhouettes for 45x65px game sprites.

### cart-v8.png

Use case stylized-concept. Production game sprite: ONE small empty minecart on real transparent alpha background, isolated no floor no rails no characters no text. Polished 2.5D animated-film sculpted style, warm light upper left, soft volume and bevels. Orthographic near-FRONT view very slightly above, symmetrical. A squat wide open-top minecart: thick dark steel rim and weathered warm oak side panels with iron corner brackets and bolts, two large round steel wheels seen on the FRONT face at lower left and right, wheel axles aligned horizontal. Wide open dark empty receiving compartment with horizontal elliptical/rounded rectangle opening spanning 80 percent of total cart width. Short and wide shape about2:1, opening readily accessible for falling gems. Small horizontal metal pushing handles extending a LITTLE outward on BOTH left and right sides at half body height. Crop generous margins around full cart including wheels and side handles. Sharp readable silhouette for a110x70px game sprite. No gems inside, no lid, no shadows outside sprite, no landscape.

### rival-v8.png

Use case stylized-concept. Reference is polished 2.5D material/render STYLE only. New sprite atlas six poses, exactly3 columns2 rows on1536x1024, transparent alpha. SAME slim mischievous adult treasure thief in each cell: purple explorer hat with brass goggles, purple jacket, tan bulging treasure sack on back, brown gloves boots. Full body facing RIGHT side-three-quarter view, consistent height400px and baseline470, each inside512x512cell with margins. NO shovel, NO pickaxe, NO tool is drawn: engine will animate shovel precisely at the hands! Hands together to right at waist height local x390 y275 gripping an INVISIBLE shaft. Poses:1 crouched ready to dig,2 drive both hands forward/down for digging stroke,3 pull hands back to lift dirt,4 left-foot running stride hands held at waist,5 right-foot running stride hands at waist,6 triumphant grin one fist lifted with one hand open at waist ready to grab a gem. Clear slim silhouette readable at50x60px, expressive eyebrow changes, small athletic body not enormous. Warm light upper left, sculpted rounded 3D volume, no backdrop, no ground, no text, no lines between cells.

---

# v7 · 统一 2.5D 美术

先使用内置 **Image** 工具生成素材，再实现游戏。全部 PNG 保留真实透明 Alpha，随静态站点发布；没有图片 API 或运行时生成。旧 v6 文件保留作为历史素材。

| 当前文件 | 实际尺寸 | 用途 |
|---|---|---|
| `porter-v7.png` | 1536×1024 | 3×2 完整人物与陶罐动作：左右脚、负重休息、擦汗、思考、抬罐；桌面侧栏也使用第一帧 |
| `rival-v7.png` | 1254×1254 | 2×2 盗宝人扬铲、掘土、奔跑、抢珠动作 |
| `props-v7.png` | 1254×1254 | 2×2 岩石与两种蚯蚓爬行姿态（左上旧形状罐子未采用） |
| `jar-v7.png` | 1254×1254 | 无人物的宽口陶罐，运行时叠加颜色与数量 |

不再把独立手掌绘制在玻璃罐上。搬运工与罐子整体切帧，外侧把手的遮挡关系由素材确定。六帧罐口分别测量、对齐同一个物理目标。全角色边界用于限制活动范围。

## v7 最终生成提示词

统一风格：polished sculpted 2.5D animated-film look, rounded 3D volumes, warm upper-left studio key light, cool ambient occlusion, orthographic near-front camera slightly above, ivory ceramic, mustard hardhat, teal overalls, plum treasure thief, genuine alpha transparency, no text, no logos. 四张最终素材均以同一首轮矿工图集作为风格来源；第二轮紧凑搬运图集以第一轮作编辑参考，单独陶罐以第二轮图集作参考。

### porter-v7.png

Use case precise-object-edit. Redesign this sprite atlas layout for gameplay: same miner identity/material/style but make the jar SHORT AND WIDE like a squat treasure bowl, and position the miner DIRECTLY BEHIND the jar, NOT to the right. Need compact width and visible correct grip. New 1536x1024 atlas exactly 3 columns 2 rows of 512 square cells. Each full assembly centered at local x256. In EVERY cell the jar's dark OPENING is centered x256 y290 and inner opening width260 pixels, height36. Jar body extends x105 to407 y300 to430 (short wide bowl), ornate ivory ceramic with small loop handles x88 and424. Miner head above jar at x256 y155, miner feet below jar at y460. Adult smiling bearded miner hardhat teal overalls, muscular arms wrap OUTSIDE either side of jar and hands grip outside handles, never through ceramic. Six poses reading order: stepping left foot forward; stepping right foot forward; standing resting both hands grips; jar resting one hand grips left handle other wipes forehead; jar resting one hand grips right handle other scratches chin; bent knees lifting two handles. Jar shape size mouth location must match in all six cells. Body/arms behind jar, hands on handles outside jar. Genuine alpha transparent background, no text, no floor, keep generous margins in every cell. Polished rounded 3D animated-film render not flat or pixel art, upper-left lighting. All six poses contained full body.

生成结果的实际开口位置不同于提示中的理想坐标，因此 `game.js` 使用实测的逐帧位置，而非盲用提示坐标。

### rival-v7.png

Use case: stylized-concept. New transparent game sprite atlas matching the reference's polished sculpted 2.5D animated-film look, NOT flat art. Reference is STYLE only. Exactly 2x2 grid on 1024x1024, each 512x512 cell shows SAME mischievous adult treasure thief, purple explorer cap with brass goggles, plum jacket, dark boots, oversized bulging tan treasure sack on back, holding short spade. Orthographic 3/4 side view facing RIGHT. Warm upper-left key light, solid rounded volumes, soft occlusion, clear face. Four poses: top left spade lifted for rapid digging, top right deep forward spade digging strike, bottom left sprint with spade and bouncing sack, bottom right excited capture clutching single glowing orange marble. Full body and all shovel tips contained inside each cell, consistent scale, generous 25px margins. No text, no labels, no scenery or floor. Genuine alpha transparent background.

### props-v7.png

Use case stylized-concept. Create matching 2.5D polished sculpted 3D game props sprite atlas with real alpha transparent background. Match reference warm clay materials, upper-left studio lighting, orthographic slightly-above front view. A square 1024x1024 with exactly FOUR 512x512 cells. Top left: the SAME empty open ivory ceramic jar from reference, WITHOUT man, two exterior loop handles, ornate subtle carvings, wide dark elliptical opening, entire pot centered with margins. Top right: a single rounded warm sandstone boulder, believable volume, smooth bevels, sandy crevices, ellipse silhouette wider than tall, no other items. Bottom left: charming chunky peach-pink earthworm in side view horizontal, head facing RIGHT with big friendly eyes, rounded segmented body gently curving, full body and tail visible. Bottom right: SAME earthworm second crawling pose, stretched forward head facing RIGHT. Render bold rounded volume, translucent soft worm skin highlights and segment creases. No text, no numbers, no cell borders, no floor or background, no decorations. Each sprite completely isolated inside its cell.

### jar-v7.png

Use case precise-object-edit. Isolate ONE of the squat wide ivory ceramic treasure pots from reference, REMOVE miner completely, no hands no boots. Keep same sculpted 2.5D game style, carved band, rounded ivory ceramic short wide body and two small exterior loop handles. Make the open mouth MUCH WIDER than original, inner mouth spans 80 percent of whole pot width, so falling marbles can readily land inside. Wide shallow elliptical open dark inside. Pot body short, like bowl; whole object 2 times wider than high. Orthographic near-front slightly above camera, upper-left soft key, tangible 3D clay volume. Center ONE object on 1024x1024 genuine alpha transparent background with generous margins. No scenery no text no colored labels.

---

# v6 卡通美术

使用内置 Image 生成工具制作，未调用外部图片 API，也不在游戏运行时生成图片。三张图片均为本项目新生成，PNG 保留透明 Alpha。游戏实际使用角色图集切换动作；不会把整张概念图当可互动关卡。

- `art-direction.png`：1024×1536，风格概念稿；用于主页封面与桌面侧栏插画。
- `porter.png`：1536×1024，2×2 透明图集。迈左脚、迈右脚、喘气、发力。双手间的实际玻璃罐由游戏绘制，位置与物理同步。
- `rival.png`：1536×1024，2×2 透明图集。扬铲、挖掘、奔跑、抢得珠子。运行时覆盖被抢珠子的实际颜色。

## 生成提示词记录

以下记录最终提示词的主要内容与约束；两份角色图集以 `art-direction.png` 作为风格及角色参考。

### 概念稿

Use case: stylized-concept. Create a polished art direction concept for an original portrait HTML casual game called 沙里有珠 (do not render any text). Premium playful 2.5D cartoon game, warm cream, honey peach sand, deep terracotta cut earth, mint leaves, candy jewel glass marbles orange blue jade pink. Full portrait composition 1024x1536. Central large rectangular cross-section sand digging play board with rounded corners, soft sandy surface, excavated tunnels, colorful marble clusters at different heights, chunky rock obstacles. Three squat glass jars with thick color-coded open rims below the sand. Funny hardworking porter with yellow hard hat, blue overalls and oversized boots holding an entire jar from its side, face visible beside glass, mouth unobstructed. Mischievous treasure hunter with plum hood, red scarf and oversized tan treasure backpack, shovel digging toward marbles. Rounded clean contours, soft clay-like shading, warm directional lighting, readable silhouettes and uncluttered composition. No photorealism, gritty noise, geometric stick people, UI text or logos.

### 搬运工图集

Use case: stylized-concept, game production sprite asset. Image 1 is style and character reference only. New sprite sheet on genuinely transparent alpha background, landscape 1536x1024. Exactly four full-body poses in evenly spaced 2 by 2 grid, each fully inside equal cell with transparent margins. No borders, letters, scenery, ground shadows or props. Same friendly big-eyed cartoon worker, yellow hardhat, blue overalls, cream shirt, dark leather boots, brown gloves, premium 2.5D clay cartoon rendering. Front three-quarter facing right. Carrying a heavy invisible jar on his right side: gloved hands stretched toward right at waist/chest height, clear empty space to overlay the actual game jar. No actual jar drawn. Top-left walking left boot forward, top-right opposite step, bottom-left knees bent and puffed cheeks resting with sweat, bottom-right deeper crouch lifting with effort face. Consistent identity, crisp silhouettes, actual transparent PNG alpha.

### 挖宝人图集

Use case: stylized-concept, game production sprite asset. Image 1 is style and character reference only. New sprite sheet with genuinely transparent alpha background, landscape 1536x1024. Exactly four full-body poses in even 2 by 2 grid, with transparent margins. Same mischievous character: plum hood, explorer goggles, red scarf, oversized bulging tan treasure sack on back, dark gloves, chunky boots. Front three-quarter facing right. Top-left shovel raised, top-right leaning and thrusting shovel down into invisible sand, bottom-left running fast with shovel and sack bouncing, bottom-right smug cheer clutching small glowing orange marble with sack open. Polished soft clay/cartoon shading, saturated plum/tan/red, crisp silhouettes readable at 80px. No background, sand, shadows, borders, labels or text.

## v13 失衡与惊吓

通过内置 Image 生成并保留原始透明 PNG：
- `operator-v13.png`：3×2 图集，双摇杆操作、受惊、退后、两步逃跑；脚下控制台不会随人逃走。提示词：`operator-v13-prompt.md`。
- `panic-blast-v13.png`：4×2 图集，上排为盗宝人惊吓、弃袋、两步逃跑；下排初版爆炸未采用（上下格有轻微串图）。提示词：`panic-blast-v13-prompt.md`。
- `blast-v13.png`：独立 4×1 爆炸图集，闪光、火球、烟团、消散；实际效果在同一个爆点播放，不改变逻辑伤害范围。提示词：`blast-v13-prompt.md`。

## v14 方向盘控制台

使用内置 Image 工具先生成并保存原始透明 PNG，再应用到游戏：
- `operator-wheel-v14.png`：3×2，面向矿区的背面操作员与方向盘；中立、左转、右转、指左、指右、惊吓六姿势。提示词：`operator-wheel-v14-prompt.md`。
- `control-props-v14.png`：3×2，空置方向盘台、四灯矿井信号柱、琥珀/青玉/冰蓝/玫瑰发光灯片。提示词：`control-props-v14-prompt.md`。
- 运行时按单个驱动目标选择灯色，按实际车速选择转向姿势；转向图与中立图使用互补透明度。
