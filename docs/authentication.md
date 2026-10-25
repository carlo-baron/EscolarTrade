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
and validate editable fields. Admin bypasses Rules. This repository currently has
no listing mutation action or update service; do not infer that listing publishing
or editing is implemented. Direct client listing writes remain denied.

Admin initialization is server-only. It reuses the existing service-account
environment variables or Application Default Credentials. Never expose these as
`NEXT_PUBLIC_` values. Session-cookie verification requires Admin access from the
Next.js server. Nothing here deploys Firebase settings, requires Cloud Functions,
or changes the Spark plan.

## Local validation

The tests use Node 24's built-in test runner and TypeScript already installed in
the project. Mocked unit tests cover the server boundary without Firebase access:

```bash
npm run test:auth
npm run typecheck
```

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
FIREBASE_PROJECT_ID=demo-escolartrade GCLOUD_PROJECT=demo-escolartrade \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm start -- --port 3100
# In another terminal:
GCLOUD_PROJECT=demo-escolartrade \
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 \
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npm run test:auth:http
```

The HTTP suite sends tokens from the Auth emulator directly to the app; it does
not execute browser JavaScript. For a manual browser flow, run `npm run dev` with
the server emulator variables above plus
`NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-escolartrade` and
`NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`. The development client uses the local
Auth/Firestore ports from `firebase.json`. Test verification links using the Auth
emulator, resend failures, browser Firestore listeners, client logout, and back
navigation. Secure cookies require HTTPS for browser testing of a production build.

The targeted Rules change is a prototype requiring review before broad release.
The emulator suite checks the new membership gate and selected existing ownership
rules; it does not validate the entire deferred chat model.
