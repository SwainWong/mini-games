# Operator complete motion atlas

Generated with the built-in image_gen tool. Reference: operator-steering-v15.png (identity/style).

Use case: stylized-concept. Create a production game animation sprite sheet, not a concept board. Reference image is the existing miner identity/style only. Exactly 24 separate complete opaque poses in an exact regular 6 column by 4 row grid on a genuinely transparent alpha background, 3072x2048 canvas, every cell 512x512. No text, no labels, no borders, no motion lines, NO afterimages, NO extra or overlapping arms, no translucent silhouettes. Warm polished 2.5D cartoon mobile mining game. Same stocky miner, mustard hardhat black lamp, curly brown hair, cream shirt, teal overalls cross straps, brown gloves and boots, seen from BEHIND facing the mine (away from viewer). Same camera, size, lighting and body proportions in all 24 frames. Full body visible. Each cell boots baseline y=480, midpoint x=256. Helmet top y=90. Generous transparent gutters. A single wooden/brass steering console with one circular wheel in front of miner; console position identical in every frame, base at x256 y465, wheel hub x256 y210. Hands touch the same wheel correctly. Feet and console absolutely stationary except final startle. Only arms and slight upper body movement change.
Frames row-major:
Row 1 frames0-5 steering LEFT to NEUTRAL: far-left wheel grip, left intermediate1, left intermediate2, left intermediate3, left intermediate4, centered neutral both hands grip.
Row 2 frames6-11: right intermediate1, right intermediate2, right intermediate3, right intermediate4, far-right wheel grip, neutral both hands grip (identical neutral).
Row 3 frames12-17: LEFT pointing full sequence. Start neutral both hands wheel; left elbow lifts hand just releases; left forearm raises halfway; left arm extends upper-left pointing toward mine carts; same extended point with slight head glance left; left arm half retracts toward wheel. RIGHT hand always stays on wheel.
Row 4 frames18-23: RIGHT pointing full sequence. neutral; right elbow lifts hand just releases; right forearm halfway; right arm extends upper-right pointing toward mine carts; same extended point slight head glance right; right arm half retracts. LEFT hand stays on wheel.
Each frame is precisely one miner with exactly TWO arms and TWO hands. No duplicated limbs. Clear strong silhouettes, crisp opaque edges without ghost outline. This sheet will be cropped into actual runtime frames, so regular identical cell sizes, consistent anchors, and fully separated poses are mandatory.

Delivered: 1536 × 1024 RGBA, 6 × 4 cells of 256 × 256. Preserve original alpha; render exactly one actor frame, without crossfades.

