# eAE-deploy
[![Travis branch](https://img.shields.io/travis/dsi-icl/eae-deploy/master.svg?style=flat-square)](https://travis-ci.org/dsi-icl/eae-deploy) 

This repository contains deployment information, docker-compose and deployment scripts for the eAE.

Please not that the **_eAE officially supports only Ubuntu 16.06 LTS_**. Other Linux like environments are compatible (debian, macOS, etc.) but are not officially supported. 

## Sandbox environment

You can test locally a small deployment of the eAE (1 interface, 1 carrier, 1 scheduler, 2 compute - `Python2` & `R` on both) using [docker-compose](https://docs.docker.com/compose/).
to facilitate the process three bash scripts have been developed: 
  * `build.sh` : Copies the sample config to the Docker folder and pulls the latest version of all the necessary Docker images from DockerHub.
  * `start.sh` : Starts the cluster.
  * `clean.sh` : Removes all containers used by the eAE compose. **NB**: The other containers and the eAE container images will not be deleted. 
  * `test.sh` : Runs a small end to end test against the sandbox environment to check if the eAE running from docker-compose runs properly.

Please be aware that the interface will start on port `80`, the carrier on port `3000` and mongo on `27017`. Thus, before starting the sandbox please make sure that those three ports are available.
