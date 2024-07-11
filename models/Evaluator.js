const mongoose = require('mongoose');
const EvaluatorSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const Evaluator = mongoose.model('Evaluator', EvaluatorSchema);
// Export models
module.exports = Evaluator;