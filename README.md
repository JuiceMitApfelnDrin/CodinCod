# CodinCod project overview

This repo exists to:

1. get up to speed quickly;
2. create a general shared understanding;
3. improve teamwork.

## Getting started

1. Required software:

   - [Git](https://git-scm.com/download/)
   - [NodeJs](https://nodejs.org/en/download/package-manager)
   - [pnpm](https://pnpm.io/)
   - MongoDb instance: can be either [locally](https://www.mongodb.com/try/download/community) or in [mongodb's online environment](https://www.mongodb.com/cloud/atlas/register).

2. Clone the project structure and its submodules:

    ```bash
    git clone --recursive https://github.com/JuiceMitApfelnDrin/CodinCod 
    ```

3. Build the types (required by both libs/backend and libs/frontend)

   ```
   cd CodinCod/libs/types
   pnpm install
   pnpm build
   ```

4. Follow the instructions for the [backend](backend/README.md) and/or [frontend](frontend/README.md) depending on what you're working on
