# Select source image
FROM node:wheezy

# Install all dependencies
RUN apt-get update

# Create app directories
RUN mkdir -p /usr/app
RUN mkdir -p /usr/test
WORKDIR /usr/app

# Install app dependencies
COPY ./package.json /usr/app/
# Install eae-compute npm dependencies
RUN npm install --silent; exit 0;
RUN cat /root/.npm/_logs/*; exit 0;

# Bundle app
COPY ./src /usr/app/src
COPY ./.eslintrc /usr/app/.eslintrc
COPY ./test/*.js /usr/app/test/
COPY ./test/jobs /usr/app/test/jobs
COPY ./config/eae.compute.test.config.js /usr/app/config/eae.compute.test.config.js

EXPOSE 80
