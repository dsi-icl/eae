# Select source image
FROM node:latest

# Create app directories
RUN mkdir -p /usr/app/config
WORKDIR /root

# We download the eae compute
RUN git clone -b master https://github.com/dsi-icl/eae-compute

WORKDIR /root/eae-compute

# Bundle app
RUN cp package.json /usr/app/ \
   && cp -r src /usr/app/src

WORKDIR /usr/app

# Install eae-compute npm dependencies
RUN npm install; exit 0;
RUN cat /root/.npm/_logs/*; exit 0;

# Run compute service
EXPOSE 80
CMD [ "npm", "start" ]
