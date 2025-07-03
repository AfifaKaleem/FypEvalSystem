// routes/fypHeadRoutes.js
const express = require('express');
const router = express.Router();
const fypHeadController = require('./../controller/FypController');
const cors = require('cors');

router.get('/studentaccess/:id', cors(),fypHeadController.getStudentAccess);
router.get('/supervisoraccess/:id',cors(),fypHeadController.getSupervisorAccess);
// router.get('/showaccessstatus/:id', cors(), fypHeadController.getAccessStatus);

router.get('/supervisors', cors(), fypHeadController.getSupervisors);         //get supervisors list
router.put('/supervisor/:id', cors(), fypHeadController.updateSupervisor);    //update supervsior id
router.delete('/supervisor/:id', cors(), fypHeadController.deleteSupervisor);  //delete supervsior by id


router.get('/evaluators', cors(), fypHeadController.getSupervisors);         //get supervisors list
router.put('/evaluator/:id', cors(), fypHeadController.updateSupervisor);    //update supervsior id
router.delete('/evaluator/:id', cors(), fypHeadController.deleteSupervisor);  //delete supervsior by id


router.get('/students', cors(), fypHeadController.getStudents);     //get students
router.put('/student/:id', cors(), fypHeadController.updateStudent);  //update students info by id
router.delete('/student/:id', cors(), fypHeadController.deleteStudent); //delete students info by id


router.get('/accepted-requests', cors(), fypHeadController.getAcceptedRequests);  //list of accepted list of students
router.get('/rejected-requests', cors(), fypHeadController.getRejectedRequests);  //list of rejected list of students
router.get('/pending-requests', cors(), fypHeadController.getPendingRequests);  //list of pending request of students

router.get('/getSpecificSupervisorAlongStudents/:id',cors(),fypHeadController.getSpecificSupervisorAlongStudents); 
// Router for grouping student with same groupid
router.get('/groupStudents/:supervisorId',cors(), fypHeadController.groupStudentsWithSameProposal);


router.put('/faculty/assign-role', fypHeadController.assignFacultyRoles);
// router.get('/faculty/getFacultywithRole', fypHeadController.getFacultyWithRoles);
router.get('/faculty/getSpecificFacultyProfile/:email', fypHeadController.getSpecificFacultyProfile); // Get specific faculty profile by email


//for assigning the evaluator to the students
router.get('/grouped-students-by-project', cors(),fypHeadController.getGroupedStudentsByProjectName);//fetch the student grouped by project name
router.post('/assignEvaluatorsToProjectGroups', cors(),fypHeadController.manualAssignProjectAndEvaluators);//assign evaluators to the project groups manually
router.get('/getAllGroupedProjectsWithEvaluators',cors(),fypHeadController.getAllGroupedProjectsWithEvaluators);// fetch all the grouped projects with evaluators
router.put("/updateAssignedEvaluators",cors(), fypHeadController.updateAssignedProjectEvaluators);// update the assigned evaluators to the project groups


router.put('/assign-role',cors(), fypHeadController.assignRole);
router.get('/faculty/recently-assigned-faculty',cors(),fypHeadController.getRecentlyAssignedFaculty);

router.post('/grade-phase-one',cors(),fypHeadController.gradePhaseOneSubmission);
router.post('/grade-phase-two',cors(), fypHeadController.gradePhaseTwoSubmission);

// Example: GET /fyp/grading-list/evaluatorOne/evaluator1@example.com
router.get('/grading-list/:evaluatorRole/:email', fypHeadController.getGradingListByEvaluator);


router.get('/grades/all', cors(),fypHeadController.getAllStudentGrades);

router.put('/update-faculty-profile/:email', cors(), fypHeadController.updateFacultyProfile);

// GET method to fetch profile
router.get('/faculty/getSpecificFacultyProfile/:email', fypHeadController.getSpecificFacultyProfile);




