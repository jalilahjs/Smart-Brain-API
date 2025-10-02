// this function registers a new user into the system
const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body; // reads user's email, name, PW from FE
  if (!email || !name || !password) { // if any field is missing, reject request. ensures data completeness before inserting into DB
    return res.status(400).json({ error: "Please fill in all the fields" });
  }

  const hash = bcrypt.hashSync(password); // converts plain password into a secure, irreversible hash to prevent storing sensitive data in plain text

  db.transaction(trx => { // uses trx so either both inserts succeed or none, prevents inconsistent data if something fails midway
    trx.insert({ // step 1: stores hashed PW and email in login table, returns the email for next step
      hash: hash,
      email: email
    })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users') // step 2: stores actual user profile (name, email, date joined), returns the full new user object
          .returning('*')
          .insert({
            name: name,
            email: loginEmail[0].email,
            joined: new Date()
          })
          .then(user => { // returns newly created user to FE (minus PW)
            res.json(user[0]);
          });
      })
      .then(trx.commit) // commit if everything succeeds
      .catch(trx.rollback); // undo changes if something fails
  })
    .catch(err => { // if an error happens, it will show the below msges;
      console.error(err); // log error for debugging
      if (err.code === "23505") { // duplicate email error in Postgres
        res.status(400).json({ error: "Email already exists" });
      } else {
        res.status(500).json({ error: "Database error during registration. Please try again later." });
      }
    });
};

// makes the function available to server's /register
module.exports = {
  handleRegister
};
