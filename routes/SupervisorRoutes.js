const express = require('express');
const router = express.Router();
const SupervisorController = require('./../controller/SupervisorController');
const cors = require('cors');

// router.get('/supervisoraccess/:id',cors(),SupervisorController.getSupervisorAccess);

router.post('/add-supervisor', cors(), SupervisorController.addSupervisor);      //create supervisor
router.get('/supervisors', cors(), SupervisorController.getSupervisors);         //get supervisors list
router.put('/supervisor/:id', cors(), SupervisorController.updateSupervisor);    //update supervsior id
router.delete('/supervisor/:id', cors(), SupervisorController.deleteSupervisor);  //delete supervsior by id

router.get('/:supervisorId/requests', cors(), SupervisorController.getStudentRequests);  //supervisor gets the student request
router.post('/respond-request', cors(), SupervisorController.respondtoStudentRequest);  // supervisor respond to student request
router.get('/by-email/:email', cors(), SupervisorController.getSupervisorIdByEmail); // Get supervisor ID by email
router.post('/by-email', cors(), SupervisorController.getSupervisorIdByPostingEmail); // Get supervisor by email

router.get('/view-accepted-requests/:supervisorEmail', cors(), SupervisorController.getAcceptedStudentsBySupervisor);  //list of accepted list of students under his supervision


//RECEIVES CHAPTER SUBMITTED BY STUDENTS
router.get('/submissions/:supervisorEmail/:chapterNumber', cors(), SupervisorController.getChapterSubmissionsBySupervisorEmail); // Get submitted chapters by supervisor email and chapter number

//now supervisor will grade and give feedback to the chapter submitted by students
router.post('/grade-chapter', cors(), SupervisorController.gradeChapterSubmission); // Supervisor grades chapter submission




// GET /fyp/phase-one-submissions/:supervisorEmail/:phaseNumberOne
router.get('/phase-one-submissions/:supervisorEmail/:phaseNumberOne',cors(), SupervisorController.getPhaseOneSubmissionsBySupervisorEmail);
router.get('/phase-two-submissions/:supervisorEmail/:phaseNumberTwo',cors(), SupervisorController.getPhaseTwoSubmissionsBySupervisorEmail);
// PUT /fyp/grade-phase-one
router.post('/grade-phase-one',cors(),SupervisorController.gradePhaseOneSubmission);


router.get('/getTotalProjectsBySupervisor/:supervisorEmail',cors(),SupervisorController.getTotalProjectsBySupervisor)
// router.get('/supervisorProfile/:email', cors(), SupervisorController.getSupervisorByEmail); // Get supervisor profile by email

// routes/supervisor.js
// router.get('/:id/updated-requests', SupervisorController.getUpdatedStudentRequests);

router.get('/:id/updated-requests',cors(), SupervisorController.getStudentRequestsBySupervisorId);


module.exports = router;