const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const carsCollection = await db.collection("cars");
        const bookingsCollection = await db.collection("bookings");

        //get the users
        app.get("/users", async (req, res) => {
            const cursor = usersCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        //post a new user
        app.post("/users", async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email };
            const checkUser = await usersCollection.findOne(query)
            if (checkUser) {
                res.send({ message: "User already exists" })
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result);
            }
        })

        //get the cars
        app.get("/cars", async (req, res) => {
            const email = req.query.email;
            console.log(email)
            if (email) {
                const cursor = carsCollection.find({ providerEmail: email });
                const result = await cursor.toArray();
                return res.send(result);
            }
            const cursor = carsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        //get the featured cars
        app.get("/featuredCars", async (req, res) => {
            const cursor = carsCollection.find({}).sort({ dateAdded: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })


        //get the specific car by the id
        app.get("/cars/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carsCollection.findOne(query);
            res.send(result);
        })

        //post new car
        app.post("/cars", async (req, res) => {
            const newCar = req.body;
            const carName = req.body.carName;
            // console.log(newCar);
            const query = { carName: carName };
            const checkCar = await carsCollection.findOne(query);
            if (checkCar) {
                res.send({ message: "Car already exists" });
            }
            else {
                const result = await carsCollection.insertOne(newCar);
                res.send(result);
            }
        })

        //patch the availability of the car
        app.patch("/cars/:id", async (req, res) => {
            const carId = req.params.id;
            const update = req.body;
            const target = { _id: new ObjectId(carId) };
            const updateData = { $set: update }
            const options = {upsert:true}
            const result = await carsCollection.updateOne(target, updateData, options)
            console.log("result",result);
            // console.log("patch id",carId);
            res.send(result)
        })

        //delete a car
        app.delete("/cars/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await carsCollection.deleteOne(query);
            res.send(result);

        })
        //get the bookings
        app.get("/bookings", async (req, res) => {
            const email = req.query.userEmail

            if (email) {
                const cursor = bookingsCollection.find({ userEmail: email });
                const result = await cursor.toArray();
                return res.send(result);
            }

            const cursor = bookingsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })

        //post bookings
        app.post("/bookings", async (req, res) => {
            const newBooking = req.body;
            const id = req.body.carId;
            const query = { carId: id }
            const checkAvailability = await bookingsCollection.findOne(query)
            if (checkAvailability) {
                return res.status(400).send({ message: "already booked" });
            }
            else {
                const result = await bookingsCollection.insertOne(newBooking);
                res.send(result);
            }
            // console.log("details", newBooking);
        })

        //delete a booked car
        app.delete("/bookings/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await bookingsCollection.deleteOne(query);
            res.send(result);

        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged  successfully");
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