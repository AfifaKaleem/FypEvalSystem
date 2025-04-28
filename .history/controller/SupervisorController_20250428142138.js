
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');
// const ProjectSchema = require('./../models/ProjectSchema');

const path = require('path');
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


// // supervisor gets the proposal of students and view their proposal
// module.exports.getStudentRequests = async (req, res) => {
//     try {
//         const { supervisorId } = req.params;

//         // ✅ Fetch Supervisor and Populate Student Requests with Project Info
//         const supervisor = await Supervisor.findById(supervisorId)
//             .populate({
//                 path: 'studentRequests.student',
//                 select: 'username email' // Include username and email of the student
//             })
//             .populate({
//                 path: 'studentRequests.projectProposal',
//                 select: 'projectName proposalFile' // Include Project Name & Proposal File
//             });

//         if (!supervisor) {
//             return res.status(404).json({ message: 'Supervisor not found' });
//         }

//         if (!supervisor.studentRequests || supervisor.studentRequests.length === 0) {
//             return res.status(200).json({ message: "No student requests found.", studentRequests: [] });
//         }

//         // ✅ Format the response to include proposalFile
//         const formattedRequests = supervisor.studentRequests.map(request => ({
            
//                 studentUsername: request.student.username,
//                 studentEmail: request.student.email,
//                 projectName: request.projectProposal?.projectName || null,
//                 proposalFile: request.projectProposal?.proposalFile || null
           
//         }));
//         console.log("Supervisor student requests:", formattedRequests);
//         res.status(200).json({ msg: "Supervisor gets the proposal of Students and view their proposal", studentRequests: formattedRequests });
        

//     } catch (err) {
//         console.error("Error fetching supervisor requests:", err.message);
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// };



