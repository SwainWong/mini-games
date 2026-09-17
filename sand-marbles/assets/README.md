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
