# eAE-python
Python pip package to interact with the eAE.


#### *Example of an eAE script to submit a job*

```python
# We import the eAE package
from eAE import eAE

# We create the connection to the backend
eae = eAE.eAE("example", "password", "interface.eae.co.uk")

# We list the jobs with their associated parameters
parameters = [ "first_analysis_type 0 1",
               "first_analysis_type 1 2",
               "second_analysis_type 0.3 delta" ]

# We list the required files for the analysis to be sent to the back-end
data_files = ["data.txt", "image.png"]

# We submit a job
result = eae.submit_jobs("python2", "job.py", parameters, data_files)

# We check that the submission has been successful
print result

"""
    result = { "status": "OK",
               "jobID": "5b080d28e9b47700118f0c99",
               "jobPosition": 1 }
"""
```
