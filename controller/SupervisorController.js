
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


// supervisor gets the proposal of students and view their proposal
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
module.exports.respondtoStudentRequest = async (req, res) => {
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
        await student.save();
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

        const acceptedStudents = supervisor.studentRequests.filter(request => request.status === 'accepted');

        const formattedRequests = acceptedStudents.map(request => ({
            student: {
                username: request.student.username,
                email: request.student.email
            },
            projectProposal: {
                projectName: request.projectProposal?.projectName || null,
                proposalFile: request.projectProposal?.proposalFile || null
            }
        }));

        res.status(200).json({ msg: "Accepted students and their proposals", studentRequests: formattedRequests });
    } catch (err) {
        console.error("Error fetching accepted students:", err.message);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
