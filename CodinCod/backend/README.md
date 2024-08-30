# Back-end

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

## Code compilation

There are several ways to handle code compilation in a safe way, research:

- https://github.com/melpon/wandbox/blob/master/kennel/API.md
- https://github.com/engineer-man/piston
