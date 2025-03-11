// controllers/fypHeadController.js
// const FYPHead = require('../models/Admin');
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');
// const ProjectProposal = require('./../models/ProjectSchema');
const ProjectSchema = require('./../models/ProjectSchema');
// const path = require('path');
const { v4: uuidv4 } = require('uuid');
// const ProjectProposal = require('./../models/ProjectSchema');


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
module.exports.getSupervisorAccess = async (req, res) => {
    const { supervisorId } = req.query;
    try {
        const supervisor = await Supervisor.findOne({ supervisorId });
        if (!supervisor) {
            return res.status(404).send("Supervisor not found");
        }
        if (supervisor.email.endsWith('@cs.uol.edu.pk')) {
            return res.status(200).json("Supervisor is Eligible to access Fyp System");
        } else {
            return res.status(403).send("Supervisor is not Eligible to access the Fyp System");
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "internal server error" })
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
        const { username, email, domain, office, position } = req.body;
        const newSupervisor = new Supervisor({ username, email, domain, office, position });
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
        const newStudent = new Student({ username, email, credit_hours, semester, department });
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


 // For generating group IDs
// Group the two students and assign them a group ID so they can be listed as group members of the same project
module.exports.groupStudentsWithSameProposal = async (req, res) => {
    const { supervisorId } = req.params;

    try {
        // ✅ Fetch proposals submitted to the specific supervisor with status "pending"
        const proposals = await ProjectSchema.find({ supervisorId })
            .populate('studentId', 'username email')
            .populate('supervisorId', 'username email');

        if (!proposals.length) {
            return res.status(404).json({ message: "No student requests found for this supervisor." });
        }

        // ✅ Group proposals by projectName and proposalFile
        const groupedProposals = {};
        for (const proposal of proposals) {
            const key = `${proposal.projectName}`;

            if (!groupedProposals[key]) {
                groupedProposals[key] = [];
            }
            groupedProposals[key].push(proposal);
        }

        // ✅ Prepare the response array
        const groupedStudents = [];

        // ✅ Assign group IDs to only two students with the same projectName and proposalFile
        for (const key in groupedProposals) {
            const students = groupedProposals[key];

            if (students.length === 2) { // Only proceed if there are exactly two students
                const groupId = uuidv4(); // Generate a unique group ID
                const studentDetails = [];

                for (const studentProposal of students) {
                    // ✅ Update ProjectSchema
                    await ProjectSchema.findByIdAndUpdate(studentProposal._id, { groupId });

                    // ✅ Update Student
                    await Student.findByIdAndUpdate(studentProposal.studentId._id, {
                        "supervisorRequest.groupId": groupId
                    });

                    // ✅ Update Supervisor's student list
                    await Supervisor.findOneAndUpdate(
                        { _id: studentProposal.supervisorId, "studentRequests.student": studentProposal.studentId._id },
                        { $set: { "studentRequests.$.groupId": groupId } }
                    );

                    // ✅ Collect student details
                    studentDetails.push({
                        studentId: studentProposal.studentId._id,
                        username: studentProposal.studentId.username,
                        email: studentProposal.studentId.email,
                        groupId
                    });
                }
               
                // ✅ Push the group's details into the response array
                groupedStudents.push({
                    supervisorId: students[0].supervisorId._id,
                    supervisorName: students[0].supervisorId.name,
                    projectName: students[0].projectName,
                    proposalFile: students[0].proposalFile,
                    students: studentDetails
                });
            }
        }

        if (!groupedStudents.length) {
            return res.status(404).json({ message: "No groups formed as no proposals matched the criteria or did not have exactly two students." });
        }

        res.status(200).json({
            message: "Students grouped successfully!",
            groupedStudents
        });

    } catch (err) {
        console.error("Error in grouping students:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.getSpecificSupervisorAlongStudents = async (req, res) => {
    try {
        // ✅ Find supervisor with required details
        const supervisor = await Supervisor.findById(req.params.id).select('email username');
        if (!supervisor) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }

        // ✅ Fetch students under this supervisor and include their project details
        const students = await Student.find({ 'supervisorRequest.supervisor': req.params.id })
            .populate({
                path: 'supervisorRequest.projectProposal', 
                select: 'projectName proposalFile'
            })
            .select('username email supervisorRequest'); // Selecting relevant fields

        // ✅ Return structured response
        res.status(200).json({
            // supervisor,
            Supervisor: {
                id: supervisor._id,
                username: supervisor.username,
                email: supervisor.email,
                studentRequests: students.map(student => ({
                    id: student._id,
                    username: student.username,
                    email: student.email,
                    status: student.supervisorRequest.status,
                    projectProposal: student.supervisorRequest.projectProposal
                        ? {
                            projectName: student.supervisorRequest.projectProposal.projectName,
                            proposalFile: student.supervisorRequest.projectProposal.proposalFile
                        }
                        : undefined 
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching supervisor and students:", error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Get list of accepted supervisor-student pairs
module.exports.getAcceptedRequests = async (req, res) => {
    try {
        const students = await Student.find({ 'supervisorRequest.status': 'accepted' })
            .populate({
                path: 'supervisorRequest.supervisor',
                select: 'id username'
            })
            .populate({
                path: 'supervisorRequest.projectProposal', // ✅ Ensure this path is correct
                select: 'projectName proposalFile'
            });

        const acceptedRequests = students.map(student => ({
            studentId: student.id,
            studentUsername: student.username,
            supervisorId: student.supervisorRequest.supervisor.id,
            supervisorUsername: student.supervisorRequest.supervisor.username,
            status: student.supervisorRequest.status,
            projectName: student.supervisorRequest.projectProposal?.projectName || 'N/A',
            proposalFile: student.supervisorRequest.projectProposal?.proposalFile || 'N/A',
            projectProposal: student.supervisorRequest.projectProposal
                ? {
                    projectName: student.supervisorRequest.supervisor.projectProposal.projectName,
                    proposalFile: student.supervisorRequest.supervisor.projectProposal.proposalFile
                }
                : null
            }));
        console.log("These Supervisors have Accepted the Students' Requests", acceptedRequests);
        res.status(200).json({
            message: "These Supervisors have Accepted the Students' Requests and their details are shown below",
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
            status: student.supervisorRequest.status,
            projectProposal :student.supervisorRequest.projectProposal,
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



