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



module.exports.assignEvaluator = async (req, res) => {
    try {
        const { studentEmailOne, studentEmailTwo, evaluatorEmailOne, evaluatorEmailTwo } = req.body;

        // Find the evaluators and students by email
        const evaluator1 = await Evaluator.findOne({ email: evaluatorEmailOne });
        const evaluator2 = await Evaluator.findOne({ email: evaluatorEmailTwo });
        const student1 = await Student.findOne({ email: studentEmailOne });
        const student2 = await Student.findOne({ email: studentEmailTwo });

        if (!evaluator1 || !evaluator2 || !student1 || !student2) {
            return res.status(404).json({ message: 'One or more Evaluators or Students not found' });
        }

        // Check if evaluators already have 8 students
        if (evaluator1.student1.length >= 8 || evaluator2.student2.length >=8  || evaluator2.student1.length >= 8 || evaluator1.student2.length >= 8) {
            return res.status(400).json({ message: 'One or more evaluators already have 8 students assigned' });
        }

        // Assign evaluator ObjectId to student
        student1.evaluator = evaluator1;
        student2.evaluator = evaluator2;
        await student1.save();
        await student2.save();

        // Add student IDs to evaluator's assigned list
        evaluator1.students.push(student1);
        evaluator2.students.push(student2);

        evaluator1.studentsAssigned.push({ student: student1, status: 'isAssigned' });
        evaluator2.studentsAssigned.push({ student: student2, status: 'isAssigned' });

        await evaluator1.save();
        await evaluator2.save();

        res.status(200).json({ message: 'Evaluators assigned to students successfully' });

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

  //show the list of evaluator assigned to student 
module.exports.getEvaluatorStudents = async (req, res) => {
    try {
        const evaluatorId = req.params.id;
        const evaluator = await Evaluator.findById(evaluatorId).populate('students');
        if (!evaluator) {
            return res.status(404).json({ message: 'Evaluator not found' });
        }
        res.status(200).json(evaluator.students);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
}

//get all the list of evaluators along with their students assigned for evaluation
module.exports.getAllEvaluatorsWithStudents = async (req, res) => {
    try {
        const evaluators = await Evaluator.find().populate('students');
        res.status(200).json(evaluators);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
}