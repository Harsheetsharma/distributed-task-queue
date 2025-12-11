FROM node:20

WORKDIR /api

COPY . .

RUN npm install -g pnpm 
RUN pnpm install --filter ./packages/api
CMD ["pnpm","--filter","packages/api","start"]