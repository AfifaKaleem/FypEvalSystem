// routes/fypHeadRoutes.js
const express = require('express');
const cors = require('cors');
const upload = require('../middleware/upload'); // Multer middleware
const StudentController = require('../controller/StudentController');

const router = express.Router();

// 📚 Student CRUD Operations
router.post('/add-student', cors(), StudentController.addStudent);            // Create a student
router.get('/students', cors(), StudentController.getStudents);                // Get all students
router.get('/studentEmails', cors(), StudentController.getStudentEmail);       // Get all student emails
router.get('/by-email/:email', cors(), StudentController.getStudentIdByEmail); // Get student ID by email
router.put('/student/:id', cors(), StudentController.updateStudent);           // Update student info by ID
router.delete('/student/:id', cors(), StudentController.deleteStudent);        // Delete student info by ID

// 📄 Supervisor Request Operations
router.post('/request-supervisor', cors(), upload.single('proposalFile'), StudentController.requestSupervisor); // Student requests supervisor
router.get('/:studentId/request-status', cors(), StudentController.getRequestStatus);                           // Student checks request status

// (Optional routes you commented out - keep if needed later)
// router.get('/accepted-requests', cors(), StudentController.getAcceptedRequests);
// router.get('/rejected-requests', cors(), StudentController.getRejectedRequests);
// router.get('/pending-requests', cors(), StudentController.getPendingRequests);
// router.get('/getSpecificSupervisorAlongStudents/:id', cors(), StudentController.getSpecificSupervisorAlongStudents);

module.exports = router;
