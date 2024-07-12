const mongoose = require('mongoose');
require('dotenv').config();

//define the MongoDB connection URL
//replace mydatabase with this FypEvalSystem database name
// const mongoURL = 'mongodb://localhost:27017/FypEvalSystem' 
const mongoURL = process.env.DB_URL||DB_URL;
//set up the MongoDB connection
mongoose.connect(mongoURL,{
    useNewUrlParser:true
})

//get the default connection 
//Mongoose maintains a default connection object representing the MongoDb connection
const db = mongoose.connection;

//define event listener for database connection
db.on('connected',()=>{
    console.log('connnected to mongodb server');
});

db.on('error',(err)=>{
    console.log('MongoDB connection error', err);
});

db.on('disconnected',()=>{
    console.log('MongoDB disconnected');
});

//export the database connection
module.exports = db;