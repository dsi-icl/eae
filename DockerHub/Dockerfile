# Select source image
FROM node:wheezy

# Install all dependencies
RUN apt-get update -q && apt-get upgrade -y --no-install-recommends

# Create app directories
RUN mkdir -p /usr/app/config
WORKDIR /root

# We download the eae compute
RUN git clone -b master https://github.com/dsi-icl/eae-compute

WORKDIR /root/eae-compute

# Install eae-compute npm dependencies
RUN cp package.json /usr/app/
RUN npm install --silent; exit 0;
RUN cat /root/.npm/_logs/*; exit 0;

# Bundle app
RUN cp -r src /usr/app/src \
   && cp config/eae.compute.sample.config.js /usr/app/config/eae.compute.config.js

# Run compute service
EXPOSE 80
