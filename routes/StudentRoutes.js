// const express = require('express');
// const router = express.Router();
// const Student = require('./../models/Student');
// const Supervisor = require('./../models/Supervisor');

// // Student requests a supervisor
// router.post('/request-supervisor', async (req, res) => {
//     const { studentId, supervisorId } = req.body;
//     try {
//         const student = await Student.findById(studentId);
//         if (!student) {
//             return res.status(404).json({ msg: 'Student not found' });
//         }
//         const supervisor = await Supervisor.findById(supervisorId);
//         if (!supervisor) {
//             return res.status(404).json({ msg: 'Supervisor not found' });
//         }
//         student.supervisorRequest = { supervisor: supervisorId, status: 'pending' };
//         await student.save();
//         supervisor.studentRequests.push({ student: studentId, status: 'pending' });
//         await supervisor.save();
//         res.status(200).json(student);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });

// // Get supervisor request status
// router.get('/:studentId/request-status', async (req, res) => {
//     try {
//         const student = await Student.findById(req.params.studentId).populate('supervisorRequest.supervisor');
//         if (!student) {
//             return res.status(404).json({ msg: 'Student not found' });
//         }
//         res.json(student.supervisorRequest);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });

// // Get list of supervisors
// router.get('/supervisors', async (req, res) => {
//     try {
//         const supervisors = await Supervisor.find();
//         res.json(supervisors);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });

// module.exports = router;
