# Select source image
FROM node:alpine

# Set up metadata
ARG version
LABEL maintainer="Florian Guitton <f.guitton@imperial.ac.uk>"
LABEL version=$version

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

# Install app dependencies
COPY package.json /usr/app/
RUN apk update && apk add git
RUN npm install; exit 0
RUN cat /root/.npm/_logs/*; exit 0
RUN apk del git

# Bundle app source
COPY src /usr/app/

# Start application
EXPOSE 4242
CMD [ "npm", "start" ]
