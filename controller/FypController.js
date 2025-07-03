// controllers/fypHeadController.js
// const FYPHead = require('../models/Admin');
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');
const Evaluator = require('../models/Evaluator');
// const ProjectProposal = require('./../models/ProjectSchema');
const ProjectSchema = require('./../models/ProjectSchema');
// const path = require('path');
const { v4: uuidv4 } = require('uuid');

const moment = require('moment');
const FypSubmissionSchema = require('../models/FYPSubmissionSchema');
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



// // Get list of accepted supervisor-student pairs
// module.exports.getAcceptedRequests = async (req, res) => {
//     try {
//         const students = await Student.find({ 'supervisorRequest.status': 'accepted' })
//             .populate({
//                 path: 'supervisorRequest.supervisor',
//                 select: 'id username email domain office position'  // ✅ Selecting relevant fields
//             })
//             .populate({
//                 path: 'supervisorRequest.projectProposal',
//                 select: 'projectName proposalFile'
//             });

//         // Format response
//         const formattedRequests = students.map(student => ({
//             student: {
//                 username: student.username || "Unknown",
//                 email: student.email || "No email",
//                 status: student.supervisorRequest?.status || "No status"
//             },
//             supervisor: student.supervisorRequest?.supervisor
//                 ? {
//                     username: student.supervisorRequest.supervisor.username || "Unknown",
//                     email: student.supervisorRequest.supervisor.email || "No email",
//                     domain: student.supervisorRequest.supervisor.domain || "No domain",
//                     office: student.supervisorRequest.supervisor.office || "No office",
//                     position: student.supervisorRequest.supervisor.position || "No position"
//                 }
//                 : "No supervisor assigned",
//             projectProposal: student.supervisorRequest?.projectProposal
//                 ? {
//                     projectName: student.supervisorRequest.projectProposal.projectName,
//                     proposalFile: student.supervisorRequest.projectProposal.proposalFile
//                 }
//                 : "No project proposal"
//         }));

//         console.log("These Supervisors have Accepted the Students' Requests", formattedRequests);

//         res.status(200).json({
//             message: "These Supervisors have Accepted the Students' Requests and their details are shown below",
//             formattedRequests
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
//             status: student.supervisorRequest.status,
//             projectProposal :student.supervisorRequest.projectProposal,
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
const ProjectProposal = require('./../models/ProjectSchema');

