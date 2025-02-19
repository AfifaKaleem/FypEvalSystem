// controllers/fypHeadController.js
const FYPHead = require('../models/FypHead');
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');
// const ProjectProposal = require('./../models/ProjectSchema');
const ProjectSchema = require('./../models/ProjectSchema');
const path = require('path')


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
module.exports.getSupervisorAccess = async(req,res)=>{
    const {supervisorId} = req.query;
    try{
        const supervisor = await Supervisor.findOne({supervisorId});
        if(!supervisor){
            return res.status(404).send("Supervisor not found");
        }
        if(supervisor.email.endsWith('@cs.uol.edu.pk')){
            return res.status(200).json("Supervisor is Eligible to access Fyp System");
        }else{
            return res.status(403).send("Supervisor is not Eligible to access the Fyp System");
        }

    }catch(err){
        console.log(err);
        res.status(500).json({error: "internal server error"})
    }
}

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


// Create Supervisor Profile
module.exports.addSupervisor = async (req, res) => {
    try {
        const { username, email, domain, office,position } = req.body;
        const newSupervisor = new Supervisor({ username, email, domain, office,position });
        const response = await newSupervisor.save();
        console.log('Supervisor data saved');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get Supervisors Profile
module.exports.getSupervisors = async (req, res) => {
    try {
        const data = await Supervisor.find().select('email username domain office position');
        console.log('Supervisors data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Supervisor Profile
module.exports.updateSupervisor = async (req, res) => {
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
};

// Delete Supervisor Profile
module.exports.deleteSupervisor = async (req, res) => {
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


//student request specific supervisor
module.exports.requestSupervisor = async (req, res) => {
    const { studentId, studentName, supervisorId, supervisorName, projectName, proposalFile } = req.body;

    if (!studentId || !studentName || !supervisorId || !supervisorName || !projectName || !proposalFile) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }
          // ✅ Check if the student already has a pending request with any supervisor
          if (student.supervisorRequest && student.supervisorRequest.status === " ") {
            return res.status(400).json({ 
                message: "You already have a pending request with another supervisor. Please wait for a response."
            });
        }
 // ✅ Check if the student has already requested this supervisor
 const existingRequest = supervisor.studentRequests.find(request => 
    request.student.toString() === studentId
);

if (existingRequest) {
    return res.status(400).json({ message: "You have already requested this supervisor." });
}
        const newProposal = new ProjectSchema({
            studentId,
            supervisorId,
            projectName,
            proposalFile
        });

        await newProposal.save();

        student.supervisorRequest = { supervisor: supervisorId, supervisorName, status: 'pending' };
        await student.save();

        supervisor.studentRequests.push({ student: studentId, studentName, status: 'pending' });
        await supervisor.save();

        res.status(201).json({
            message: 'Proposal submitted successfully!',
            proposal: newProposal,
            student: student,
            supervisor: supervisor
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// supervisor gets the proposal of students and view their proposal
module.exports.getSupervisorRequests = async (req, res) => {
    try {
        const { supervisorId } = req.params;

        // ✅ Fetch Supervisor and Populate Student Requests with Project Info
        const supervisor = await Supervisor.findById(supervisorId)
            .populate({
                path: 'studentRequests.student',
                select: 'username email' // Include username and email of the student
            })
            .populate({
                path: 'studentRequests.projectProposal',
                select: 'projectName proposalFile' // Include Project Name & Proposal File
            });

        if (!supervisor) {
            return res.status(404).json({ message: 'Supervisor not found' });
        }

        if (!supervisor.studentRequests || supervisor.studentRequests.length === 0) {
            return res.status(200).json({ message: "No student requests found.", studentRequests: [] });
        }

        // ✅ Format the response to include proposalFile
        const formattedRequests = supervisor.studentRequests.map(request => ({
            student: {
                username: request.student.username,
                email: request.student.email
            },
            status: request.status,
            projectProposal: {
                projectName: request.projectProposal?.projectName || null,
                proposalFile: request.projectProposal?.proposalFile || null
            },
            remarks: request.remarks
        }));

        res.status(200).json({ studentRequests: formattedRequests });

    } catch (err) {
        console.error("Error fetching supervisor requests:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
// Supervisor responds to a student request
module.exports.respondRequest = async (req, res) => {
    const { supervisorId, studentId, response, remarks } = req.body;

    if (!supervisorId || !studentId || !response) {
        return res.status(400).json({ error: 'Supervisor ID, Student ID, and Response are required' });
    }

    try {
        // ✅ Find the supervisor and populate the student details in the studentRequests array
        const supervisor = await Supervisor.findById(supervisorId)
            .populate({
                path: 'studentRequests.student',
                select: 'username email' // Include username and email of the student
            });

        if (!supervisor) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }

        // ✅ Check if the supervisor has already accepted 15 students
        const acceptedStudentsCount = await Student.countDocuments({
            'supervisorRequest.supervisor': supervisorId,
            'supervisorRequest.status': 'accepted'
        });

        if (response === 'accepted' && acceptedStudentsCount >= 15) {
            return res.status(400).json({ error: 'Supervisor has already accepted 15 students' });
        }

        // ✅ Find the specific student request
        const studentRequest = supervisor.studentRequests.find(request => 
            request.student && request.student._id.toString() === studentId
        );

        if (!studentRequest) {
            return res.status(404).json({ error: 'Student request not found' });
        }

        // ✅ Check if the student field is populated
        if (!studentRequest.student) {
            return res.status(404).json({ error: 'Student details not found' });
        }

        // ✅ Update the student request status and remarks
        studentRequest.status = response;
        studentRequest.remarks = remarks || '';
        await supervisor.save();

        // ✅ Update the student's supervisor request status and remarks
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        if (student.supervisorRequest.supervisor.toString() === supervisorId) {
            student.supervisorRequest.status = response;
            student.supervisorRequest.remarks = remarks || '';
            await student.save();
        }

        // ✅ Return the response with the updated supervisor and student details
        res.status(200).json({ 
            msg: "Response recorded successfully", 
            supervisor: {
                ...supervisor.toObject(), // Convert Mongoose document to plain object
                studentRequests: supervisor.studentRequests.map(request => ({
                    ...request.toObject(), // Convert Mongoose subdocument to plain object
                    student: request.student ? {
                        username: request.student.username,
                        email: request.student.email
                    } : null
                }))
            }
        });

    } catch (err) {
        console.error("Error responding to student request:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// student gets request status from supervisor
module.exports.getRequestStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate({
            path: 'supervisorRequest.supervisor',
            select: 'id username'
        });

        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        res.status(200).json({
            supervisor: student.supervisorRequest.supervisor,
            status: student.supervisorRequest.status,
            remarks: student.supervisorRequest.remarks || 'No remarks provided' // Display remarks if available
        });

    } catch (err) {
        console.error("Error fetching request status:", err.message);
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
            status: student.supervisorRequest.status,
           
            
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



