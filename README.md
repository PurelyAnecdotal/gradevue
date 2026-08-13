# GradeCompass

An advanced grade calculator.

> [!NOTE]
> Direct website login no longer works. StudentVUE's SOAP API was shut off (error D5518-00). The new protocol is cookie-session based and will not send credentials to a third-party site. GradeCompass stays on-device by using a **companion browser extension** as a local bridge: you log in on the official portal, and the extension reads gradebook data with your browser cookies.

## Developing

Make sure to have [Bun](https://bun.sh) installed, then run `bun install` to install dependencies.

### Dev Server

```bash
bun run dev
```

### Companion extension

```bash
bun run extension:build
```

Then in Chrome open `chrome://extensions`, enable Developer mode, and Load unpacked → `extension/dist`.

Keep the extension loaded while using `bun run dev` at `http://gradecompass.localhost:5173`. On the login page, enter your district host (for example `ca-xxxx-psv.edupoint.com`) and choose **Continue to StudentVUE**. After you sign in on the official portal, GradeCompass loads grades locally.

The extension only talks to GradeCompass origins and to the district host you grant. It is not a generic CORS proxy.

### Building

```bash
bun run build
```

You can preview the production build with `bun run preview`.

```bash
bun test
```

## Hosting

When hosting your own version of GradeCompass, please [change](src/lib/brand.ts) the name, icon, contact email, and repository link to avoid confusion with our version.

Vercel and Netlify are both good options for hosting SvelteKit apps like GradeCompass. Users still need the companion extension for a live StudentVUE login; the hosted site never sees passwords or grades.
