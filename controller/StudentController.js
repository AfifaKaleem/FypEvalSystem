
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');
const path = require('path');
const ProjectSchema = require('./../models/ProjectSchema');
const ProjectProposal = require('./../models/ProjectSchema');



// Route to check access that student is eligible to access fyp system
module.exports.getStudentAccess = async (req, res) => {
    const { studentId } = req.query;
  
    try {
      const student = await Student.findOne({ studentId });
  
      if (!student) {
        return res.status(404).send('Student not found');
      }
      if (student.isEligible && student.email.endsWith("@student.uol.edu,pk")) {
        return res.status(200).send('Student is eligible to access FYP system');
      } else {
        return res.status(403).send('Student is not eligible to access FYP system');
      }
    } catch (error) {
      res.status(500).send('Internal server error');
    }
  };

//show access status to student
module.exports.getAccessStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate({
            path: 'isEligible.student',
            select: 'id username'
        });
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        res.json(student.isEligible);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


module.exports.addStudent = async (req, res) => {
    try {
        const { username, email, credit_hours, semester, department } = req.body;

        const newStudent = new Student({
            username,
            email,
            credit_hours,
            semester,
            department
        });

        await newStudent.save();
        console.log("Student data saved");
        res.status(200).json(newStudent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


// Get Students
module.exports.getStudents = async (req, res) => {
    try {
        const data = await Student.find().select('username email credit_hours semester department');
        console.log('Students data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Student
module.exports.updateStudent = async (req, res) => {
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
};

// Delete Student
module.exports.deleteStudent = async (req, res) => {
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
};



//student request specific supervisor
module.exports.requestSupervisor = async (req, res) => {
    const { studentId, studentName, supervisorId, supervisorName, projectName } = req.body;

    // ✅ Validate required fields
    if (!studentId || !studentName || !supervisorId || !supervisorName || !projectName || !req.file) {
        return res.status(400).json({ error: 'All fields are required, including the PDF file.' });
    }

    try {
        // ✅ Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // ✅ Check if supervisor exists
        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }

        // ✅ Check if the student already has a pending request
        if (student.supervisorRequest && student.supervisorRequest.status === 'pending') {
            return res.status(400).json({ message: "You already have a pending request." });
        }
    
        // ✅ Check if the student has already requested this supervisor
        const existingRequest = supervisor.studentRequests.find(request =>
            request.student.toString() === studentId
        );
        if (existingRequest) {
            return res.status(400).json({ message: "You have already requested this supervisor." });
        }
        
        

        // ✅ Check if the same projectName and proposalFile have already been submitted
        const existingProposal = await ProjectSchema.findOne({
            projectName: projectName.trim(),
            // proposalFile: req.file.filename // Ensure the exact file is compared
        });

        if (existingProposal && existingProposal.length >= 2) {
            return res.status(400).json({
                message: "This proposal with the same project name and file has already been submitted by two students."
            });
        }

        // ✅ Save the proposal in the database
        const newProposal = new ProjectSchema({
            studentId,
            supervisorId,
            projectName: projectName.trim(), // Trim to avoid whitespace differences
            proposalFile: req.file.filename
        });

        await newProposal.save();

        // ✅ Update student's request
        student.supervisorRequest = { supervisor: supervisorId, supervisorName, status: 'pending' };
        await student.save();

        // ✅ Update supervisor's student list with projectProposal reference
        supervisor.studentRequests.push({
            student: studentId,
            studentName,
            status: 'pending',
            projectProposal: newProposal._id
        });
        await supervisor.save();

        // ✅ Success response
        res.status(201).json({
            message: 'Proposal submitted successfully!',
            proposal: newProposal,
            student: student,
            supervisor: supervisor
        });

    } catch (err) {
        console.error("Error in requestSupervisor:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get supervisor request status
module.exports.getRequestStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId)
            .populate({
                path: 'supervisorRequest.supervisor',
                select: 'id username email'
            })
            .populate({
                path: 'supervisorRequest.projectProposal',
                select: 'projectName proposalFile'
            })
            .select('username email supervisorRequest'); // Select only relevant fields

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // ✅ Construct response ensuring no null/undefined values
        const response = {
            msg: "Show Response from Supervisor to Student",
            student: {
                id: student._id,
                username: student.username,
                email: student.email
            },
            supervisor: student.supervisorRequest?.supervisor
                ? {
                    id: student.supervisorRequest.supervisor._id,
                    username: student.supervisorRequest.supervisor.username,
                    email: student.supervisorRequest.supervisor.email
                }
                : null,  // ✅ Return `null` instead of `undefined`
            status: student.supervisorRequest?.status || "Pending",
            proposal:student.supervisorRequest.projectProposal|| ProjectProposal
            }
        

        console.log("✅ Supervisor Request Response:", JSON.stringify({response},null,2));

        res.status(200).json({response});
    } catch (err) {
        console.error("❌ Error fetching request status:", err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};



module.exports.getSpecificSupervisorAlongStudents = async (req, res) => {
    try {
      const supervisor = await Supervisor.findById(req.params.id).populate('email username');
      if (!supervisor) {
        return res.status(404).send({ error: 'Supervisor not found' });
      }
      const students = await Student.find({ supervisor: req.params.id }).populate('email username');
      res.json({ supervisor, students });
    } catch (error) {
      console.error(error.message);
      res.status(500).send({ error: 'Internal server error' });
    }
  };

// Get list of accepted supervisor-student pairs
module.exports.getAcceptedRequests = async (req, res) => {
    try {
        const students = await Student.find({ 'supervisorRequest.status': 'accepted' }).populate({
            path: 'supervisorRequest.supervisor',
            select: 'id username'
        });

        const acceptedRequests = students.map(student => ({
            studentId: student.id,
            studentUsername: student.username,
            supervisorId: student.supervisorRequest.supervisor.id,
            supervisorUsername: student.supervisorRequest.supervisor.username,
            status: student.supervisorRequest.status
        }));
        console.log("These Supervisors has Accepted the Students Request", acceptedRequests);
        res.status(200).json({
            message: "These Supervisors has Accepted the Students Request and the Student and Supervisors Ids and Names has been shown below",
            acceptedRequests
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get list of rejected supervisor-student pairs
module.exports.getRejectedRequests = async (req, res) => {
    try {
        const students = await Student.find({ 'supervisorRequest.status': 'rejected' }).populate({
            path: 'supervisorRequest.supervisor',
            select: 'id username'
        });

        const rejectedRequests = students.map(student => ({
            studentId: student.id,
            studentUsername: student.username,
            supervisorId: student.supervisorRequest.supervisor.id,
            supervisorUsername: student.supervisorRequest.supervisor.username,
            status: student.supervisorRequest.status
        }));
        console.log("These Supervisors has Rejected the Students Request", rejectedRequests);
        res.status(200).json({
            message: "These Supervisors has Rejected the Students Request",
            rejectedRequests
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get list of pending supervisor-student pairs
module.exports.getPendingRequests = async (req, res) => {
    try {
        const students = await Student.find({ 'supervisorRequest.status': 'pending' }).populate({
            path: 'supervisorRequest.supervisor',
            select: 'id username'
        });

        const pendingRequests = students
            .filter(student => student.supervisorRequest.supervisor)
            .map(student => ({
                studentId: student.id,
                studentUsername: student.username,
                supervisorId: student.supervisorRequest.supervisor.id,
                supervisorUsername: student.supervisorRequest.supervisor.username,
                status: student.supervisorRequest.status
            }));

        console.log("These Supervisors have pending requests from students", pendingRequests);
        res.status(200).json({
            message: "These Supervisors have pending requests from students",
            pendingRequests
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


