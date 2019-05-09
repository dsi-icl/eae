# eAE-carrier
[![](https://img.shields.io/badge/made-with_Kobolds-5e4ac2.svg?style=flat-square)](https://eae.doc.ic.ac.uk)
[![Travis branch](https://img.shields.io/travis/dsi-icl/eae-carrier/master.svg?style=flat-square)](https://travis-ci.org/dsi-icl/eae-carrier) 
[![David](https://img.shields.io/david/dsi-icl/eae-carrier.svg?style=flat-square)](https://david-dm.org/dsi-icl/eae-carrier) 
[![David](https://img.shields.io/david/dev/dsi-icl/eae-carrier.svg?style=flat-square)](https://david-dm.org/dsi-icl/eae-carrier?type=dev) 


eAE - Carrier micro-service 

The eAE-carrier manages the transfer of files between the client application and the eAE. 
It enables the client to upload the required files for the computation and serves back the results once they have been computed
by the eAE compute services.

We provide the [API documentation](doc-api-swagger.yml) in swagger 2.0 format. You can paste the content in the 
[swagger editor](http://editor.swagger.io/) to render the API documentation. 

## Configuration
At its construction, the `eae-carrier` server receives a configuration object that MUST respect the following schema:
 * [Example configuration](config/eae.carrier.sample.config.js)
 * [Tests configuration](config/eae.carrier.test.config.js)
