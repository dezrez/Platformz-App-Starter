# Start your Angular app

1. Extract this ZIP into a folder you can find again, such as **Documents / My Dezrez app**. Open the folder containing `package.json` and this file; do not choose its parent folder.
2. Open that folder in your chosen coding assistant. In Codex, add or open it as the project folder. In Claude Code, choose the local environment and open this folder. Check the selected folder before sending a message.
3. Paste this prompt, replacing the sentence about your idea:

> Read DEZREZ-START-HERE.md, AGENTS.md and skills/dezrez-angular-app/SKILL.md in this folder. I am a beginner. Build this idea using the working Dezrez Angular starter: [describe your idea]. Check that the required Node.js version is available, run npm ci, npm test, npm run build and npm run validate, then start the app with npm start. Keep the existing locked dependencies, partner SDK, Dezrez themes, heading icons and lifecycle protections. Use fictional records until I connect through the developer website. Give me the local app address and one clear next step. Do not add packages or make direct Dezrez/provider calls to bypass unsupported capabilities.

4. When your assistant gives you the address, return to the developer website. Choose **Open my app for testing** and paste the address. The default address is **http://127.0.0.1:4200/**. The assistant should set the exact website origin in `DEMO_PARENT_ORIGIN` before starting the production preview.

You can also open **http://127.0.0.1:4200/mock-host.html** to try fictional examples without signing in.

It starts as a dashboard widget with no record selected. Choose a property,
its marketing role or a people group in the mock host to open the record dialog
and notes example. Your signed-in agency is handled automatically by the website.
A widget receives no
property or person and must not make up an ID to call a record API.

If this is an older app, use the website's separate **Update my app** message.
Updating the AI's instructions alone does not update app code or its supported
record choices. Ask your AI to preserve your app while comparing the latest
starting files, SDK and record-contexts reference.

To install or update the assistant’s project skill, paste:

> Read the canonical skill at skills/dezrez-angular-app/SKILL.md. For Codex, copy that folder to .agents/skills/dezrez-angular-app inside this project; for Claude Code, copy it to .claude/skills/dezrez-angular-app. Keep the canonical folder as the maintained source, update the project copy when the canonical instructions change, and do not change global assistant settings. Follow AGENTS.md or CLAUDE.md as well. Explain what you updated in plain language. Never invent new operations or change the locked dependency profile to make a test pass.

You do not need a private repository, feed, deployment account or API key. If an idea needs a capability this starter does not support, your assistant should explain that in ordinary language and keep the demonstration fictional.

Keep `fontSource:'bundled'` and the included local Dezrez icon files. The app uses
licensed Exo 2/Poppins fallback fonts without external font requests. These do
not claim Exo Soft/New Rubrik parity. Preserve the notices and the strict app
policy; do not restore an unused base tag or a hosted font link.

The starter includes fictional app details for testing. Ask your AI to keep them
accurate as it changes the app. Before preparing a real release, it must ask you
for your organisation, a support contact and an estimate of how people will use
the app. It must leave unknown details unfinished instead of guessing. The
bundled app-details reference explains how the AI records your answers.

## If the browser needs a secure local address

Keep the usual setup first. If your browser needs an HTTPS address, give your AI
the message in [the optional secure local setup](skills/dezrez-angular-app/references/local-https.md).
It explains the change before asking to install anything or change computer trust.
Keep certificate keys outside your project and source submission.
