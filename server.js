const express = require('express'); // allows hosting of API
const bodyParser = require('body-parser'); //middleware that parses body of incoming HTTP requests eg JSON/form data into a usable format
const bcrypt = require('bcrypt-nodejs'); //encrypt and decrypt data
const cors = require('cors'); // safe comm. cross-domain (FE React App talking to this BE API)
const knex = require('knex'); // SQL query builder that lets me write db queries in JS instead of raw SQL
require('dotenv').config() // loads env. variables so we don't hardcode secrets

// these files each contain the business logic for specific routes
const register = require('./controllers/register'); 
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

// connects to postgreSQL DB using knex, uses env. variables for the connection and ensures secure SSL comm.
const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
});

const app = express(); // initialize the API server - our API backbone.

app.use(cors()); // allows cross-domain requests
app.use(bodyParser.json()); // lets server understand JSON request bodies

app.get('/', (req, res) => { res.send('Smart Brain API running'); }); // Root route - to confirm the API is alive
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) }); // Sign-in route - checks user credentials against DB
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) }); // Register route - adds a new user into DB w/ encrypted PW
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) }); // Profile route. (:id) is a variable passed in the url, only appears in get requests.
app.post('/faceDetection', (req, res) => { image.handleFaceDetection(req, res) }); // fwds image URL to Clarifai API for face detection
app.put("/score", (req, res) => image.handleScore(req, res, db)); // Update rank after successful face detection

// Start server - runs server on port defined in env. variables, and logs a msg when ready
app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`)})
