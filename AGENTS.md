# Instructions for this Angular project

Read `DEZREZ-START-HERE.md`, `README.md`, `COMPATIBILITY.md`,
`skills/dezrez-angular-app/SKILL.md` and `references/rezi-styling.md` first.
Project paths are relative to this folder, including in discovery copies.

Start with the welcome message only: the person's first name and greeting,
one standard Dezrez panel, no chosen context and no data operations. Keep the
welcome draft manifests synchronized, including empty permissions and
`starter:{phase:'welcome',context:'not-chosen'}`. Do not load the optional record
example or ask the person to choose a record before they decide what to build.
Keep instructions in the wizard, guide or AI chat, not in the app. Do not add
body copy, a next-steps panel or an instruction list to the welcome.

First build: `npm ci`, `npm run check:welcome`, `npm run build`,
`npm run validate`, then `npm start`. Check only the welcome in the current
appearance and actual loaded Exo Soft/New Rubrik. Never open the developer
website in an AI internal browser; hand back the address for normal Chrome/Edge.
`npm test` is the full developer suite for later development and CI, not a first
welcome requirement. Local structural checks grant no certification or release.

Keep the exact dependency lock, SDK origin/window/session protections, hosted
intact font kit, local reviewed heading icons and global semantic component
styles. Never introduce tokens in an iframe, legacy credential handoff, arbitrary
API calls, polling, automatic write retries, packages or custom builders. Do not
use force or legacy-peer-deps. Ask what the person wants to build before using
record example guidance or replacing a draft with complete record declarations.
