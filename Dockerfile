# Multi-stage Dockerfile for a Vite + React (TypeScript) app
# Stage 1: build the app
FROM node:20-alpine AS build
WORKDIR /app

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL
ARG VITE_ADMIN_EMAILS

# Install dependencies based on lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: serve with Node.js
FROM node:20-alpine AS production
WORKDIR /app

# Install serve globally to serve static files
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist /app/dist
COPY --from=build /app/serve.json /app/serve.json

EXPOSE 3000
CMD ["serve", "dist", "-l", "3000", "-c", "/app/serve.json"]
