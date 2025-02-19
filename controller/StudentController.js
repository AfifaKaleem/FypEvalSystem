// controllers/fypHeadController.js
// const FYPHead = require('../models/FypHead');
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');


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



// Create Student
module.exports.addStudent = async (req, res) => {
    try {
        const { username, email, credit_hours, semester, department } = req.body;
        const newStudent = new Student ({ username, email, credit_hours, semester, department });
        const response = await newStudent.save();
        console.log('Student data saved');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
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

module.exports.requestSupervisor = async (req, res) => {
    try {
        const { studentId, studentName, supervisorName, supervisorId, projectName } = req.body;

        // ✅ Validate Student
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ msg: "Student not found" });

        // ✅ Validate Supervisor
        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) return res.status(404).json({ msg: "Supervisor not found" });

        // ✅ Ensure Proposal File is Provided
        if (!req.file) {
            return res.status(400).json({ message: "Proposal file is required (PDF only)." });
        }

        // ✅ Save Proposal Submission
        const newProposal = new ProjectProposal({
            studentId,
            supervisorId,
            projectName,
            proposalFile: req.file.path // Save file path
        });

        await newProposal.save();

        // ✅ Update Student & Supervisor Requests
        student.supervisorRequest = { supervisor: supervisorId, supervisorName, status: "pending" };
        await student.save();

        supervisor.studentRequests.push({ student: studentId, studentName, status: "pending" });
        await supervisor.save();

        res.status(201).json({ 
            message: "Proposal submitted successfully!", 
            proposal: newProposal,
            student: student,
            supervisor: supervisor
        });

    } catch (err) {
        console.error("Error:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// Get supervisor request status
module.exports.getRequestStatus = async (req, res) => {
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


