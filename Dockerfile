# Multi-stage Dockerfile for a Vite + React (TypeScript) app
# Stage 1: build the app
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies based on lockfile for reproducible builds
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a default nginx config to enable gzip and set headers
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
