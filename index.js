const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middle wares

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tym1q1j.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('tourServices').collection('services');
        const orderCollection = client.db("tourServices").collection('reviews');
        const addServiceCollection = client.db("tourSrvices").collection('addservice');

        app.get('/services', async (req, res) => {
            const query = {};
            const limit = 3;
            if (req?.query?.limit === 'all') {
                const services = await serviceCollection.find(query).toArray();
                res.send(services)
            }
            else {
                const services = await serviceCollection.find(query).limit(limit).skip(0).toArray();
                res.send(services)
            }
        })


        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //reviews api 

        app.get('/reviews', async (req, res) => {

            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = orderCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


        // reviews post 
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await orderCollection.insertOne(review);
            res.send(result);
        })

        // Add Service post 
        app.post('/addservice', async (req, res) => {
            const addservice = req.body;
            const result = await serviceCollection.insertOne(addservice);
            res.send(result)
        })

        // update

        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const review = req.body;
            const option = { upsert: true };
            const updateMessege = {
                $set: review
            }
            const result = await orderCollection.updateOne(filter, updateMessege, option);
            res.send(result);
        })
        // delete 

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(err => console.error(err))





app.get('/', (req, res) => {
    res.send('service review server running');
})
app.listen(port, () => {
    console.log(`service review server running ont the ${port}`)
})
