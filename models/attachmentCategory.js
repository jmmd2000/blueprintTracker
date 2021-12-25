var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AttachmentCategorySchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  game: {
    type: Schema.ObjectId,
    ref: 'game',
    required: true
  },
  secondary: {
    type: Boolean,
    required: true
  },
  primary: {
    type: Boolean,
    required: true
  },
});

// Virtual for this author instance URL.
AttachmentCategorySchema.virtual('url').get(function () {
  return '/tracker/attachmentCategory/' + this._id;
});

// Export model.
module.exports = mongoose.model('Attachment Category', AttachmentCategorySchema);