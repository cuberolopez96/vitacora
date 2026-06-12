FROM node:18-slim
WORKDIR /app

# copy package and install
COPY package.json package-lock.json* ./
RUN npm install --production --silent || true

# copy source
COPY . .

EXPOSE 8080
CMD ["node", "src/server.js"]
