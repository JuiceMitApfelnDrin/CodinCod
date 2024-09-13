<!--
    Thanks for your contribution! Please note that README files are managed in the docs repository. To make changes, go to docs/backend/README.md.
-->

# Backend

Written in [Node-js](https://nodejs.org/en), with [Fastify](https://fastify.dev/).

## Getting started

### Environment variables

```bash
PORT=8888
MONGO_URI=mongodb://codincod-dev:hunter2@localhost:27017
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d
NODE_ENV=development
PISTON_URI=http://localhost:2000
# These are only used when running mongo with `docker compose`, they should match user and password in MONGO_URI
CODINCOD_MONGODB_USERNAME=codincod-dev
CODINCOD_MONGODB_PASSWORD=hunter2
```

#### What they mean and where to get them?

<!-- TODO: create a better title or something for this section -->

- `PORT`: when you start the server, it will occupy a port, through which you can access the backend, don't choose the same port for your frontend
- `JWT_SECRET`: a key that is used to encrypt authentication info between frontend and backend, make it a bit long and random, can be anything but should be a secret ;)
- `JWT_EXPIRY`: the amount of time after which a JWT token will expire, and a user has to log-in again

### Setup

1. Make sure you have set up the project following [the installation instructions for the parent project](../README.md)

2. Install dependencies using [`pnpm`](https://github.com/pnpm/pnpm) (`npm` does NOT work because it does not support workspace dependencies which we use for the [`types`](https://github.com/JuiceMitApfelnDrin/CodinCodTypes) package)

   ```bash
   pnpm install
   ```

3. Fill in the environment variables and make sure you have MongoDB running at `MONGO_URI`. While developing you may use `docker compose up` to start up mongo locally.

4. Start a development server:

   ```bash
   pnpm run dev

   # or start the server and open the app in a new browser tab
   pnpm run dev -- --open
   ```

## Code compilation

There are several ways to handle code compilation in a safe way, research:

- [kennel api](https://github.com/melpon/wandbox/blob/master/kennel/API.md)
- [piston api](https://github.com/engineer-man/piston)
