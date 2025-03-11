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

router.get('/students', cors(), fypHeadController.getStudents);     //get students
router.put('/student/:id', cors(), fypHeadController.updateStudent);  //update students info by id
router.delete('/student/:id', cors(), fypHeadController.deleteStudent); //delete students info by id


router.get('/accepted-requests', cors(), fypHeadController.getAcceptedRequests);  //list of accepted list of students
router.get('/rejected-requests', cors(), fypHeadController.getRejectedRequests);  //list of rejected list of students
router.get('/pending-requests', cors(), fypHeadController.getPendingRequests);  //list of pending request of students

router.get('/getSpecificSupervisorAlongStudents/:id',cors(),fypHeadController.getSpecificSupervisorAlongStudents); 
// Router for grouping student with same groupid
router.get('/groupStudents/:supervisorId',cors(), fypHeadController.groupStudentsWithSameProposal);






// router.post('/add-student', cors(), fypHeadController.addStudent);  //create students
// router.post('/add-supervisor', cors(), fypHeadController.addSupervisor);      //create supervisor
module.exports = router;