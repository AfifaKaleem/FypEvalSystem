const express = require('express');
const router = express.Router();
const FYPHead = require('./../models/FypHead');
const Supervisor = require('./../models/Supervisor');
const Student = require('./../models/Student');

// Create Supervisor
router.post('/add-supervisor', async (req, res) => {
    try {
        const data = req.body; // Assuming the request body contains the supervisor data
        const newSupervisor = new Supervisor(data);
        const response = await newSupervisor.save();
        console.log('Supervisor data saved');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Supervisors
router.get('/supervisors', async (req, res) => {
    try {
        const data = await Supervisor.find();
        console.log('Supervisors data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.put('/supervisor/:id', async (req, res) => {
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
router.delete('/supervisor/:id', async (req, res) => {
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
router.post('/add-student', async (req, res) => {
    try {
        const data = req.body; // Assuming the request body contains the student data
        const newStudent = new Student(data);
        const response = await newStudent.save();
        console.log('Student data saved');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Students
router.get('/students', async (req, res) => {
    try {
        const data = await Student.find();
        console.log('Students data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update Student
router.put('/student/:id', async (req, res) => {
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
router.delete('/student/:id', async (req, res) => {
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
router.post('/request-supervisor', async (req, res) => {
    const { studentId, supervisorId } = req.body;
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) {
            return res.status(404).json({ msg: 'Supervisor not found' });
        }
        student.supervisorRequest = { supervisor: supervisorId, status: 'pending' };
        await student.save();
        supervisor.studentRequests.push({ student: studentId, status: 'pending' });
        await supervisor.save();
        res.status(200).json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get supervisor request status
router.get('/:studentId/request-status', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate('supervisorRequest.supervisor');
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
router.get('/:supervisorId/requests', async (req, res) => {
    try {
        const supervisor = await Supervisor.findById(req.params.supervisorId).populate('studentRequests.student');
        if (!supervisor) {
            return res.status(404).json({ msg: 'Supervisor not found' });
        }
        res.json(supervisor.studentRequests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Supervisor accepts or rejects a student request
router.post('/respond-request', async (req, res) => {
    const { supervisorId, studentId, response } = req.body;

    try {
        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) {
            return res.status(404).json({ msg: 'Supervisor not found' });
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
router.get('/Students', async (req, res) => {
    try {
        const students = await Student.find();
        res.json(students);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

