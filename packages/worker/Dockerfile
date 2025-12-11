FROM node:20

WORKDIR /worker

COPY . .

RUN npm install -g pnpm 
RUN pnpm install --filter ./packages/worker

CMD ["pnpm","--filter","packages/worker","start"]