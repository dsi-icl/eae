# Select source image
FROM ubuntu:14.04

# Install all dependencies
RUN apt-get update
RUN apt-get install -y nodejs

# Create app directories
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY ./package.json /usr/app/
# Install eae-compute npm dependencies
RUN npm install --silent; exit 0
RUN cat /root/.npm/_logs/*; exit 0

# Bundle app
COPY ./src /usr/app/src
COPY ./config/eae.compute.test.config.js /usr/app/config/eae.compute.config.js

EXPOSE 80
CMD npm test
