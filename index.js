const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const port = process.env.PORT || 3000;
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://news-wave-af65c.web.app"
  ]
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.user}:${process.env.pass}@cluster0.wzxk65v.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const postsCollection = client.db("newswave").collection("posts");
    const usersCollection = client.db("newswave").collection("users");
    const publisherCollection = client.db("newswave").collection("publishers");


    // posts crud
    app.post("/posts", async (req, res) => {
      // console.log('res')

      const post = req.body;
      const result = await postsCollection.insertOne(post);
      res.send(result);
    })

    app.get("/posts", async (req, res) => {
      const result = await postsCollection.find().toArray();
      res.send(result);
    })

    app.get("/articles", async (req, res) => {
      const search = req?.query?.searchValue || '';
      const query = {status: 'approved', title: { $regex: search, $options: 'i' } }
      const result = await postsCollection.find(query).toArray();
      res.send(result)
    })

    app.get("/publishers", async (req, res) => {
      let query = {};
      const result = await publisherCollection.find().toArray();
      // console.log(result)
      res.send(result);
    });

    app.post('/add-publisher', async (req, res) => {
      const document = req.body;
      // console.log(document)
      const result = await publisherCollection.insertOne(document);
      res.send(result)
    })

    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await postsCollection.deleteOne(query);
      res.send(result);
    })

    app.patch("/approval/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateRequest = req.body;
      // console.log(updateRequest);
      const updatedApproval = {
        $set: {
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


        // console.log(query.email);
      }
      const result = await postsCollection.find(query).toArray();
      res.send(result)
    })


    // users
    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return;
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);

    })

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      // console.log(email);
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result)
    })

    app.patch("/user/:id", async (req, res) => {
      const id = req.params.id;
      console.log({ id })
      const query = { _id: new ObjectId(id) };
      const updateRequest = req.body;
      console.log(updateRequest);

      const updatedAdmin = {

        $set: {
          role: updateRequest?.role,
        }
      }
      const result = await usersCollection.updateOne(query, updatedAdmin);
      res.send(result);
    })

    app.patch("/premiumuser/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const updateRequest = req.body;
      const updatedDoc = {
        $set: {
          account_type: updateRequest.account_type,
        }
      };
      const result = await usersCollection.updateOne(query, updatedDoc);
      res.send(result);
    })


    app.post("/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      // console.log(price)
      const amount = parseInt(price * 100); // fixed invalid integer
      // console.log(price, amount)

      if (!price || amount < 1) return;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })

  } finally {
    // Ensure that the client will close when you finish/error
    //await client.close();
  }
}

run().catch(console.dir);

// Move the app.listen outside the finally block
app.get("/", (req, res) => {
  res.send("News Wave Server Is Running Perfectly");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
