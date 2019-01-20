# We import the eAE package
from eAE import eAE

# We create the connection to the backend
eae = eAE.eAE("admin", "admin", "146.169.33.32")

# We list the jobs with their associated parameters
parameters = [ "first_analysis_type 0 1" ]

# We list the required files for the analysis to be sent to the back-end
data_files = ["faust.txt"]

# We submit a job
result = eae.submit_jobs("python2", "job.py", parameters, data_files)

# We check that the submission has been successful
print(result)

"""
    result = { "status": "OK",
               "jobID": "5b080d28e9b47700118f0c99",
               "jobPosition": 1 }
"""