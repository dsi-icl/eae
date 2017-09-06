# Select source image
FROM node:wheezy

# Install all dependencies
RUN apt-get update -q                                   \
    && apt-get upgrade -y --no-install-recommends       \
    && apt-get install -y python-pip

#RUN wget https://mran.microsoft.com/install/mro/3.4.0/microsoft-r-open-3.4.0.tar.gz \
#    && tar xzf microsoft-r-open-3.4.0.tar.gz \
#    && cd microsoft-r-open \
#    && ./install.sh

# Create app directories
RUN mkdir -p /usr/app && mkdir -p /usr/test
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
COPY ./config/eae.compute.test.config.js /usr/app/config/eae.compute.config.js

EXPOSE 80
