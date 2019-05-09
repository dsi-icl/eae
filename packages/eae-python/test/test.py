# We import the eAE package
import time

from eAE import eAE

directory = ''

# We create the connection to the backend
eae = eAE.eAE("admin", "admin", "127.0.0.1")

# We list the jobs with their associated parameters
parameters = ["first_analysis_type 0 1"]

# We list the required files for the analysis to be sent to the back-end
data_files = ["job.py", "faust.txt"]

# We submit a job
answer = eae.submit_jobs("python2", "job.py", parameters, data_files)

# We check that the submission has been successful
print(answer)

"""
    answer = { "status": "OK",
               "jobID": "5c47530c6ad68800121c72be",
               "jobPosition": 1,
               "carriers": [
                            "carrier:3000"
                       ]
            }
"""

# We check the current status of the job
status = eae.get_job(answer['jobID'])

print(status)

"""
    status = {
        'status': ['eae_job_completed', 'eae_job_done', 'eae_job_running', 'eae_job_scheduled', 'eae_job_queued', 'eae_job_transferring_data', 'eae_job_created'],
        'startDate': '2018-01-22T17:29:53.983Z',
        'main': 'job.py',
        'endDate': '2018-01-22T17:30:14.077Z',
        'executorPort': '9000',
        'executorIP': '127.0.0.1',
        'stdout': 'Hello World !\n',
        'output': ['test_out.txt'],
        'params': ['first_analysis_type 0 1'],
        'statusLock': False,
        'stderr': '',
        'requester': 'admin',
        'swiftData': {},
        'input': ['job.py', 'faust.txt'],
        'message': {'context': 'success'},
        '_id': '5c47530c6ad68800121c72be',
        'type': 'python2',
        'exitCode': 0
        }
"""

# We wait a bit for the computation to finish
time.sleep(30)

# We download the results
result = eae.get_job_result(directory, answer['jobID'])

# We have a look at the computed result
"""
Hello World !
first_analysis_type
The Project Gutenberg EBook of Faust, by Johann Wolfgang Von Goethe

This eBook is for the use of anyone anywhere at no cost and with
almost no restrictions whatsoever.  You may copy it, give it away or
re-use it under the terms of the Project Gutenberg License included
with this eBook or online at www.gutenberg.net
"""
