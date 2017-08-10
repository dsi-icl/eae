# Select source image
FROM ubuntu:14.04

# Install all dependencies
RUN apt-get update
RUN apt-get install -y nodejs

# Create app directories
RUN mkdir -p /usr/app
RUN mkdir -p /usr/app/src
RUN mkdir -p /usr/app/config
WORKDIR /usr/app

# Bundle app source
COPY src /usr/app/src
COPY package.json /usr/app/
COPY config/eae.compute.test.config.js /usr/app/config/eae.compute.config.js

# Install eae-compute npm dependencies
RUN npm install --silent; exit 0
RUN cat /root/.npm/_logs/*; exit 0

EXPOSE 80
