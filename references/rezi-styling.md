# Dezrez app layout and styling

Use the supplied component styles, icon assets, semantic colour tokens and theme
controller. Match the Dezrez application rather than inventing a separate visual
design. The first welcome app has two small, readable panels: the person's
welcome with "Your starting app is ready. You decide what it becomes.", then
"What happens next" with the supplied three simple steps. Preserve this guidance
in the app, identical in every preview location. Do not add property
cards, notes, record selectors, example business data or extra application
features before the person chooses what to build.

## Load the intended fonts

The intended faces are **Exo Soft** for body text and controls and **New Rubrik**
for panel headings. Exo 2 and Poppins are useful fallbacks; they are not the same
fonts and do not establish a visual match.

Use the supplied theme controller in the embedded app's own document:

```js
const theme = createThemeController({
  document,
  window,
  hostOwned: true,
  fontSource: 'hosted',
});
```

The controller loads the authorised, intact stylesheet
`https://use.typekit.net/yis4cut.css`. Keep that URL and its linked font resources
intact. Never download or repackage its font binaries. The app's content policy
must permit the supplied stylesheet/font destinations; do not weaken the rest of
the policy or introduce wildcard destinations to make a font request work.

The parent website loading the kit does not load it for a separate iframe. Do not
change this to `fontSource: 'bundled'` for convenience or claim that a CSS family
name proves the font loaded. After the stylesheet has loaded, the supplied
controller checks both of these actual faces and waits for `document.fonts.ready`:

```js
document.fonts.load('600 18px "new-rubrik"');
document.fonts.load('400 14px "exo-soft"');
```

Each result must be a nonempty list of loaded faces. The controller then reports
`data-fonts="rezi"` on the document root. `bundled` or `fallback` means the intended
faces have not been verified. Keep the readable fallback and explain the problem
honestly if the kit is blocked or unavailable; do not silently present it as a
match.

Body text uses Exo Soft 400, ordinarily 14px times the supplied font scale, with
line-height 1.45. Panel headings use New Rubrik 600, 18px times the scale, with
line-height 1.4. Reserve heavier type for a component that needs it. Do not give
the simple welcome message an oversized marketing-page treatment.

## Use standard panels

A section containing a title and related content belongs in a standard panel.
Use the two supplied welcome and next-step panels; add more only when the person's
later app has genuinely separate sections. Avoid either a bare page of unstructured text
or a grid of decorative cards.

The panel has a 1px semantic border, 10px radius, surface background, 12px content
padding and no shadow. Its header is inset 6px from the outer frame, has an 8px
top radius, subtle-surface background, bottom border and a minimum height of 45px.
Header padding is 6px vertically and 16px horizontally. It must grow with wrapped
text.

The supplied component styles should provide these rules. If extending them,
keep the same relationships rather than introducing a second panel system:

```css
.rezi-panel {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--rezi-modern-border);
  border-radius: 10px;
  background: var(--rezi-modern-surface);
  box-shadow: none;
}
.rezi-panel__heading {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: -6px -6px 12px;
  padding: 6px 16px;
  min-height: 45px;
  border-bottom: 1px solid var(--rezi-modern-border);
  border-radius: 8px 8px 0 0;
  background: var(--rezi-modern-surface-subtle);
}
.rezi-panel__title {
  min-width: 0;
  margin: 0;
  font-family: 'new-rubrik', Poppins, Arial, sans-serif;
  font-size: calc(18px * var(--rezi-modern-font-scale, 1));
  font-weight: 600;
  line-height: 1.4;
  overflow-wrap: anywhere;
}
```

Give every standard panel heading an appropriate supplied, verified decorative
icon beside real accessible text. For a welcome panel, use the
supplied book or screen icon. For the existing icon-font assets this is, for
example, `<span class="char char-book" aria-hidden="true"></span>`. Keep the
actual heading text; the glyph must not be its accessible name. Do not invent a
new icon-font mapping or add another icon library. Reuse supplied assets instead
of copying additional proprietary font binaries into the app.

An icon is normally 16px times the font scale in an alignment box approximately
22.4px high. Keep a 10px gap between the title and icon. Standard panel gaps are
10px. Use separators for related subsections rather than adding unnecessary
nested panel borders.

## Keep the host's appearance

The supplied modern themes are `light`, `dark` and `high-contrast`. Use
`--rezi-modern-*` semantic variables for surface, text, heading, link, border,
selected and action colours. Do not hard-code the Light palette into the app.
Keep the existing High Contrast 1.2 type scale and natural-height controls.

An embedded app receives appearance through the supplied SDK's validated theme
events. Apply them through `theme.setLook(look, { persist: false })`. Keep
`hostOwned: true`, the trusted parent origin and source-window validation. A local
app does not need a Dezrez subdomain and must not read its parent's document or
cookies to obtain the appearance. Preserve the startup script and its allowlisted
colour hint so loading does not flash the wrong background.

Do not add a theme chooser or persist a competing localhost preference. The
developer website follows the shared Dezrez choice; its local standalone copy
uses Light. Original is stored as `current`, not `original`; keep the supplied
explicit fallback rather than rewriting that preference.

## Controls and first-build checks

Reuse the supplied control rules. Text fields and selects have an orange focused
boundary with no extra outline or shadow, including High Contrast. Ordinary
fields do not gain an orange hover border. Buttons, links and disclosures retain
their own visible keyboard cues. Controls and panel headers must grow with text;
never hide overflowing content to conceal a layout problem. Respect reduced
motion and avoid decorative animation in the welcome app.

For the first welcome build, verify only the two simple welcome and next-step panels,
its actual fonts and its one current appearance: Light when opened locally on
its own, or the host's effective appearance when embedded. Keep theme support in the code,
but do not launch a multi-theme, record-context, note-storage or certification
test programme before the person has chosen the app's purpose. Later requested
features can receive their appropriate focused checks.

Keep the developer website in the person's normal Chrome or Edge window. Do not
open it in an AI app's internal browser. Use local file and command tools to
prepare and run the app, then give the person its verified local address and one
clear next step on the developer website.