const Evaluator = require('../models/Evaluator');
const FypSubmissionSchema = require('../models/FYPSubmissionSchema');
// Get all phase two submissions with grades for an evaluator
router.get('/phase-two-submissions-grades/:evaluatorEmail/:phaseNumber', async (req, res) => {
  try {
    const { evaluatorEmail, phaseNumber } = req.params;

    if (!evaluatorEmail || !phaseNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Evaluator email and phase number are required' 
      });
    }

    // Verify evaluator exists
    const evaluator = await Evaluator.findOne({ email: evaluatorEmail });
    if (!evaluator) {
      return res.status(404).json({ 
        success: false, 
        error: 'Evaluator not found' 
      });
    }

    // Find all submissions where the evaluator is assigned
    const submissions = await FypSubmissionSchema.find({
      $or: [
        { EvaluatorEmailOne: evaluatorEmail },
        { EvaluatorEmailTwo: evaluatorEmail }
      ],
      phaseNumberTwo: phaseNumber.toString()
    }).select('-projectFile -__v');

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No submissions found for this evaluator in phase two' 
      });
    }

    // Format response with only necessary data
    const formattedSubmissions = submissions.map(sub => ({
      email: sub.studentEmail,
      projectName: sub.projectName,
      submittedAt: sub.submittedAt,
      EvaluatorEmailOne: sub.EvaluatorEmailOne,
      EvaluatorEmailTwo: sub.EvaluatorEmailTwo,
      evaluatorOneMarks: sub.evaluatorOneMarks,
      evaluatorTwoMarks: sub.evaluatorTwoMarks,
      evaluatorOneFeedback: sub.evaluatorOneFeedback,
      evaluatorTwoFeedback: sub.evaluatorTwoFeedback,
      grading: sub.grading
    }));

    return res.status(200).json({
      success: true,
      submissions: formattedSubmissions
    });

  } catch (error) {
    console.error('Error fetching phase two submissions:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Grade phase two submission
router.post('/grade-phase-two', async (req, res) => {
  try {
    const { 
      studentEmail, 
      phaseNumberTwo, 
      grade, 
      feedback, 
      role, 
      graderEmail 
    } = req.body;

    // Validate input
    if (!studentEmail || !phaseNumberTwo || grade === undefined || !feedback || !role || !graderEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    if (!['evaluatorOne', 'evaluatorTwo'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid evaluator role' 
      });
    }

    // Find the submission
    const submission = await FypSubmissionSchema.findOne({
      studentEmail,
      phaseNumberTwo: phaseNumberTwo.toString()
    });

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        error: 'Submission not found' 
      });
    }

    // Verify grader authorization
    const evaluatorField = `EvaluatorEmail${role === 'evaluatorOne' ? 'One' : 'Two'}`;
    if (submission[evaluatorField] !== graderEmail) {
      return res.status(403).json({ 
        success: false, 
        error: 'Unauthorized to grade this submission' 
      });
    }

    // Update marks and feedback
    const marksField = `${role}Marks`;
    const feedbackField = `${role}Feedback`;
    
    submission[marksField] = Number(grade);
    submission[feedbackField] = feedback.trim();
    
    // Initialize gradedBy if it doesn't exist
    submission.gradedBy = submission.gradedBy || { 
      evaluatorOne: false, 
      evaluatorTwo: false 
    };
    
    // Update grading status
    submission.gradedBy[role] = true;

    // Check if fully graded
    const isFullyGraded = submission.gradedBy.evaluatorOne && submission.gradedBy.evaluatorTwo;
    submission.grading = isFullyGraded ? 'fullyGraded' : 'partiallyGraded';

    // Save the updated submission
    await submission.save();

    // Update evaluator's grading history
    await EvaluatorSchema.findOneAndUpdate(
      { email: graderEmail },
      {
        $push: {
          gradingHistory: {
            studentEmail,
            phase: 'Phase 2',
            grade: Number(grade),
            feedback: feedback.trim(),
            gradedAt: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );

    // Return the updated submission data
    const updatedSubmission = await FypSubmissionSchema.findOne({
      studentEmail,
      phaseNumberTwo: phaseNumberTwo.toString()
    }).select('-projectFile -__v');

    return res.status(200).json({
      success: true,
      message: 'Grade submitted successfully',
      submission: {
        email: updatedSubmission.studentEmail,
        projectName: updatedSubmission.projectName,
        submittedAt: updatedSubmission.submittedAt,
        EvaluatorEmailOne: updatedSubmission.EvaluatorEmailOne,
        EvaluatorEmailTwo: updatedSubmission.EvaluatorEmailTwo,
        evaluatorOneMarks: updatedSubmission.evaluatorOneMarks,
        evaluatorTwoMarks: updatedSubmission.evaluatorTwoMarks,
        evaluatorOneFeedback: updatedSubmission.evaluatorOneFeedback,
        evaluatorTwoFeedback: updatedSubmission.evaluatorTwoFeedback,
        grading: updatedSubmission.grading
      }
    });

  } catch (error) {
    console.error('Error grading phase two submission:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
});



// router.post('/add-student', cors(), fypHeadController.addStudent);  //create students
// router.post('/add-supervisor', cors(), fypHeadController.addSupervisor);      //create supervisor
module.exports = router;