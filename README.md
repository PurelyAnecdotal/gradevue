# GradeCompass

An advanced grade calculator.

> [!WARNING]
> GradeCompass is now obsolete. It is not compatible with the new API and cannot be updated to support it.

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

The GradeCompass project is open source and can be self-hosted. However, if you plan on hosting it for others on the public internet, keep in mind that the MIT license **does not grant trademark rights**. You cannot use the GradeCompass name or logo without permission. Otherwise, unaware users would think that we were responsible for your site.

Therefore, you must change the **name** in [brand.ts](src/lib/brand.ts) and the **icons** in the [/static](static) folder to your own, distinct designs. (Simply changing a prefix or suffix of an existing name or modifying the icon *does not suffice*.) We advise you to be very careful of trademark confusion when choosing a name. Please also update the **contact email** and **repository link** in [brand.ts](src/lib/brand.ts) so your users don't get confused with our version. 

<sup> This is not legal advice.</sup>


Vercel and Netlify are both good options for hosting SvelteKit apps like GradeCompass.


## Contributing

GradeCompass cannot support the new API in its current form as a website. CORS restrictions on the new API prevent client-side connections from a different origin, meaning that connecting to the student portal would requie a server-side proxy. Regardless of whether student data is encrypted through this proxy, any solution which involves a third-party server connecting to the student portal is inherently legally problematic.

For this reason, GradeCompass will not be accepting contributions to "restart" the project.
