FROM node:20

# Set working directory
WORKDIR /app

# Copy root files and workspace configuration
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./

# Copy all package.json files for workspace packages
COPY libs/backend/package.json ./libs/backend/
COPY libs/types/package.json ./libs/types/

# Install pnpm globally and all workspace dependencies
RUN npm install -g pnpm@10
RUN pnpm install --filter backend...

# Copy all necessary files for backend and types
COPY libs/backend ./libs/backend/
COPY libs/types ./libs/types/

# Build the backend
WORKDIR /app/libs/types
RUN pnpm build

WORKDIR /app/libs/backend
RUN pnpm build

# Start the backend
CMD ["pnpm", "start"]