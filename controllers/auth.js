require('dotenv').config()
let db = require('../models')
let router = require('express').Router()
let jwt = require('jsonwebtoken')


// POST /auth/login (find and validate user; send token)
router.post('/login', (req, res) => {
  console.log(req.body)
  //Look up the user by email
  db.User.findOne({ email: req.body.email })
  .then(user => {
    // Check whether the user exists
    if(!user) {
      // They dont have an account , send error message
      return res.status(404).send({ message: 'User not found'})
    }
    //They exist - but make sure the password is correct
    if(!user.validPassword(req.body.password)) {
      // Incorrect password, send an error back
      return res.status(401).send({ message: 'Invalid login credentials'})
    }
    //We have a good user we gotta make them a new token and send it to em
    let token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
      expiresIn: 60 * 60 * 8 // 8 hours in seconds login token period
    })
    res.send({ token })
  s})
  .catch(err => {
    console.log('error in POST /auth/login', err)
    res.status(503).send({message: 'server-side or DB error'})
  })
})

// POST to /auth/signup (create user; generate token)
router.post('/signup', (req, res) => {
  console.log(req.body)
  // Look up the user mayne by email to make sure they are actually new
  db.User.findOne({email: req.body.email })
  .then(user=> {
    // If user already exists dont let them create another account
    if (user){
      //No no! signup instead
      return res.status(409).send({ message: 'Email address in use'})
    }

    // we know the user is new and legit! CReate them
    db.User.create(req.body)
    .then(newUser => {
      //YAYA things worked and users exist now create a token for em
      let token = jwt.sign(newUser.toJSON(), process.env.JWT_SECRET,{
        expiresIn:120 // 60 * 60 * 8 // 8 hours in seconds
      })
      res.send({ token })
    })
    .catch(innerErr => {
      console.log('Error creating user', innerErr);
      if(innerErr.name === "validationError"){
        res.status(412).send({message: `validation Error ${innerErr.message}`})
      }
      else{
        res.status(500).send({message: 'Error creating user'})
      }
    })
  })
  .catch(err => {
    console.log('ERROR IN YA POST AUTH SIGNUP', err)
    res.status(503).send({message: 'Database or Server errors' })
  })
})


module.exports = router
