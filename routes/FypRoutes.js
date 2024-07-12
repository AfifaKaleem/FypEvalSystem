const express = require('express');
const router = express.Router();
const FYPHead = require('./../models/FypHead');
const Supervisor = require('./../models/Supervisor');
const Student = require('./../models/Student');
const cors = require('cors');

// Create Supervisor
router.post('/add-supervisor', cors(),async (req, res) => {
    try {
        const {username,email,domain,office} = req.body; // Assuming the request body contains the supervisor data
        const newSupervisor = new Supervisor({username:username, email:email,domain:domain,office:office});
        const response = await newSupervisor.save();
        console.log('Supervisor data saved');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Supervisors
router.get('/supervisors', cors(), async (req, res) => {
    try {
        const data = await Supervisor.find().select('email username domain office');
        console.log('Supervisors data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//update supervisor
router.put('/supervisor/:id', cors(),async (req, res) => {
    try {
        const supervisorId = req.params.id;
        const updatedSupervisorData = req.body;

        const response = await Supervisor.findByIdAndUpdate(supervisorId, updatedSupervisorData, {
            new: true, // Return the updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }

        console.log('Supervisor data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete Supervisor
router.delete('/supervisor/:id',cors(), async (req, res) => {
    try {
        const supervisorId = req.params.id;

        const response = await Supervisor.findByIdAndDelete(supervisorId);

        if (!response) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }

        console.log('Supervisor data deleted');
        res.status(200).json({ message: 'Supervisor deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create Student
router.post('/add-student', cors(),async (req, res) => {
    try {
        const {username,email,credit_hours, semester,department} = req.body; // Assuming the request body contains the student data
        const newStudent = new Student({username:username,email:email,credit_hours:credit_hours,semester:semester,department:department});
        const response = await newStudent.save();
        console.log('Student data saved');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Students
router.get('/students',cors(), async (req, res) => {
    try {
        const data = await Student.find().select('username email credit_hours  semester department');
        console.log('Students data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update Student
router.put('/student/:id', cors(),async (req, res) => {
    try {
        const studentId = req.params.id;
        const updatedStudentData = req.body;

        const response = await Student.findByIdAndUpdate(studentId, updatedStudentData, {
            new: true, // Return the updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Student not found' });
        }

        console.log('Student data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete Student
router.delete('/student/:id',cors(), async (req, res) => {
    try {
        const studentId = req.params.id;

        const response = await Student.findByIdAndDelete(studentId);

        if (!response) {
            return res.status(404).json({ error: 'Student not found' });
        }

        console.log('Student data deleted');
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Student requests a supervisor
router.post('/request-supervisor', cors(),async (req, res) => {
    const { studentId, studentName, supervisorName, supervisorId } = req.body;
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) {
            return res.status(404).json({ msg: 'Supervisor not found' });
        }
        student.supervisorRequest = { supervisor: supervisorId, supervisorName: supervisorName, status: 'pending' };
        await student.save();
        supervisor.studentRequests.push({ student: studentId, studentName:studentName, status: 'pending' });
        await supervisor.save();
        res.status(200).json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get supervisor request status
router.get('/:studentId/request-status', cors(), async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate({
            path: 'supervisorRequest.supervisor',
            select: 'id username'
        });
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        res.json(student.supervisorRequest);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get supervisor's student requests
router.get('/:supervisorId/requests', cors(), async (req, res) => {
    try {
        const supervisor = await Supervisor.findById(req.params.supervisorId).populate({
            path: 'studentRequests.student',
            select: 'id username'
        });
        if (!supervisor) {
            return res.status(404).json({ msg: 'Supervisor not found' });
        }
        res.json(supervisor.studentRequests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get list of accepted supervisor-student pairs
router.get('/accepted-requests', cors(), async (req, res) => {
    try {
        // Find all students with an accepted supervisor request
        const students = await Student.find({ 'supervisorRequest.status': 'accepted' }).populate({
            path: 'supervisorRequest.supervisor',
            select: 'id username'
        });

        // Filter and map the data to only include relevant information
        const acceptedRequests = students.map(student => ({
            studentId: student.id,
            studentUsername: student.username,
            supervisorId: student.supervisorRequest.supervisor.id,
            supervisorUsername: student.supervisorRequest.supervisor.username,
            status: student.supervisorRequest.status
        }));
        console.log("These Supervisors has Accepted the Students Request", acceptedRequests);
        res.status(200).json({message : "These Supervisors has Accepted the Students Request and the Student and  Supervisors Ids and Names has been shown below",acceptedRequests});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get list of rejected supervisor-student pairs
router.get('/rejected-requests', cors(), async (req, res) => {
    try {
        // Find all students with an accepted supervisor request
        const students = await Student.find({ 'supervisorRequest.status': 'rejected' }).populate({
            path: 'supervisorRequest.supervisor',
            select: 'id username'
        });

        // Filter and map the data to only include relevant information
        const rejectedRequests = students.map(student => ({
            studentId: student.id,
            studentUsername: student.username,
            supervisorId: student.supervisorRequest.supervisor.id,
            supervisorUsername: student.supervisorRequest.supervisor.username,
            status: student.supervisorRequest.status
        }));
        console.log("These Supervisors has Rejected the Students Request", rejectedRequests);
        res.status(200).json({message : "These Supervisors has Rejected the Students Request",rejectedRequests});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Get list of pending supervisor-student pairs
router.get('/pending-requests', cors(), async (req, res) => {
    try {
        // Find all students with a pending supervisor request
        const students = await Student.find({ 'supervisorRequest.status': 'pending' }).populate({
            path: 'supervisorRequest.supervisor',
            select: 'id username'
        });

        // Filter and map the data to only include relevant information
        const pendingRequests = students
            .filter(student => student.supervisorRequest.supervisor) // Check if supervisor is populated
            .map(student => ({
                studentId: student.id,
                studentUsername: student.username,
                supervisorId: student.supervisorRequest.supervisor.id,
                supervisorUsername: student.supervisorRequest.supervisor.username,
                status: student.supervisorRequest.status
            }));

        console.log("These Supervisors have pending requests from students", pendingRequests);
        res.status(200).json({ message: "These Supervisors have pending requests from students", pendingRequests });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// Supervisor responds to a student request
router.post('/respond-request', cors(), async (req, res) => {
    const { supervisorId, studentId, response } = req.body;

    try {
        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) {
            return res.status(404).json({ msg: 'Supervisor not found' });
        }

        // Check if the supervisor already has 15 accepted students
        const acceptedStudentsCount = await Student.countDocuments({
            'supervisorRequest.supervisor': supervisorId,
            'supervisorRequest.status': 'accepted'
        });

        if (acceptedStudentsCount >= 15) {
            return res.status(400).json({ msg: 'Supervisor has already accepted 15 students' });
        }

        const studentRequest = supervisor.studentRequests.find(req => req.student.toString() === studentId);
        if (!studentRequest) {
            return res.status(404).json({ msg: 'Student request not found' });
        }

        studentRequest.status = response;
        await supervisor.save();

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        if (student.supervisorRequest.supervisor.toString() === supervisorId) {
            student.supervisorRequest.status = response;
            await student.save();
        }

        res.status(200).json(supervisor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// Get list of students
// router.get('/Students', cors(),async (req, res) => {
//     try {
//         const students = await Student.find();
//         res.json(students);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });

module.exports = router;

