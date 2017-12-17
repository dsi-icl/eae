#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""Provides methods for accessing the eAE-interface API.
"""
import json

from http import client

__author__ = "Axel Oehmichen"
__copyright__ = "Copyright 2017, Axel Oehmichen"
__credits__ = []
__license__ = "MIT"
__version__ = "0.1"
__maintainer__ = "Axel Oehmichen"
__email__ = "ao1011@imperial.ac.uk"
__status__ = ""

__all__ = ['eAE']


class eAE(object):
    def __init__(self, username, password, interface_ip, interface_port=80):
        self.username = str(username)
        self.password = str(password)
        self.interface_ip = int(interface_ip)
        self.interface_port = int(interface_port)
        self.connection = client.HTTPSConnection(self.interface_ip, self.interface_port)

    def __str__(self):
        return "\rThe interface ip is set to: {0}\r The interface port is set to: {1}".format(self.interface_ip,
                                                                                              self.interface_port)

    def submit_jobs(self, computation_type, main_file, parameters_set, data_files):
        """
        Submit jobs to the eAE backend

        This method is called when a specific task needs to be computed on a cluster.
        """

        if len(data_files) == len(parameters_set):
            return "There is a mismatch in the number of data files data files and parameters " \
                   + str(len(data_files)) + " , " + str(len(parameters_set))

        submit_responses = []
        for i in range(len(data_files)):
            job = {"type": computation_type, "main": main_file, "params": parameters_set[i], "input": data_files[i] }
            data = {'eaeUsername': self.username, 'eaeUserToken': self.password, 'job': job}
            data_str = json.dumps(data)
            self.connection.request('POST', '/job', data_str)
            res = self.connection.getresponse()
            submit_responses.append(res.read())

        return submit_responses

    def get_job(self):
        """
        Retrieves a job currently running on the eAE backend
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password}
        data_str = json.dumps(data)
        self.connection.request('POST', '/servicesStatus', data_str)
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response


    def get_all_jobs(self):
        """
        Retrieves all job currently running on the eAE backend
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password}
        data_str = json.dumps(data)
        self.connection.request('POST', '/job/getAll', data_str)
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response

    def cancel_job(self, job_id):
        """
        Cancels a specific job currently running on the eAE backend
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, "jobID": job_id}
        data_str = json.dumps(data)
        self.connection.request('POST', '/job/cancel', data_str)
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response

    def get_job_result(self, job_id):
        """
        Retrieves the results for a specific job computed on the eAE backend
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, "jobID": job_id}
        data_str = json.dumps(data)
        self.connection.request('POST', '/job/results', data_str)
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response

    def get_user(self, requestedUsername):
        """
        Retrieves all the information regarding a specified user
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, "requestedUsername": requestedUsername}
        data_str = json.dumps(data)
        self.connection.request('POST', '/user', data_str)
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response

    def create_user(self, new_user):
        """
        Creates a new user for the eAE
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, "newUser": {"username": new_user}}
        data_str = json.dumps(data)
        self.connection.request('POST', '/user/create', data_str)
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response

    def delete_user(self, user_to_be_deleted):
        """
        Deletes the specified eAE user
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password, "userToBeDeleted": user_to_be_deleted}
        data_str = json.dumps(data)
        self.connection.request('POST', '/user/delete', data_str)
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response

    def get_services_status(self):
        """
        Retrieves all the current statuses of the eAE backend services
        """
        data = {'eaeUsername': self.username, 'eaeUserToken': self.password}
        data_str = json.dumps(data)
        self.connection.request('POST', '/servicesStatus', data_str)
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response

    def who_are_you(self):
        """
        I AM A TEAPOT !
        """
        self.connection.request('GET', '/whoareyou')
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response
