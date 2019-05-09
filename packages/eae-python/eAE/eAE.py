#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Provides methods for accessing the eAE-interface API.
"""
import json
import requests
from http import client
from requests_toolbelt.multipart.encoder import MultipartEncoder

__author__ = "Axel Oehmichen"
__copyright__ = "Copyright 2017, Axel Oehmichen"
__credits__ = []
__license__ = "MIT"
__version__ = "0.1.3"
__maintainer__ = "Axel Oehmichen"
__email__ = "ao1011@imperial.ac.uk"
__status__ = ""

__all__ = ['eAE']


class eAE(object):
    def __init__(self, username, password, interface_address, interface_port=80, carrier_port=3000):
        self.username = str(username)
        self.password = str(password)
        self.interface_ip = interface_address
        self.interface_port = int(interface_port)
        self.carrier_port = int(carrier_port)
        self.connection = client.HTTPSConnection(self.interface_ip, self.interface_port)
        self.url_interface = 'http://' + str(self.interface_ip) + ':' + str(self.interface_port)
        self.url_carrier = 'http://' + str(self.interface_ip) + ':' + str(self.carrier_port)

    def __str__(self):
        return "\rThe interface ip is set to: {0}\r The interface port is set to: {1}".format(self.interface_ip,
                                                                                              self.interface_port)

    def submit_jobs(self, computation_type, main_file, parameters_set, data_files):
        """
        Submit jobs to the eAE backend

        This method is called when a specific task needs to be computed on a cluster.
        """
        job = {'type': computation_type, 'main': main_file, 'params': parameters_set, 'input': data_files}
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, 'job': json.dumps(job)}
        r = requests.post(self.url_interface + '/job/create', json=data)
        res = r.json()
        for i in range(len(data_files)):
            m = MultipartEncoder(
                fields={'fileName': data_files[i], 'jobID': str(res['jobID']), 'eaeUsername': self.username,
                        'file': (data_files[i], open(data_files[i], 'rb'), 'text/plain')}
            )
            r = requests.post(self.url_carrier + '/file-upload', data=m,
                              headers={'Content-Type': m.content_type})
            if(r.text is True):
                print('The file {} has been successfully uploaded'.format(data_files[i]))
        return res

    def get_job(self, jobID):
        """
        Retrieves a job currently running on the eAE backend
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, 'jobID': jobID}
        r = requests.post(self.url_interface + '/job', json=data)
        submit_response = r.json()
        return submit_response

    def get_all_jobs(self):
        """
        Retrieves all job currently running on the eAE backend
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password}
        r = requests.post(self.url_interface + '/job/getAll', json=data)
        submit_response = r.json()
        return submit_response

    def cancel_job(self, job_id):
        """
        Cancels a specific job currently running on the eAE backend
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, "jobID": job_id}
        r = requests.post(self.url_interface + '/job/cancel', json=data)
        submit_response = r.json()
        return submit_response

    def get_job_result(self, directory,job_id):
        """
        Retrieves the results for a specific job computed on the eAE backend
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, "jobID": job_id}
        r = requests.post(self.url_interface + '/job/results', json=data)
        res = r.json()
        for i in range(len(res["output"])):
            file = {'eaeUsername': self.username, 'fileName': res["output"][i], "jobID": job_id}
            r = requests.post(self.url_carrier + '/file-download', json=file)
            print('The file {} has been successfully downloaded'.format(res["output"][i]))
            with open(directory + res["output"][i], 'a') as f:
                f.write(r.content.decode('utf-8'))
        return res

    def get_user(self, requestedUsername):
        """
        Retrieves all the information regarding a specified user
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, "requestedUsername": requestedUsername}
        r = requests.post(self.url_interface + '/user', json=data)
        submit_response = r.json()
        return submit_response

    def create_user(self, new_user):
        """
        Creates a new user for the eAE
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, "newUser": {"username": new_user}}
        r = requests.post(self.url_interface + '/user/create', json=data)
        submit_response = r.json()
        return submit_response

    def delete_user(self, user_to_be_deleted):
        """
        Deletes the specified eAE user
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, "userToBeDeleted": user_to_be_deleted}
        r = requests.post(self.url_interface + '/user/delete', json=data)
        submit_response = r.json()
        return submit_response

    def get_services_status(self):
        """
        Retrieves all the current statuses of the eAE backend services
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password}
        r = requests.post(self.url_interface + '/servicesStatus', json=data)
        submit_response = r.json()
        return submit_response

    def who_are_you(self):
        """
        I AM A TEAPOT !
        """
        self.connection.request('GET', '/whoareyou')
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response
