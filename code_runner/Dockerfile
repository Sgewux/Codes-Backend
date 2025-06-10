FROM node:18.19.1-alpine

# Install bash shell and g++ compiler (these dont come by default on Alpine based containers)
RUN apk update
RUN apk upgrade
RUN apk add --no-cache bash
RUN apk add --no-cache g++

#Intall coreutils because we want to use the timeout from coreutils rather than from busybox
RUN apk add --no-cache coreutils

COPY . ./app
WORKDIR ./app
RUN npm install

CMD npm run dev