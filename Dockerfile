FROM node:lts-alpine

ARG VERSION_ARG

# setting timezone
RUN apk add --no-cache tzdata
ENV TZ=Europe/Zurich

RUN mkdir -p app/backend
RUN mkdir -p app/frontend/build

ADD ./backend /app/backend
ADD ./frontend/build /app/frontend/build
WORKDIR /app/backend
RUN npm install
RUN npm run build
RUN rm -rf ./src

ENTRYPOINT [ "node", "./dist/index.js" ]
