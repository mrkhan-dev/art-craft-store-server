const express = require("express");
const cors = require("cors");
require("dotenv").config();
const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aeb0oh8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    // const craftCollection = client.db("craftStoreDB").collection("craftStore");

    const db = client.db("craftStoreDB");
    const craftCollection = db.collection("craftStore");
    const manualCollection = db.collection("manuallyInserted");

    // get data to my craft list

    // create data
    app.post("/added_craft", async (req, res) => {
      const newItem = req.body;
      // console.log(newItem);
      const result = await craftCollection.insertOne(newItem);
      res.send(result);
    });

    // get all data
    app.get("/allData", async (req, res) => {
      const cursor = craftCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get data to my craft list with email
    app.get("/myCraft/:email", async (req, res) => {
      // console.log(req.params.email);
      const result = await craftCollection
        .find({email: req.params.email})
        .toArray();
      res.send(result);
    });

    // get data by category
    app.get("/craftCategory/:category", async (req, res) => {
      const result = await manualCollection
        .find({category: req.params.category})
        .toArray();
      res.send(result);
    });

    app.get("/allCategory", async (req, res) => {
      const cursor = manualCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // get single data using id
    app.get("/singleItem/:id", async (req, res) => {
      const result = await craftCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // update data
    app.put("/updateCraft/:id", async (req, res) => {
      console.log(req.params.id);
      const query = {_id: new ObjectId(req.params.id)};
      const updateCraft = req.body;
      const craft = {
        $set: {
          name: updateCraft.name,
          category: updateCraft.category,
          price: updateCraft.price,
          customization: updateCraft.customization,
          stockStatus: updateCraft.stockStatus,
          image: updateCraft.image,
          rating: updateCraft.rating,
          processingTime: updateCraft.processingTime,
          description: updateCraft.description,
        },
      };
      const result = await craftCollection.updateOne(query, craft);
      console.log(result);
      res.send(result);
    });

    // delete data
    app.delete("/deleteItem/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await craftCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ping: 1});
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// test
app.get("/", (req, res) => {
  res.send("my art & craft server is running");
});

app.listen(port, () => {
  console.log(`server running on port: ${port}`);
});
