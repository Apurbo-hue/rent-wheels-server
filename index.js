const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jhmuzak.mongodb.net/?appName=Cluster0`;
// Create a MongoClient 
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
    try {
        await client.connect();
        console.log("MongoDB connected");
        const db = await client.db("rent_wheels_db");
        const usersCollection = await db.collection("users");
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged successfully");
    }
    finally {
        
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Hello World!");
})

app.listen(port, () => {
    console.log(`this site is live on port ${port}`);
})