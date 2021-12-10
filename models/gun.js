var mongoose = require('mongoose');
var Att = require("../models/attachment");

var Schema = mongoose.Schema;

var GunSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  description: {
    type: String,
    required: true,
    maxLength: 500
  },
  weaponClass: {
    title: {
      type: String
    },
    type: Schema.ObjectId,
    ref: 'weaponClass',
    required: true
  },
  image: {
    type: String,
    required: true,
    maxLength: 500
  },
  compatible: [{
    title: {
      type: String
    },
    type: Schema.ObjectId,
    ref: 'Attachment',
    required: false
  }],


});

// Virtual for this gun instance URL.
GunSchema.virtual('url').get(function () {
  return '/tracker/guns/' + this._id;
});

// Export model.
module.exports = mongoose.model('Gun', GunSchema);