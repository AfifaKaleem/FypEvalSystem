
// const Supervisor = require('../models/Supervisor');
// const Student = require('../models/Student');
// const path = require('path');
// const ProjectSchema = require('./../models/ProjectSchema');
// const ProjectProposal = require('./../models/ProjectSchema');



// // Route to check access that student is eligible to access fyp system
// module.exports.getStudentAccess = async (req, res) => {
//     const { studentId } = req.query;

//     try {
//         const student = await Student.findOne({ studentId });

//         if (!student) {
//             return res.status(404).send('Student not found');
//         }
//         if (student.isEligible && student.email.endsWith("@student.uol.edu,pk")) {
//             return res.status(200).send('Student is eligible to access FYP system');
//         } else {
//             return res.status(403).send('Student is not eligible to access FYP system');
//         }
//     } catch (error) {
//         res.status(500).send('Internal server error');
//     }
// };

// //show access status to student
// module.exports.getAccessStatus = async (req, res) => {
//     try {
//         const student = await Student.findById(req.params.studentId).populate({
//             path: 'isEligible.student',
//             select: 'id username'
//         });
//         if (!student) {
//             return res.status(404).json({ msg: 'Student not found' });
//         }
//         res.json(student.isEligible);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// };


// module.exports.addStudent = async (req, res) => {
//     try {
//         const { username, email, credit_hours, semester, department } = req.body;

//         const newStudent = new Student({
//             username,
//             email,
//             credit_hours,
//             semester,
//             department
//         });

//         await newStudent.save();
//         console.log("Student data saved");
//         res.status(200).json(newStudent);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };


// // Get Students
// module.exports.getStudents = async (req, res) => {
//     try {
//         const data = await Student.find().select('username email credit_hours semester department');
//         console.log('Students data fetched');
//         res.status(200).json(data);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// // Get only student emails
// module.exports.getStudentEmail = async (req, res) => {
//     try {
//         const data = await Student.find().select('email -_id'); // Only select 'email' and exclude '_id'
//         console.log('Student emails fetched');
//         res.status(200).json(data);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// //get student id by email
// module.exports.getStudentIdByEmail = async (req, res) => {
//     try {
//         const email = req.params.email;
//         const student = await Student.findOne({ email });
    
//         if (!student) {
//           return res.status(404).json({ message: "Student not found" });
//         }
//         console.log("Student ID fetched by email:", student._id);
//         res.json({ studentId: student._id });
//       } catch (error) {
//         console.error("Error fetching student ID by email:", error);
//         res.status(500).json({ message: "Internal Server Error" });
//       }
// }
// // Update Student
// module.exports.updateStudent = async (req, res) => {
//     try {
//         const studentId = req.params.id;
//         const updatedStudentData = req.body;

//         const response = await Student.findByIdAndUpdate(studentId, updatedStudentData, {
//             new: true, // Return the updated document
//             runValidators: true, // Run mongoose validation
//         });

//         if (!response) {
//             return res.status(404).json({ error: 'Student not found' });
//         }

//         console.log('Student data updated');
//         res.status(200).json(response);
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// // Delete Student
// module.exports.deleteStudent = async (req, res) => {
//     try {
//         const studentId = req.params.id;

//         const response = await Student.findByIdAndDelete(studentId);

//         if (!response) {
//             return res.status(404).json({ error: 'Student not found' });
//         }

//         console.log('Student data deleted');
//         res.status(200).json({ message: 'Student deleted successfully' });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// module.exports.requestSupervisor = async (req, res) => {
//     const { projectName, studentEmail, supervisorEmail } = req.body;

//     if (!projectName || !studentEmail || !supervisorEmail || !req.file) {
//         return res.status(400).json({
//             error: 'Missing required fields (projectName, studentEmail, supervisorEmail, proposalFile).'
//         });
//     }

//     try {
//         // Find student and supervisor using email
//         const student = await Student.findOne({ email: studentEmail });
//         if (!student) {
//             return res.status(404).json({ error: 'Student not found' });
//         }

//         const supervisor = await Supervisor.findOne({ email: supervisorEmail });
//         if (!supervisor) {
//             return res.status(404).json({ error: 'Supervisor not found' });
//         }

//         // // Check if the student is already assigned to a supervisor
//         // if (student.supervisorRequest && student.supervisorRequest.status !== 'rejected') {
//         //     return res.status(400).json({ error: 'you already have a supervisor assigned.' });
//         // }


