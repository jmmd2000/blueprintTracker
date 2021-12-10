var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var WeaponClassSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxLength: 100
    },
    game: {
        type: Schema.ObjectId,
        ref: 'game',
        required: true
    }
});

// Virtual for this gun instance URL.
WeaponClassSchema.virtual('url').get(function () {
    return '/tracker/weaponClass/' + this._id;
});

// Export model.
module.exports = mongoose.model('weaponClass', WeaponClassSchema);