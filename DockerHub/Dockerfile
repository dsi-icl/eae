# Select source image
FROM node:latest

# Create app directories
RUN mkdir -p /usr/app/config
WORKDIR /root

# We download the eae interface
RUN git clone -b master https://github.com/dsi-icl/eae-interface

WORKDIR /root/eae-interface

# Bundle app
RUN cp package.json /usr/app/ \
   && cp -r src /usr/app/src

WORKDIR /usr/app

# Install eae-interface npm dependencies
RUN npm install; exit 0;
RUN cat /root/.npm/_logs/*; exit 0;

# Run interface service
EXPOSE 80
CMD [ "npm", "start" ]
