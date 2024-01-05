const mongoose = require('mongoose')

const { Schema, model } = mongoose

const userSchema = new Schema({
    image:String,
})

const User = model('User', userSchema)
module.exports = User