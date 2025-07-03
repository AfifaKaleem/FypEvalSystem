// routes/fypHeadRoutes.js
const express = require('express');
const cors = require('cors');
const upload = require('../middleware/upload'); // Multer middleware
const StudentController = require('../controller/StudentController');
// const { submitPhaseOne } = require("../controllers/fypController");

const router = express.Router();

// 📚 Student CRUD Operations
router.post('/add-student', cors(), StudentController.addStudent);            // Create a student
router.get('/students', cors(), StudentController.getStudents);                // Get all students
router.get('/studentEmails', cors(), StudentController.getStudentEmail);       // Get all student emails
router.get('/by-email/:email', cors(), StudentController.getStudentIdByEmail); // Get student ID by email
router.post('/supervisor-id-fetch', cors(), StudentController.getSupervisorIdByStudentEmail); // Get student ID by supervisor ID

router.post('/by-email',cors(),StudentController.getStudentIdByPostingEmail); // Get student by email
router.put('/student/:id', cors(), StudentController.updateStudent);           // Update student info by ID
router.delete('/student/:id', cors(), StudentController.deleteStudent);        // Delete student info by ID

// 📄 Supervisor Request Operations
router.post('/request-supervisor', cors(), upload.single('proposalFile'), StudentController.requestSupervisor); // Student requests supervisor
router.get('/:studentId/request-status', cors(), StudentController.getRequestStatus);                           // Student checks request status


//student submits chapters
// Example route
router.post('/submit-chapter/:studentEmail/:supervisorEmail', upload.single('chapterFile'), StudentController.submitChapter);
router.get('/projectNames/:email', StudentController.getProjectNameByStudentEmail);
router.get('/getChaptersGrades/:studentEmail', cors(), StudentController.getSubmittedChaptersByStudentEmail); // Get chapters by student email



router.post(
  '/submit-phaseOne/:studentEmail/:evaluatorEmailOne/:evaluatorEmailTwo',
  cors(),
  upload.single('projectFile'), // 🟢 Make sure you're uploading under this name
  StudentController.submitPhaseOne
);

router.post(
  '/submit-phaseTwo/:studentEmail/:evaluatorEmailOne/:evaluatorEmailTwo',
  cors(),
  upload.single('projectFile'), // 🟢 Same here
  StudentController.submitPhaseTwo
);

router.get('/getEvaluatorbyStudentEmail/:studentEmail', cors(), StudentController.getAllGroupedProjectsWithEvaluators); // Get evaluators by student email
router.get('/getPhaseOneSubmissions/:studentEmail', cors(), StudentController.getSubmittedPhaseOneByStudentEmail); // Get phase one submissions by student email
router.get('/getPhaseTwoSubmissions/:studentEmail', cors(), StudentController.getSubmittedPhaseTwoByStudentEmail); // Get phase one submissions by student email
// (Optional routes you commented out - keep if needed later)
// router.get('/accepted-requests', cors(), StudentController.getAcceptedRequests);
// router.get('/rejected-requests', cors(), StudentController.getRejectedRequests);
// router.get('/pending-requests', cors(), StudentController.getPendingRequests);
// router.get('/getSpecificSupervisorAlongStudents/:id', cors(), StudentController.getSpecificSupervisorAlongStudents);
// Route to get accepted projects by student email
// router.get('/accepted-projects/:email', StudentController.getAcceptedProjectsByStudentEmail);

module.exports = router;
