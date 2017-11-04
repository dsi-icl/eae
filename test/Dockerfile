# Select source image
FROM node:wheezy

# Install all dependencies
RUN apt-get update -q                                   \
    && apt-get upgrade -y --no-install-recommends

# Create app directories
RUN mkdir -p /usr/app && mkdir -p /usr/test
WORKDIR /usr/app

# Install app dependencies
COPY ./package.json /usr/app/
# Install eae-interface npm dependencies
RUN npm install --silent; exit 0;
RUN cat /root/.npm/_logs/*; exit 0;

# Bundle app
COPY ./src /usr/app/src
COPY ./.eslintrc /usr/app/.eslintrc
COPY ./test/*.js /usr/app/test/
COPY ./config/eae.interface.test.config.js /usr/app/config/eae.interface.test.config.js

EXPOSE 80
