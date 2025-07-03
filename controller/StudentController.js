const Student = require('../models/Student');
const Supervisor = require('../models/Supervisor');
const ProjectSchema = require('../models/ProjectSchema');
const ChapterWiseSubmission = require('../models/ChapterWiseSubmission');
const FypSubmissionSchema = require('./../models/FYPSubmissionSchema');
const path = require('path');
const Evaluator = require('./../models/Evaluator')

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

module.exports.getStudentIdByPostingEmail = async (req, res) => {
  try {
    const email = req.body.email;
    const student = await Student.findOne({ email });
    res.status(200).json({ message: 'Student Email', studentId: student._id });
  } catch (error) {
    console.error("Error fetching student ID by email:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ POST: Get assigned supervisorId and email using studentEmail
module.exports.getSupervisorIdByStudentEmail = async (req, res) => {
  try {
    const { studentEmail } = req.body;

    if (!studentEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Assuming schema uses `email` not `studentEmail`
    const student = await Student.findOne({ email: studentEmail })
      .populate({
        path: 'supervisorRequest.supervisor',
        select: '_id username email'
      });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    let supervisorId = null;
    let supervisorEmail = null;

    if (Array.isArray(student.supervisorRequest)) {
      const acceptedRequest = student.supervisorRequest.find(req => req.status === 'accepted');
      supervisorId = acceptedRequest?.supervisor?._id || null;
      supervisorEmail = acceptedRequest?.supervisor?.email || null;
    } else if (typeof student.supervisorRequest === 'object' && student.supervisorRequest !== null) {
      if (student.supervisorRequest.status === 'accepted') {
        supervisorId = student.supervisorRequest.supervisor?._id || null;
        supervisorEmail = student.supervisorRequest.supervisor?.email || null;
      }
    }

    if (!supervisorId || !supervisorEmail) {
      return res.status(404).json({ message: "Supervisor not assigned to this student" });
    }

    res.status(200).json({
      supervisorId,
      supervisorEmail,
    });
  } catch (error) {
    console.error("❌ Error fetching supervisor ID by student email:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get student by ID


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
    // ✅ Check if student already sent a request
    // if (student.supervisorRequest && ['pending', 'accepted'].includes(student.supervisorRequest.status)) {
    //   return res.status(400).json({
    //     error: `You have already sent a request to ${student.supervisorRequest.supervisorName} which is currently ${student.supervisorRequest.status}. You cannot send another request at this time.`
    //   });
    // }

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
    const fileLink = `${req.protocol}://${req.get('host')}/file/view-file/${req.file.filename}`;

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


module.exports.getRequestStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate({
        path: 'supervisorRequest.supervisor',
        select: '_id username email'
      })
      .populate({
        path: 'supervisorRequest.projectProposal',
        model: 'ProjectProposal',
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
        status: request.status || "Pending",
        projectProposal: request.projectProposal ? {
          projectName: request.projectProposal.projectName || null,
          proposalFile: request.projectProposal.proposalFile
            ? `${req.protocol}://${req.get('host')}/file/view-file/${request.projectProposal.proposalFile}`
            : null
        } : null
      }));
    } else if (typeof student.supervisorRequest === 'object' && student.supervisorRequest !== null) {
      const request = student.supervisorRequest;
      requests.push({
        supervisorId: request.supervisor?._id || null,
        supervisorName: request.supervisor?.username || null,
        supervisorEmail: request.supervisor?.email || null,
        status: request.status || "Pending",
        projectProposal: request.projectProposal ? {
          projectName: request.projectProposal.projectName || null,
          proposalFile: request.projectProposal.proposalFile
            ? `${req.protocol}://${req.get('host')}/file/view-file/${request.projectProposal.proposalFile}`
            : null
        } : null
      });
    }

    const response = {
      msg: "Supervisor Responses for Student",
      studentId: student._id,
      studentUsername: student.username,
      studentEmail: student.email,
      requestStatus: requests
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("❌ Error fetching request status:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// module.exports.getRequestStatus = async (req, res) => {
//     try {
//         const student = await Student.findById(req.params.studentId)
//             .populate({
//                 path: 'supervisorRequest.supervisor',
//                 select: '_id username email'
//             })
//             .populate({
//                 path: 'supervisorRequest.projectProposal',
//                 model: 'ProjectProposal',  // Correct case here
//                 select: 'projectName proposalFile'
//             })
//             .select('username email supervisorRequest');

//         if (!student) return res.status(404).json({ error: 'Student not found' });

//         console.log("Populated Student:", JSON.stringify(student, null, 2));  // Debug output

//         let requests = [];

//         if (Array.isArray(student.supervisorRequest)) {
//             requests = student.supervisorRequest.map((request) => ({
//                 supervisorId: request.supervisor?._id || null,
//                 supervisorName: request.supervisor?.username || null,
//                 supervisorEmail: request.supervisor?.email || null,
//                 status: request.status || "Pending",
//                 // projectProposal: request.projectProposal ? {
//                 //     projectName: request.projectProposal.projectName || null,
//                 //     proposalFile: request.projectProposal.proposalFile ? 
//                 //         `${req.protocol}://${req.get('host')}/file/view-file/${request.projectProposal.proposalFile}` : null
//                 // } : null
//             }));
//         } else if (typeof student.supervisorRequest === 'object' && student.supervisorRequest !== null) {
//             requests.push({
//                 supervisorId: student.supervisorRequest.supervisor?._id || null,
//                 supervisorName: student.supervisorRequest.supervisor?.username || null,
//                 supervisorEmail: student.supervisorRequest.supervisor?.email || null,
//                 status: student.supervisorRequest.status || "Pending",
//                 // projectProposal: student.supervisorRequest.projectProposal ? {
//                 //     projectName: student.supervisorRequest.projectProposal.projectName || null,
//                 //     proposalFile: student.supervisorRequest.projectProposal.proposalFile ? 
//                 //         `${req.protocol}://${req.get('host')}/file/view-file/${student.supervisorRequest.projectProposal.proposalFile}` : null
//                 // } : null
//             });
//         }

//         const response = {
//             msg: "Supervisor Responses for Student",
//             studentId: student._id,
//             studentUsername: student.username,
//             studentEmail: student.email,
//             // projectName: student.supervisorRequest.projectProposal  ?student.supervisorRequest.projectProposal.projectName : null,
//             requestStatus: requests
//         };

//         console.log("✅ Supervisor Request Status:", JSON.stringify(response, null, 2));
//         res.status(200).json(response);
//     } catch (err) {
//         console.error("❌ Error fetching request status:", err.message);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };


module.exports.submitChapter = async (req, res) => {
  const { studentEmail, supervisorEmail } = req.params;
  const { chapterNumber, projectName } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  try {
    // Find student and supervisor by email
    const student = await Student.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const supervisor = await Supervisor.findOne({ email: supervisorEmail });
    if (!supervisor) return res.status(404).json({ error: 'Supervisor not found' });

    // Build the file URL
    const fileLink = `${req.protocol}://${req.get('host')}/file/view-file/${req.file.filename}`;


    const newSubmission = {
      studentEmail: studentEmail,
      supervisorEmail: supervisorEmail,
      projectName,
      chapterNumber,
      chapterFile: fileLink,
      status: 'Pending',
      grading: 'isNotGraded',
      marks: 0,
      feedback: ''
    };

    // Create new document and save it to DB
    const submission = new ChapterWiseSubmission(newSubmission);
    await submission.save();

    console.log(`Chapter ${chapterNumber} submission successful:`, submission);

    return res.status(201).json({
      message: `Chapter ${chapterNumber} submission successful!`,
      submission: submission.toObject()
    });

  } catch (err) {
    console.error(`Error in submitChapter ${chapterNumber}:`, err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports.getAcceptedProjectsByStudentEmail = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.params.email })
      .populate({
        path: 'supervisorRequest.supervisor',
        select: '_id username email'
      })
      .populate({
        path: 'supervisorRequest.projectProposal',
        model: 'ProjectProposal',
        select: 'projectName proposalFile'
      })

      .select('username email supervisorRequest');

    if (!student) return res.status(404).json({ error: 'Student not found' });

    const acceptedRequests = Array.isArray(student.supervisorRequest)
      ? student.supervisorRequest.filter(r => r.status === 'accepted')
      : student.supervisorRequest?.status === 'accepted'
        ? [student.supervisorRequest]
        : [];

    const acceptedProjects = acceptedRequests.map(request => ({
      supervisorId: request.supervisor?._id || null,
      supervisorName: request.supervisor?.username || null,
      supervisorEmail: request.supervisor?.email || null,
      projectName: request.projectProposal?.projectName || null,
      proposalFile: request.projectProposal?.proposalFile || null,
      status: request.status
    }));

    res.status(200).json({
      msg: "Accepted Supervisor Projects for Student",
      studentId: student._id,
      studentUsername: student.username,
      studentEmail: student.email,
      acceptedProjects
    });

  } catch (err) {
    console.error("❌ Error fetching accepted projects:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
//get assigned supervisor id by posting student email



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


const ProjectProposal = require('.././models/ProjectSchema'); // adjust the relative path if needed

module.exports.getProjectNameByStudentEmail = async (req, res) => {
  try {
    // Find student by email
    const student = await Student.findOne({ email: req.params.email });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find all projects for this student
    const projects = await ProjectProposal.find({ studentId: student._id }).select('projectName');

    if (!projects || projects.length === 0) {
      return res.status(404).json({ message: 'No projects found for this student' });
    }

    // Extract project names from projects
    const projectNames = projects.map(project => project.projectName);

    res.json({ projectNames });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching project name' });
  }
};



//now show the supervisors submitted chapters grade and feedback response to student
module.exports.getSubmittedChaptersByStudentEmail = async (req, res) => {
  try {
    const { studentEmail } = req.params;

    // Find student by email
    const student = await Student.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    // Fetch all chapter submissions for this student
    const submissions = await ChapterWiseSubmission.find({ studentEmail })
      .populate('supervisorEmail', 'username email') // Populate supervisor details
      .select('chapterNumber chapterFile status grading marks feedback');

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: 'No chapter submissions found for this student' });
    }

    res.status(200).json({
      message: 'Chapter submissions retrieved successfully',
      submissions
    });

  } catch (err) {
    console.error("❌ Error fetching submitted chapters:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};







//Submission of phase one and phase two//

module.exports.submitPhaseOne = async (req, res) => {
  const { studentEmail, evaluatorEmailOne, evaluatorEmailTwo } = req.params;
  const { phaseNumberOne, projectName } = req.body;

  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  try {
    const student = await Student.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ error: 'Student not found' });

  
    const evaluatorOne = await Evaluator.findOne({ email: evaluatorEmailOne });
    if (!evaluatorOne) return res.status(404).json({ error: 'Evaluator 1 not found' });

    const evaluatorTwo = await Evaluator.findOne({ email: evaluatorEmailTwo });
    if (!evaluatorTwo) return res.status(404).json({ error: 'Evaluator 2 not found' });

    const fileLink = `${req.protocol}://${req.get('host')}/file/view-file/${req.file.filename}`;

    const newSubmission = new FypSubmissionSchema({
      studentEmail,
      EvaluatorEmailOne: evaluatorOne.email,
      EvaluatorEmailTwo: evaluatorTwo.email,
      projectName,
      phaseNumberOne: phaseNumberOne,
      projectFile: fileLink,
      status: 'Pending',
      grading: 'isNotGraded',
      marks: 0,
      feedback: ''
    });

    await newSubmission.save();

    console.log(`Phase ${phaseNumberOne} submission successful:`, newSubmission);
    res.status(201).json({
      message: `Phase ${phaseNumberOne} submission successful!`,
      submission: newSubmission.toObject()
    });

  } catch (err) {
    console.error(`Error in submitPhaseOne:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.submitPhaseTwo = async (req, res) => {
  const { studentEmail, evaluatorEmailOne, evaluatorEmailTwo } = req.params;
  const { phaseNumberTwo, projectName } = req.body;


  if (!req.file) {
    return res.status(400).json({ error: 'File is required' });
  }

  try {
    const student = await Student.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const evaluatorOne = await Evaluator.findOne({ email: evaluatorEmailOne });
    if (!evaluatorOne) return res.status(404).json({ error: 'Evaluator 1 not found' });

    const evaluatorTwo = await Evaluator.findOne({ email: evaluatorEmailTwo });
    if (!evaluatorTwo) return res.status(404).json({ error: 'Evaluator 2 not found' });

    const fileLink = `${req.protocol}://${req.get('host')}/file/view-file/${req.file.filename}`;

    const newSubmission = new FypSubmissionSchema({
      studentEmail,
      EvaluatorEmailOne: evaluatorOne.email,
      EvaluatorEmailTwo: evaluatorTwo.email,
      projectName,
      phaseNumberTwo:phaseNumberTwo,
      projectFile: fileLink,
      evaluatorOneMarks: 0,
      evaluatorTwoMarks: 0,
      evaluatorOneFeedback: '',
      evaluatorTwoFeedback: '',
      status: 'Pending',
      grading: 'isNotGraded',
      marks: 0,
      feedback: ''
     
    });

    await newSubmission.save();

    console.log(`✅ Phase ${phaseNumberTwo} submission successful:`, newSubmission);
    res.status(201).json({
      message: `✅ Phase ${phaseNumberTwo} submission successful!`,
      submission: newSubmission.toObject()
    });

  } catch (err) {
    console.error(`❌ Error in submitPhaseTwo:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



module.exports.getSubmittedPhaseOneByStudentEmail = async (req, res) => {
  try {
    const { studentEmail } = req.params;

    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const submissions = await FypSubmissionSchema.find({
      studentEmail,
      phaseNumberOne: "1"
    }).select('phaseNumberOne projectFile submittedAt projectName EvaluatorEmailOne EvaluatorEmailTwo grading marks feedback evaluatorOneMarks evaluatorTwoMarks evaluatorOneFeedback evaluatorTwoFeedback gradedBy');

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: 'No Phase 1 submissions found for this student' });
    }

    res.status(200).json({
      message: 'Phase 1 submissions retrieved successfully',
      submissions
    });

  } catch (err) {
    console.error("❌ Error fetching Phase 1 submissions:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.getSubmittedPhaseTwoByStudentEmail = async (req, res) => {
  try {
    const { studentEmail } = req.params;

    const student = await Student.findOne({ email: studentEmail });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const submissions = await FypSubmissionSchema.find({
      studentEmail,
      phaseNumberTwo: "2"
    }).select(
      'phaseNumberTwo projectFile submittedAt projectName EvaluatorEmailOne EvaluatorEmailTwo grading marks feedback evaluatorOneMarks evaluatorTwoMarks evaluatorOneFeedback evaluatorTwoFeedback gradedBy'
    );

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({ message: 'No Phase 2 submissions found for this student' });
    }

    res.status(200).json({
      message: '✅ Phase 2 submissions retrieved successfully',
      submissions
    });

  } catch (err) {
    console.error("❌ Error fetching Phase 2 submissions:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};




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