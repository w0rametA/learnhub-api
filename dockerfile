FROM node:18-alpine

WORKDIR /app

COPY . .

ENV DATABASE_URL="postgresql://postgres:academy@localhost:5432/postgres?schema=public"
ENV PORT=8000

RUN npm i 
RUN npx tsc

CMD ["node", "dist/index.js"]
EXPOSE 3000