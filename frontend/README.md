# Frontend

Written in svelte.

## Getting started

### Environment variables

```bash
VITE_BACKEND_URL=http://localhost:3000
```

What they mean and where to get them?
<!-- TODO: create a better title or something for this section -->

- `VITE_BACKEND_URL`: the link to a codin-cod backend
- `VITE_JWT_SECRET`: the same value as in the backend, used for decoding the json-web-token

### Setup

1. In case you only want to run the frontend, clone it:

    ```bash
    git clone https://github.com/JuiceMitApfelnDrin/CodinCodFrontend
    ```

2. Fill in the environment variables
3. Install dependencies, **only need to run one of these 3**

    ```bash

    # use npm if you don't know what you're doing!
    npm install

    # or for pnpm
    pnpm install

    # or for yarn
    yarn install
    ```

4. Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

    ```bash
    npm run dev

    # or start the server and open the app in a new browser tab
    npm run dev -- --open
    ```

## Editor

<!-- - https://github.com/microsoft/monaco-editor -->
- <https://github.com/codemirror/codemirror5>
<!-- - https://github.com/ajaxorg/ace -->

## Building

To create a production version of CodinCod:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

<!-- 
> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment. -->
