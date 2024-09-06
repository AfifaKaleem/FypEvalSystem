// controllers/evaluatorController.js
const Evaluator = require('./../models/Evaluator');
const Student = require('./../models/Student');

// Create Evaluator
module.exports.addEvaluator = async (req, res) => {
    try {
        const { username, email, office } = req.body;
        const newEvaluator = new Evaluator({ username, email, office });
        const response = await newEvaluator.save();
        console.log('Evaluator data saved');
        res.status(200).json({ message: "Evaluator data is added successfully", response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get Evaluators
module.exports.getEvaluators = async (req, res) => {
    try {
        const data = await Evaluator.find().select('email username office');
        console.log('Evaluator data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Evaluator
module.exports.updateEvaluator = async (req, res) => {
    try {
        const evaluatorId = req.params.id;
        const updatedEvaluatorData = req.body;

        const response = await Evaluator.findByIdAndUpdate(evaluatorId, updatedEvaluatorData, {
            new: true, // Return the updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }

        console.log('Evaluator data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete Evaluator
module.exports.deleteEvaluator = async (req, res) => {
    try {
        const evaluatorId = req.params.id;

        const response = await Evaluator.findByIdAndDelete(evaluatorId);

        if (!response) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }

        console.log('Evaluator data deleted');
        res.status(200).json({ message: 'Evaluator deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//assign evaluator to students
module.exports.assignEvaluator = async (req, res) => {
    try {
        const { studentId, evaluatorId } = req.body;

        // Find the evaluator and student
        const evaluator = await Evaluator.findById(evaluatorId);
        const student = await Student.findById(studentId);

        if (!evaluator || !student) {
            return res.status(404).json({ message: 'Evaluator or Student not found' });
        }

        // Check if the evaluator already has 8 students
        if (evaluator.students.length >= 8) {
            return res.status(400).json({ message: 'Evaluator already has 8 students assigned' });
        }

        // Assign the evaluator to the student
        student.evaluator = evaluatorId;
        await student.save();

        // Add the student to the evaluator's list
        evaluator.students.push(studentId);
        await evaluator.save();

        res.status(200).json({ message: 'Evaluator assigned to student successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};


module.exports.getSpecificEvaluatorAlongStudents = async (req, res) => {
    try {
      const evaluator = await Evaluator.findById(req.params.id).populate('email username');
      if (!evaluator) {
        return res.status(404).send({ error: 'Evaluator not found' });
      }
      const students = await Student.find({ evaluator: req.params.id }).populate('email username');
      res.json({ evaluator, students });
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ error: 'Internal server error' });
    }
  }