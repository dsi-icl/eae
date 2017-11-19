import sys
import datetime
from pymongo import MongoClient

#####################################
# main program                      #
#####################################

mongoURL = sys.argv[1]
adminPwd = sys.argv[2]

client = MongoClient('mongodb://' + mongoURL + '/')

adminUser = { "type" : "ADMIN",
	      "username" : "admin",
              "token" : adminPwd,
              "created" : datetime.datetime.utcnow() 
             }

client.eae.users.insert_one(adminUser)

client.close()
