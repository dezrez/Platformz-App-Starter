# Start your app

1. Sign in on the developer website with your supplied Dezrez test account. Put the downloaded files in a folder you can find again, such as **Documents / My Dezrez app**.
2. Open that folder in Claude Code or Codex. The developer website can give you a message to paste into your AI.
3. Let your AI build and run the supplied two-panel welcome as your actual starting app. It gets your first name from your signed-in Dezrez profile; you do not need to type it.
4. When your AI gives you an address, return to the developer website in your normal Chrome or Edge window to see it.
5. Choose Group Hub, Property Hubs or Dashboard to see the same app in its host location. Tell your AI what you would like to add when you are ready.

You do not need Visual Studio Code, a deployment account or an API key. Your AI
can check the small set of tools it needs and explain any installation before
you do it. Keep your AI open while you try your app.

## Message for your AI

> Read DEZREZ-START-HERE.md, AGENTS.md, skills/dezrez-angular-app/SKILL.md and references/rezi-styling.md in this project. I am a beginner. Build and run my actual starting application from the supplied Angular source; do not just describe it or show a temporary message. Keep the supplied two-panel welcome: the first-name greeting and starting-app sentence, then What happens next with the exact three numbered instructions in README.md. The first name must come from negotiator/me FirstName through the supplied viewer extension: createViewerClient({client,hostOrigin}) before client.connect(), then getCurrentViewer() only after connection; call viewer.destroy() before destroying the core client. Never ask for a name, hardcode it, use a URL value, split ContactName or inspect tokens. Preserve generic loading and sign-in/retry guidance. Keep the code and book icons. Do not remove that body copy or instruction panel. Group Hub, Property Hubs and Dashboard are the three presentation choices for the same app and local address. Choosing a location does not choose its features or add record access. Do not add records, notes, forms, settings or other business features before I ask. Check the required tools, use the locked dependencies, run npm ci, npm run check:welcome, npm run build and npm run validate, then keep npm start running with DEMO_PARENT_ORIGIN set to the exact developer website address I am using. Keep hosted Exo Soft and New Rubrik, the supplied panels, icons, semantic colours and host-owned appearance. Check the signed-in greeting once in its current appearance without requesting record data; do not run a theme/context matrix or open the optional notes example. Do not open the developer website inside your internal browser. Give me the verified local address and one simple next action in my normal Chrome or Edge window. Then ask what I want to add to my app.

## When your chosen widget needs settings

That is a later choice, not part of the first welcome. Ask your AI to read
[the widget-settings guide](references/widget-settings.md) only when you want
that feature. Preview settings are temporary; the production-host connection
has not been verified.

## If you already have an app

If you later ask for a chart, your AI should follow [the chart guide](references/charts.md)
and use the supplied Chart.js package with the Dezrez fonts, themes and ordered
colours. The first welcome stays as its two simple panels.

Use the website's separate **Update my app** message. Your AI should preserve
your work and compare only the starting files it needs. Installing new AI
instructions does not update your app automatically. Do not replace your app
with a welcome screen or the optional record example.

To install or update the project skill, ask your AI:

> Read skills/dezrez-angular-app/SKILL.md. Copy the canonical folder to this project's .agents/skills/dezrez-angular-app for Codex, or .claude/skills/dezrez-angular-app for Claude Code. Keep both copies in step when the canonical instructions change. Do not change global settings. Explain what you did in plain language.

Developer details and the optional later example are in [README.md](README.md).
