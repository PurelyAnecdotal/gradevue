# GradeCompass

An advanced grade calculator for a certain student portal software.

> [!WARNING]
> GradeCompass is now obsolete. It is not compatible with the new API and cannot be updated to support it.

<sub>GradeCompass is not affiliated with or endorsed by Edupoint Educational Systems LLC.</sub>

## Developing

Make sure to have [Bun](https://bun.sh) installed, then run `bun install` to install dependencies.

### Dev Server

```bash
bun run dev
```

### Building

```bash
bun run build
```

You can preview the production build with `bun run preview`.

## Hosting

When hosting your own version of GradeCompass, please [change](src/lib/brand.ts) the name, icon, contact email, and repository link to avoid confusion with our version.

Vercel and Netlify are both good options for hosting SvelteKit apps like GradeCompass.