//         //check if he has already requested to another supervisor
//         if (student.supervisorRequest && student.supervisorRequest.status === 'pending') {
//             return res.status(400).json({ error: 'Student has already requested a supervisor.' });
//         }
//         // Check if project already submitted by 2 students
//         const existingProposals = await ProjectSchema.find({ projectName: projectName.trim() });
//         if (existingProposals.length >= 2) {
//             return res.status(400).json({ message: "This project has already been submitted by two students." });
//         }
      

//         // Save the proposal
//         const newProposal = new ProjectSchema({
//             studentId: student._id,
//             supervisorId: supervisor._id,
//             projectName: projectName.trim(),
//             proposalFile: req.file.filename
//         });
//         await newProposal.save();

//         // Update student record
//         student.supervisorRequest = {
//             supervisor: supervisor._id,
//             supervisorName: supervisor.name,
//             status: 'pending'
//         };
//         await student.save();

//         // Update supervisor record
//         supervisor.studentRequests.push({
//             student: student._id,
//             studentName: student.name,
//             status: 'pending',
//             projectProposal: newProposal._id
//         });
//         await supervisor.save();
//         console.log("Proposal submitted successfully!", newProposal, student.email, supervisor.email);
//         // ✅ Return success with studentEmail and supervisorEmail
//         return res.status(201).json({
//             message: 'Proposal submitted successfully!',
//             proposal: newProposal,
//             studentEmail: student.email,
//             supervisorEmail: supervisor.email
//         });

//     } catch (err) {
//         console.error("Error in requestSupervisor:", err.message);
//         return res.status(500).json({ error: 'Internal Server Error' });
//     }
// };


// module.exports.getRequestStatus = async (req, res) => {
//     try {
//       const student = await Student.findById(req.params.studentId)
//         .populate({
//           path: 'supervisorRequest.supervisor',
//           select: '_id username email'
//         })
//         .populate({
//           path: 'supervisorRequest.projectProposal',
//           model: 'Proposal',
//           select: 'projectName proposalFile'
//         })
//         .select('username email supervisorRequest');
  
//       if (!student) {
//         return res.status(404).json({ error: 'Student not found' });
//       }
  
//       let requests = [];
  
//       if (Array.isArray(student.supervisorRequest)) {
//         // 🌀 If it's an array, loop through each request
//         requests = student.supervisorRequest.map((request) => ({
//           supervisorId: request.supervisor?._id || null,
//           supervisorName: request.supervisor?.username || null,
//           supervisorEmail: request.supervisor?.email || null,
//         //   proposalTitle: request.projectProposal?.projectName || null,
//           status: request.status || "Pending"
//         }));
//       } else if (student.supervisorRequest && typeof student.supervisorRequest === 'object') {
//         // 📦 If it's a single object (not an array)
//         requests.push({
//           supervisorId: student.supervisorRequest.supervisor?._id || null,
//         //   supervisorName: student.supervisorRequest.supervisor?.username || null,
//         //   supervisorEmail: student.supervisorRequest.supervisor?.email || null,
//         //   proposalTitle: student.supervisorRequest.projectProposal?.projectName || null,
//           status: student.supervisorRequest.status || "Pending"
//         });
//       }
  
//       const response = {
//         msg: "Supervisor Responses for Student",
//         studentId: student._id,
//         studentUsername: student.username,
//         studentEmail: student.email,
//         requestStatus: requests
//       };
  
//       console.log("✅ Full Supervisor Request Status Response:", JSON.stringify(response, null, 2));
//       res.status(200).json(response);
//     } catch (err) {
//       console.error("❌ Error fetching request status:", err.message);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };
  

// // module.exports.getRequestStatus = async (req, res) => {
// //     try {
// //         const student = await Student.findById(req.params.studentId)
// //             .populate({
// //                 path: 'supervisorRequest.supervisor',
// //                 select: '_id username email'
// //             })
// //             .populate({
// //                 path: 'supervisorRequest.projectProposal',
// //                 model: 'Proposal',
// //                 select: 'projectName proposalFile'
// //             })
// //             .select('username email supervisorRequest');

// //         if (!student) {
// //             return res.status(404).json({ error: 'Student not found' });
// //         }
// //         const requestStatus = student.supervisorRequest.map((request) => ({
// //             supervisorId: request.supervisor?._id || null,
// //             supervisorName: request.supervisor?.username || null,
// //             supervisorEmail: request.supervisor?.email || null,
// //             proposalTitle: request.projectProposal?.projectName || null,
// //             status: request.status || "Pending"
// //           }));
          

