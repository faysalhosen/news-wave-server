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