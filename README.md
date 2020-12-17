# Introduction
## Part Of JP TOKYO Internship
This is a sample project to get started Mongodb + Elasticsearch + mongo-connector + nodeJS + React stack. This project uses nodeJS as middleware for access to elastic-search and mongoDB. The security used for authentication is based on JWT tokens, which is a good way to achieve stateless/passive authentication, without maintaining a active session database.
One of the main reasons for this project is the sync between the mongoDB database and ElasticSearch automatically using python library mongo-connector.

This is a unlisted video and only accessable through this link
https://www.youtube.com/watch?v=kwxGbO6Yzvc&feature=youtu.be

### TODO
1) Make a DB for user auth, select a HASH digest function
2) Make better tokenizers for search
3) Add real products to make more sense out of the data

### Changes
31/10/2018
1) Implemented JTW auth, routes are now secure
2) Implemented Redux for state management in frontend

## Pre-Requisites
1) A working mongoDB installation
	start the mongoDB server using the following command to start it as a replica set
 - mongod --replSet rs0
 - ( if you see an error ) 
 - use [rs.intiate()](https://docs.mongodb.com/manual/reference/method/rs.initiate/) - see documentation
2) Working ElasticSearch binaries.
3) python with pip installed

## Installation of required software
1) pip install mongo-connector 
2) pip install elastic2-doc-manager

## Install Instructions
#### 1) Setting up mongoDB

    # Start mongoDB session
    mongo
    
    # Create a database named jp_tokyo 
    use jp_tokyo
	
	# Create a collection named products
	db.createCollection('products')
	

#### 2) Setting up ElasticSearch
The use of autocomplete requires a analyser chain. This is accomplished by using one of the many analysers provided by ElasticSearch. For this project I have used [edge_ngrams](https://en.wikipedia.org/wiki/N-gram) analyser due to its ease of understanding and easy set-up.


    # Create an index named products_opt
    curl -H 'Content-Type: application/json' \
		-X PUT http://localhost:9200/products_opt \
		-d \
		"{ \
			\"settings\": { \
				\"number_of_shards\": 1, \
				\"analysis\": { \
					\"filter\": { \
						\"autocomplete_filter\": { \
							\"type\": \"edge_ngram\", \
							\"min_gram\": 3, \
							\"max_gram\": 20 \
						} \
					}, \
					\"analyzer\": { \
						\"autocomplete\": { \
							\"type\":  \"custom\", \
							\"tokenizer\": \"standard\", \
							\"filter\": [ \
								\"lowercase\", \
								\"autocomplete_filter\" \
							] \
						} \
					} \
				} \
	    	} \
	    }"
	    
    # Create mappings to products
    curl -H 'Content-Type: application/json' \
        -X PUT http://localhost:9200/products_opt/_mapping/products \
        -d \
       "{ \
           \"products\": { \
               \"properties\": { \
                   \"title\": { \
                       \"type\":     \"text\", \
                       \"analyzer\": \"autocomplete\" \
                   }, \
                   \"content\": { \
                       \"type\":    \"text\" \
                   }, \
                   \"size\": { \
                       \"type\":    \"text\", \
                       \"analyzer\": \"autocomplete\" \
                   } \
               } \
           } \
       }"
    
	# You can check the created index using
	curl localhost:9200/_cat/indices?v
	

#### 3) Using mongo-connector

> You have to make sure that the mongoDB is running as a replica set, if
> not the python script will fail.

Use this command, and let it keep running in the background

    mongo-connector -m 127.0.0.1:27017 -t 127.0.0.1:9200 -d elastic2_doc_manager -n jp_tokyo.products -g products_opt.products

#### 4) Inserting documents

	# Insert some documents
	db.products.insert({
    title: "Golden Glass holder",
    content: "Perfect for the places of royalty, this is widely used in Dubai/'s high class hotels",
    size: "200x300,400x600"
    })
	
	db.products.insert({
    title: "Silver Glass holder",
    content: "Perfect for the places of executive business, this is widely used in Old English Architecture",
    size: "200x300,400x600,800x600"
    })
    
	# Now if everything is working corectly, you will see two documents show up in proucts_opt index
	curl localhost:9200/_cat/indices?v

    

### Using this project 

    # clone this project using git
    # This project is composed of two basic sub projects, one is react frontend and other is backend.
    # You do not need the frontend project to accomplish this task but I have provided it if you want to use it as a template or make any changes
    cd backend
    npm install
    # This will start the server on port 7190
    npm start  

The project should now be live on http://localhost:7190
Enjoy !

## TODO
1) Token distribution
2) Express middleware for route specific authentication
