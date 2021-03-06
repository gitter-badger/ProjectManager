"""
Created December 2013

@author: zack.galbreath@kitware.com

This script loads Visomics-style analyses into the Arbor TreeStore database.

Requirements:
    - xmltodict (can be pip installed)
"""

from ArborFileManagerAPI import ArborFileManager
api = ArborFileManager()
api.initDatabaseConnection()

import json
import os
import sys
import xmltodict

# check that analysis directory has been passed in via the command line
if len(sys.argv) < 2:
  print sys.argv[0] + " <path/to/xml_dir>"
  sys.exit(1)

xml_dir = sys.argv[1]
xml_files = os.listdir(xml_dir)

for xml_file in xml_files:
  if not xml_file.endswith(".xml"):
    continue

  # find each matching pair of .xml & .R files
  analysis_name = xml_file[:-4]

  script_path = ""
  analysis_type = ""
  r_script_path = xml_dir + "/" + analysis_name + ".R"
  python_script_path = xml_dir + "/" + analysis_name + ".py"
  if os.path.exists(r_script_path):
    script_path = r_script_path
    analysis_type = "vtkr"
  elif os.path.exists(python_script_path):
    script_path = python_script_path
    analysis_type = "vtkpython"
  else:
    print "Skipping %s because corresponding script does not exist" % analysis_name
    continue

  # load their contents into a Python dictionary
  f = file(xml_dir + "/" + xml_file, "r")
  xml_contents = f.read()
  f.close()

  f = file(script_path, "r")
  script_contents = f.read()
  f.close()

  analysis_item = xmltodict.parse(xml_contents)
  analysis_item["analysis"]["script"] = script_contents
  analysis_item["analysis"]["type"] = analysis_type

  # use this dictionary to insert this analysis into the TreeStore
  api.newAnalysis(analysis_name, analysis_item)
  print "newAnalysis called for %s" % analysis_name
