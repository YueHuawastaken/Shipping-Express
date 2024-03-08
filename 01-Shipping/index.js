const express = require('express');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/', (req, res) => {
    res.send('Hello, world!');
  });

  const { connectToMongoDB } = require('./db');
  
  async function main() {
    try {
      const db = await connectToMongoDB();
      console.log('Connected to MongoDB');
  
      // Add your route code here
        app.get("/", function(req, res) {
        // you may use the `db` object to connect MongoDB
            }
        )
    } catch (error) {
      console.error('Error connecting to MongoDB', error);
    }
  }
  
  main();
  

  
  app.post('/shippingproducts', async (req, res) => {
    try {

        const db = await connectToMongoDB();

      const { _id, name, value, Product_Type} = req.body;
        console.log("body here", req.body);
      
      // Validation
      if (!_id || !name || !value || !Product_Type) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      const newProduct = { _id, name, value, Product_Type };
      const result = await db.collection('shipping_db').insertOne(newProduct);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error adding new recipe', error: error.message });
    }
  });