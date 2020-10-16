const express = require('express')
const cors = require('cors')
const app = express()
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster1.fwfle.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const ObjectId = require('mongodb').ObjectId;

const port = 5000;




app.use(bodyParser.json());
app.use(cors());
app.use(express.static('images'));
app.use(fileUpload());





const client = new MongoClient(uri, { useNewUrlParser: true ,useUnifiedTopology: true });

client.connect(err => {

  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("testServiceCollection");
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("ordes");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admins");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");



  // Add New Service

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    const image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

   serviceCollection.insertOne({ title,description, image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
  })


// Add New Order
  app.post('/addOrder', (req, res) => {
    const orderData = req.body;
    orderCollection.insertOne(orderData)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
  })

  

  // Filter By Service List
  app.post('/serviceList', (req, res) => {
      const email = req.body.email;
        orderCollection.find({email: email})
          .toArray((err, documents) => {
            res.send(documents);
        })
          
  });


  // Make Admin
  app.post('/makeAdmin', (req, res) => {
    const adminInfo = req.body;
    adminCollection.insertOne(adminInfo)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
  })

  // Check Admin Access
  app.post('/checkAccess', (req, res) => {
      const email = req.body.email;
      adminCollection.find({email: email})
          .toArray((err, documents) => {
            res.send(documents.length > 0);
        })
          
  });

// get Services
  app.get('/services', (req, res) => {
    serviceCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
  });


// get all Orders
  app.get('/allOrders', (req, res) => {
    orderCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
  });

   // updating order
   app.patch('/updateOrder/:id', (req, res) => {
    orderCollection.updateOne({_id: ObjectId(req.params.id)},
    {$set: {
        status: req.body.status
    }})
    .then(result => res.send(result.modifiedCount > 0))
})

  // get Dynamic Order
  app.get('/order/:key', (req, res) => {
    serviceCollection.find({
      _id: ObjectId(req.params.key),
    })
        .toArray((err, documents) => {
            res.send(documents[0]);
        })
  });


  // add Review
  app.post('/addReview', (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
  })

  // get Services
  app.get('/reviews', (req, res) => {
    reviewCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
  });
  
});






app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(process.env.PORT || port);


// "start": "node index.js",
    // "start:dev": "nodemon index.js",