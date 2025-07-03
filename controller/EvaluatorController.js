// controllers/evaluatorController.js
const Evaluator = require('./../models/Evaluator');
const Student = require('./../models/Student');
const FypSubmissionSchema = require('.././models/FypSubmissionSchema');

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



const ProjectSchema = require('../models/ProjectSchema');
module.exports.getTotalProjectsByEvaluator = async (req, res) => {
  try {
    const { evaluatorEmail } = req.params;

    // Step 1: Find the supervisor by email
    const evaluator = await Evaluator.findOne({ email: evaluatorEmail });

    if (!evaluator) {
      return res.status(404).json({ message: "Evaluator not found." });
    }

    // Step 2: Count the number of projects assigned to this supervisor
    const totalProjects = await ProjectSchema.countDocuments({ evaluatorId: evaluator._id });

    return res.status(200).json({
      message: `Total number of projects for evaluator ${evaluator.username}`,
      evaluatorEmail,
      totalProjects
    });

  } catch (err) {
    console.error("Error fetching total projects by supervisor:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// controller/evaluatorController.js
exports.getPhaseOneSubmissionsByEvaluatorEmail = async (req, res) => {
  try {
    const { evaluatorEmail, phaseNumberOne } = req.params;

    const submissions = await FypSubmissionSchema.find({
      $or: [
        { EvaluatorEmailOne: evaluatorEmail },
        { EvaluatorEmailTwo: evaluatorEmail },
      ],
      phaseNumberOne: phaseNumberOne.toString(),
    }).select(
      'studentEmail projectFile projectName grading evaluatorOneMarks evaluatorTwoMarks evaluatorOneFeedback evaluatorTwoFeedback EvaluatorEmailOne EvaluatorEmailTwo'
    );

    const formatted = submissions.map((s) => {
      const isEvaluatorOne = s.EvaluatorEmailOne === evaluatorEmail;

      return {
        email: s.studentEmail,
        fileURL: s.projectFile,
        projectName: s.projectName,
        grading: s.grading,
        marks: isEvaluatorOne ? s.evaluatorOneMarks : s.evaluatorTwoMarks,
        feedback: isEvaluatorOne ? s.evaluatorOneFeedback : s.evaluatorTwoFeedback,
        EvaluatorEmailOne: s.EvaluatorEmailOne,
        EvaluatorEmailTwo: s.EvaluatorEmailTwo,
      };
    });

    res.status(200).json({
      message: 'Phase One submissions retrieved successfully',
      submissions: formatted,
    });
  } catch (err) {
    console.error('❌ Error fetching phase 1 submissions:', err.message);
    res.status(500).json({
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};




module.exports.getPhaseTwoSubmissionsByEvaluatorEmail = async (req, res) => {
  try {
    const { evaluatorEmail, phaseNumberTwo } = req.params;

    const submissions = await FypSubmissionSchema.find({
      evaluatorEmail,
      phaseNumberTwo: phaseNumberTwo.toString()
    }).select('studentEmail projectFile projectName grading marks feedback ');

    if (submissions.length === 0) {
      return res.status(200).json({
        message: 'No submissions found for Phase One',
        submissions: []
      });
    }

    const formatted = submissions.map((s) => ({
      email: s.studentEmail,
      fileURL: s.projectFile,
      projectName: s.projectName,
      grading: s.grading,
      marks: s.marks,
      feedback: s.feedback
    }));

    res.status(200).json({
      message: 'Phase Two submissions retrieved successfully',
      submissions: formatted
    });

  } catch (err) {
    console.error('❌ Error fetching phase 2 submissions:', err.message);
    res.status(500).json({
      message: 'Internal Server Error',
      error: err.message
    });
  }
};



module.exports.getPhaseOneSubmissions = async (req, res) => {
  const { email: evaluatorEmail, phaseNumber } = req.params;

  try {
    const submissions = await FypSubmissionSchema.find({
      phaseNumberOne: phaseNumber,
      $or: [
        { EvaluatorEmailOne: evaluatorEmail },
        { EvaluatorEmailTwo: evaluatorEmail }
      ]
    });

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ success: false, message: 'No submissions found' });
    }

    // To avoid duplicates for same student, use a Map
    const uniqueSubmissions = new Map();

    for (const submission of submissions) {
      if (!uniqueSubmissions.has(submission.studentEmail)) {
        const student = await Student.findOne({ email: submission.studentEmail });

        uniqueSubmissions.set(submission.studentEmail, {
          email: submission.studentEmail,
          studentName: student?.username || '',
          projectFile: submission.projectFile,
          projectName: submission.projectName || '',
          submittedAt: submission.submittedAt || new Date(),
          grading: submission.grading || 'NotGraded',
          EvaluatorEmailOne: submission.EvaluatorEmailOne,
          EvaluatorEmailTwo: submission.EvaluatorEmailTwo,
          evaluatorOneMarks: submission.evaluatorOneMarks ?? null,
          evaluatorTwoMarks: submission.evaluatorTwoMarks ?? null,
          evaluatorOneFeedback: submission.evaluatorOneFeedback ?? '',
          evaluatorTwoFeedback: submission.evaluatorTwoFeedback ?? '',
        });
      }
    }

    const response = Array.from(uniqueSubmissions.values());

    res.status(200).json({ success: true, submissions: response });
  } catch (error) {
    console.error('Error fetching phase one submissions:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



module.exports.getPhaseTwoSubmissions = async (req, res) => {
  const { email: evaluatorEmail, phaseNumberTwo } = req.params;

  try {
    const submissions = await FypSubmissionSchema.find({
      phaseNumberTwo: phaseNumberTwo,
      $or: [
        { EvaluatorEmailOne: evaluatorEmail },
        { EvaluatorEmailTwo: evaluatorEmail }
      ]
    });

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ success: false, message: 'No submissions found' });
    }

    // To avoid duplicates for same student, use a Map
    const uniqueSubmissions = new Map();

    for (const submission of submissions) {
      if (!uniqueSubmissions.has(submission.studentEmail)) {
        const student = await Student.findOne({ email: submission.studentEmail });

        uniqueSubmissions.set(submission.studentEmail, {
          email: submission.studentEmail,
          studentName: student?.username || '',
          projectFile: submission.projectFile,
          projectName: submission.projectName || '',
          submittedAt: submission.submittedAt || new Date(),
          grading: submission.grading || 'NotGraded',
          EvaluatorEmailOne: submission.EvaluatorEmailOne,
          EvaluatorEmailTwo: submission.EvaluatorEmailTwo,
          evaluatorOneMarks: submission.evaluatorOneMarks ?? null,
          evaluatorTwoMarks: submission.evaluatorTwoMarks ?? null,
          evaluatorOneFeedback: submission.evaluatorOneFeedback ?? '',
          evaluatorTwoFeedback: submission.evaluatorTwoFeedback ?? '',
        });
      }
    }

    const response = Array.from(uniqueSubmissions.values());

    res.status(200).json({ success: true, submissions: response });
  } catch (error) {
    console.error('Error fetching phase one submissions:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};