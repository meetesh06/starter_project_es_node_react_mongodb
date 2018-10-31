const express = require('express');
const elasticsearch = require('elasticsearch');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const jwt = require('jsonwebtoken');
const url = "mongodb://localhost:27017/";

const server = express();

const APP_SECRET_KEY = "JP_TOKYO_ES";

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
  

server.post('/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    // connect to database here

    const JWTToken = jwt.sign({
        email
      },
      APP_SECRET_KEY, {
        expiresIn: '1d'
      });

    if(email === "meeteshmehta4@gmail.com" && password === "ogilogil") 
        res.json({
            error: false,
            data: JWTToken
        });
    else 
        res.json({
            error: true,
            mssg: "auth failure"
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
    const token = req.query.token;
    if(queryString === undefined || token === undefined) return res.send({ error: false, mssg: "Invalid Request" })
    jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
        if (err) return res.json({
            error: true,
            mssg: "Token Verification failed."
          });
          
          client.search({
              index: 'products_opt',
              type: 'products',
              body: {
                  query: {
                      match_phrase_prefix: {
                        title: {
                          query: queryString,
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
      
});
server.get('/search/normal', (req, res) => {
    const queryString = req.query.text;

    const token = req.query.token;
    if(queryString === undefined || token === undefined) return res.send({ error: false, mssg: "Invalid Request" })
    jwt.verify(token, APP_SECRET_KEY, function(err, decoded) {
        if (err) return res.json({
            error: true,
            mssg: "Token Verification failed."
          });
        client.search({
        index: 'products_opt',
        type: 'products',
        body: {
            
            query: {
                multi_match : {
                        query:    queryString, 
                        fields: [ "title", "content", "size" ],
                        fuzziness : "AUTO",
                        // prefix_length : 2
                },
            }
            
        }
        }).then(function (resp) {
        res.send({ error: false, data: resp.hits.hits })
        }, function (err) {
        res.send({ error: false, mssg: err.message })
        });
         
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

