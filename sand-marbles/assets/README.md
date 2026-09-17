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
