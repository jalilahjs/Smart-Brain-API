const fetch = require("node-fetch"); // CommonJS

// Handle Clarifai API call
const handleApiCall = (req, res) => {
  const PAT = process.env.CLARIFAI_PAT;
  const USER_ID = "clarifai"; // replace if needed
  const APP_ID = "main";      // replace if needed
  const MODEL_ID = "face-detection";
  const MODEL_VERSION_ID = "6dc7e46bc9124c5c8824be4822abe105";

  const { input } = req.body;

  const raw = JSON.stringify({
    user_app_id: { user_id: USER_ID, app_id: APP_ID },
    inputs: [{ data: { image: { url: input } } }],
  });

  fetch(
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
    .then((response) => response.json())
    .then((data) => res.json(data))
    .catch(() => res.status(400).json("unable to work with API"));
};

// Handle updating user entries (increment by number of faces detected)
const handleImage = (req, res, db) => {
  const { id, faces } = req.body;

  db("users")
    .where("id", "=", id)
    .increment("entries", faces || 1) // default 1 if faces not provided
    .returning("entries")
    .then((entries) => res.json(entries[0].entries))
    .catch(() => res.status(400).json("unable to get entries"));
};

module.exports = { handleApiCall, handleImage };
