var mongoose = require('mongoose');
var Att = require('../models/attachmentCategory');

var Schema = mongoose.Schema;

var AttachmentSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  attachmentCategory: [{
    title: {
      type: String
    },
    type: Schema.ObjectId,
    ref: 'Attachment Category',
    required: true
  }],
});

// Virtual for this author instance URL.
AttachmentSchema.virtual('url').get(function () {
  return '/tracker/attachments/' + this._id;
});

// Export model.
module.exports = mongoose.model('Attachment', AttachmentSchema);