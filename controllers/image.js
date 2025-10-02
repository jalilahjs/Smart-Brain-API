const fetch = require("node-fetch"); // lets BE make HTTP requests, but for Node.js
require('dotenv').config() // loads sensitive info (API keys, user IDs, etc.) from .env file into process.env

// Function is triggered when FE sends an image URL for face detection. 
// Loads Clarifai credentials from .env
// Uses Clarifai face-detection model to process images
const handleFaceDetection = (req, res) => { 
  const PAT = process.env.CLARIFAI_PAT; // API key
  const USER_ID = process.env.CLARIFAI_USER_ID;
  const APP_ID = process.env.CLARIFAI_APP_ID;
  const MODEL_ID = "face-detection";
  const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";

  const { input } = req.body; // gets image URL from request body, formats it in JSON so Clarifai understands it
  console.log('input', input)
  const raw = JSON.stringify({
    user_app_id: { user_id: USER_ID, app_id: APP_ID },
    inputs: [{ data: { image: { url: input } } }],
  });

  fetch( // sends POST request to Clarifai API with image URL, includes API key for authentication
    `https://api.clarifai.com/v2/models/${MODEL_ID}/versions/${MODEL_VERSION_ID}/outputs`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Key " + PAT,
      },
      body: raw,
    }
  )
    .then((response) => response.json()) // if Clarifai eturns face regions, extract bounding box coordinates (where faces are in picture)
    .then((data) => {
      if (data.outputs && data.outputs[0].data.regions) {
        const regions = data.outputs[0].data.regions.map(
          (region) => region.region_info.bounding_box
        );
        console.log('regions', regions)
        res.json({ faces: regions });
      } else {
        res.status(400).json("no faces detected");
      }
    })
    .catch((err) => { // handles network/API errors gracefully
      console.error(err);
      res.status(400).json("unable to work with API");
    });
};

// Updates user's score in DB/how many images they've submitted
const handleScore = (req, res, db) => {
  const { id, faces } = req.body; // takes ID and how many faces detected

  // increments user's entries count in users table.
  // if multiple faces are detected, it increments by that number, otherwise defaults to 1.
  // returns the updates total.
  db("users")
    .where("id", "=", id)
    .increment("entries", faces || 1) // default 1 if faces not provided
    .returning("entries")
    .then((entries) => res.json(entries[0].entries))
    .catch(() => res.status(400).json("unable to get entries"));
};

// makes both functions available for use in BE server.
// handleFaceDetection talks to Clarifai API, detects faces in images and returns bounding boxes.
// handleScore updates the user's score in DB based on how many faces were detected.
module.exports = { handleFaceDetection, handleScore };
