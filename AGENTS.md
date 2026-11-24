# Instructions for this Angular project

Read `DEZREZ-START-HERE.md`, `README.md`, `COMPATIBILITY.md`,
`skills/dezrez-angular-app/SKILL.md` and `references/rezi-styling.md` first.
Project paths are relative to this folder, including in discovery copies.

Start with the two supplied standard Dezrez panels: the person's first-name
welcome and its starting-app sentence, then What happens next with the exact
three simple numbered instructions. Build and run them in the actual Angular
application source; they are not a temporary message. Keep their code/book
heading icons. There is no chosen record data access or data operation. Keep the
initial manifests synchronized, including empty record permissions and
`starter:{phase:'welcome',context:'not-chosen'}`. Do not load the optional record
example or ask the person to choose a record before they decide what to build.
Keep this same application source and local address across exactly three host
locations: Group Hub, Property Hubs and Dashboard. Presentation can be chosen
independently of business features and adds no record access. There is no fourth
welcome location.
Do not remove its body copy or next-steps panel, add business features or choose
what the person should build. Obtain the first name only from signed-in
negotiator/me FirstName using the supplied viewer extension: create it with
{client,hostOrigin} before core connect, call getCurrentViewer only after
connection and dispose it before the core client. Never manual input, hardcoded
or URL names, ContactName splitting or token inspection. Keep generic loading
and sign-in/retry guidance when unavailable.

First build: `npm ci`, `npm run check:welcome`, `npm run build`,
`npm run validate`, then `npm start`. Check only the signed-in API greeting in the current
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
