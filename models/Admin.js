const mongoose = require('mongoose');


const AdminSchema = new mongoose.Schema({
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


const Admin = mongoose.model('Admin', AdminSchema);

// Export models
module.exports = Admin;
