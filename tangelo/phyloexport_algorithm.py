# -*- coding: utf-8 -*-
import pymongo

def recursive_build_newick(tree_coll, doc_id):
    nodeDoc = tree_coll.find_one({'_id':doc_id})
    clades = nodeDoc[u'clades'] # a list of doc ids
    newickString = "("
    for clade in clades:
      childDoc = tree_coll.find_one({'_id':clade})

      if childDoc.has_key(u'clades'):
        subNewickString = recursive_build_newick(tree_coll,clade)
        newickString += subNewickString

      if childDoc.has_key(u'name'):
        nodeName = childDoc[u'name']
        newickString += nodeName

      if childDoc.has_key(u'branch_length'):
        branchLength = childDoc[u'branch_length']
        newickString += ":%f" %(branchLength)
      else:
        print "Warning: this node has empty branch length"

      newickString += ","

    # remove the last "," and replace it with ")"
    newickString = newickString[:-1] + ")"
    return newickString

def convertTreeToNewickString(tree_coll):
    phylo = tree_coll.find_one({'rooted':True})
    string = ""
    if (phylo is not None):
       doc_id = phylo[u'clades'][0]#point to the acutally root
       # newick string ends with ";"
       string = recursive_build_newick(tree_coll, doc_id) + ";"
    else:
        print 'failed to find the root document in the tree collection'

    return string

def getHeadersForTable(table_coll):
    # create the header row.  If it contains a "name" field,
    # then ensure that this appears first.
    first_row = table_coll.find_one()
    string = ""
    if "name" in first_row.keys():
        string = "name,"
    for key in first_row.iterkeys():
        if key == "_id" or key == "name":
            continue
        string += key
        string += ","
    string = string[:-1] + "\n"
    return string

def convertTableToCSVString(table_coll):
    # get the header row
    string = getHeadersForTable(table_coll)

    hasNames = False
    if "name," in string:
        hasNames = True

    # create the contents rows
    for row in table_coll.find():
        if hasNames:
            string += row["name"]
            string += ","
        for key, value in row.iteritems():
            if key == "_id" or key == "name":
                continue
            string += value
            string += ","
        string = string[:-1] + "\n"

    string = string[:-1]
    return string
