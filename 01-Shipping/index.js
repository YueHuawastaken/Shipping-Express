const express = require('express');
const cors = require("cors");
const mongodb = require ('mongodb');
require ('dotenv').config();

const MongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;

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

let db;

async function main() {
  try {
    db = await connectToMongoDB();
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
 
app.post('/shippingproducts', async(req,res) => {
  try {

      console.log("route hit")
      const db = await connectToMongoDB();

      // look at ur req.body and each destructured variable

      const {name, value, product_type} = req.body;
      console.log("Items here", req.body);
    
    // Validation
    if (!name || !value || !product_type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // next line console log
    const newProduct = {name, value, product_type};
    const result = await db.collection('shipping_db').insertOne(newProduct);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error adding new product', error: error.message });
  }
})

app.get('/shippingproducts', async (req, res) => {
  try {
    const allShippingItems = await db.collection('shipping_db').find({}).toArray();
    console.log("Shipping Items in all fetch", allShippingItems)
    // res.json(allShippingItems);

    const tags = await db.collection('product_Type').find({}).toArray();
    
    console.log ("all tags here", tags)

    //for loop
    //then do a matching with product type id
    // then each massage
    //then push to empty array
    
    // Method 1
    // for (let item of allShippingItems){
    // }

    let modifiedArrayOfItems = [];
    for (let i = 0; i < allShippingItems.length; i++) {
      
      let itemToCompare = allShippingItems[i];
      
      const modifiedItem = {}
      modifiedItem["_id"] = itemToCompare._id;
      modifiedItem["name"] = itemToCompare.name;
      modifiedItem["value"] = itemToCompare.value;
      
      let productTypeId = itemToCompare.product_type;

      for (let tag of tags){
        if (productTypeId == tag._id){
          modifiedItem["tag"] = tag.type;
        }
      }
      modifiedArrayOfItems.push(modifiedItem);
      console.log("modified array here 1", modifiedArrayOfItems) 

    }
    console.log("modified array here 2", modifiedArrayOfItems)
    let jsonString = JSON.stringify(modifiedArrayOfItems);
    res.json(jsonString)
  
  //     if (allShippingItems && tags) {

  //       let responseOutput = {
  //         _id: searchProduct._id,
  //         name: searchProduct.name,
  //         value: searchProduct.value,
  //         product_type: tags.type
  //       }
  //       res.json(responseOutput);
  //     } else {
  //       res.status(404).json({ message: 'Product not found' });
  //     }
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error fetching product', error: error.message });
  //   }
  // }); 
    

    // if (allShippingItems && tags) {

    //   let responseOutput = {
    //     _id: searchProduct._id,
    //     name: searchProduct.name,
    //     value: searchProduct.value,
    //     product_type: tags.type
    //   }
    //   res.json(responseOutput);
    // } else {
    //   res.status(404).json({ message: 'Product not found' });
    // }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// Get a single recipe by ID
app.get('/shippingproducts/:id', async (req, res) => {
  try {
    const id = new ObjectId (req.params.id);
    const searchProduct = await db.collection('shipping_db').findOne({_id: id});


    console.log("search product here", searchProduct)

    const tags = await db.collection('product_Type').findOne({_id: searchProduct.product_type});

    console.log ("tags", tags)


    if (searchProduct && tags) {

      let responseOutput = {
        _id: searchProduct._id,
        name: searchProduct.name,
        value: searchProduct.value,
        product_type: tags.type
      }
      res.json(responseOutput);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
})

app.get('/shippingproducts', async (req, res) => {
  try {
      // Fetching all recipes
    const allShippingItems = await db.collection('shipping_db').find({}).toArray();
const tags = await db.collection('product_Type').find({}).toArray();
const tagMap = {};

    // Creating tag map using for loop
  for (let i = 0; i < tags.length; i++) {
    const tag = tags[i];
    tagMap[tag._id] = tag.name;
  }

    // Replacing tag IDs with tag names in recipes using for loops
    for (let shipping_db of shippingproducts) {
      // ensure that recipe.tags is an array
      if (Array.isArray(shipping_db.tags)) {
        for (let k = 0; k < shipping_db.tags.length; k++) {
          const tagId = shipping_db.tags[k];
          // if the tag id exists, 
          if (tagMap[tagId]) {
            // replace the existing tag with the one from the tags map
            shipping_db.tags[k] = tagMap[tagId];
          }
        }
      }
    }

    res.json(shipping_db);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
});

app.put('/shippingproducts/:id', async (req, res) => {
  try {
    const id = new ObjectId(req.params.id);
    const {name, value, product_type} = req.body;

    // Validation
    if (!name || !value || !product_type === 0) {
      return res.status(400).json({ message: 'Name and Value are required, and Value should be a non-empty array.' });
    }

    // Additional validation can be added as necessary

    const updateData = {name, value, product_type};
    const result = await db.collection('shipping_db').updateOne(
      {_id: id},
      {$set: updateData}
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: 'No product found with this ID, or no new data provided' });
    }

    res.json({message: 'Product updated successfully'});
  } catch (error) {
    res.status(500).json({message: 'Error updating product', error: error.message});
  }
});

app.delete('/shippingproducts/:id', async function(req,res){
  await db.collection('shipping_db').deleteOne({
      '_id': new ObjectId(req.params.id)
  });

  res.json({
      'message':"Deleted"
  })
})




