const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
require("dotenv").config();

// middlewares
app.use(cors());
app.use(express.json());

// mongodb


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
//const uri = `mongodb+srv://${process.env.user}:${process.env.pass}@cluster0.sr4dbs2.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.user}:${process.env.pass}@cluster0.wzxk65v.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const postsCollection = client.db("newswave").collection("posts");
    const usersCollection = client.db("newswave").collection("users");


    // posts crud
    app.post("/posts", async (req, res) => {
      const post = req.body;
      const result = await postsCollection.insertOne(post);
      res.send(result);
    })

    app.get("/posts", async (req, res) => {
      const result = await postsCollection.find().toArray();
      res.send(result);
    })
    app.get("/articles", async (req, res) => {

      let query = {};
      if (req.query?.status) {
        query = {
          status: req.query.status,
        }
        // console.log(query);
      }
      const result = await postsCollection.find(query).toArray();
      res.send(result)
    })

    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.deleteOne(query);
      res.send(result);
    })

    app.patch("/approval/:id", async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const updateRequest = req.body;
      // console.log(updateRequest);
      const updatedApproval = {
        $set:{
          status: updateRequest.status,
        }
      }
      const result = await postsCollection.updateOne(query, updatedApproval);
      res.send(result);

    })

    app.patch("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateRequest = req.body;
      // console.log(updateRequest);
      const updatedArticle = {
        $set: {
          title: updateRequest.title,
          category: updateRequest.category,
          article: updateRequest.article,
          type: updateRequest.type,
          photoURL: updateRequest.photoURL,
          status: "pending",
        }
      };
      const result = await postsCollection.updateOne(query, updatedArticle);
      res.send(result);
    })


    app.get("/post/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.findOne(query);
      res.send(result);
    })

    app.get("/myarticles", async (req, res) => {

      let query = {};
      if (req.query?.email) {
        query = {
          author_email: req.query.email,
        }
        // console.log(query);
      }
      const result = await postsCollection.find(query).toArray();
      res.send(result)
    })


    // users
    app.post("/users", async(req,res)=>{
      const user = req.body;
      // console.log(user);
      const query = {email: user.email};
      const existingUser = await usersCollection.findOne(query);
      if(existingUser){
        return;
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);

    })

    app.get("/users", async(req,res)=>{
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.get("/user/:email", async(req,res)=>{
      const email = req.params.email;
      // console.log(email);
      const query = {email: email};
      const result = await usersCollection.findOne(query);
      res.send(result)
    })

    app.patch("/user/:id", async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const updateRequest = req.body;
      // console.log(updateRequest);
      const updatedAdmin = {
        $set:{
          role: updateRequest.role,
        }
      }
      const result = await usersCollection.updateOne(query, updatedAdmin);
      res.send(result);
    })

    app.patch("/premiumuser/:email", async(req,res)=>{
      const email = req.params.email;
      const query = {email:email};
      const updateRequest = req.body;
      const updatedDoc = {
        $set:{
          account_type: updateRequest.account_type,
        }
      };
      const result = await usersCollection.updateOne(query, updatedDoc);
      res.send(result);
    })


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("News Wave Server Is Running Prefectly");
})
app.listen(port);