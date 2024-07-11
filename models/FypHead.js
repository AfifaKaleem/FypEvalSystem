const mongoose = require('mongoose');


const FypHeadSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    supervisors: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Supervisor',
        },
      ],

});

// Create models


const FypHead = mongoose.model('FypHead', FypHeadSchema);

// Export models
module.exports = FypHead
