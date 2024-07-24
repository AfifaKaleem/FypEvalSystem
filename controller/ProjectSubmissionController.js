// const mongoose = require('mongoose');
// const Student = require('./../models/Student');

// // Route to submit proposal
// module.exports.SubmitProposal=async (req, res) => {
//     const { studentId, proposalData } = req.body;
  
//     try {
//       const student = await Student.findOne({ studentId });
  
//       if (!student || !student.isEligible) {
//         return res.status(403).send('Student is not eligible to submit proposal');
//       }
  
//       const proposal = new Proposal(proposalData);
//       await proposal.save();
  
//       student.proposals.push(proposal);
//       await student.save();
  
//       res.status(200).send('Proposal submitted successfully');
//     } catch (error) {
//       res.status(500).send('Internal server error');
//     }
//   };
  
//   // Route for FYP Phase 1 completion
//  module.exports.SubmitFypPhase1=async (req, res) => {
//     const { studentId } = req.body;
  
//     try {
//       const student = await Student.findOne({ studentId });
  
//       if (!student || student.semester < 7 || !student.isEligible) {
//         return res.status(403).send('Student is not eligible for FYP Phase 1');
//       }
  
//       student.fypPhase1 = true;
//       await student.save();
  
//       res.status(200).send('FYP Phase 1 marked as complete');
//     } catch (error) {
//       res.status(500).send('Internal server error');
//     }
//   };
  
//   // Route for FYP Phase 2 completion
// module.exports.SubmitFypPhase2=async (req, res) => {
//     const { studentId } = req.body;
  
//     try {
//       const student = await Student.findOne({ studentId });
  
//       if (!student || student.semester < 8 || !student.isEligible || !student.fypPhase1) {
//         return res.status(403).send('Student is not eligible for FYP Phase 2');
//       }
  
//       student.fypPhase2 = true;
//       await student.save();
  
//       res.status(200).send('FYP Phase 2 marked as complete');
//     } catch (error) {
//       res.status(500).send('Internal server error');
//     }
// };

// module.exports.SubmitFinalProject = async (req, res) => {
//     const { studentId } = req.body;
  
//     try {
//       const student = await Student.findOne({ studentId });
  
//       if (!student || student.semester < 8 || !student.isEligible || !student.fypPhase1) {
//         return res.status(403).send('Student is not eligible for FYP Phase 2');
//       }
  
//       student.fypPhase2 = true;
//       await student.save();
  
//       res.status(200).send('FYP Phase 2 marked as complete');
//     } catch (error) {
//       res.status(500).send('Internal server error');
//     }
// };