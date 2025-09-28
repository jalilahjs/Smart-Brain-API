const handleSignin = (req, res, db, bcrypt) => {
  const { email, password } = req.body;

  if (!email || !password) { // return 400 if email/password are empty
    return res.status(400).json('incorrect form submission');
  }

  // Look for user in database
  db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      if (data.length) {
        const isValid = bcrypt.compareSync(password, data[0].hash); //compare password from the browser to db hash
        if (isValid) {
          return db.select('*').from('users')
            .where('email', '=', email)
            .then(user => {
              res.json(user[0]); // send back user object for frontend
            })
            .catch(err => res.status(400).json('unable to get user'));
        } else {
          res.status(400).json('wrong credentials');
        }
      } else {
        res.status(400).json('wrong credentials');
      }
    })
    .catch(err => res.status(400).json('unable to signin'));
};

module.exports = {
  handleSignin
};
