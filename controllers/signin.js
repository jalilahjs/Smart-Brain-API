// handle user logiin by verifying email + PW
const handleSignin = (req, res, db, bcrypt) => {
  const { email, password } = req.body; // reads email + PW from login form

  // validate form submission
  if (!email || !password) { // return 400 if email/password are empty
    return res.status(400).json({ error: "Please enter both email and password"});
  }

  // Looks up stored hash for that email in the login table
  db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      if (data.length) {
        const isValid = bcrypt.compareSync(password, data[0].hash); //compare password from the browser to db hash
        if (isValid) {
          return db.select('*').from('users') // if valid, retrieves full user profile from users table and return it
            .where('email', '=', email)
            .then(user => {
              res.json(user[0]); // send back user object for frontend
            })
            .catch(err => {
              console.error("Signin user fetch error:", err); // log detailed error
              res.status(500).json({ error: "Unable to fetch user data. Please try again later." }); // structured server error
            });
        } else {
          res.status(400).json({ error: "Incorrect password" }); // distinguish wrong password
        }
      } else {
        res.status(400).json({ error: "Email not found" }); // distinguish email not found
      }
    })
    .catch(err => {
      console.error("Signin error:", err); // log DB error
      res.status(500).json({ error: "Database error during signin. Please try again later." }); // structured server error
    });
};

// makes this function available to server's signin route
module.exports = {
  handleSignin
};
