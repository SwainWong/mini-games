# Mini Games project conventions

- Each game lives in its own top-level directory, with its own `index.html`, CSS, JavaScript, assets, and README. Keep games independently runnable.
- Root `index.html` and `home.css` form the collection homepage. Add a homepage card and update the count when adding a game.
- Use relative asset and navigation paths. The deployed base path is `/mini-games/`, not `/`.
- Keep the project static and dependency-light. Do not add a backend, accounts, databases, cloud saves, remote leaderboards, analytics, or telemetry.
- Game progress must reset on refresh. Currently there is no persistent browser storage. At most, localStorage may be used for future local preferences; never introduce remote persistence without a new user instruction.
- Do not commit credentials, local absolute paths, browser profiles, or test output. Original references and development screenshots are not deployment assets.
- Verify changes with a browser at desktop and mobile widths. For game logic changes, exercise actual pointer/touch input and verify completion, failure/restart, and refresh reset. For homepage changes, verify links under the project base path.
- GitHub Pages publishes `main` at repository root. A local preview or successful push alone is not proof of a completed deployment; check the Pages build and live page.
