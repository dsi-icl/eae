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
# Install eae-compute npm dependencies
RUN npm install --silent; exit 0;
RUN cat /root/.npm/_logs/*; exit 0;

# Bundle app
COPY ./test/*.js /usr/app/test/
COPY ./test/files /usr/app/test/files
COPY ./test/config /usr/app/config

EXPOSE 80