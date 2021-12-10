var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var gameSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxLength: 100
    }
});

// Virtual for this gun instance URL.
gameSchema.virtual('url').get(function () {
    return 'game/' + this._id;
});

// Export model.
module.exports = mongoose.model('game', gameSchema);