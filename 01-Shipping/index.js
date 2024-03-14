const express = require('express');
const cors = require("cors");
const mongodb = require ('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

function authenticateWithJWT(req, res, next) {
  
  // 2nd mistake is, req.headers.authorization does not magically appear out from fantasy land
  // req.headers.authorization = JWTStore["access_token"];
  console.log(req.headers);
  const authHeader = req.headers.authorization;
  console.log("authheader here", authHeader)
  if (authHeader) {

      // 3rd mistake: authHeader.split(" ")[1];
      // JWT traditionally comes in the form of:
      // BEARER "actual hash of the token is here with a space after bearer"
      // .split takes each element separated by a empty space " " and put into an array and returns it
      // and thus ["BEARER", "JSONHASHBLAHBLAH"]
      // thus token = theArray[1] which is the 2nd position which is actual token

      const token = authHeader.split(" ")[1];
      // first argument: the token that I want to verify
      // second argument: the token secret
      // third argument: callback function
      jwt.verify(token, process.env.TOKEN_SECRET, function(err,payload){
          if (err) {
              res.status(400);
              return res.json({
                  'error': err
              })
          } else {
              // the JWT is valid, forward request to the route and store the payload in the request
              req.payload = payload;
              next();
          }
      })
  } else {
      res.status(400);
      res.json({
          'error':'Login required to access this route'
      })
  }
}

main();
 
app.post('/shippingproducts',authenticateWithJWT, async(req,res) => {
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

app.get('/shippingproducts',authenticateWithJWT, async (req, res) => {
  try {
    const allShippingItems = await db.collection('shipping_db').find({}).toArray();
    // console.log("Shipping Items in all fetch", allShippingItems)
    // res.json(allShippingItems);

    const tags = await db.collection('product_Type').find({}).toArray();
    
    // console.log ("all tags here", tags)

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
      // console.log("modified array here 1", modifiedArrayOfItems) 

    }
    // console.log("modified array here 2", modifiedArrayOfItems)
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


app.get('/shippingproducts', authenticateWithJWT, async (req, res) => {
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

app.get('/search/:name', async (req, res) => {
  try {
    console.log("Test");
    const name = req.params.name;
    console.log("Test");
    const searchProduct = await db.collection('shipping_db').findOne({name: name});


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

async function connect(uri, dbname) {

  // `connect` allows us to connect to the mongodb
  // useUnifiedTopology means we want use the latest
  // structure for Mongo
  const client = await MongoClient.connect(uri);
  let db = client.db(dbname);
  return db;
}

// A jwt is sometimes known as an 'access token' because it grants access
// to your services or protected routes
function generateAccessToken(id, email) {
  // the first arugment of `jwt.sign` is the payload that you want to store
  // the second argument of `jwt.sign` is the token secret
  // the third arugment is an option object
  return jwt.sign({
      'user_id': id,
      'email': email
  }, process.env.TOKEN_SECRET, {
      'expiresIn':'3d'  // w = weeks, d = days, h = hours, m = minutes, s = seconds
  });
}

// this is a middleware function that check if a valid JWT has been provided
// a middleware function has three arugments: req, res, next

// First mistake is he never store his JWToken anywhere, so when go to other route, it is GONEEEEEEEEEEEEEE....
// This is the wrong way to store JWT.
// let JWTStore = {};

// function authenticateWithJWT(req, res, next) {
  
//   // 2nd mistake is, req.headers.authorization does not magically appear out from fantasy land
//   // req.headers.authorization = JWTStore["access_token"];
//   console.log(req.headers);
//   const authHeader = req.headers.authorization;
//   console.log("authheader here", authHeader)
//   if (authHeader) {

//       // 3rd mistake: authHeader.split(" ")[1];
//       // JWT traditionally comes in the form of:
//       // BEARER "actual hash of the token is here with a space after bearer"
//       // .split takes each element separated by a empty space " " and put into an array and returns it
//       // and thus ["BEARER", "JSONHASHBLAHBLAH"]
//       // thus token = theArray[1] which is the 2nd position which is actual token

//       const token = authHeader.split(" ")[1];
//       // first argument: the token that I want to verify
//       // second argument: the token secret
//       // third argument: callback function
//       jwt.verify(token, process.env.TOKEN_SECRET, function(err,payload){
//           if (err) {
//               res.status(400);
//               return res.json({
//                   'error': err
//               })
//           } else {
//               // the JWT is valid, forward request to the route and store the payload in the request
//               req.payload = payload;
//               next();
//           }
//       })
//   } else {
//       res.status(400);
//       res.json({
//           'error':'Login required to access this route'
//       })
//   }


// }
app.post('/user', async function(req,res){

  // hashing with bcrypt is an async function
  // bcyrpt.hash takes two argument:
  // 1. the plaintext that you want to hash
  // 2. how secure you want it
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  console.log("hashp", hashedPassword)
  console.log("email", req.body.email)
  const result = await db.collection('users').insertOne({
      'email': req.body.email,
      'password': hashedPassword
  })
  res.json({
      'result': result
  })
})

// Allow user to log in by providing their email and password
app.post('/login', async function(req,res){
  // 1. Find the user by email address
  const user = await db.collection('users')
                  .findOne({
                      email: req.body.email
                  });

  
  // 2. Check if the password matches
  if (user && Object.keys(user).length !== 0) {
      // bcrypt.compare()
      // - first arugment is the plaintext
      // - second argument is the hashed version 
      if (await bcrypt.compare(req.body.password, user.password)) {
          // valid login - so generate the JWT
          const token = generateAccessToken(user._id, user.email);

          // JWTStore["access_token"] = token;

          res.json({
              'token': token
          })
      } else {
          res.status(400);
          res.json({
              'error':'Invalid login credentials'
          })
      }
  } else {
      res.status(400);
      return res.json({
          'error':'Invalid login credentials'
      })
  }

  // 3. Generate and send back the JWT (aka access token)
});

// Protected route: client must provide the JWT to access
app.get('/profile', authenticateWithJWT, async function(req,res){
 
  res.json({
      'message':'success in accessing protected route',
      'payload': req.payload
  })
})

app.get('/payment', authenticateWithJWT, async function(req,res){
  res.json({
      'message':"accessing protected payment route"
  })
})
  


