const express = require('express');
const Router = express.Router();
const { getDb } = require('../db');
const jwt = require('jsonwebtoken');
const { Collection } = require('mongodb');
const multer=require('multer');

require('dotenv').config();
const SecretKey = process.env.SECURITY_KEY;

const verifyToken = (token) => {
    try {
        console.log(SecretKey)
        console.log(token)
        return jwt.verify(token, SecretKey);
    } catch (error) {
        if (error.name === 'JsonWebTokenError') throw new Error('Invalid Token');
        if (error.name === 'TokenExpiredError') throw new Error('Token Expired');
        throw new Error('Internal Server Error');
    }
};

Router.post('/getAlumni', async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(400).json({ 'error': 'Token Not Found !!!' });

        verifyToken(token);

        const { PassedYear, Department, State, Package } = req.body;
        const userCollection = getDb('profiles');
        const users = await userCollection.find({ PassedYear, Department, State, Package }).toArray();
        if (users.length === 0) return res.status(400).send("User Not found !!!");
        return res.status(200).json(users);
    } catch (error) {
        console.error(error.message);
        if (error.message === 'Invalid Token' || error.message === 'Token Expired') {
            return res.status(401).send(error.message);
        }
        return res.status(500).send("Internal Server Error !!!");
    }
});

Router.post('/addOne', async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) return res.status(400).json({ 'error': 'Token Not Found !!!' });

        verifyToken(token);

        const { jobTitle, description, jobType, postedAt,Location, requirement,companyName} = req.body;
        const document = { jobTitle, description, jobType, postedAt,Location, requirement,companyName};
        const userCollection = getDb('request_postings');
        const result = await userCollection.insertOne(document);
        if (result.acknowledged) {
            return res.status(201).json({
                'message': 'Post added successfully',
                postId: result.insertedId
            });
        }
        return res.status(500).send('Failed to add post');
    } catch (error) {
        console.error(error.message);
        if (error.message === 'Invalid Token' || error.message === 'Token Expired') {
            return res.status(401).send(error.message);
        }
        return res.status(500).send("Internal Server Error");
    }
});

Router.get('/fetchPost', async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        console.log(token);
        if (!token) return res.status(400).json({ 'error': 'Token Not Found !!!' });

        verifyToken(token);

        const userCollection = getDb('postings');
        const posts = await userCollection.find().toArray();
        if (posts.length === 0) return res.status(404).send("No posts found");
        return res.status(200).json(posts);
    } catch (error) {
        console.error(error.message);
        if (error.message === 'Invalid Token' || error.message === 'Token Expired') {
            return res.status(401).send(error.message);
        }
        return res.status(500).send("Internal Server Error");
    }
});

Router.post('/donate', async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        console.log(token);
        if (!token) return res.status(400).json({ 'error': 'Token Not Found !!!' });

        verifyToken(token);

        const { name, email } = req.body;
        const document = { name, email };
        const userCollection = getDb('donators');
        const result = await userCollection.insertOne(document);
        if (result.acknowledged) {
            return res.status(200).json({ 'message': 'Document Inserted For Donator Successfully !!!' });
        }
        return res.status(500).json({ 'message': 'Failed To Insert Document For Donator' });
    } catch (error) {
        console.error(error.message);
        if (error.message === 'Invalid Token' || error.message === 'Token Expired') {
            return res.status(401).send(error.message);
        }
        return res.status(500).send("Internal Server Error");
    }
});

Router.get('/events', async (req, res) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        console.log(token);
        if (!token) return res.status(400).json({ 'error': 'Token Not Found !!!' });

        verifyToken(token);

        const userCollection = getDb('request_events');
        const currentDate = new Date();
        const events = await userCollection.find(
            {eventDate:{$gte:currentDate}}
        ).toArray();
       
        return res.status(200).json(events);
    } catch (error) {
        console.error(error.message);
        if (error.message === 'Invalid Token' || error.message === 'Token Expired') {
            return res.status(401).send(error.message);
        }
        return res.status(500).json({ 'error': 'Internal Server Error !!!' });
    }
});

Router.get('/success',async (req,res)=>{
   try {
    const token =req.headers['authorization']?.split(' ')[1];
    if(!token) res.status(400).json({msg:'Token Not Found !!! '});
    verifyToken(token);

    const colllection=getDb('stories');
    const stories=await colllection.find().toArray();
    res.status(200).send(stories);
   } catch (error) {
    console.log(error);
    return res.status(500).json({error : 'Internal Server Error !!! '});
   }
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
  
  const upload = multer({ storage: storage });

Router.post('/addStory', upload.single('image') ,async (req,res)=>{
     try{
        const token=req.headers['authorization']?.split(' ')[1];
        if(!token) res.status(400).json({msg:'Token Not Found !!! '});
        verifyToken(token);
        const {name, description}=req.body;
        const image = req.file;
        const collection=getDb('request_stories');  
        await collection.insertOne({
            name,
            description,
            imagePath: image.path,  
            imageOriginalName: image.originalname,  
            createdAt: new Date()
          }); 
          
          res.status(200).json({ msg: 'Story added successfully!' });

     }
     catch(err){
        res.status(500).json({ msg: 'Error adding story', error: err.message });
     }
})


Router.get('/verifyToken',async(req,res)=>{
    const token=req.headers['authorization'].split(' ')[1];
    res.status(401).json({ error: 'Invalid Token' });

   verifyToken(token);
   res.status(200).json({'message':'Succesfull Token Verification !!!'})
})

module.exports = Router;
