const express = require('express');
const router = express.Router();
const cors = require('cors');
const Evaluator = require('../models/Evaluator');
const Student = require('./../models/Student');
const FypHead = require('./../routes/FypHeadRoutes');

// Create Evaluator
router.post('/add-evaluator', cors(),async (req, res) => {
    try {
        const {username,email,office} = req.body; // Assuming the request body contains the supervisor data
        const newEvaluator = new Evaluator({username:username, email:email,office:office});
        const response = await newEvaluator.save();
        console.log('Evaluator data saved');
        res.status(200).json("Evaluator data is added successfully", response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get Evaluator
router.get('/evaluators', cors(), async (req, res) => {
    try {
        const data = await Evaluator.find().select('email username office');
        console.log('Evaluator data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//update Evaluator
router.put('/evaluator/:id', cors(),async (req, res) => {
    try {
        const evaluatorId = req.params.id;
        const updatedEvaluatorData = req.body;

        const response = await Evaluator.findByIdAndUpdate(evaluatorId, updatedEvaluatorData, {
            new: true, // Return the updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }

        console.log('Evaluator data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete Evaluator
router.delete('/evaluator/:id',cors(), async (req, res) => {
    try {
        const evaluatorId = req.params.id;

        const response = await Evaluator.findByIdAndDelete(evaluatorId);

        if (!response) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }

        console.log('Evaluator data deleted');
        res.status(200).json({ message: 'Evaluator deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Assign evaluator to student
router.post('/assign-evaluator', async (req, res) => {
    const { evaluatorId, studentId } = req.body;

    try {
        const evaluator = await Evaluator.findById(evaluatorId);
        if (!evaluator) {
            return res.status(404).json({ msg: 'Evaluator not found' });
        }

        // Check if the evaluator already has 8 assigned students
        const assignedStudentsCount = await Student.countDocuments({
            'evaluator': evaluatorId
        });

        if (assignedStudentsCount >= 8) {
            return res.status(400).json({ msg: 'Evaluator has already been assigned 8 students' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        student.evaluator = evaluatorId;
        await student.save();

        evaluator.studentAssignments.push(studentId);
        await evaluator.save();

        res.status(200).json(evaluator);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});