// //         // const request = student.supervisorRequest;

// //         // const requestStatus = {
// //         //   supervisorId: request.supervisor?._id || null,
// //         // //   supervisorName: request.supervisor?.username || null,
// //         // //   supervisorEmail: request.supervisor?.email || null,
// //         //   status: request.status || "Pending"
// //         // };
        
// //         const response = {
// //           msg: "Supervisor Response for Student",
// //           studentId: student._id,
// //           studentUsername: student.username,
// //           studentEmail: student.email,
// //           requestStatus
// //         };
        

// //         console.log("✅ Full Supervisor Request Status Response:", JSON.stringify(response, null, 2));
// //         res.status(200).json(response);
// //     } catch (err) {
// //         console.error("❌ Error fetching request status:", err.message);
// //         res.status(500).json({ error: 'Internal server error' });
// //     }
// // };



// //     try {
// //         const student = await Student.findOne(req.params.studentId)
// //             .populate({
// //                 path: 'supervisorRequest.supervisor',
// //                 select: 'id username email'
// //             })
// //             .populate({
// //                 path: 'supervisorRequest.projectProposal',
// //                 model: 'Proposal', // make sure this matches your model name
// //                 select: 'projectName proposalFile'
// //             })
// //             .select('username email supervisorRequest');

// //         if (!student) {
// //             return res.status(404).json({ error: 'Student not found' });
// //         }

// //         const filename = student.supervisorRequest?.projectProposal?.proposalFile;
// //         const fileUrl = filename
// //             ? `${req.protocol}://${req.get('host')}/proposals/${filename}`
// //             : null;

// //         const response = {
// //             msg: "Show Response from Supervisor to Student",

// //             studentId: student._id,
// //             studentUsername: student.username,
// //             studentEmail: student.email,

// //             status: student.supervisorRequest?.status || "Pending",
// //         };

// //         console.log("✅ Supervisor Request Response:", JSON.stringify({ response }, null, 2));

// //         res.status(200).json({ response });
// //     } catch (err) {
// //         console.error("❌ Error fetching request status:", err.message);
// //         res.status(500).json({ error: 'Internal server error' });
// //     }
// // };

// module.exports.getSpecificSupervisorAlongStudents = async (req, res) => {
//     try {
//         const supervisor = await Supervisor.findById(req.params.id).populate('email username');
//         if (!supervisor) {
//             return res.status(404).send({ error: 'Supervisor not found' });
//         }
//         const students = await Student.find({ supervisor: req.params.id }).populate('email username');
//         res.json({ supervisor, students });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send({ error: 'Internal server error' });
//     }
// };

// // Get list of accepted supervisor-student pairs
// module.exports.getAcceptedRequests = async (req, res) => {
//     try {
//         const students = await Student.find({ 'supervisorRequest.status': 'accepted' }).populate({
//             path: 'supervisorRequest.supervisor',
//             select: 'id username'
//         });


//         // const acceptedRequests = students.map(student => ({
//         //     studentId: student.id,
//         //     studentUsername: student.username,
//         //     supervisorId: student.supervisorRequest.supervisor.id,
//         //     supervisorUsername: student.supervisorRequest.supervisor.username,
//         //     status: student.supervisorRequest.status
//         // }));
//         // console.log("These Supervisors has Accepted the Students Request", acceptedRequests);
//         // res.status(200).json({
//         //     message: "These Supervisors has Accepted the Students Request and the Student and Supervisors Ids and Names has been shown below",
//         //     acceptedRequests
//         // });



//         const acceptedRequests = students
//             .filter(student => student.supervisorRequest.supervisor)
//             .map(student => ({
//                 studentId: student.id,
//                 studentUsername: student.username,
//                 supervisorId: student.supervisorRequest.supervisor.id,
//                 supervisorUsername: student.supervisorRequest.supervisor.username,
//                 status: student.supervisorRequest.status
//             }));

//         console.log("These Supervisors have pending requests from students", acceptedRequests);
//         res.status(200).json({
//             message: "These Supervisors have pending requests from students",
//             acceptedRequests
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// };

// // Get list of rejected supervisor-student pairs
// module.exports.getRejectedRequests = async (req, res) => {
//     try {
//         const students = await Student.find({ 'supervisorRequest.status': 'rejected' }).populate({
//             path: 'supervisorRequest.supervisor',
//             select: 'id username'
//         });

