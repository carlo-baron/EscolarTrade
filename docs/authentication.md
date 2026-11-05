# Authentication

The accepted school domain is exactly `mls.ceu.edu.ph`. Earlier memory notes
using `ceu.mls.edu.ph` are superseded by the current forms and user instructions.

Login uses Firebase client email/password authentication, obtains a fresh ID
token, and calls `createSession`. This Server Action checks the request origin,
verifies the token with Admin (including revocation), requires a verified school
email and authentication within the last five minutes, then issues a Firebase
session cookie. Refreshing an old ID token does not satisfy recent authentication;
the user must log in again. No API route or additional provider is involved.

The `__session` cookie lasts five days, is HTTP-only, SameSite=Lax, host-only,
and uses path `/`. It is Secure in production; local development allows HTTP.
The shared `(app)/layout.tsx` verifies it with Admin, including expiration,
revocation, disabled/deleted accounts, and required email claims. At the user's
request, individual pages and the nested messages layout do not call
`requireSession` directly. Next.js can reuse the layout during client navigation,
so its check does not run on every route change; this is not an independent
authorization boundary for each page. Data access and Server Actions must still
authorize their own requests. The listing editor retains its authenticated
ownership helper. Proxy only redirects GET
requests without a cookie. Landing, login/signup, and password-reset UI stay
public. Authentication redirects go to `/auth?tab=login&error=...` with separate
unauthenticated, unverified, domain, and recent-login feedback.

Signup remains public and creates an unverified Auth account and profile through
the existing validated Server Action. Client sign-in then sends verification mail.
Failures are visible and the existing auth screen offers resend instructions.
After following the email link, log in again to obtain verified token claims and
a fresh server session. Signup does not grant protected access.

Client Firebase authentication remains active for Firestore listeners. Firestore
Rules enforce verified exact-domain membership on every existing client access
path. A browser session cookie alone grants no Firestore access. Profile creation
before verification uses the existing Admin signup action; there is no unverified
client read/write exception. The deferred conversation/message model is unchanged.

Logout clears the server cookie and Firebase client state, then performs a full
navigation to discard the client router cache. If either operation fails, it
shows an error and allows retry.

For future server data access and mutations, call `requireSession` inside each
entry point. Derive the UID from its result. For listing edits, the existing editor
now calls `requireListingOwner`, which loads the stored seller ID. Mutations must
also call `assertListingOwner` on the document read **inside their transaction**,
and validate editable fields. Admin bypasses Rules. The current `createListing`
action only authenticates and validates input; its success path does not yet
write or publish a listing. Direct client listing writes remain denied.

Admin initialization is server-only. It reuses the existing service-account
environment variables or Application Default Credentials. Never expose these as
`NEXT_PUBLIC_` values. Session-cookie verification requires Admin access from the
Next.js server. Nothing here deploys Firebase settings, requires Cloud Functions,
or changes the Spark plan.

## Vercel runtime configuration

For a live deployment, set `NEXT_PUBLIC_FIREBASE_MODE=live` before the build
and configure the server credentials described above in Vercel's environment
variables for the deployment environment.

The current dependency chain (`firebase-admin@14.5.0` → `jwks-rsa@4.1.0` →
`jose@6`) loads an ES module through CommonJS `require()`. Vercel disables
this Node.js feature by default. If login fails with `ERR_REQUIRE_ESM` from
`jwks-rsa/src/utils.js`, add this Vercel environment variable and redeploy:

```dotenv
NODE_OPTIONS=--experimental-require-module
```

