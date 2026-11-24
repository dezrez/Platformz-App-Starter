# App details for the first pilot

The app's `manifest.json` describes who supports it, what it expects to do and
how to test it. These declarations grant no permission, storage allocation,
request rate, concurrency increase or publication approval. The host still
applies its own policies. Never put credentials or customer records here.

Use the bundled `sdk/manifest.js` normalizer and completeness check. Angular
uses the identical module in `public/sdk/manifest.js`; keep its two manifest
copies synchronized. The wire protocol stays `dezrez.partner/1`; new record
apps use SDK `0.2.0`. `manifestVersion:1` versions app details separately.

The supplied manifest is a complete **fictional example**, marked
`example:true`. Its one-hour example is not a claim about a real partner or a
measurement of production demand. You may submit a complete fictional app for
private testing. If the owner explicitly chooses fictional partner details for
an internal demo, retain them and `example:true`; do not ask for real contacts
again or change this marker to pass a check. A Dezrez reviewer must separately
acknowledge those details when approving the exact internal pilot release.
Otherwise, ask for the owner's organisation and working support email or HTTPS
support address. Obtain explicit workload assumptions separately; fictional
partner details do not replace measured workflow and capacity evidence.
Incomplete declarations still prevent publication. Never invent a contact,
infer a workload from stress tests or treat any declaration as release approval.

## Required declarations

| Field | Meaning |
|---|---|
| `example` | Required boolean identifying fictional demonstration details. |
| `partner.organisation`, `partner.supportContact` | Owner's organisation and email or HTTPS support page. No credentials, query or fragment in a URL. |
| `compatibility` | New apps: `sdkVersion:"0.2.0"`, `hosts:["rezi"]`, `surfaces:["record-action"]`. Old SDK0.1.0/property-action remains property-only compatibility; do not silently change an approved manifest. |
| `storage` | New record apps: `scope:"app-agency-user-context"`, `schemaVersion:1`, positive integer `expectedMaximumBytes`. Old property-only scope is `app-agency-user-property`. Declared expectation, never a granted quota. |
| `activity.initializationCalls` | Unique supported operations with nonnegative integer counts expected on one initialization. An explicit empty array means none. |
| `activity.pollingIntervalMs` | Explicit `null` means no polling. Polling is unsupported by this pilot. Omitting the field is incomplete. |
| `activity.refreshTriggers` | Nonempty unique subset of `manual`, `context-change`, `enabled`, `visible` matching the app's actual lifecycle. |
| `activity.backgroundWork` | Explicit `false`. Background work is unsupported by this pilot. |
| `expectedUsage` | The versioned author-declared scenario described below. |
| `testing.journeys`, `testing.fixtures` | Nonempty unique named journey and synthetic fixture IDs describing the real tests/fixtures. These names are declarations, not passing evidence. |

Keep existing identity, version, name, host, surface, permissions, dialog options
and genuine certification selectors accurate. A versioned app must name the
supported host/surface. These declarations describe the older `property.read`,
`appState.get` and `appState.set` compatibility helpers. They do not limit the
separate full API extension: read the project-root `references/dezrez-api.md`
for all documented authorized business reads and writes. Do not invent another
core operation name or replace a requested business change with a private note.
Read [selected records and marketing roles](record-contexts.md). A property read
helper is not applicable to a group; full group APIs use the API facade. The server derives the agency and
checks actual property/role/group access. Typed state separates group IDs and
marketing roles rather than reusing another record's note.

## Expected usage

For a draft with no owner estimate, use:

```json
{ "version": 1, "status": "not-provided" }
```

This is explicitly incomplete. Keep working in the local preview, then ask the
owner for the missing estimate before sending a private source copy. Missing,
null or blank required values are also incomplete. Malformed values are rejected;
do not replace unknowns with guessed numbers or empty strings to pass a check.

A declared scenario has `version:1`, `status:"declared"`, positive safe integers
`horizonMs` and `maxConcurrentInstances`, nonnegative safe-integer `sessionStarts`
and a nonempty `actions` array of `{name,count}`. Action names are plain text up
to 100 characters without control characters and must be unique; counts are
nonnegative safe integers. Zero is an explicit count, not unknown.

**Every count is a total across all instances for that complete horizon.**
`maxConcurrentInstances` is a maximum concurrent population, not a multiplier.
For example, 20 starts and 50 saves across five concurrent instances in one hour
means 20 total starts and 50 total saves, never 100 and 250. The starter's example
is one fictional hour, one concurrent instance, one session start, one
`read-property` action and one `save-note` action.

These are author assumptions. Private demand projection separately binds
measured normal-workflow samples, population assumptions and deployment limits.
An app manifest is neither a measurement nor calibration evidence and cannot
change those approved limits. Certification, reviewer approval and publication
still bind the exact source, manifest, artifact and permission set.

## AI workflow

Read the app before updating these declarations. Keep their counts and test
names aligned with its actual behavior. Run the starter's checks, then exercise
the app through the developer website. If an owner's value is unknown, explain
in ordinary language what information is needed and leave the draft incomplete.
A successful syntax or completeness check does not prove the contact works,
the estimate is accurate or the app passed external certification.
