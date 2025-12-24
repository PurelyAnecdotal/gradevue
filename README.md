# GradeCompass

An advanced grade calculator designed to interface with StudentVUE®.

<sub>StudentVUE is a registered trademark of Edupoint Educational Systems LLC. GradeCompass is not affiliated with or endorsed by Edupoint Educational Systems LLC.</sub>

## Developing

Make sure to have [Bun](https://bun.sh) installed, then run `bun install` to install dependencies.
To start a development server:

```bash
bun run dev --host gradecompass.localhost
```

## Building

To build a production version:

```bash
bun run build
```

You can preview the production build with `bun run preview`.

## Hosting

When hosting your own version of GradeCompass, please [change](src/lib/brand.ts) the name, contact email, and repository link to avoid confusion with our version.

## License

GradeCompass is licensed under the [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/), an open-source copyleft license. What this means for you is that if you

- modify the source code of GradeCompass, and
- host this modified version on the internet,

you are required to publish the source code of your modified version under the same GNU AGPL license and document the changes you have made.
