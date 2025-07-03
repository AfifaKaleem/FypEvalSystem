// routes/evaluatorRoutes.js
const express = require('express');
const router = express.Router();
const cors = require('cors');
const evaluatorController = require('./../controller/EvaluatorController');

// Create Evaluator
router.post('/add-evaluator', cors(), evaluatorController.addEvaluator);

// Get Evaluators
router.get('/evaluators', cors(), evaluatorController.getEvaluators);

// Update Evaluator
router.put('/evaluator/:id', cors(), evaluatorController.updateEvaluator);

// Delete Evaluator
router.delete('/evaluator/:id', cors(), evaluatorController.deleteEvaluator);

// Assign Evaluator to Student
router.post('/assign-evaluator', cors(), evaluatorController.assignEvaluator);

router.get('/getSpecificEvaluatorAlongStudents/:id', cors(),evaluatorController.getSpecificEvaluatorAlongStudents)

router.get('/getTotalProjectsByEvaluator/:evaluatorEmail',cors(),evaluatorController.getTotalProjectsByEvaluator);

router.get('/phase-one-submissions/:evaluatorEmail/:phaseNumberOne',cors(), evaluatorController.getPhaseOneSubmissionsByEvaluatorEmail);
router.get('/phase-two-submissions/:evaluatorEmail/:phaseNumberTwo',cors(), evaluatorController.getPhaseTwoSubmissionsByEvaluatorEmail);



router.get('/phase-one-submissions-grades/:email/:phaseNumber', evaluatorController.getPhaseOneSubmissions);

router.get('/phase-two-submissions-grades/:email/:phaseNumber', evaluatorController.getPhaseTwoSubmissions);
module.exports = router;
