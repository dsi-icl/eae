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

    def submit_jobs(self, parameters_set, cluster, computation_type, main_file, data_files, host_ip, ssh_port="22"):
        """
        Submit jobs to the eAE backend

        This method is called when a specific task needs to be computed on a cluster.
        """

        configs = parameters_set
        data = {'host_ip': host_ip, 'configs': configs,
                'cluster': cluster, 'clusterType': computation_type, 'mainScriptExport': main_file}
        data_str = json.dumps(data)
        self.connection.request('POST', '/interfaceEAE/OpenLava/submitJob', data_str)
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response

    def get_job(self):
        """
        Retrieves a job currently running on the eAE backend
        """

        return

    def get_all_jobs(self):
        """
        Retrieves all job currently running on the eAE backend
        """
        return

    def cancel_job(self):
        """
        Cancels a specific job currently running on the eAE backend
        """
        return

    def get_job_result(self):
        """
        Retrieves the results for a specific job computed on the eAE backend
        """
        return

    def get_user(self):
        """
        Retrieves all the information regarding a specified user
        """
        return

    def create_user(self):
        """
        Creates a new user for the eAE
        """
        return

    def delete_user(self):
        """
        Deletes the specified eAE user
        """
        return

    def get_services_status(self):
        """
        Retrieves all the current statuses of the eAE backend services
        """
        return

    def who_are_you(self):
        """
        I AM A TEAPOT !
        """
        self.connection.request('GET', '/whoareyou')
        res = self.connection.getresponse()
        submit_response = res.read()

        return submit_response
