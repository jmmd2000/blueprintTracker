var mongoose = require("mongoose");
var Att = require("../models/attachment");

var Schema = mongoose.Schema;

var BlueprintSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    required: false,
    maxLength: 500,
  },
  weaponBase: {
    title: {
      type: String
    },
    type: Schema.ObjectId,
    ref: "Gun",
    required: true,
  },
  weaponClass: {
    title: {
      type: String
    },
    type: Schema.ObjectId,
    ref: 'weaponClass',
    required: true
  },
  attachments: [{
    title: {
      type: String
    },
    type: Schema.ObjectId,
    ref: 'Attachment'
  }],
});

// Virtual for this gun instance URL.
BlueprintSchema.virtual("url").get(function () {
  return "/tracker/blueprints/" + this._id;
});

// Export model.
module.exports = mongoose.model("Blueprint", BlueprintSchema);