module.exports.getAcceptedRequests = async (req, res) => {
    try {
        const students = await Student.find({ 'supervisorRequest.status': 'accepted' })
            .populate({
                path: 'supervisorRequest.supervisor',
                select: 'username email'
            });

        // Fetch all project proposals
        const allProposals = await ProjectProposal.find({}, 'studentId projectName proposalFile');

        // Create a quick lookup map for proposals by studentId
        const proposalMap = new Map();
        allProposals.forEach(p => {
            proposalMap.set(p.studentId.toString(), {
                projectName: p.projectName,
                // proposalFile: p.proposalFile
            });
        });

        const acceptedRequests = students.map(student => {
            const supervisor = student.supervisorRequest?.supervisor;
            const studentIdStr = student._id.toString();
            const projectProposal = proposalMap.get(studentIdStr);

            return {
                studentId: student._id,
                studentName: student.username || "Unknown",
                studentEmail: student.email || "No email",

                supervisorName: supervisor?.username || "Unknown",
                supervisorEmail: supervisor?.email || "No email",

                status: student.supervisorRequest?.status || "No status",

                projectProposal: projectProposal || "No project proposal"
            };
        });

        res.status(200).json({
            message: "List of supervisors who have accepted students",
            acceptedRequests
        });

    } catch (err) {
        console.error("❌ Error fetching accepted requests:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Get list of rejected supervisor-student pairs
module.exports.getRejectedRequests = async (req, res) => {
    try {
        const students = await Student.find({ 'supervisorRequest.status': 'rejected' }).populate({
            path: 'supervisorRequest.supervisor',
            select: 'id username'
        });

        const rejectedRequests = students
            .filter(student => student.supervisorRequest && student.supervisorRequest.supervisor)
            .map(student => ({
                studentId: student.id,
                studentName: student.username || "Unknown",
                studentEmail: student.email || "No email",
                supervisorId: student.supervisorRequest.supervisor.id,
                supervisorName: student.supervisorRequest.supervisor.username || "Unknown",
                supervisorEmail: student.supervisorRequest.supervisor.email || "No email",
                status: student.supervisorRequest.status || "No status"
            }));
            
        console.log("✅ Accepted Supervisor-Student Pairs:", rejectedRequests);

        res.status(200).json({
            message: "List of supervisors who have accepted students",
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


// Create Evaluator
module.exports.addEvaluator = async (req, res) => {
    try {
        const { username, email, office,domain } = req.body;
        const newEvaluator = new Evaluator({ username, email, office,domain });
        const response = await newEvaluator.save();
        console.log('Evaluator data saved');
        res.status(200).json({ message: "Evaluator data is added successfully", response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get Evaluators
module.exports.getEvaluators = async (req, res) => {
    try {
        const data = await Evaluator.find().select('email username office domain');
        console.log('Evaluator data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Evaluator
module.exports.updateEvaluator = async (req, res) => {
    try {
        const evaluatorId = req.params.id;
        const updatedEvaluatorData = req.body;

        const response = await Evaluator.findByIdAndUpdate(evaluatorId, updatedEvaluatorData, {
            new: true, // Return the updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }

        console.log('Evaluator data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete Evaluator
module.exports.deleteEvaluator = async (req, res) => {
    try {
        const evaluatorId = req.params.id;

        const response = await Evaluator.findByIdAndDelete(evaluatorId);

        if (!response) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }

        console.log('Evaluator data deleted');
        res.status(200).json({ message: 'Evaluator deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//assign evaluator to student
module.exports.assignEvaluator = async (req, res) => {
    try {
        const { evaluatorEmail, studentEmail } = req.body;
        const evaluator = await Evaluator.findById(evaluatorId);
        const student = await Student.findById(studentId);

        if (!evaluator || !student) {
            return res.status(404).json({ error: 'Evaluator or Student not found' });
        }

        // Check if the student is already assigned to the evaluator
        const isAlreadyAssigned = evaluator.studentsAssigned.some(
            (assignment) => assignment.student.toString() === studentId
        );

        if (isAlreadyAssigned) {
            return res.status(400).json({ error: 'Student is already assigned to this evaluator' });
        }

        // Assign the student to the evaluator
        evaluator.studentsAssigned.push({ student: studentId });
        await evaluator.save();

        console.log('Student assigned to evaluator successfully');
        res.status(200).json({ message: 'Student assigned to evaluator successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


module.exports.assignFacultyRoles = async (req, res) => {
  const { email, roles, username, office = '', domain = '' } = req.body;

  if (!email || !Array.isArray(roles)) {
    return res.status(400).json({ error: 'Email and roles[] required' });
  }

  const validRoles = ['supervisor', 'evaluator', 'both'];
  const invalid = roles.filter(r => !validRoles.includes(r));
  if (invalid.length) {
    return res.status(400).json({ error: `Invalid roles: ${invalid.join(', ')}` });
  }

  try {
    // Assign Supervisor role
    if (roles.includes('supervisor') || roles.includes('both')) {
      await Supervisor.findOneAndUpdate(
        { email },
        { username, email, domain, office },
        { upsert: true, new: true }
      );
    } else {
      await Supervisor.findOneAndDelete({ email });
    }

    // Assign Evaluator role
    if (roles.includes('evaluator') || roles.includes('both')) {
      await Evaluator.findOneAndUpdate(
        { email },
        { username, email, domain, office },
        { upsert: true, new: true }
      );
    } else {
      await Evaluator.findOneAndDelete({ email });
    }

    return res.status(200).json({ message: 'Roles updated successfully', rolesAssigned: roles });
  } catch (err) {
    console.error('Error assigning roles:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


// after loading the page it sould show the updated role who were recently assigned by admin itself just show the role not buttons
module.exports.getFacultyWithRoles = async (req, res) => {
  try {
    const supervisors = await Supervisor.find().select('username email domain office position');
    const evaluators = await Evaluator.find().select('username email domain office');

    // Combine both lists and add role information
    const facultyList = [
      ...supervisors.map(f => ({ ...f.toObject(), role: 'supervisor' })),
      ...evaluators.map(f => ({ ...f.toObject(), role: 'evaluator' }))
    ];

    res.status(200).json(facultyList);
  } catch (err) {
    console.error('Error fetching faculty with roles:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.getSpecificFacultyProfile = async (req, res) => {
  const email = req.params.email;

  try {
    // Try to find the user in Supervisor collection
    const supervisor = await Supervisor.findOne({ email }).select('username email domain office position roles');

    // Try to find the user in Evaluator collection
    const evaluator = await Evaluator.findOne({ email }).select('username email domain office roles');

    if (!supervisor && !evaluator) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Merge data if user is both supervisor and evaluator
    let userProfile = {};
    let roles = [];

    if (supervisor) {
      userProfile = {
        username: supervisor.username,
        email: supervisor.email,
        domain: supervisor.domain,
        office: supervisor.office,
        position: supervisor.position,
      };
      if (supervisor.roles?.length) {
        roles = roles.concat(supervisor.roles);
      } else {
        roles.push("Supervisor");
      }
    }

    if (evaluator) {
      // If userProfile is empty (not supervisor), fill basic info from evaluator
      if (!supervisor) {
        userProfile = {
          username: evaluator.username,
          email: evaluator.email,
          domain: evaluator.domain,
          office: evaluator.office,
          position: "N/A", // if evaluator doesn't have position field
        };
      }
      if (evaluator.roles?.length) {
        roles = roles.concat(evaluator.roles);
      } else {
        roles.push("Evaluator");
      }
    }

    // Remove duplicate roles (if any)
    roles = [...new Set(roles)];

    // Add role field
    userProfile.role = roles.join(", ");

    res.status(200).json(userProfile);
  } catch (err) {
    console.error('Error fetching faculty profile by email:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// PUT /fyp/faculty/assign-role
module.exports.assignRole = async (req, res) => {
  try {
    const { username, email, domain, office, roles } = req.body;

    if (!email || !roles || !roles.length) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const assignedRole =
      roles.includes('both') ? 'Both' :
      roles.includes('supervisor') ? 'Supervisor' :
      roles.includes('evaluator') ? 'Evaluator' : '';

    // If Supervisor or Both
    if (roles.includes('supervisor') || roles.includes('both')) {
      await Supervisor.findOneAndUpdate(
        { email },
        {
          username,
          email,
          domain,
          office,
          assignedRole,
        },
        { upsert: true, new: true }
      );
    }

    // If Evaluator or Both
    if (roles.includes('evaluator') || roles.includes('both')) {
      await Evaluator.findOneAndUpdate(
        { email },
        {
          username,
          email,
          domain,
          office,
          assignedRole,
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({ success: true, message: 'Role assigned successfully' });

  } catch (err) {
    console.error('Error assigning role:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


module.exports.getRecentlyUpdatedFaculty = async (req, res) => {
  try {
    // Find the most recently updated supervisor and evaluator
    const [latestSupervisor] = await Supervisor.find().sort({ updatedAt: -1 });
    const [latestEvaluator] = await Evaluator.find().sort({ updatedAt: -1 });

    // Compare which one is more recent
    let latest = null;
    let roleType = '';

    if (latestSupervisor && latestEvaluator) {
      if (latestSupervisor.updatedAt > latestEvaluator.updatedAt) {
        latest = latestSupervisor;
        // Check if also exists as evaluator → role is 'both'
        const evaluatorExists = await Evaluator.findOne({ email: latest.email });
        roleType = evaluatorExists ? 'both' : 'supervisor';
      } else {
        latest = latestEvaluator;
        // Check if also exists as supervisor → role is 'both'
        const supervisorExists = await Supervisor.findOne({ email: latest.email });
        roleType = supervisorExists ? 'both' : 'evaluator';
      }
    } else if (latestSupervisor) {
      latest = latestSupervisor;
      const evaluatorExists = await Evaluator.findOne({ email: latest.email });
      roleType = evaluatorExists ? 'both' : 'supervisor';
    } else if (latestEvaluator) {
      latest = latestEvaluator;
      const supervisorExists = await Supervisor.findOne({ email: latest.email });
      roleType = supervisorExists ? 'both' : 'evaluator';
    }

    if (!latest) {
      return res.status(404).json({ message: 'No faculty members found' });
    }

    // Return the response
    return res.status(200).json({
      username: latest.username,
      email: latest.email,
      domain: latest.domain || '',
      office: latest.office || '',
      roles: latest.roles || [],
      updatedAt: latest.updatedAt,
      assignedAs: roleType   // 'supervisor' | 'evaluator' | 'both'
    });

  } catch (error) {
    console.error('Error fetching latest updated faculty:', error);
    res.status(500).json({ message: 'Server error' });
  }
};





module.exports.getGroupedStudentsByProjectName = async (req, res) => {
  try {
    // Fetch all project proposals with student & supervisor details
    const proposals = await ProjectSchema.find()
      .populate('studentId', 'username email')
      .populate('supervisorId', 'username email');

    const projectMap = {};

    // Group all proposals by project name
    proposals.forEach(proposal => {
      const projectName = proposal.projectName || 'Untitled Project';
      if (!projectMap[projectName]) {
        projectMap[projectName] = [];
      }
      projectMap[projectName].push(proposal);
    });

    const groupedProjects = [];

    // Filter only projects with exactly 2 students
    Object.keys(projectMap).forEach(projectName => {
      const students = projectMap[projectName];

      if (students.length === 2) {
        const [student1, student2] = students;

        groupedProjects.push({
          projectName,
          studentNameOne: student1.studentId?.username || 'N/A',
          studentEmailOne: student1.studentId?.email || 'N/A',
          studentNameTwo: student2.studentId?.username || 'N/A',
          studentEmailTwo: student2.studentId?.email || 'N/A',
          supervisorName: student1.supervisorId?.username || 'N/A',
          supervisorEmail: student1.supervisorId?.email || 'N/A',
          projectId: student1.projectId || 'Not Assigned'
        });
      }
    });

    res.status(200).json({
      message: "✅ Projects with exactly 2 students grouped",
      groupedProjects
    });

  } catch (error) {
    console.error("❌ Error fetching grouped students:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// POST: Assign evaluators + projectId manually to a group with same project name
// exports.manualAssignProjectAndEvaluators = async (req, res) => {
//   try {
//     const { projectId, projectName, evaluatorOneEmail, evaluatorTwoEmail } = req.body;

//     // Validate input
//     if (!projectId || !evaluatorOneEmail || !evaluatorTwoEmail ||!projectName) {
//       return res.status(400).json({ message: "projectId, projectName, evaluatorOneEmail, and evaluatorTwoEmail are required." });
//     }

//     // Step 1: Find unassigned groups (students with same projectName, no projectId)
//     const proposals = await ProjectSchema.find({ projectId: null })
//       .populate("studentId", "username email")
//       .populate("supervisorId", "username email");

//     // Group proposals by projectName
//     const groupedByProjectName = {};
//     for (const proposal of proposals) {
//       const name = proposal.projectName.trim();
//       if (!groupedByProjectName[name]) groupedByProjectName[name] = [];
//       groupedByProjectName[name].push(proposal);
//     }

//     // Step 2: Find a group of exactly 2 students without a projectId
//     let selectedGroup = null;
//     let selectedProjectName = projectName;
//     for (const [projectName, group] of Object.entries(groupedByProjectName)) {
//       if (group.length === 2) {
//         selectedGroup = group;
//         selectedProjectName = projectName;
//         break;
//       }
//     }

//     if (!selectedGroup) {
//       return res.status(404).json({ message: "No unassigned group with exactly 2 students found." });
//     }

//     // Step 3: Find evaluators
//     const evaluatorOne = await Evaluator.findOne({ email: evaluatorOneEmail });
//     const evaluatorTwo = await Evaluator.findOne({ email: evaluatorTwoEmail });

//     if (!evaluatorOne || !evaluatorTwo) {
//       return res.status(404).json({ message: "Evaluator(s) not found by provided email." });
//     }

//     // Step 4: Update both students’ proposals
//     await Promise.all(
//       selectedGroup.map(p =>
//         ProjectSchema.findByIdAndUpdate(p._id, {
//           projectId,
//           evaluators: [evaluatorOne._id, evaluatorTwo._id]
//         })
//       )
//     );

//     // Step 5: Response
//     const [p1, p2] = selectedGroup;

//     return res.status(200).json({
//       message: "Project ID and evaluators assigned successfully.",
//       group: {
//         projectId,
//         projectName: selectedProjectName,
//         studentOneName: p1.studentId.username,
//         studentOneEmail: p1.studentId.email,
//         studentTwoName: p2.studentId.username,
//         studentTwoEmail: p2.studentId.email,
//         supervisorName: p1.supervisorId.username,
//         supervisorEmail: p1.supervisorId.email,
//         evaluatorOneName: evaluatorOne.username,
//         evaluatorOneEmail: evaluatorOne.email,
//         evaluatorTwoName: evaluatorTwo.username,
//         evaluatorTwoEmail: evaluatorTwo.email,
//       }
//     });

//   } catch (error) {
//     console.error("Error assigning evaluators and projectId:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// POST: Assign evaluators + projectId manually to a group with same project name 

exports.manualAssignProjectAndEvaluators = async (req, res) => {
  try {
    const { projectId, projectName, evaluatorOneEmail, evaluatorTwoEmail } = req.body;

    // Validate input
    if (!projectId || !evaluatorOneEmail || !evaluatorTwoEmail || !projectName) {
      return res.status(400).json({
        message: "projectId, projectName, evaluatorOneEmail, and evaluatorTwoEmail are required."
      });
    }

    // Step 1: Find unassigned groups with same project name and no projectId
    const proposals = await ProjectSchema.find({ projectId: null })
      .populate("studentId", "username email")
      .populate("supervisorId", "username email");

    // Group proposals by projectName
    const groupedByProjectName = {};
    for (const proposal of proposals) {
      const name = proposal.projectName.trim();
      if (!groupedByProjectName[name]) groupedByProjectName[name] = [];
      groupedByProjectName[name].push(proposal);
    }

    const selectedGroup = groupedByProjectName[projectName];

    if (!selectedGroup || selectedGroup.length !== 2) {
      return res.status(404).json({
        message: "No group with exactly 2 students found for the specified project name."
      });
    }

    // Step 2: Find evaluators
    const evaluatorOne = await Evaluator.findOne({ email: evaluatorOneEmail });
    const evaluatorTwo = await Evaluator.findOne({ email: evaluatorTwoEmail });

    if (!evaluatorOne || !evaluatorTwo) {
      return res.status(404).json({ message: "Evaluator(s) not found by provided email." });
    }

    // Step 3: Update both students’ project proposal with projectId and evaluators
    await Promise.all(
      selectedGroup.map(p =>
        ProjectSchema.findByIdAndUpdate(p._id, {
          projectId,
          evaluators: [evaluatorOne._id, evaluatorTwo._id]
        })
      )
    );

  // Step 4: Add student info (ID, name, email) to evaluators' studentsAssigned list
for (const proposal of selectedGroup) {
  const studentId = proposal.studentId._id;
  const studentName = proposal.studentId.username;
  const studentEmail = proposal.studentId.email;

  const studentEntry = {
    studentId,
    studentName,
    studentEmail,
    status: 'isAssigned'
  };

  await Evaluator.updateOne(
    { _id: evaluatorOne._id },
    { $addToSet: { studentsAssigned: studentEntry } }
  );

  await Evaluator.updateOne(
    { _id: evaluatorTwo._id },
    { $addToSet: { studentsAssigned: studentEntry } }
  );
}


    const [p1, p2] = selectedGroup;

    // Step 5: Send Response
    return res.status(200).json({
      message: "Project ID and evaluators assigned successfully.",
      group: {
        projectId,
        projectName,
        studentOneName: p1.studentId.username,
        studentOneEmail: p1.studentId.email,
        studentTwoName: p2.studentId.username,
        studentTwoEmail: p2.studentId.email,
        supervisorName: p1.supervisorId.username,
        supervisorEmail: p1.supervisorId.email,
        evaluatorOneName: evaluatorOne.username,
        evaluatorOneEmail: evaluatorOne.email,
        evaluatorTwoName: evaluatorTwo.username,
        evaluatorTwoEmail: evaluatorTwo.email,
      }
    });

  } catch (error) {
    console.error("Error assigning evaluators and projectId:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



module.exports.gradePhaseOneSubmission = async (req, res) => {
  let { studentEmail, phaseNumberOne, grade, feedback, role, graderEmail } = req.body;

  try {
    if (!['evaluatorOne', 'evaluatorTwo'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role provided' });
    }

    if (!phaseNumberOne) {
      return res.status(400).json({ success: false, error: 'phaseNumberOne is required' });
    }

    const submission = await FypSubmissionSchema.findOne({
      studentEmail,
      phaseNumberOne: phaseNumberOne.toString()
    });

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    // ✅ Ensure gradedBy is initialized
    submission.gradedBy = submission.gradedBy || {};

    if (role === 'evaluatorOne') {
      if (submission.EvaluatorEmailOne !== graderEmail) {
        return res.status(403).json({ success: false, error: 'Unauthorized grader for evaluatorOne' });
      }

      submission.evaluatorOneMarks = grade;
      submission.evaluatorOneFeedback = feedback;
      submission.gradedBy.evaluatorOne = true;
    }

    if (role === 'evaluatorTwo') {
      if (submission.EvaluatorEmailTwo !== graderEmail) {
        return res.status(403).json({ success: false, error: 'Unauthorized grader for evaluatorTwo' });
      }

      submission.evaluatorTwoMarks = grade;
      submission.evaluatorTwoFeedback = feedback;
      submission.gradedBy.evaluatorTwo = true;
    }

    if (submission.gradedBy.evaluatorOne && submission.gradedBy.evaluatorTwo) {
      submission.grading = 'fullyGraded';
    }

    await submission.save();

    await EvaluatorSchema.findOneAndUpdate(
      { email: graderEmail },
      {
        $push: {
          gradingHistory: {
            studentEmail,
            phase: 'Phase 1',
            grade,
            feedback
          }
        }
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `${role} grading saved successfully.`,
      submission
    });

  } catch (error) {
    console.error('Error grading phase 1 submission:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};


// module.exports.gradePhaseTwoSubmission = async (req, res) => {
//   let { studentEmail, phaseNumberTwo, grade, feedback, role, graderEmail } = req.body;

//   try {
//     if (!['evaluatorOne', 'evaluatorTwo'].includes(role)) {
//       return res.status(400).json({ success: false, error: 'Invalid role provided' });
//     }

//     if (!phaseNumberTwo) {
//       return res.status(400).json({ success: false, error: 'phaseNumberTwo is required' });
//     }

//     const submission = await FypSubmissionSchema.findOne({
//       studentEmail,
//       phaseNumberTwo: phaseNumberTwo.toString()
//     });

//     if (!submission) {
//       return res.status(404).json({ success: false, error: 'Submission not found' });
//     }

//     // ✅ Ensure gradedBy is initialized
//     submission.gradedBy = submission.gradedBy || {};

//     if (role === 'evaluatorOne') {
//       if (submission.EvaluatorEmailOne !== graderEmail) {
//         return res.status(403).json({ success: false, error: 'Unauthorized grader for evaluatorOne' });
//       }

//       submission.evaluatorOneMarks = grade;
//       submission.evaluatorOneFeedback = feedback;
//       submission.gradedBy.evaluatorOne = true;
//     }

//     if (role === 'evaluatorTwo') {
//       if (submission.EvaluatorEmailTwo !== graderEmail) {
//         return res.status(403).json({ success: false, error: 'Unauthorized grader for evaluatorTwo' });
//       }

//       submission.evaluatorTwoMarks = grade;
//       submission.evaluatorTwoFeedback = feedback;
//       submission.gradedBy.evaluatorTwo = true;
//     }

//     if (submission.gradedBy.evaluatorOne && submission.gradedBy.evaluatorTwo) {
//       submission.grading = 'fullyGraded';
//     }

//     await submission.save();

//     await EvaluatorSchema.findOneAndUpdate(
//       { email: graderEmail },
//       {
//         $push: {
//           gradingHistory: {
//             studentEmail,
//             phase: 'Phase 2',
//             grade,
//             feedback
//           }
//         }
//       },
//       { upsert: true, new: true }
//     );

//     return res.status(200).json({
//       success: true,
//       message: `${role} grading saved successfully.`,
//       submission
//     });

//   } catch (error) {
//     console.error('Error grading phase 2 submission:', error.message);
//     return res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// };



module.exports.gradePhaseTwoSubmission = async (req, res) => {
  const { studentEmail, phaseNumberTwo, grade, feedback, role, graderEmail } = req.body;

  try {
    // Validate required fields
    if (!studentEmail || !phaseNumberTwo || grade === undefined || !feedback || !graderEmail) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields (studentEmail, phaseNumberTwo, grade, feedback, or graderEmail)' 
      });
    }

    // Validate role
    if (!['evaluatorOne', 'evaluatorTwo'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role provided. Must be either evaluatorOne or evaluatorTwo' 
      });
    }

    // Validate grade is a number
    if (typeof grade !== 'number' || isNaN(grade)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Grade must be a valid number' 
      });
    }

    // Find the submission
    const submission = await FypSubmissionSchema.findOne({
      studentEmail,
      phaseNumberTwo: phaseNumberTwo.toString()
    });

    if (!submission) {
      return res.status(404).json({ 
        success: false, 
        error: 'Phase 2 submission not found for this student' 
      });
    }

    // Verify grader authorization
    const evaluatorField = `EvaluatorEmail${role === 'evaluatorOne' ? 'One' : 'Two'}`;
    if (submission[evaluatorField] !== graderEmail) {
      return res.status(403).json({ 
        success: false, 
        error: `Unauthorized: You are not assigned as ${role} for this submission` 
      });
    }

    // Update marks and feedback
    const marksField = `${role}Marks`;
    const feedbackField = `${role}Feedback`;
    
    submission[marksField] = grade;
    submission[feedbackField] = feedback;
    
    // Initialize gradedBy if it doesn't exist
    submission.gradedBy = submission.gradedBy || { 
      evaluatorOne: false, 
      evaluatorTwo: false 
    };
    
    // Update grading status
    submission.gradedBy[role] = true;

    // Check if fully graded
    const isFullyGraded = submission.gradedBy.evaluatorOne && submission.gradedBy.evaluatorTwo;
    submission.grading = isFullyGraded ? 'fullyGraded' : 'partiallyGraded';

    // Save the submission
    await submission.save();

    // Update evaluator's grading history
    await EvaluatorSchema.findOneAndUpdate(
      { email: graderEmail },
      {
        $push: {
          gradingHistory: {
            studentEmail,
            phase: 'Phase 2',
            grade,
            feedback,
            gradedAt: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `${role} grading saved successfully for Phase 2`,
      data: {
        studentEmail,
        phase: 'Phase 2',
        grade,
        feedback,
        gradingStatus: submission.grading
      }
    });

  } catch (error) {
    console.error('Error grading Phase 2 submission:', {
      error: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error during Phase 2 grading',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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



// // Get list of accepted supervisor-student pairs
// module.exports.getAcceptedRequests = async (req, res) => {
//     try {
//         const students = await Student.find({ 'supervisorRequest.status': 'accepted' })
//             .populate({
//                 path: 'supervisorRequest.supervisor',
//                 select: 'id username email domain office position'  // ✅ Selecting relevant fields
//             })
//             .populate({
//                 path: 'supervisorRequest.projectProposal',
//                 select: 'projectName proposalFile'
//             });

//         // Format response
//         const formattedRequests = students.map(student => ({
//             student: {
//                 username: student.username || "Unknown",
//                 email: student.email || "No email",
//                 status: student.supervisorRequest?.status || "No status"
//             },
//             supervisor: student.supervisorRequest?.supervisor
//                 ? {
//                     username: student.supervisorRequest.supervisor.username || "Unknown",
//                     email: student.supervisorRequest.supervisor.email || "No email",
//                     domain: student.supervisorRequest.supervisor.domain || "No domain",
//                     office: student.supervisorRequest.supervisor.office || "No office",
//                     position: student.supervisorRequest.supervisor.position || "No position"
//                 }
//                 : "No supervisor assigned",
//             projectProposal: student.supervisorRequest?.projectProposal
//                 ? {
//                     projectName: student.supervisorRequest.projectProposal.projectName,
//                     proposalFile: student.supervisorRequest.projectProposal.proposalFile
//                 }
//                 : "No project proposal"
//         }));

//         console.log("These Supervisors have Accepted the Students' Requests", formattedRequests);

//         res.status(200).json({
//             message: "These Supervisors have Accepted the Students' Requests and their details are shown below",
//             formattedRequests
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
//             status: student.supervisorRequest.status,
//             projectProposal :student.supervisorRequest.projectProposal,
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
module.exports.getAcceptedRequests = async (req, res) => {
    try {
        const students = await Student.find({ 'supervisorRequest.status': 'accepted' })
            .populate({
                path: 'supervisorRequest.supervisor',
                select: 'username email'
            });

        // Fetch all project proposals
        const allProposals = await ProjectProposal.find({}, 'studentId projectName proposalFile');

        // Create a quick lookup map for proposals by studentId
        const proposalMap = new Map();
        allProposals.forEach(p => {
            proposalMap.set(p.studentId.toString(), {
                projectName: p.projectName,
                // proposalFile: p.proposalFile
            });
        });

        const acceptedRequests = students.map(student => {
            const supervisor = student.supervisorRequest?.supervisor;
            const studentIdStr = student._id.toString();
            const projectProposal = proposalMap.get(studentIdStr);

            return {
                studentId: student._id,
                studentName: student.username || "Unknown",
                studentEmail: student.email || "No email",

                supervisorName: supervisor?.username || "Unknown",
                supervisorEmail: supervisor?.email || "No email",

                status: student.supervisorRequest?.status || "No status",

                projectProposal: projectProposal || "No project proposal"
            };
        });

        res.status(200).json({
            message: "List of supervisors who have accepted students",
            acceptedRequests
        });

    } catch (err) {
        console.error("❌ Error fetching accepted requests:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Get list of rejected supervisor-student pairs
module.exports.getRejectedRequests = async (req, res) => {
    try {
        const students = await Student.find({ 'supervisorRequest.status': 'rejected' }).populate({
            path: 'supervisorRequest.supervisor',
            select: 'id username'
        });

        const rejectedRequests = students
            .filter(student => student.supervisorRequest && student.supervisorRequest.supervisor)
            .map(student => ({
                studentId: student.id,
                studentName: student.username || "Unknown",
                studentEmail: student.email || "No email",
                supervisorId: student.supervisorRequest.supervisor.id,
                supervisorName: student.supervisorRequest.supervisor.username || "Unknown",
                supervisorEmail: student.supervisorRequest.supervisor.email || "No email",
                status: student.supervisorRequest.status || "No status"
            }));
            
        console.log("✅ Accepted Supervisor-Student Pairs:", rejectedRequests);

        res.status(200).json({
            message: "List of supervisors who have accepted students",
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


// Create Evaluator
module.exports.addEvaluator = async (req, res) => {
    try {
        const { username, email, office,domain } = req.body;
        const newEvaluator = new Evaluator({ username, email, office,domain });
        const response = await newEvaluator.save();
        console.log('Evaluator data saved');
        res.status(200).json({ message: "Evaluator data is added successfully", response });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get Evaluators
module.exports.getEvaluators = async (req, res) => {
    try {
        const data = await Evaluator.find().select('email username office domain');
        console.log('Evaluator data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Evaluator
module.exports.updateEvaluator = async (req, res) => {
    try {
        const evaluatorId = req.params.id;
        const updatedEvaluatorData = req.body;

        const response = await Evaluator.findByIdAndUpdate(evaluatorId, updatedEvaluatorData, {
            new: true, // Return the updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }

        console.log('Evaluator data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete Evaluator
module.exports.deleteEvaluator = async (req, res) => {
    try {
        const evaluatorId = req.params.id;

        const response = await Evaluator.findByIdAndDelete(evaluatorId);

        if (!response) {
            return res.status(404).json({ error: 'Evaluator not found' });
        }

        console.log('Evaluator data deleted');
        res.status(200).json({ message: 'Evaluator deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

//assign evaluator to student
module.exports.assignEvaluator = async (req, res) => {
    try {
        const { evaluatorEmail, studentEmail } = req.body;
        const evaluator = await Evaluator.findById(evaluatorId);
        const student = await Student.findById(studentId);

        if (!evaluator || !student) {
            return res.status(404).json({ error: 'Evaluator or Student not found' });
        }

        // Check if the student is already assigned to the evaluator
        const isAlreadyAssigned = evaluator.studentsAssigned.some(
            (assignment) => assignment.student.toString() === studentId
        );

        if (isAlreadyAssigned) {
            return res.status(400).json({ error: 'Student is already assigned to this evaluator' });
        }

        // Assign the student to the evaluator
        evaluator.studentsAssigned.push({ student: studentId });
        await evaluator.save();

        console.log('Student assigned to evaluator successfully');
        res.status(200).json({ message: 'Student assigned to evaluator successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



module.exports.getSpecificFacultyProfile = async (req, res) => {
  const email = req.params.email;

  try {
    // Try to find the user in Supervisor collection
    const supervisor = await Supervisor.findOne({ email }).select('username email domain office position roles');

    // Try to find the user in Evaluator collection
    const evaluator = await Evaluator.findOne({ email }).select('username email domain office roles');

    if (!supervisor && !evaluator) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Merge data if user is both supervisor and evaluator
    let userProfile = {};
    let roles = [];

    if (supervisor) {
      userProfile = {
        username: supervisor.username,
        email: supervisor.email,
        domain: supervisor.domain,
        office: supervisor.office,
        position: supervisor.position,
      };
      if (supervisor.roles?.length) {
        roles = roles.concat(supervisor.roles);
      } else {
        roles.push("Supervisor");
      }
    }

    if (evaluator) {
      // If userProfile is empty (not supervisor), fill basic info from evaluator
      if (!supervisor) {
        userProfile = {
          username: evaluator.username,
          email: evaluator.email,
          domain: evaluator.domain,
          office: evaluator.office,
          position: "N/A", // if evaluator doesn't have position field
        };
      }
      if (evaluator.roles?.length) {
        roles = roles.concat(evaluator.roles);
      } else {
        roles.push("Evaluator");
      }
    }

    // Remove duplicate roles (if any)
    roles = [...new Set(roles)];

    // Add role field
    userProfile.role = roles.join(", ");

    res.status(200).json(userProfile);
  } catch (err) {
    console.error('Error fetching faculty profile by email:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





module.exports.getGroupedStudentsByProjectName = async (req, res) => {
  try {
    // Fetch all project proposals with student & supervisor details
    const proposals = await ProjectSchema.find()
      .populate('studentId', 'username email')
      .populate('supervisorId', 'username email');

    const projectMap = {};

    // Group proposals by composite key: projectName + supervisorEmail
    proposals.forEach(proposal => {
      const projectName = proposal.projectName || 'Untitled Project';
      const supervisorEmail = proposal.supervisorId?.email || 'unknown@supervisor.com';
      const key = `${projectName}|${supervisorEmail}`;

      if (!projectMap[key]) {
        projectMap[key] = new Map(); // Ensure no duplicate student emails
      }

      const studentEmail = proposal.studentId?.email;

      if (studentEmail) {
        projectMap[key].set(studentEmail, {
          studentName: proposal.studentId?.username || 'N/A',
          studentEmail,
          projectId: proposal.projectId || 'Not Assigned'
        });
      }
    });

    const groupedProjects = [];

    // Filter groups with exactly two unique students
    for (const [key, studentMap] of Object.entries(projectMap)) {
      if (studentMap.size === 2) {
        const [projectName, supervisorEmail] = key.split('|');
        const students = Array.from(studentMap.values());

        // Get supervisor name from any matching proposal
        const matchedProposal = proposals.find(
          p => p.projectName === projectName && p.supervisorId?.email === supervisorEmail
        );

        groupedProjects.push({
          projectName,
          supervisorName: matchedProposal?.supervisorId?.username || 'N/A',
          supervisorEmail,
          students
        });
      }
    }

    res.status(200).json({
      message: "✅ Projects grouped by supervisor and project name (2 students)",
      groupedProjects
    });

  } catch (error) {
    console.error("❌ Error fetching grouped students:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.manualAssignProjectAndEvaluators = async (req, res) => {
  try {
    const { projectId, projectName, evaluatorOneEmail, evaluatorTwoEmail } = req.body;

    // Validate input
    if (!projectId || !evaluatorOneEmail || !evaluatorTwoEmail || !projectName) {
      return res.status(400).json({
        message: "projectId, projectName, evaluatorOneEmail, and evaluatorTwoEmail are required."
      });
    }

    // Step 1: Fetch proposals with no assigned projectId
    const proposals = await ProjectSchema.find({ projectId: null })
      .populate("studentId", "username email")
      .populate("supervisorId", "username email");

    // Step 2: Group by project name (case-insensitive)
    const groupedByProjectName = {};
    for (const proposal of proposals) {
      const name = proposal.projectName?.trim().toLowerCase();
      if (!groupedByProjectName[name]) groupedByProjectName[name] = [];
      groupedByProjectName[name].push(proposal);
    }

    // Step 3: Match group by projectName
    const selectedGroup = groupedByProjectName[projectName.trim().toLowerCase()];

    // Debug logs
    console.log("Available project names:", Object.keys(groupedByProjectName));
    console.log("Selected group size:", selectedGroup?.length);

    if (!selectedGroup || selectedGroup.length < 2) {
      return res.status(404).json({
        message: "No group found with at least 2 students for the specified project name."
      });
    }

    // Step 4: Filter only valid proposals with studentId and supervisorId
    const validProposals = selectedGroup.filter(
      p => p.studentId && p.studentId._id && p.supervisorId
    );

    // Debug null studentIds
    selectedGroup.forEach((p, i) => {
      if (!p.studentId) {
        console.warn(`❗ Proposal #${i} in group "${projectName}" has no studentId`);
      }
    });

    if (validProposals.length !== 2) {
      return res.status(400).json({
        message: `Expected 2 valid student proposals for this project, but found ${validProposals.length}. Please check your data.`
      });
    }

    // Step 5: Fetch evaluator documents
    const evaluatorOne = await Evaluator.findOne({ email: evaluatorOneEmail });
    const evaluatorTwo = await Evaluator.findOne({ email: evaluatorTwoEmail });

    if (!evaluatorOne || !evaluatorTwo) {
      return res.status(404).json({
        message: "Evaluator(s) not found by provided email."
      });
    }

    // Step 6: Update proposals with projectId and evaluators
    await Promise.all(
      validProposals.map(p =>
        ProjectSchema.findByIdAndUpdate(p._id, {
          projectId,
          evaluatorOneEmail,
          evaluatorTwoEmail,
          evaluators: [evaluatorOne._id, evaluatorTwo._id]
        })
      )
    );

    // Step 7: Add students to evaluator's studentsAssigned
    for (const proposal of validProposals) {
      const studentId = proposal.studentId._id;
      const studentName = proposal.studentId.username;
      const studentEmail = proposal.studentId.email;

      const studentEntry = {
        studentId,
        studentName,
        studentEmail,
        status: 'isAssigned'
      };

      await Evaluator.updateOne(
        { _id: evaluatorOne._id },
        { $addToSet: { studentsAssigned: studentEntry } }
      );

      await Evaluator.updateOne(
        { _id: evaluatorTwo._id },
        { $addToSet: { studentsAssigned: studentEntry } }
      );
    }

    const [p1, p2] = validProposals;

    // Step 8: Response
    return res.status(200).json({
      message: "✅ Project ID and evaluators assigned successfully.",
      group: {
        projectId,
        projectName,
        studentOneName: p1.studentId.username,
        studentOneEmail: p1.studentId.email,
        studentTwoName: p2.studentId.username,
        studentTwoEmail: p2.studentId.email,
        supervisorName: p1.supervisorId.username,
        supervisorEmail: p1.supervisorId.email,
        evaluatorOneName: evaluatorOne.username,
        evaluatorOneEmail: evaluatorOne.email,
        evaluatorTwoName: evaluatorTwo.username,
        evaluatorTwoEmail: evaluatorTwo.email
      }
    });

  } catch (error) {
    console.error("❌ Error assigning evaluators and projectId:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// module.exports.getAllGroupedProjectsWithEvaluators = async (req, res) => {
//   try {
//     // Fetch all project proposals with student & supervisor details
//     const proposals = await ProjectSchema.find({
//       projectId: { $ne: null },
//       evaluatorOneEmail: { $ne: null },
//       evaluatorTwoEmail: { $ne: null }
//     })
//       .populate('studentId', 'username email')
//       .populate('supervisorId', 'username email');

//     const projectMap = {};

//     // Group by projectName + supervisorEmail
//     for (const proposal of proposals) {
//       const projectName = proposal.projectName?.trim() || 'Untitled Project';
//       const supervisorEmail = proposal.supervisorId?.email || 'unknown@supervisor.com';
//       const key = `${projectName}|${supervisorEmail}`;

//       if (!projectMap[key]) {
//         projectMap[key] = new Map();
//       }

//       const studentEmail = proposal.studentId?.email;
//       if (studentEmail) {
//         projectMap[key].set(studentEmail, {
//           studentName: proposal.studentId?.username || 'N/A',
//           studentEmail,
//           projectId: proposal.projectId,
//           evaluatorOneEmail: proposal.evaluatorOneEmail,
//           evaluatorTwoEmail: proposal.evaluatorTwoEmail
//         });
//       }
//     }

//     const groupedProjects = [];

//     for (const [key, studentMap] of Object.entries(projectMap)) {
//       if (studentMap.size === 2) {
//         const [projectName, supervisorEmail] = key.split('|');
//         const students = Array.from(studentMap.values());

//         const matchedProposal = proposals.find(
//           p => p.projectName === projectName && p.supervisorId?.email === supervisorEmail
//         );

//         const projectId = students[0].projectId;
//         const evaluatorOneEmail = students[0].evaluatorOneEmail;
//         const evaluatorTwoEmail = students[0].evaluatorTwoEmail;

//         groupedProjects.push({
//           projectName,
//           projectId,
//           supervisorName: matchedProposal?.supervisorId?.username || 'N/A',
//           supervisorEmail,
//           evaluatorOneEmail,
//           evaluatorTwoEmail,
//           students: students.map(s => ({
//             studentName: s.studentName,
//             studentEmail: s.studentEmail
//           }))
//         });
//       }
//     }

//     res.status(200).json({
//       message: "✅ Grouped projects with assigned projectId and evaluators only",
//       groupedProjects
//     });

//   } catch (error) {
//     console.error("❌ Error fetching assigned grouped projects:", error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };



module.exports.getAllGroupedProjectsWithEvaluators = async (req, res) => {
  try {
    const proposals = await ProjectSchema.find({
      projectId: { $ne: null },
      evaluatorOneEmail: { $ne: null },
      evaluatorTwoEmail: { $ne: null }
    })
      .populate('studentId', 'username email')
      .populate('supervisorId', 'username email');

    const projectMap = {};

    for (const proposal of proposals) {
      const projectName = proposal.projectName?.trim() || 'Untitled Project';
      const supervisorEmail = proposal.supervisorId?.email || 'unknown@supervisor.com';
      const key = `${projectName}|${supervisorEmail}`;

      if (!projectMap[key]) {
        projectMap[key] = new Map();
      }

      const student = proposal.studentId;
      const studentEmail = student?.email;

      if (studentEmail) {
        projectMap[key].set(studentEmail, {
          studentName: student.username,
          studentEmail,
          projectId: proposal.projectId,
          evaluatorOneEmail: proposal.evaluatorOneEmail,
          evaluatorTwoEmail: proposal.evaluatorTwoEmail
        });

        // Save evaluator info into Student model
        await Student.findOneAndUpdate(
          { email: studentEmail },
          {
            evaluatorOneEmail: proposal.evaluatorOneEmail,
            evaluatorTwoEmail: proposal.evaluatorTwoEmail
          },
          { new: true }
        );
      }
    }

    const groupedProjects = [];

    for (const [key, studentMap] of Object.entries(projectMap)) {
      if (studentMap.size === 2) {
        const [projectName, supervisorEmail] = key.split('|');
        const students = Array.from(studentMap.values());

        const matchedProposal = proposals.find(
          p => p.projectName === projectName && p.supervisorId?.email === supervisorEmail
        );

        const projectId = students[0].projectId;
        const evaluatorOneEmail = students[0].evaluatorOneEmail;
        const evaluatorTwoEmail = students[0].evaluatorTwoEmail;

        groupedProjects.push({
          projectName,
          projectId,
          supervisorName: matchedProposal?.supervisorId?.username || 'N/A',
          supervisorEmail,
          evaluatorOneEmail,
          evaluatorTwoEmail,
          students: students.map(s => ({
            studentName: s.studentName,
            studentEmail: s.studentEmail
          }))
        });
      }
    }

    res.status(200).json({
      message: "✅ Grouped projects with assigned evaluators and projectId",
      groupedProjects
    });

  } catch (error) {
    console.error("❌ Error fetching grouped projects:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
module.exports.updateAssignedProjectEvaluators = async (req, res) => {
  try {
    const { projectName, projectId, evaluatorOneEmail, evaluatorTwoEmail } = req.body;

    if (!projectName || !projectId || !evaluatorOneEmail || !evaluatorTwoEmail) {
      return res.status(400).json({ message: "All fields (projectName, projectId, evaluatorOneEmail, evaluatorTwoEmail) are required." });
    }

    // Fetch the two proposals associated with this project name
    const proposals = await ProjectSchema.find({ projectName: projectName.trim() }).populate("studentId");

    if (proposals.length !== 2) {
      return res.status(404).json({ message: "Group with exactly 2 students not found for the given project name." });
    }

    // Fetch new evaluator documents
    const evaluatorOne = await Evaluator.findOne({ email: evaluatorOneEmail });
    const evaluatorTwo = await Evaluator.findOne({ email: evaluatorTwoEmail });

    if (!evaluatorOne || !evaluatorTwo) {
      return res.status(404).json({ message: "One or both evaluators not found." });
    }

    // Remove students from all evaluators' assigned lists (clean old assignment)
    for (const proposal of proposals) {
      await Evaluator.updateMany(
        {},
        { $pull: { studentsAssigned: { studentId: proposal.studentId._id } } }
      );
    }

    // Update proposals and re-assign to new evaluators
    for (const proposal of proposals) {
      await ProjectSchema.findByIdAndUpdate(proposal._id, {
        projectId,
        evaluatorOneEmail,
        evaluatorTwoEmail,
        evaluators: [evaluatorOne._id, evaluatorTwo._id]
      });

      const studentEntry = {
        studentId: proposal.studentId._id,
        studentName: proposal.studentId.username,
        studentEmail: proposal.studentId.email,
        status: 'isAssigned'
      };

      await Evaluator.updateOne(
        { _id: evaluatorOne._id },
        { $addToSet: { studentsAssigned: studentEntry } }
      );

      await Evaluator.updateOne(
        { _id: evaluatorTwo._id },
        { $addToSet: { studentsAssigned: studentEntry } }
      );
    }

    return res.status(200).json({ message: "✅ Project assignment updated successfully." });

  } catch (error) {
    console.error("❌ Error updating assigned project evaluators:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};







module.exports.getRecentlyUpdatedFaculty = async (req, res) => {
  try {
    // Find the most recently updated supervisor and evaluator
    const [latestSupervisor] = await Supervisor.find().sort({ updatedAt: -1 });
    const [latestEvaluator] = await Evaluator.find().sort({ updatedAt: -1 });

    // Compare which one is more recent
    let latest = null;
    let roleType = '';

    if (latestSupervisor && latestEvaluator) {
      if (latestSupervisor.updatedAt > latestEvaluator.updatedAt) {
        latest = latestSupervisor;
        // Check if also exists as evaluator → role is 'both'
        const evaluatorExists = await Evaluator.findOne({ email: latest.email });
        roleType = evaluatorExists ? 'both' : 'supervisor';
      } else {
        latest = latestEvaluator;
        // Check if also exists as supervisor → role is 'both'
        const supervisorExists = await Supervisor.findOne({ email: latest.email });
        roleType = supervisorExists ? 'both' : 'evaluator';
      }
    } else if (latestSupervisor) {
      latest = latestSupervisor;
      const evaluatorExists = await Evaluator.findOne({ email: latest.email });
      roleType = evaluatorExists ? 'both' : 'supervisor';
    } else if (latestEvaluator) {
      latest = latestEvaluator;
      const supervisorExists = await Supervisor.findOne({ email: latest.email });
      roleType = supervisorExists ? 'both' : 'evaluator';
    }

    if (!latest) {
      return res.status(404).json({ message: 'No faculty members found' });
    }

    
    return res.status(200).json({
  username: latest.username,
  email: latest.email,
  domain: latest.domain || '',
  office: latest.office || '',
  roles: roleType === 'both' ? ['supervisor', 'evaluator'] : [roleType],
  updatedAt: latest.updatedAt,
  assignedAs: roleType   // 'supervisor' | 'evaluator' | 'both'
});


  } catch (error) {
    console.error('Error fetching latest updated faculty:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// after loading the page it sould show the updated role who were recently assigned by admin itself just show the role not buttons
module.exports.getFacultyWithRoles = async (req, res) => {
  try {
    const supervisors = await Supervisor.find().select('username email domain office position');
    const evaluators = await Evaluator.find().select('username email domain office');

    // Combine both lists and add role information
    const facultyList = [
      ...supervisors.map(f => ({ ...f.toObject(), role: 'supervisor' })),
      ...evaluators.map(f => ({ ...f.toObject(), role: 'evaluator' }))
    ];

    res.status(200).json(facultyList);
  } catch (err) {
    console.error('Error fetching faculty with roles:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports.assignFacultyRoles = async (req, res) => {
  const { email, roles, username, office = '', domain = '' } = req.body;

  if (!email || !Array.isArray(roles)) {
    return res.status(400).json({ error: 'Email and roles[] required' });
  }

  const validRoles = ['supervisor', 'evaluator', 'both'];
  const invalid = roles.filter(r => !validRoles.includes(r));
  if (invalid.length) {
    return res.status(400).json({ error: `Invalid roles: ${invalid.join(', ')}` });
  }

  try {
    // Assign Supervisor role
    if (roles.includes('supervisor') || roles.includes('both')) {
      await Supervisor.findOneAndUpdate(
        { email },
        { username, email, domain, office },
        { upsert: true, new: true }
      );
    } else {
      await Supervisor.findOneAndDelete({ email });
    }

    // Assign Evaluator role
    if (roles.includes('evaluator') || roles.includes('both')) {
      await Evaluator.findOneAndUpdate(
        { email },
        { username, email, domain, office },
        { upsert: true, new: true }
      );
    } else {
      await Evaluator.findOneAndDelete({ email });
    }

    return res.status(200).json({ message: 'Roles updated successfully', rolesAssigned: roles });
  } catch (err) {
    console.error('Error assigning roles:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports.assignRole = async (req, res) => {
  try {
    const { username, email, domain, office, roles } = req.body;

    if (!email || !roles || !roles.length) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const assignedRole =
      roles.includes('both') ? 'Both' :
      roles.includes('supervisor') ? 'Supervisor' :
      roles.includes('evaluator') ? 'Evaluator' : '';

    // Supervisor Role
    if (roles.includes('supervisor') || roles.includes('both')) {
      await Supervisor.findOneAndUpdate(
        { email },
        { username, email, domain, office, assignedRole },
        { upsert: true, new: true, timestamps: true }
      );
    } else {
      await Supervisor.findOneAndDelete({ email });
    }

    // Evaluator Role
    if (roles.includes('evaluator') || roles.includes('both')) {
      await Evaluator.findOneAndUpdate(
        { email },
        { username, email, domain, office, assignedRole },
        { upsert: true, new: true, timestamps: true }
      );
    } else {
      await Evaluator.findOneAndDelete({ email });
    }

    res.status(200).json({ success: true, message: 'Role assigned successfully' });
  } catch (err) {
    console.error('Error assigning role:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
module.exports.getRecentlyAssignedFaculty = async (req, res) => {
  try {
    const [supervisors, evaluators] = await Promise.all([
      Supervisor.find({}).sort({ updatedAt: -1 }),
      Evaluator.find({}).sort({ updatedAt: -1 })
    ]);

    const map = new Map();

    // Merge supervisors
    for (const sup of supervisors) {
      map.set(sup.email, {
        username: sup.username,
        email: sup.email,
        domain: sup.domain,
        office: sup.office,
        updatedAt: sup.updatedAt,
        roles: ['supervisor']
      });
    }

    // Merge evaluators
    for (const evalr of evaluators) {
      if (map.has(evalr.email)) {
        const existing = map.get(evalr.email);
        existing.roles.push('evaluator');
        existing.updatedAt = new Date(Math.max(existing.updatedAt, evalr.updatedAt));
      } else {
        map.set(evalr.email, {
          username: evalr.username,
          email: evalr.email,
          domain: evalr.domain,
          office: evalr.office,
          updatedAt: evalr.updatedAt,
          roles: ['evaluator']
        });
      }
    }

    // Convert map to array and attach role label
    const mergedList = Array.from(map.values())
      .map(fac => ({
        ...fac,
        role:
          fac.roles.includes('supervisor') && fac.roles.includes('evaluator')
            ? 'both'
            : fac.roles[0]
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt) // most recent first
      .slice(0, 5); // return top 5 recently updated

    return res.status(200).json(mergedList);
  } catch (err) {
    console.error('Error fetching recently assigned faculty:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



//now get the graded status which the evaluator has recently graded
module.exports.getRecentlyGradedSubmissions = async (req, res) => {
  try {
    const { email } = req.params;

    // Fetch evaluator's grading history
    const evaluator = await EvaluatorSchema.find({ email })
    .select('gradingHistory')
      .populate('gradingHistory.studentId', 'username email');
    if (!evaluator) {
      return res.status(404).json({ success: false, error: 'Evaluator not found' });
    }
    const gradedSubmissions = evaluator.gradingHistory
      .filter(entry => entry.phase === 'Phase 1')
      .map(entry => ({
        studentName: entry.studentId.username,
        studentEmail: entry.studentId.email,
        grade: entry.grade,
        feedback: entry.feedback,
        gradedAt: entry.gradedAt
      }))
      .sort((a, b) => new Date(b.gradedAt) - new Date(a.gradedAt)); // Sort by most recent grading
    if (gradedSubmissions.length === 0) {
      return res.status(404).json({ success: false, message: 'No graded submissions found' });
    }
    res.status(200).json({
      success: true,
      gradedSubmissions
    });
  } catch (error) {
    console.error('Error fetching graded submissions:', error.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};



module.exports.gradePhaseSubmission = async (req, res) => {
  const { studentEmail, grade, feedback, role, graderEmail, phase } = req.body;

  if (!['evaluatorOne', 'evaluatorTwo'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role provided' });
  }

  if (!['1', '2'].includes(phase)) {
    return res.status(400).json({ success: false, error: 'Invalid phase number' });
  }

  try {
    // Find the correct phase document
    const phaseField = phase === '1' ? 'phaseNumberOne' : 'phaseNumberTwo';

    const query = {
      studentEmail,
      [phaseField]: phase
    };

    const submission = await FypSubmissionSchema.findOne(query);

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    // Authorization & Grading Logic
    if (role === 'evaluatorOne') {
      if (submission.EvaluatorEmailOne !== graderEmail)
        return res.status(403).json({ success: false, error: 'Unauthorized grader' });

      submission.evaluatorOneMarks = grade;
      submission.evaluatorOneFeedback = feedback;
      submission.gradedBy.evaluatorOne = true;
    }

    if (role === 'evaluatorTwo') {
      if (submission.EvaluatorEmailTwo !== graderEmail)
        return res.status(403).json({ success: false, error: 'Unauthorized grader' });

      submission.evaluatorTwoMarks = grade;
      submission.evaluatorTwoFeedback = feedback;
      submission.gradedBy.evaluatorTwo = true;
    }

    // Check for fully graded
    if (submission.gradedBy.evaluatorOne && submission.gradedBy.evaluatorTwo) {
      submission.grading = 'fullyGraded';
    }

    await submission.save();

    res.status(200).json({
      success: true,
      message: `${role} grading saved successfully.`,
      submission
    });

  } catch (error) {
    console.error('Grading error:', error.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};



module.exports.gradePhaseOneSubmission = async (req, res) => {
  const { studentEmail, phaseNumberOne, grade, feedback, role, graderEmail } = req.body;

  if (!['evaluatorOne', 'evaluatorTwo'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role provided' });
  }

  try {
    // Fetch FYP submission
    const submission = await FypSubmissionSchema.findOne({
      studentEmail,
      phaseNumberOne: phaseNumberOne.toString()
    });

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    // Authorization check & update marks
    if (role === 'evaluatorOne') {
      if (submission.EvaluatorEmailOne !== graderEmail)
        return res.status(403).json({ success: false, error: 'Unauthorized grader' });

      submission.evaluatorOneMarks = grade;
      submission.evaluatorOneFeedback = feedback;
      submission.gradedBy.evaluatorOne = true;
    }

    if (role === 'evaluatorTwo') {
      if (submission.EvaluatorEmailTwo !== graderEmail)
        return res.status(403).json({ success: false, error: 'Unauthorized grader' });

      submission.evaluatorTwoMarks = grade;
      submission.evaluatorTwoFeedback = feedback;
      submission.gradedBy.evaluatorTwo = true;
    }

    // Set grading status if both have graded
    if (submission.gradedBy.evaluatorOne && submission.gradedBy.evaluatorTwo) {
      submission.grading = 'fullyGraded';
    }

    await submission.save();

    // Add grade entry to EvaluatorSchema
    await Evaluator.findOneAndUpdate(
      { email: graderEmail },
      {
        $push: {
          gradingHistory: {
            studentEmail,
            phase: `Phase 1`,
            grade,
            feedback
          }
        }
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: `${role} grading saved successfully.`,
      submission
    });

  } catch (error) {
    console.error('Error grading submission:', error.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


module.exports.gradePhaseTwoSubmission = async (req, res) => {
  const { studentEmail, phaseNumberTwo, grade, feedback, role, graderEmail } = req.body;

  try {
    // Validate role strictly
    if (role !== 'evaluatorOne' && role !== 'evaluatorTwo') {
      return res.status(400).json({ success: false, error: 'Invalid role provided' });
    }

    // Find the submission for the student for phase 2
    const submission = await FypSubmissionSchema.findOne({
      studentEmail,
      phaseNumberTwo: phaseNumberTwo.toString()
    });

    if (!submission) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    // Authorization and grading logic
    if (role === 'evaluatorOne') {
      if (submission.EvaluatorEmailOne !== graderEmail) {
        return res.status(403).json({ success: false, error: 'Unauthorized grader for evaluatorOne' });
      }

      submission.evaluatorOneMarks = grade;
      submission.evaluatorOneFeedback = feedback;
      submission.gradedBy = submission.gradedBy || {};
      submission.gradedBy.evaluatorOne = true;
    }

    if (role === 'evaluatorTwo') {
      if (submission.EvaluatorEmailTwo !== graderEmail) {
        return res.status(403).json({ success: false, error: 'Unauthorized grader for evaluatorTwo' });
      }

      submission.evaluatorTwoMarks = grade;
      submission.evaluatorTwoFeedback = feedback;
      submission.gradedBy = submission.gradedBy || {};
      submission.gradedBy.evaluatorTwo = true;
    }

    // Update grading status
    if (submission.gradedBy?.evaluatorOne && submission.gradedBy?.evaluatorTwo) {
      submission.grading = 'fullyGraded';
    }

    await submission.save();

    // Update Evaluator grading history
    await Evaluator.findOneAndUpdate(
      { email: graderEmail },
      {
        $push: {
          gradingHistory: {
            studentEmail,
            phase: 'Phase 2',
            grade,
            feedback,
            date: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `${role} grading saved successfully.`,
      updatedGradingStatus: submission.grading
    });

  } catch (error) {
    console.error('Error grading phase 2 submission:', error.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};  


module.exports.getGradingListByEvaluator = async (req, res) => {
  const { email, evaluatorRole } = req.params;

  if (!['evaluatorOne', 'evaluatorTwo'].includes(evaluatorRole)) {
    return res.status(400).json({ success: false, error: 'Invalid evaluator role' });
  }

  try {
    let query = {};
    if (evaluatorRole === 'evaluatorOne') {
      query = { EvaluatorEmailOne: email };
    } else if (evaluatorRole === 'evaluatorTwo') {
      query = { EvaluatorEmailTwo: email };
    }

    const submissions = await FypSubmissionSchema.find(query);

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ success: false, error: 'No submissions found for this evaluator' });
    }

    const gradingList = submissions.map(sub => ({
      studentEmail: sub.studentEmail,
      projectName: sub.projectName,
      marks: evaluatorRole === 'evaluatorOne' ? sub.evaluatorOneMarks : sub.evaluatorTwoMarks,
      feedback: evaluatorRole === 'evaluatorOne' ? sub.evaluatorOneFeedback : sub.evaluatorTwoFeedback,
      gradingStatus: sub.grading
    }));

    res.status(200).json({ success: true, gradingList });

  } catch (error) {
    console.error('Error fetching grading list:', error.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};



const ChapterWiseSubmission = require('../models/ChapterWiseSubmission');
module.exports.getAllStudentGrades = async (req, res) => {
  try {
    // Step 1: Get supervisor grades from ChapterWiseSubmission
    const chapterSubmissions = await ChapterWiseSubmission.aggregate([
      {
        $group: {
          _id: '$studentEmail',
          supervisorTotalMarks: { $sum: '$marks' }
        }
      }
    ]);

    // Extract student emails
    const studentEmails = chapterSubmissions.map(item => item._id);

    // Step 2: Get evaluator grades from FypSubmissionSchema
    const fypSubmissions = await FypSubmissionSchema.find({
      studentEmail: { $in: studentEmails }
    });

    // Step 3: Merge supervisor + evaluator grades by studentEmail
    const combinedData = chapterSubmissions.map(chapter => {
      const fyp = fypSubmissions.find(f => f.studentEmail === chapter._id);

      return {
        student: chapter._id,
        supervisor: chapter.supervisorTotalMarks,
        evaluator1: fyp ? fyp.evaluatorOneMarks : 0,
        evaluator2: fyp ? fyp.evaluatorTwoMarks : 0
      };
    });

    res.status(200).json({
      success: true,
      grades: combinedData
    });

  } catch (error) {
    console.error('Error fetching grades:', error.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};


module.exports.updateFacultyProfile = async (req, res) => {
  const email = req.params.email;
  const { domain, office, position } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    // Try updating Supervisor
    let updatedSupervisor = await Supervisor.findOneAndUpdate(
      { email },
      { domain, office, position },
      { new: true }
    );

    // Try updating Evaluator
    let updatedEvaluator = await Evaluator.findOneAndUpdate(
      { email },
      { domain, office },
      { new: true }
    );

    // If no faculty found
    if (!updatedSupervisor && !updatedEvaluator) {
      return res.status(404).json({ success: false, message: 'Faculty not found in either Supervisor or Evaluator' });
    }

    // Re-fetch the updated document(s) to ensure correct saving
    if (updatedSupervisor) {
      updatedSupervisor = await Supervisor.findOne({ email });
    }
    if (updatedEvaluator) {
      updatedEvaluator = await Evaluator.findOne({ email });
    }

    res.status(200).json({
      success: true,
      message: 'Faculty profile updated successfully',
      supervisor: updatedSupervisor || null,
      evaluator: updatedEvaluator || null
    });

  } catch (error) {
    console.error('Error updating faculty profile:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

