# Start your app

1. Put the downloaded files in a folder you can find again, such as **Documents / My Dezrez app**.
2. Open that folder in Claude Code or Codex. The developer website can give you a message to paste into your AI.
3. Tell your AI your first name. It will get your welcome app running.
4. When your AI gives you an address, return to the developer website in your normal Chrome or Edge window to see it.
5. Then tell your AI what you would like your app to do. You have not chosen an app type yet.

You do not need Visual Studio Code, a deployment account or an API key. Your AI
can check the small set of tools it needs and explain any installation before
you do it. Keep your AI open while you try your app.

## Message for your AI

> Read DEZREZ-START-HERE.md, AGENTS.md, skills/dezrez-angular-app/SKILL.md and references/rezi-styling.md in this project. I am a beginner. Ask my first name if you do not know it. Start the supplied app showing only my welcome message; I have not chosen what to build. Do not add body copy, instructions, another panel or a list of next steps inside the app. Give instructions to me in this chat or the wizard. Check the required tools, use the locked dependencies, run npm ci, npm run check:welcome, npm run build and npm run validate, then keep npm start running with DEMO_PARENT_ORIGIN set to the exact developer website address I am using. Keep hosted Exo Soft and New Rubrik, the supplied panel, icon, semantic colours and host-owned appearance. Check only the welcome in its current appearance; do not select records, run a theme/context matrix or open the optional notes example. Do not open the developer website inside your internal browser. Give me the verified local address and one simple next action in my normal Chrome or Edge window. Then ask what I want my app to do.

## When your chosen widget needs settings

That is a later choice, not part of the first welcome. Ask your AI to read
[the widget-settings guide](references/widget-settings.md) only when you want
that feature. Preview settings are temporary; the production-host connection
has not been verified.

## If you already have an app

Use the website's separate **Update my app** message. Your AI should preserve
your work and compare only the starting files it needs. Installing new AI
instructions does not update your app automatically. Do not replace your app
with a welcome screen or the optional record example.

To install or update the project skill, ask your AI:

> Read skills/dezrez-angular-app/SKILL.md. Copy the canonical folder to this project's .agents/skills/dezrez-angular-app for Codex, or .claude/skills/dezrez-angular-app for Claude Code. Keep both copies in step when the canonical instructions change. Do not change global settings. Explain what you did in plain language.

Developer details and the optional later example are in [README.md](README.md).