//         const rejectedRequests = students.map(student => ({
//             studentId: student.id,
//             studentUsername: student.username,
//             supervisorId: student.supervisorRequest.supervisor.id,
//             supervisorUsername: student.supervisorRequest.supervisor.username,
//             status: student.supervisorRequest.status
//         }));
//         console.log("These Supervisors has Rejected the Students Request", rejectedRequests);
//         res.status(200).json({
//             message: "These Supervisors has Rejected the Students Request",
//             rejectedRequests
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// };

// // Get list of pending supervisor-student pairs
// module.exports.getPendingRequests = async (req, res) => {
//     try {
//         const students = await Student.find({ 'supervisorRequest.status': 'pending' }).populate({
//             path: 'supervisorRequest.supervisor',
//             select: 'id username'
//         });

//         const pendingRequests = students
//             .filter(student => student.supervisorRequest.supervisor)
//             .map(student => ({
//                 studentId: student.id,
//                 studentUsername: student.username,
//                 supervisorId: student.supervisorRequest.supervisor.id,
//                 supervisorUsername: student.supervisorRequest.supervisor.username,
//                 status: student.supervisorRequest.status
//             }));

//         console.log("These Supervisors have pending requests from students", pendingRequests);
//         res.status(200).json({
//             message: "These Supervisors have pending requests from students",
//             pendingRequests
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// };


const Student = require('../models/Student');
const Supervisor = require('../models/Supervisor');
const ProjectSchema = require('../models/ProjectSchema');
const path = require('path');

// ✅ Check student eligibility to access FYP system
module.exports.getStudentAccess = async (req, res) => {
    const { studentId } = req.query;
    try {
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).send('Student not found');
        if (student.isEligible && student.email.endsWith('@student.uol.edu.pk')) {
            return res.status(200).send('Student is eligible to access FYP system');
        }
        return res.status(403).send('Student is not eligible to access FYP system');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
};

// ✅ Show access status
module.exports.getAccessStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId).populate({
            path: 'isEligible.student',
            select: 'id username'
        });
        if (!student) return res.status(404).json({ msg: 'Student not found' });
        res.json(student.isEligible);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ✅ Add student
