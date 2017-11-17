#!/usr/bin/env bash

cp config/eae.carrier.sample.config.js Docker/eae.carrier.config.js
cp config/eae.compute.sample.config.js Docker/eae.compute.config.js
cp config/eae.interface.sample.config.js Docker/eae.interface.config.js
cp config/eae.scheduler.sample.config.js Docker/eae.scheduler.config.js

cd Docker

docker-compose build

echo -e "To start the eAE please run 'docker-compose up'\n"