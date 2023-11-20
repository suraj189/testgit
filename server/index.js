const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');
const User = require('./models/User');
const cookiesParser = require('cookie-parser')
require('dotenv').config();


//test commit 2
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000',
}));


//test commit 3
app.use(express.json());
app.use(cookiesParser())


//test commit 4
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.get('/test', (req, res) => {
    console.log('test');
    res.json('test ok');
});

app.post('/register', async (req, res) => {
    const { name, email, password } = req.body.formData;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required fields' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
       await User.create({
            name,
            email,
            password: hashedPassword,
        });
        res.status(200).json({message:'user created succesfully'});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
});

app.post('/login', async (req,res) => {
    mongoose.connect(process.env.MONGO_URL);
    const {email,password} = req.body;
    const userDoc = await User.findOne({email});
    if (userDoc) {
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
        jwt.sign({
          email:userDoc.email,
          id:userDoc._id
        }, jwtSecret, {}, (err,token) => {
          if (err) throw err;
          res.cookie('token', token).json(userDoc);
        });
      } else {
        res.status(422).json('pass not ok');
      }
    } else {
      res.json('not found');
    }
  });
  
  app.get('/profile', (req,res) => {
    // mongoose.connect(process.env.MONGO_URL);
    const {token} = req.cookies;
    console.log(token)
    if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) throw err;
        const {name,email,_id} = await User.findById(userData.id);
        res.json({name,email,_id});
      });
    } else {
      res.json(null);
    }
  });

const port = 5000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
