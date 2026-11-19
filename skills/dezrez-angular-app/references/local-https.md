# If your browser needs a secure local address

Use the usual local address first. If your browser requires an address beginning
with `https://`, copy this message to the AI chat that built your app:

> Please read the starter skill's local-https reference and prepare a secure
> local address using the existing Angular tools. Before installing anything or
> changing what my computer trusts, explain the exact change and ask me to
> approve it. Keep certificate keys outside my project and source submission.
> Do not print or share their contents. Start and check the app, then give me
> the exact address to paste into Dezrez Developer. Stop if there is a browser
> certificate warning; do not bypass it.

## Instructions for the AI

Keep the existing locked dependencies and normal `npm start` behaviour. This
optional route uses Angular's existing development server, not the strict built
preview. Do not add packages, change the dependency lock or install Angular
globally. Complete the usual installation and checks described in README first.

Obtain a browser-trusted certificate and matching key for `localhost` and
`127.0.0.1`. An organisation-managed pair is suitable. For a new local pair, read
the maintained [mkcert instructions](https://github.com/FiloSottile/mkcert#installation).
Ask permission before installing that tool or using `mkcert -install`, which
changes local trust. Do not run remote installation scripts or change browser
security. Store the server certificate and key in a private folder outside the
entire project. Never share mkcert's own CA private key or use it as the server
key. After permission, create the pair with
`mkcert -cert-file <absolute-cert-path> -key-file <absolute-key-path> localhost 127.0.0.1`.
Replace the placeholders with quoted paths. Keep all keys outside source,
downloads, repositories and submissions.

The [official Angular serve options](https://angular.dev/cli/serve) support
`--ssl`, `--ssl-cert` and `--ssl-key`. The supplied local CLI uses them through
the existing project command:

```sh
npm run dev -- --ssl --ssl-cert "<absolute-cert-path>" --ssl-key "<absolute-key-path>"
```

This command works in PowerShell and macOS/Linux shells after replacing the
paths. Supply **both** explicit files; do not ask Angular to generate an
untrusted certificate. The command retains this project's `127.0.0.1` binding
and port 4200. The dev server rebuilds during editing. It is not the production
artifact server, certification or a deployment, and it does not apply the strict
built-preview response policy.

Open the printed HTTPS address in the person's Chrome or Edge browser and check
that no certificate warning appears. Paste that exact address into **Open my
app for testing**. The portal supplies its own origin and context. Let the person
decide any local-network permission prompt. HTTPS does not replace permission
or authorize real records. If Angular rejects the files or the browser does
not trust them, stop and diagnose the certificate without bypassing validation.

Stop the process to return to the normal commands. Do not remove local trust
automatically or include certificate files when preparing a source submission.
