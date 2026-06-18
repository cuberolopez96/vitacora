# Frontend multi-stage Dockerfile (Vite + React)

# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --no-audit --no-fund --silent; fi
COPY . .
RUN npm run build

# Production stage — serve static with nginx
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
# Remove default nginx config and provide a minimal one if needed
# EXPOSE 80 (documented, not required in image)
CMD ["nginx", "-g", "daemon off;"]
