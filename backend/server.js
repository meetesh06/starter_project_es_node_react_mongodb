const express = require('express');
const elasticsearch = require('elasticsearch');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const url = "mongodb://localhost:27017/";

const server = express();
const client = new elasticsearch.Client({
  host: 'localhost:9200',
//   log: 'trace'
});

var dbo = null;

server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json())

server.use(express.static('public'));

MongoClient.connect(url, { useNewUrlParser: true } ,function(err, db) {
    if (err) throw err;
    dbo = db.db("jp_tokyo");
    // console.log(dbo);
    server.listen(7190 || process.env.PORT, () => {
        console.log("Server is live on " + 7190 || process.env.PORT);
    });
  });
  

server.post('/insert', (req, res) => {
    console.log(req.body);
    let title = req.body.title;
    let size = req.body.size.split(',');
    let content = req.body.content;
    dbo.collection('products').insertOne({ title, size, content }, (err, value) => {
        if(err) return res.json({
            error: true,
            mssg: err
        });
        res.json({
            error: false,
            mssg: "Value has been addes"
        });

    });
});

server.get('/', (req, res) => {
    console.log(__dirname+'/public/index.html');
    res.sendFile(__dirname+'/public/index.html');
});

server.get('/search/autocomplete', (req, res) => {
    const queryString = req.query.text;
    if(queryString === undefined) return res.send({ error: false, mssg: "Invalid Request" })
    client.search({
        index: 'products_opt',
        type: 'products',
        body: {
            query: {
                match: {
                  title: {
                    query: queryString,
                    analyzer: "standard"
                  }
                }
              }
        }
      }).then(function (resp) {
        res.send({ error: false, data: resp.hits.hits })
      }, function (err) {
        res.send({ error: false, mssg: err.message })
      });
      
});
server.get('/search/normal', (req, res) => {
    const queryString = req.query.text;
    if(queryString === undefined) return res.send({ error: false, mssg: "Invalid Request" })
    client.search({
        index: 'products_opt',
        type: 'products',
        body: {
            query: {
                multi_match : {
                        query:    queryString, 
                        fields: [ "title", "content", "size" ] 
                }
            }
            
        }
      }).then(function (resp) {
        res.send({ error: false, data: resp.hits.hits })
      }, function (err) {
        res.send({ error: false, mssg: err.message })
      });
      
});

server.get('/fetch/product', (req, res) => {
    const _id = req.query.id;
    console.log(_id);
    if(_id === undefined) return res.send({ error: false, mssg: "Invalid Request" })
    dbo.collection("products").findOne({ _id: ObjectID(_id) }, function(err, result) {
        // if (err) throw err;
        console.log(err, result)
        res.json({
            error: false,
            data: result === null ? [] : result  
        })
    });
      
});