module.exports.getStudentRequests = async (req, res) => {
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

        // ✅ Format the response to include proposalFile as a link
        const formattedRequests = supervisor.studentRequests.map(request => {
            const proposalFileLink = request.projectProposal?.proposalFile 
                ? `${req.protocol}://${req.get('host')}/file/view-file/${request.projectProposal.proposalFile}`
                : null;

            return {
                studentUsername: request.student.username,
                studentEmail: request.student.email,
                projectName: request.projectProposal?.projectName || null,
                proposalFile: proposalFileLink // Include the link to the proposal file
            };
        });

        console.log("Supervisor student requests:", formattedRequests);
        res.status(200).json({ msg: "Supervisor gets the proposal of Students and view their proposal", studentRequests: formattedRequests });

    } catch (err) {
        console.error("Error fetching supervisor requests:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// module.exports.respondtoStudentRequest = async (req, res) => {
//     const { response, studentEmail, supervisorEmail } = req.body;

//     if (!supervisorEmail || !studentEmail || !response) {
//         return res.status(400).json({ error: 'Supervisor email, Student email, and Response are required' });
//     }

//     try {
//         // ✅ Find supervisor by email and populate studentRequests
//         const supervisor = await Supervisor.findOne({ email: supervisorEmail })
//             .populate({
//                 path: 'studentRequests.student',
//                 select: 'username email'
//             })
//             .populate({
//                 path: 'studentRequests.projectProposal',
//                 select: 'projectName proposalFile'
//             });

//         if (!supervisor) {
//             return res.status(404).json({ error: 'Supervisor not found' });
//         }

//         // ✅ Get student by email
//         const student = await Student.findOne({ email: studentEmail });
//         if (!student) {
//             return res.status(404).json({ error: 'Student not found' });
//         }

//         // ✅ Check supervisor student limit (max 15 accepted)
//         const acceptedStudentsCount = await Student.countDocuments({
//             'supervisorRequest.supervisor': supervisor._id,
//             'supervisorRequest.status': 'accepted'
//         });

//         if (response === 'accepted' && acceptedStudentsCount >= 15) {
//             return res.status(400).json({ error: 'Supervisor has already accepted 15 students' });
//         }

//         // ✅ Find the specific request in supervisor's list
//         const studentRequest = supervisor.studentRequests.find(req =>
//             req.student && req.student._id.toString() === student._id.toString()
//         );

//         if (!studentRequest) {
//             return res.status(404).json({ error: 'Student request not found in supervisor record' });
//         }

//         // ✅ Update status in both supervisor and student documents
//         studentRequest.status = response;
//         await supervisor.save();

//         if (student.supervisorRequest && student.supervisorRequest.supervisor.toString() === supervisor._id.toString()) {
//             student.supervisorRequest.status = response;
//             await student.save();
//         }
//         console.log("Student request status updated:", studentRequest.status, studentRequest.student.username, studentRequest.student.email);
//         // ✅ Respond with relevant details
//         return res.status(200).json({
//             msg: "Response recorded successfully",
//             studentEmail: student.email,
//             supervisorEmail: supervisor.email,
//             updatedRequest: {
                
//                     studentUsername: student.username,
//                     studentEmail: student.email,
//                     status: studentRequest.status,
//                 projectProposal: studentRequest.projectProposal ? {
//                     projectName: studentRequest.projectProposal.projectName,
//                     proposalFile: studentRequest.projectProposal.proposalFile
//                 } : null
//             }
//         });

//     } catch (err) {
//         console.error("Error responding to student request:", err.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };





module.exports.respondtoStudentRequest = async (req, res) => {
    const { response, studentEmail, supervisorEmail } = req.body;

    if (!supervisorEmail || !studentEmail || !response) {
        return res.status(400).json({ error: 'Supervisor email, Student email, and Response are required' });
    }

    try {
        // ✅ Find supervisor by email and populate studentRequests
        const supervisor = await Supervisor.findOne({ email: supervisorEmail })
            .populate({
                path: 'studentRequests.student',
                select: 'username email'
            })
            .populate({
                path: 'studentRequests.projectProposal',
                select: 'projectName proposalFile'
            });

        if (!supervisor) {
            return res.status(404).json({ error: 'Supervisor not found' });
        }

        // ✅ Get student by email
        const student = await Student.findOne({ email: studentEmail });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // ✅ Check supervisor student limit (max 15 accepted)
        const acceptedStudentsCount = await Student.countDocuments({
            'supervisorRequest.supervisor': supervisor._id,
            'supervisorRequest.status': 'accepted'
        });

        if (response === 'accepted' && acceptedStudentsCount >= 15) {
            return res.status(400).json({ error: 'Supervisor has already accepted 15 students' });
        }

        // ✅ Find the specific request in supervisor's list
        const studentRequest = supervisor.studentRequests.find(req =>
            req.student && req.student._id.toString() === student._id.toString()
        );

        if (!studentRequest) {
            return res.status(404).json({ error: 'Student request not found in supervisor record' });
        }

        // ✅ Update status in both supervisor and student documents
        studentRequest.status = response;
        await supervisor.save();

        if (student.supervisorRequest && student.supervisorRequest.supervisor.toString() === supervisor._id.toString()) {
            student.supervisorRequest.status = response;
            await student.save();
        }

        console.log("Student request status updated:", studentRequest.status, studentRequest.student.username, studentRequest.student.email);

        // ✅ Generate the proposalFile link
        const proposalFileLink = studentRequest.projectProposal?.proposalFile 
            ? `${req.protocol}://${req.get('host')}/file/view-file/${studentRequest.projectProposal.proposalFile}`
            : null;

        // ✅ Respond with relevant details, including the proposalFile link
        return res.status(200).json({
            msg: "Response recorded successfully",
            studentEmail: student.email,
            supervisorEmail: supervisor.email,
            updatedRequest: {
                studentUsername: student.username,
                studentEmail: student.email,
                status: studentRequest.status,
                projectProposal: studentRequest.projectProposal ? {
                    projectName: studentRequest.projectProposal.projectName,
                    proposalFile: proposalFileLink // Include the link to the proposal file
                } : null
            }
        });

    } catch (err) {
        console.error("Error responding to student request:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//supervisor can see his accepted students list for supervision along with their projectName and proposalsFile
module.exports.viewListofStudentsUnderSupervision = async (req, res) => {
    try {
        const { id } = req.params;
        const supervisor = await Supervisor.findById(id)
            .populate({
                path: 'studentRequests.student',
                match: { 'supervisorRequest.status': 'accepted' },
                select: 'username email'
            })
            .populate({
                path: 'studentRequests.projectProposal',
                select: 'projectName proposalFile'
            });

        if (!supervisor) {
            return res.status(404).json({ message: 'Supervisor not found' });
        }

        // Filter only accepted students
        const acceptedStudents = supervisor.studentRequests.filter(request =>
            request.status === 'accepted' && request.student
        );

        // Format response
        const formattedRequests = acceptedStudents.map(request => ({
            student: {
                username: request.student?.username || "Unknown",
                email: request.student?.email || "No email",
                status: request.status || "No status" 
            },

            projectProposal: request.projectProposal
                ? {
                    projectName: request.projectProposal.projectName,
                    proposalFile: request.projectProposal.proposalFile
                }
                : null
        }));

        res.status(200).json({ msg: "Accepted students and their proposals", studentRequests: formattedRequests });
    } catch (err) {
        console.error("Error fetching accepted students:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
