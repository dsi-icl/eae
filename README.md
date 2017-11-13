# eae-compute
[![Travis](https://img.shields.io/travis/dsi-icl/eae-compute/master.svg?style=flat-square)](https://travis-ci.org/dsi-icl/eae-compute) 
[![David](https://img.shields.io/david/dsi-icl/eae-compute.svg?style=flat-square)](https://david-dm.org/dsi-icl/eae-compute) 
[![David](https://img.shields.io/david/dev/dsi-icl/eae-compute.svg?style=flat-square)](https://david-dm.org/dsi-icl/eae-compute?type=dev) 

eAE - Compute micro-service
---------------------------

The eae-compute service provides execution capabilities to the eae eco-system. While managing jobs is expected to be handled by the eae-scheduler, running them is the role of eae-compute. 
To do so, the eae-compute service exposes a REST interface. 

We provide the [API documentation](doc-api-swagger.yml) in swagger 2.0 format. You can paste the content in the [swagger editor](http://editor.swagger.io/) to render the API documentation.

## Configuration
At its construction, the `eaeCompute` server receives a configuration object that MUST respect the following schema:
 * [Example configuration](config/eae.compute.sample.config.js)
 * [Tests configuration](config/eae.compute.test.config.js)
 

### Supported job types
 * `EAE_JOB_TYPE_PYTHON2` From the eae-utils package. Runs a python script using python2 cli
 * `EAE_JOB_TYPE_PIP` Use the pip command. Support both install and uninstall via this job parameters
 * `EAE_JOB_TYPE_R` From the eae-utils package. Runs an R script using Rscript cli

### Contributing
To add support for more Job types:
 * Create a new class that inherits from the `JobExecutorAbstract` [source](src/jobExecutorAbstract.js).
 * Implement the abstract methods `_preExecution`, `_postExecution`, `startExecution` and `stopExecution`, with their expected behavior.
 * Insert your new job type allocation into the [JobFactory](src/jobExecutorFactory.js).
