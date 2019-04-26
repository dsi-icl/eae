# Select source image
FROM node:latest@sha256:c88ef4f7ca8d52ed50366d821e104d029f43e8686120a29541ce0371f333453f

# Install all dependencies
RUN apt-get update -q                                   \
    && apt-get upgrade -y --no-install-recommends

# Create app directories
RUN mkdir -p /usr/app && mkdir -p /usr/test
WORKDIR /usr/app

# Install app dependencies
COPY ./package.json /usr/app/
# Install eae-carrier npm dependencies
RUN npm install --silent; exit 0;
RUN cat /root/.npm/_logs/*; exit 0;

# Bundle app
COPY ./src /usr/app/src
COPY ./.eslintrc /usr/app/.eslintrc
COPY ./test/*.js /usr/app/test/
COPY ./test/files /usr/app/test/files
COPY ./config/eae.carrier.test.config.js /usr/app/config/eae.carrier.test.config.js

EXPOSE 80
