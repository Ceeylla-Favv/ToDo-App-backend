const mongoose = require ('mongoose');
const { Schema, model} = mongoose;
const userSchema = new Schema({
  email: { type: String },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Admin', 'User' ],
    default: 'User'
  },
},
  {timestamps: true
});

const userModel = model("User", userSchema)

module.exports = userModel;