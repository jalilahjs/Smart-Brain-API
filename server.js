const express = require('express'); // allows hosting of API
const bodyParser = require('body-parser'); //middleware that parses body of incoming HTTP requests eg JSON/form data 
const bcrypt = require('bcrypt-nodejs'); //encrypt and decrypt data
const cors = require('cors'); // browser feature that controls cross-domain requests between web pages and servers
const knex = require('knex'); // SQL query builder that lets me write db quesries in JS instead of raw SQL
require('dotenv').config()

const register = require('./controllers/register'); 
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const db = knex({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true
  }
});

const app = express(); // initialize the server

app.use(cors()); 
app.use(bodyParser.json());

app.get('/', (req, res) => { res.send('Smart Brain API running'); }); // Root route
app.post('/signin', (req, res) => { signin.handleSignin(req, res, db, bcrypt) }); // Sign-in route
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) }); // Register route
app.get('/profile/:id', (req, res) => { profile.handleProfileGet(req, res, db) }); // Profile route. (:id) is a variable passed in the url, only appears in get requests.
app.post('/imageurl', (req, res) => { image.handleApiCall(req, res) }); // Clarifai API call
app.put("/image", (req, res) => image.handleImage(req, res, db)); // Update rank

// Start server
app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`)})
