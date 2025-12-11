FROM node:20


WORKDIR /distrbuted-task-queue

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY apps/Task-queue/package.json apps/Task-queue/

RUN npm install -g pnpm
RUN pnpm install --filter ./apps/Task-queue

COPY . .

CMD ["pnpm","task-dev"]
