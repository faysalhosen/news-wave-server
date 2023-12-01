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


}
run().catch(console.dir);



app.get("/", (req, res) => {
  res.send("News Wave Server Is Running Prefectly");
})
app.listen(port);