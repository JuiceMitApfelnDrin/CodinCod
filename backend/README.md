# Backend

Written in node-js, with fastify.

## Getting started

### Environment variables

```bash
PORT=8888
MONGO_URI=mongodb://localhost:27017/mydatabase
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=7d
NODE_ENV=development
```

What they mean and where to get them?
<!-- TODO: create a better title or something for this section -->

- `PORT`: when you start the server, it will occupy a port, through which you can access the backend, don't choose the same port for your frontend
- `JWT_SECRET`: a key that is used to encrypt authentication info between frontend and backend, make it a bit long and random, can be anything but should be a secret ;)
- `JWT_EXPIRY`: the amount of time after which a JWT token will expire, and a user has to log-in again

### Setup

1. In case you only want to run the backend, clone it:

    ```bash
    git clone https://github.com/JuiceMitApfelnDrin/CodinCodBackend
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

## Code compilation

There are several ways to handle code compilation in a safe way, research:

- [kennel api](https://github.com/melpon/wandbox/blob/master/kennel/API.md)
- [piston api](https://github.com/engineer-man/piston)
