# eAE-scheduler
[![Phoenix](https://img.shields.io/badge/made-with_Phoenixes-ffa34d.svg?style=flat-square)](https://eae.doc.ic.ac.uk)
[![Travis branch](https://img.shields.io/travis/dsi-icl/eae-scheduler/master.svg?style=flat-square)](https://travis-ci.org/dsi-icl/eae-scheduler) 
[![David](https://img.shields.io/david/dsi-icl/eae-scheduler.svg?style=flat-square)](https://david-dm.org/dsi-icl/eae-scheduler) 
[![David](https://img.shields.io/david/dev/dsi-icl/eae-scheduler.svg?style=flat-square)](https://david-dm.org/dsi-icl/eae-scheduler?type=dev) 



eAE - Scheduler micro-service

---------------------------

The eae-scheduler service provides scheduling capabilities to the eae eco-system. While running jobs is handled by the eae-computing, 
managing and scheduling them is the role of eae-scheduler. 
To do so, the eae-scheduler runs continually in the background, checking for job to be scheduled, queued or archived. 

We provide the [API documentation](doc-api-swagger.yml) in swagger 2.0 format. You can paste the content in the [swagger editor](http://editor.swagger.io/) to render the API documentation.

## Configuration
At its construction, the `eaeScheduler` server receives a configuration object that MUST respect the following schema:
 * [Example configuration](config/eae.scheduler.sample.config.js)
 

### Supported Job States
 * `QUEUED` The job is in a queue and it is waiting to be scheduled
 * `SCHEDULED` The job has been scheduled
 * `RUNNING` The job is currently running
 * `DONE` The job has finished but it still need post processing
 * `COMPLETED` The job has finished and the post processing has been completed
 * `ERROR` The job encountered an error
 * `CANCELLED` The job has been cancelled
 * `DEAD` The job is dead
