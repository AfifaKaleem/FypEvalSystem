// routes/fypHeadRoutes.js
const express = require('express');
const router = express.Router();
const StudentController = require('./../controller/StudentController');
const cors = require('cors');


router.get('/studentaccess/:id', cors(),StudentController.getStudentAccess);

// router.get('/showaccessstatus/:id', cors(), StudentController.getAccessStatus);

router.post('/add-student', cors(), StudentController.addStudent);  //create students
router.get('/students', cors(), StudentController.getStudents);     //get students
router.put('/student/:id', cors(), StudentController.updateStudent);  //update students info by id
router.delete('/student/:id', cors(), StudentController.deleteStudent); //delete students info by id

router.post('/request-supervisor', cors(), StudentController.requestSupervisor);  //student request a supervisor
router.get('/:studentId/request-status', cors(), StudentController.getRequestStatus); //students gets a accepted or rejected status from supervisor


router.get('/accepted-requests', cors(), StudentController.getAcceptedRequests);  //list of accepted list of students
router.get('/rejected-requests', cors(), StudentController.getRejectedRequests);  //list of rejected list of students
router.get('/pending-requests', cors(), StudentController.getPendingRequests);  //list of pending request of students

router.get('/getSpecificSupervisorAlongStudents/:id',cors(),StudentController.getSpecificSupervisorAlongStudents); 

module.exports = router;