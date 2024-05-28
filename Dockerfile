FROM node:lts-alpine as build


ADD ./backend /app/backend
ADD ./frontend /app/frontend

WORKDIR /app/frontend
RUN npm install
RUN npm run build

WORKDIR /app/backend
RUN npm install && npm run prisma-generate
RUN npm run build
RUN rm -rf ./src

FROM node:lts-alpine

ARG VERSION_ARG

# setting timezone
RUN apk add --no-cache tzdata
ENV TZ=Europe/Zurich

COPY --from=build /app/backend /app/backend
COPY --from=build /app/frontend/build /app/frontend/build

WORKDIR /app/backend

ENTRYPOINT [ "node", "./dist/index.js" ]
