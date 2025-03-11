const express = require('express');
const router = express.Router();
const SupervisorController = require('./../controller/SupervisorController');
const cors = require('cors');

router.get('/supervisoraccess/:id',cors(),SupervisorController.getSupervisorAccess);

router.post('/add-supervisor', cors(), SupervisorController.addSupervisor);      //create supervisor
router.get('/supervisors', cors(), SupervisorController.getSupervisors);         //get supervisors list
router.put('/supervisor/:id', cors(), SupervisorController.updateSupervisor);    //update supervsior id
router.delete('/supervisor/:id', cors(), SupervisorController.deleteSupervisor);  //delete supervsior by id

router.get('/:supervisorId/requests', cors(), SupervisorController.getStudentRequests);  //supervisor gets the student request
router.post('/respond-request', cors(), SupervisorController.respondtoStudentRequest);  // supervisor respond to student request

router.get('/view-accepted-requests', cors(), SupervisorController.viewListofStudentsUnderSupervision);  //list of accepted list of students under his supervision

module.exports = router;