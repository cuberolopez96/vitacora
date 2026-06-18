# Multi-stage build: install deps and build in a lightweight builder, produce a minimal runtime image
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies (use lockfile when present)
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --no-audit --no-fund --silent; fi

# Copy source and run any build step if present
COPY . .
# If the project has a build step (e.g., TypeScript/Vite), run it; otherwise this will be a no-op
RUN if npm run | grep -q build; then npm run build --silent; else echo "no build script"; fi

# Final runtime image
FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only what is needed from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
# Prefer build output if present
COPY --from=builder /app/dist ./dist
# Fall back to source if no build output
COPY --from=builder /app/src ./src

EXPOSE 8080
CMD ["node", "src/server.js"]
