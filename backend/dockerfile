# --- STAGE 1: Build & Generate ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
COPY backend/ ./
RUN npm install
RUN npx prisma generate
RUN npm run build

# --- STAGE 2: Surgical Pruning ---
FROM node:22-alpine AS pruner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# 1. Standard prune
RUN npm prune --production

# 2. SURGERY: Manually remove the CLI tools that @prisma/client is hoarding
# This breaks the chain and deletes the 40MB+ CLI and 20MB+ TS
RUN rm -rf node_modules/prisma \
           node_modules/typescript \
           node_modules/effect \
           node_modules/@angular-devkit \
           node_modules/@electric-sql \
           node_modules/chart.js \
           node_modules/react \
           node_modules/react-dom \
           node_modules/@radix-ui \
           node_modules/@eslint \
           node_modules/@jest \
           node_modules/@istanbuljs \
           node_modules/@babel \
           node_modules/chokidar \
           node_modules/@prisma/studio-core \
           node_modules/@prisma/dev 

# --- STAGE 3: Final Runner ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=pruner /app/dist ./dist
COPY --from=pruner /app/node_modules ./node_modules
COPY --from=pruner /app/package*.json ./

USER node
EXPOSE 3000
CMD ["node", "dist/main"]