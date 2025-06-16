

This repo contains:

* [`packages/avatar-creator`](packages/avatar-creator) – a React component library that lets users build fully-rigged 3D avatars powered by the [PlayCanvas](https://playcanvas.com) engine.
* [`examples/avatar-preview-app`](examples/avatar-preview-app) – a minimal Next.js application that embeds the Avatar Creator and serves as a live playground / reference integration.

![Avatar Creator Screenshot](screenshot.jpg)

## TODO:
* [ ] Make UI more composable as part of a wider application (e.g. not assuming fullscreen)
* [ ] Add API for loading and saving avatar configurations
* [ ] Update data model to allow more flexibility for custom part combinations
* [ ] Publish the avatar-creator library to npm

---



1. **Install dependencies (workspace-wide)**

   ```bash
   nvm use # otherwise use Node.js v22.x
   npm install
   ```

2. **Start the development servers**

   ```bash
   npm run iterate # or `npm run dev`
   ```

   This will:
   * build `packages/avatar-creator` in watch-mode
   * launch the Next.js preview app on <http://localhost:3000>

   Open http://localhost:3000 in your browser – you should see the Avatar Creator embedded in the preview site.

> 💡  Prefer to run packages individually?
>
> ```bash
> # in one terminal – build the library and serve static assets
> cd packages/avatar-creator && npm run iterate
>
> # in another terminal – start the preview app
> cd examples/avatar-preview-app && npm run iterate
> ```

---

## Production Builds

```bash
# build everything
npm run build

# preview the Next.js production build
cd examples/avatar-preview-app && npm run start
```

The library is compiled to ESM bundles (and type declarations) under `packages/avatar-creator/build/`.

---



See [examples/avatar-preview-app/public/data.json](examples/avatar-preview-app/public/data.json)















--- 

## How to make new assets

For production of assets, there a few recommendations and guidelines as well as templates to follow:

* [Clothes](./docs/clothes.md)
* *TODO* - Faces
* *TODO* - Hair

---

## License

This repository and any related avatar assets not otherwise licensed are proprietary to MSquared. All rights reserved.
