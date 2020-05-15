let bcrypt = require('bcryptjs')
let mongoose = require('mongoose')




//Create user schema
let userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: String,
  email: {
    type: String,
  required: true,
  unique: true,
  minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  pic: String,
  admin: {
    type: Boolean,
    default: false
  }
})

// hash the pwords
userSchema.pre('save', function(done) {
  // make sure it's
  if(this.isNew) {
     this.password = bcrypt.hashSync(this.password, 12)
  }
   // Tell it we are okay to move on by calling call back
   done()
})
// make a JSON representation of the user for sending ont the JWT payload
userSchema.set('toJSON', {
  transform: (doc, user) => {
    delete user.password
    delete user.__v
    // return()
  }
})

// make a function that compares pwords
userSchema.methods.validPassword = function(typedPassword){
  //typed password: plain text just typed by user
  // this.password: Existing password
  return bcrypt.compareSync(typedPassword, this.password)
}
// Export user model
module.exports = mongoose.model('User', userSchema)
