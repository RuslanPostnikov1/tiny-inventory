FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Set temporary DATABASE_URL for Prisma generation (not used, just needed for config)
ARG DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public
ENV DATABASE_URL=${DATABASE_URL}

# Generate Prisma Client
RUN yarn prisma generate

# Build application
RUN yarn build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Install production dependencies only
RUN yarn install --frozen-lockfile --production

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3001

# Start application
CMD ["sh", "-c", "yarn prisma migrate deploy && node dist/prisma/seed.js && node dist/src/main.js"]
