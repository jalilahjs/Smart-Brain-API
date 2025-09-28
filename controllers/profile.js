const handleProfileGet = (req, res, db) => {
  const { id } = req.params;  // get from param not from body because it is passed in the URL 
  db.select('*').from('users').where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json('not found');
      }
    })
    .catch(err => res.status(400).json('error getting user'));
};

module.exports = {
  handleProfileGet
};
