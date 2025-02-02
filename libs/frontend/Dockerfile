FROM node:20

ARG ORIGIN
ENV ORIGIN=${ORIGIN}
WORKDIR /app

# Copy root files and workspace config
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Copy all necessary package.json files for dependencies
COPY libs/frontend/package.json ./libs/frontend/
COPY libs/types/package.json ./libs/types/

# Install pnpm globally and install all dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy the actual source code
COPY libs/frontend ./libs/frontend/
COPY libs/types ./libs/types/

# Build the frontend
WORKDIR /app/libs/types
RUN pnpm build

WORKDIR /app/libs/frontend
RUN pnpm build

# Start the development server
CMD ["node", "build/index.js"]