module.exports.addStudent = async (req, res) => {
    try {
        const { username, email, credit_hours, semester, department } = req.body;
        const newStudent = new Student({ username, email, credit_hours, semester, department });
        await newStudent.save();
        console.log("Student data saved");
        res.status(200).json(newStudent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// ✅ Get all students
module.exports.getStudents = async (req, res) => {
    try {
        const data = await Student.find().select('username email credit_hours semester department');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ✅ Get only student emails
module.exports.getStudentEmail = async (req, res) => {
    try {
        const data = await Student.find().select('email -_id');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ✅ Get student ID by email
module.exports.getStudentIdByEmail = async (req, res) => {
    try {
        const email = req.params.email;
        const student = await Student.findOne({ email });
        if (!student) return res.status(404).json({ message: "Student not found" });
        res.json({ studentId: student._id });
    } catch (error) {
        console.error("Error fetching student ID by email:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// ✅ Update student
module.exports.updateStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const updatedStudentData = req.body;
        const response = await Student.findByIdAndUpdate(studentId, updatedStudentData, {
            new: true,
            runValidators: true
        });
        if (!response) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ✅ Delete student
module.exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        const response = await Student.findByIdAndDelete(studentId);
        if (!response) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ✅ Request supervisor

// module.exports.requestSupervisor = async (req, res) => {
//     const { projectName, studentEmail, supervisorEmail } = req.body;

//     if (!projectName || !studentEmail || !supervisorEmail || !req.file) {
//         return res.status(400).json({
//             error: 'Missing required fields (projectName, studentEmail, supervisorEmail, proposalFile).'
//         });
//     }

//     try {
//         const student = await Student.findOne({ email: studentEmail });
//         if (!student) return res.status(404).json({ error: 'Student not found' });

//         const supervisor = await Supervisor.findOne({ email: supervisorEmail });
//         if (!supervisor) return res.status(404).json({ error: 'Supervisor not found' });

//         // if (student.supervisorRequest && student.supervisorRequest.status === 'pending') {
//         //     return res.status(400).json({ error: 'Student has already requested a supervisor.' });
//         // }

//         // const existingProposals = await ProjectSchema.find({ projectName: projectName.trim() });
//         // if (existingProposals.length >= 2) {
//         //     return res.status(400).json({ message: "This project has already been submitted by two students." });
//         // }

//         const newProposal = new ProjectSchema({
//             studentId: student._id,
//             supervisorId: supervisor._id,
//             projectName: projectName.trim(),
//             proposalFile: req.file.filename
//         });
//         await newProposal.save();

//         student.supervisorRequest = {
//             supervisor: supervisor._id,
//             supervisorName: supervisor.name,
//             status: 'pending'
//         };
//         await student.save();

//         supervisor.studentRequests.push({
//             student: student._id,
//             studentName: student.username,
//             status: 'pending',
//             projectProposal: newProposal._id
//         });
//         await supervisor.save();

//         // Create file link
//         const fileLink = `${req.protocol}://${req.get('host')}/file/view-file/${req.file.filename}`;

//         // http://localhost:8080/file/view-file/1745828894388-555605051.pdf
//         // no case of file not found
//         // http://localhost:8080/uploads/1745828847572-Python_Assignment_HaroonIshaq.pdf

//         console.log("Proposal submitted:", student.email, supervisor.email);
//         res.status(201).json({
//             message: 'Proposal submitted successfully!',
//             proposal: {
//                 ...newProposal.toObject(),
//                 proposalFileLink: fileLink
//             },
//             studentEmail: student.email,
//             supervisorEmail: supervisor.email
//         });

//     } catch (err) {
//         console.error("Error in requestSupervisor:", err.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };


module.exports.requestSupervisor = async (req, res) => {
    const { projectName, studentEmail, supervisorEmail } = req.body;

    if (!projectName || !studentEmail || !supervisorEmail || !req.file) {
        return res.status(400).json({
            error: 'Missing required fields (projectName, studentEmail, supervisorEmail, proposalFile).'
        });
    }

    try {
        const student = await Student.findOne({ email: studentEmail });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        const supervisor = await Supervisor.findOne({ email: supervisorEmail });
        if (!supervisor) return res.status(404).json({ error: 'Supervisor not found' });

        const newProposal = new ProjectSchema({
            studentId: student._id,
            supervisorId: supervisor._id,
            projectName: projectName.trim(),
            proposalFile: req.file.filename // Storing only filename in DB
        });
        await newProposal.save();

        student.supervisorRequest = {
            supervisor: supervisor._id,
            supervisorName: supervisor.name,
            status: 'pending'
        };
        await student.save();

        supervisor.studentRequests.push({
            student: student._id,
            studentName: student.username,
            status: 'pending',
            projectProposal: newProposal._id
        });
        await supervisor.save();

        // Create the file link for response
        const fileLink = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        console.log("Proposal submitted:", student.email, supervisor.email);

        res.status(201).json({
            message: 'Proposal submitted successfully!',
            proposal: {
                ...newProposal.toObject(),
                proposalFile: fileLink  // Show the file link directly in the proposalFile property
            },
            studentEmail: student.email,
            supervisorEmail: supervisor.email
        });

    } catch (err) {
        console.error("Error in requestSupervisor:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// ✅ Get supervisor request status
module.exports.getRequestStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId)
            .populate({
                path: 'supervisorRequest.supervisor',
                select: '_id username email'
            })
            .populate({
                path: 'supervisorRequest.projectProposal',
                model: 'Proposal',
                select: 'projectName proposalFile'
            })
            .select('username email supervisorRequest');

        if (!student) return res.status(404).json({ error: 'Student not found' });

        let requests = [];

        if (Array.isArray(student.supervisorRequest)) {
            requests = student.supervisorRequest.map((request) => ({
                supervisorId: request.supervisor?._id || null,
                supervisorName: request.supervisor?.username || null,
                supervisorEmail: request.supervisor?.email || null,
                status: request.status || "Pending"
            }));
        } else if (typeof student.supervisorRequest === 'object') {
            requests.push({
                supervisorId: student.supervisorRequest.supervisor?._id || null,
                supervisorName: student.supervisorRequest.supervisor?.username || null,
                supervisorEmail: student.supervisorRequest.supervisor?.email || null,
                status: student.supervisorRequest.status || "Pending"
            });
        }

        const response = {
            msg: "Supervisor Responses for Student",
            studentId: student._id,
            studentUsername: student.username,
            studentEmail: student.email,
            requestStatus: requests
        };

        console.log("✅ Supervisor Request Status:", JSON.stringify(response, null, 2));
        res.status(200).json(response);
    } catch (err) {
        console.error("❌ Error fetching request status:", err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
