// controllers/fypHeadController.js
const FYPHead = require('../models/FypHead');
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');
// const ProjectProposal = require('./../models/ProjectSchema');
const ProjectSchema = require('./../models/ProjectSchema');
const path = require('path');
const { v4: uuidv4 } = require('uuid');


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

        if (existingProposal.length >= 2) {
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



// const { v4: uuidv4 } = require('uuid'); // Import UUID to generate group IDs

// module.exports.requestSupervisor = async (req, res) => {
//     const { studentId, studentName, supervisorId, supervisorName, projectName } = req.body;

//     // ✅ Validate required fields
//     if (!studentId || !studentName || !supervisorId || !supervisorName || !projectName || !req.file) {
//         return res.status(400).json({ error: 'All fields are required, including the PDF file.' });
//     }

//     try {
//         // ✅ Check if student exists
//         const student = await Student.findById(studentId);
//         if (!student) {
//             return res.status(404).json({ error: 'Student not found' });
//         }

//         // ✅ Check if supervisor exists
//         const supervisor = await Supervisor.findById(supervisorId);
//         if (!supervisor) {
//             return res.status(404).json({ error: 'Supervisor not found' });
//         }

//         // ✅ Check if the student has already requested this supervisor
//         const existingRequest = supervisor.studentRequests.find(request =>
//             request.student.toString() === studentId
//         );
//         if (existingRequest) {
//             return res.status(400).json({ message: "You have already requested this supervisor." });
//         }

//         // ✅ Check if the same projectName has already been submitted
//         let existingProposals = await ProjectSchema.find({
//             projectName: projectName.trim(),
//             proposalFile: req.file.filename
//         });

//         // ✅ Limit the group size to 3 students
//         if (existingProposals.length >= 3) {
//             return res.status(400).json({
//                 message: "This project has already reached the maximum limit of 3 students."
//             });
//         }

//         // ✅ If the proposal already exists, use the same groupId
//         let groupId = existingProposals.length > 0 ? existingProposals[0].groupId : uuidv4();

//         // ✅ Save the proposal in the database
//         const newProposal = new ProjectSchema({
//             studentId,
//             supervisorId,
//             projectName: projectName.trim(),
//             proposalFile: req.file.filename,
//             groupId: groupId // Assign the group ID
//         });

//         await newProposal.save();

//         // ✅ Update student's request
//         student.supervisorRequest = {
//             supervisor: supervisorId,
//             supervisorName,
//             status: 'pending',
//             groupId: groupId
//         };
//         await student.save();

//         // ✅ Update supervisor's student list with projectProposal reference
//         supervisor.studentRequests.push({
//             student: studentId,
//             studentName,
//             status: 'pending',
//             projectProposal: newProposal._id,
//             groupId: groupId
//         });
//         await supervisor.save();

//         // ✅ Success response
//         res.status(201).json({
//             message: 'Proposal submitted successfully!',
//             proposal: newProposal,
//             student: student,
//             supervisor: supervisor,
//             groupId: groupId
//         });

//     } catch (err) {
//         console.error("Error in requestSupervisor:", err.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };



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
        }));

        res.status(200).json({msg: "Supervisor gets the proposal of Students and view their proposal",studentRequests: formattedRequests });

    } catch (err) {
        console.error("Error fetching supervisor requests:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};



// Supervisor responds to a student request
module.exports.respondRequest = async (req, res) => {
    const { supervisorId, studentId, response } = req.body;

    if (!supervisorId || !studentId || !response) {
        return res.status(400).json({ error: 'Supervisor ID, Student ID, and Response are required' });
    }

    try {
        // ✅ Find the supervisor and populate the student and projectProposal details
        const supervisor = await Supervisor.findById(supervisorId)
            .populate({
                path: 'studentRequests.student',
                select: 'username email'
            })
            .populate({
                path: 'studentRequests.projectProposal', // Include proposal details
                select: 'projectName proposalFile'
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

        // ✅ Update the student request status
        studentRequest.status = response;
        await supervisor.save();

        // ✅ Update the student's supervisor request status
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        if (student.supervisorRequest.supervisor.toString() === supervisorId) {
            student.supervisorRequest.status = response;
            await student.save();
        }

        // ✅ Return the response with the updated supervisor, student, and proposal details
        res.status(200).json({
            msg: "Response recorded successfully",
            supervisor: {
                ...supervisor.toObject(),
                studentRequests: supervisor.studentRequests.map(request => ({
                    student: request.student ? {
                        username: request.student.username,
                        email: request.student.email
                    } : null,
                    status: request.status,
                    projectProposal: request.projectProposal ? {
                        projectName: request.projectProposal.projectName,
                        proposalFile: request.projectProposal.proposalFile
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
        // ✅ Find the student and populate supervisor and projectProposal details
        const student = await Student.findById(req.params.studentId)
            .populate({
                path: 'supervisorRequest.supervisor',
                select: 'id username'
            })
            .populate({
                path: 'supervisorRequest.projectProposal', // Populate project proposal
                select: 'projectName proposalFile'
            });

        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        // ✅ Prepare response with projectName and proposalFile
        res.status(200).json({
            msg:"Show Response from Supervisor to Student",
            supervisor: student.supervisorRequest.supervisor,
            status: student.supervisorRequest.status,
            projectProposal: student.supervisorRequest.projectProposal
                ? {
                    projectName: student.supervisorRequest.supervisor.projectProposal.projectName,
                    proposalFile: student.supervisorRequest.supervisor.projectProposal.proposalFile
                }
                : null
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



