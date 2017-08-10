# Select source image
FROM ubuntu:14.04

# Set up metadata
ARG version
LABEL version=$version
RUN echo "Version is to be" $version

# Install all dependencies
RUN apt-get update
RUN apt-get install -y nodejs

# Create app directory
RUN mkdir -p /usr/app
WORKDIR /usr/app

COPY package.json /usr/app/
RUN npm install --silent; exit 0
RUN cat /root/.npm/_logs/*; exit 0

# Bundle app source
COPY src /usr/app/src

# Start application
EXPOSE 80
CMD npm test
