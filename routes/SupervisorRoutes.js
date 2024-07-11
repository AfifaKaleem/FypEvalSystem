// const express = require('express');
// const router = express.Router();
// const Supervisor = require('./../models/Supervisor');
// const Student = require('./../models/Student');

// // Get supervisor's student requests
// router.get('/:supervisorId/requests', async (req, res) => {
//   try {
//     const supervisor = await Supervisor.findById(req.params.supervisorId).populate('studentRequests.student');
//     if (!supervisor) {
//       return res.status(404).json({ msg: 'Supervisor not found' });
//     }
//     res.json(supervisor.studentRequests);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// // Supervisor accepts or rejects a student request
// router.post('/respond-request', async (req, res) => {
//   const { supervisorId, studentId, response } = req.body;

//   try {
//     const supervisor = await Supervisor.findById(supervisorId);
//     if (!supervisor) {
//       return res.status(404).json({ msg: 'Supervisor not found' });
//     }

//     const studentRequest = supervisor.studentRequests.find(req => req.student.toString() === studentId);
//     if (!studentRequest) {
//       return res.status(404).json({ msg: 'Student request not found' });
//     }

//     studentRequest.status = response;
//     await supervisor.save();

//     const student = await Student.findById(studentId);
//     if (!student) {
//       return res.status(404).json({ msg: 'Student not found' });
//     }

//     if (student.supervisorRequest.supervisor.toString() === supervisorId) {
//       student.supervisorRequest.status = response;
//       await student.save();
//     }

//     res.status(200).json(supervisor);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });
// // Get list of students
// router.get('/students', async (req, res) => {
//   try {
//       const students = await Student.find();
//       res.json(students);
//   } catch (err) {
//       console.error(err.message);
//       res.status(500).send('Server Error');
//   }
// });

// module.exports = router;
