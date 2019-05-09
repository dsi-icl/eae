# eAE-interface
[![Unicorn](https://img.shields.io/badge/made-with_Unicorns-ff69b4.svg?style=flat-square)](https://eae.doc.ic.ac.uk)
[![Travis branch](https://img.shields.io/travis/dsi-icl/eae-interface/master.svg?style=flat-square)](https://travis-ci.org/dsi-icl/eae-interface) 
[![David](https://img.shields.io/david/dsi-icl/eae-interface.svg?style=flat-square)](https://david-dm.org/dsi-icl/eae-interface) 
[![David](https://img.shields.io/david/dev/dsi-icl/eae-interface.svg?style=flat-square)](https://david-dm.org/dsi-icl/eae-interface?type=dev) 

eAE - Interface micro-service 

The eAE-interface provides the API to interact with the eae eco-system. The core function of the API is first and
foremost to enable authorized users to submit jobs to the eAE. The two other features that the Interface manages are the
management of users(creation, deletion and providing information about them) and providing the current statuses of all the 
services in the environment. The currently managed services are Interface, Carrier, Scheduler and Compute.

We provide the [API documentation](doc-api-swagger.yml) in swagger 2.0 format. You can paste the content in the 
[swagger editor](http://editor.swagger.io/) to render the API documentation. 

## Configuration
At its construction, the `eae-interface` server receives a configuration object that MUST respect the following schema:
 * [Example configuration](config/eae.interface.sample.config.js)
 * [Tests configuration](config/eae.interface.test.config.js)