If `NODE_OPTIONS` already contains other flags, append this flag to its value.
This follows [Vercel's documented runtime setting](https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration#experimental-node.js-require-of-es-module).
Use a supported Node.js version meeting Firebase Admin's requirement (Node 22
or newer); the local reproduction and fix were checked on Node 24.14.0.
On November 5, 2026, the user reported hosted login working after applying this
setting and redeploying. This is a runtime compatibility workaround. Once a
release addresses the [upstream module-loading issue](https://github.com/auth0/node-jwks-rsa/pull/508),
update the dependencies and test without the flag before removing it.

## Local validation

### Switching Firebase environments

Set a single variable in `.env.local`:

```dotenv
NEXT_PUBLIC_FIREBASE_MODE=emulator
```

Use `live` to connect to the real `escolar-trade` project. Use `emulator` for
`demo-escolartrade` with Auth on `127.0.0.1:9099` and Firestore on
`127.0.0.1:8080`. Missing mode defaults to `emulator`; other values are rejected.
The browser and Admin SDK share the mode and project selection. Firebase app
names differ by mode so persisted browser Auth accounts are kept separate.

Leave `NODE_ENV` to Next.js: it controls framework behavior, independently of
Firebase mode. Both modes work with `npm run dev` and production builds. Restart
the Next.js server and reload the browser after switching. For `npm start`, set
the mode **before building**, rebuild, and restart: Next.js embeds public env
variables into both the browser bundle and compiled server code. Changing only
the runtime variable cannot switch an existing build. Log in again after
switching; the existing server session cookie belongs to the previous environment.
Accounts and data are separate and are not copied between environments.

Live mode needs valid server credentials in `FIREBASE_CLIENT_EMAIL` and
`FIREBASE_PRIVATE_KEY`, or Application Default Credentials for the live project.
Emulator mode does not use service-account credentials. The old application
overrides (`FIREBASE_PROJECT_ID`, `GCLOUD_PROJECT`,
`NEXT_PUBLIC_FIREBASE_PROJECT_ID`, and `NEXT_PUBLIC_USE_FIREBASE_EMULATORS`) no
longer select the application's project or mode. Admin sets its two emulator host
variables automatically in emulator mode and removes stale values in live mode.
Remove old overrides from local env files to avoid confusion. Keep the mode in
one env file; `.env.development.local` takes priority over `.env.local` during
development, and shell variables take priority over both.

For emulator mode, start the services separately, then run the app:

```bash
firebase emulators:start --only auth,firestore --project demo-escolartrade
# In another terminal:
npm run dev
```

Live mode does not need the emulator process. The marketplace currently still
uses sample listing fixtures; switching mode does not add Firestore data fetching.

### Checks

The tests use Node 24's built-in test runner and TypeScript already installed in
the project. Mocked unit tests cover the server boundary without Firebase access:

```bash
npm run test:auth
npm run test:firebase
npm run typecheck
```

`test:firebase` checks both actual SDK configurations in fresh processes for
development and production, including stale overrides and invalid modes. It does
not send requests to live Firebase or require running emulators.

Use an isolated demo project for emulator tests, never the live project:

```bash
firebase emulators:start --only auth,firestore --project demo-escolartrade
GCLOUD_PROJECT=demo-escolartrade \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run test:auth:emulator
```

The integration suite creates temporary accounts and documents and removes them.
Emulator tokens are unsigned, so these checks do not prove production signature
validation or real email delivery. Signature verification is delegated to Admin;
unit tests ensure SDK verification failures are denied.

HTTP tests exercise the real production Server Action transport and shared layout
guard on full page requests; they do not prove session revalidation during client
navigation that reuses the layout.
Build first, then start a separate local server against the same demo emulators:

```bash
npm run build -- --webpack
npm start -- --port 3100
# In another terminal:
GCLOUD_PROJECT=demo-escolartrade \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run test:auth:http
```

Set `NEXT_PUBLIC_FIREBASE_MODE=emulator` in `.env.local` before the build above.
The test scripts initialize their own Admin apps, so they still require the
explicit demo project and host variables shown in their commands; the application
does not. The HTTP suite sends tokens from the Auth emulator directly to the app;
it does not execute browser JavaScript. For a manual browser flow, use emulator
mode and run `npm run dev`. The client uses the local Auth/Firestore ports matching
`firebase.json`. Test verification links using the Auth emulator, resend failures,
browser Firestore listeners, client logout, and back
navigation. Secure cookies require HTTPS for browser testing of a production build.

The targeted Rules change is a prototype requiring review before broad release.
The emulator suite checks the new membership gate and selected existing ownership
rules; it does not validate the entire deferred chat model.
