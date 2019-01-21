# We import the eAE package
from eAE import eAE

# We create the connection to the backend
eae = eAE.eAE("admin", "admin", "146.169.33.20")

# We list the jobs with their associated parameters
parameters = [ "first_analysis_type 0 1" ]

# We list the required files for the analysis to be sent to the back-end
data_files = ["faust.txt"]

# We submit a job
answer = eae.submit_jobs("python2", "job.py", parameters, data_files)

# We check that the submission has been successful
print(answer)

"""
    answer = { "status": "OK",
               "jobID": "5b080d28e9b47700118f0c99",
               "jobPosition": 1,
               "carriers": [
                            "carrier:3000"
                       ]
            }
"""

# We download the results
result = eae.get_job_result(answer.jobID)

# We have a look at the computed result
print(result)

"""
Hello World !
Hello_this_is_patrick
The Project Gutenberg EBook of Faust, by Johann Wolfgang Von Goethe

This eBook is for the use of anyone anywhere at no cost and with
almost no restrictions whatsoever.  You may copy it, give it away or
re-use it under the terms of the Project Gutenberg License included
with this eBook or online at www.gutenberg.net
"""
