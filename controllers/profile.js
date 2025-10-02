const handleProfileGet = (req, res, db) => {
  const { id } = req.params;  // get from param not from body because it is passed in the URL 
  db.select('*').from('users').where({ id }) // looks into the users table to find user with matching ID
    .then(user => { // if user is found, return first user object as JSON, if no user exists, return 400
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('not found');
      }
    })
    .catch(err => res.status(400).json('error getting user')); // if DB query fails, send back an error
};

// makes function available to main server fail, so /profile/:id route can use it.
module.exports = {
  handleProfileGet
};
