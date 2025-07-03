
const Supervisor = require('../models/Supervisor');
const Student = require('../models/Student');
const ChapterWiseSubmission = require('./../models/ChapterWiseSubmission'); 
// const ProjectSchema = require('./../models/ProjectSchema');


const FypSubmissionSchema = require('./../models/FYPSubmissionSchema');

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


// ✅ Get student ID by email
module.exports.getSupervisorIdByEmail = async (req, res) => {
    try {
        const email = req.params.email;
        const supervisor = await Supervisor.findOne({ email });
        if (!supervisor) return res.status(404).json({ message: "Supervisor not found" });
        res.json({ supervisorId: supervisor._id });
    } catch (error) {
        console.error("Error fetching supervisor ID by email:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


//post supervisor email and get student id
module.exports.getSupervisorIdByPostingEmail = async (req, res) => {
    try {
        const email = req.body.email;
        const supervisor = await Supervisor.findOne({ email });
        res.status(200).json({ message:'Supervisor Email',supervisorId: supervisor._id });
    } catch (error) {
        console.error("Error fetching student ID by email:", error);
        res.status(500).json({ message: "Internal Server Error" });
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

module.exports.getStudentRequests = async (req, res) => {
  try {
    const supervisorId = req.params.supervisorId;

    const supervisor = await Supervisor.findById(supervisorId)
      .populate({
        path: 'studentRequests.student',
        select: 'username email'
      })
      .populate({
        path: 'studentRequests.projectProposal',
        select: 'projectName proposalFile'
      });

    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    if (!supervisor.studentRequests || supervisor.studentRequests.length === 0) {
      return res.status(200).json({ message: "No student requests found.", studentRequests: [] });
    }

    // ✅ Log if any student is missing
    supervisor.studentRequests.forEach((r, i) => {
      if (!r.student) console.warn(`Warning: Missing student at index ${i}`);
    });

    // ✅ Filter valid requests with both student and projectProposal fields populated
    const validRequests = supervisor.studentRequests.filter(req =>
      req.student &&
      req.projectProposal &&
      req.projectProposal.projectName &&
      req.projectProposal.proposalFile
    );

    if (validRequests.length === 0) {
      return res.status(200).json({ message: "No valid project proposals found.", studentRequests: [] });
    }

    // ✅ Format filtered student requests
    const formattedRequests = validRequests.map(request => {
      const proposalFileLink = `${req.protocol}://${req.get('host')}/file/view-file/${request.projectProposal.proposalFile}`;

      return {
        studentUsername: request.student?.username || 'Unknown',
        studentEmail: request.student?.email || 'Unknown',
        projectName: request.projectProposal?.projectName || 'Untitled',
        proposalFile: proposalFileLink
      };
    });

    console.log("Filtered valid student requests:", formattedRequests);

    res.status(200).json({
      msg: "Supervisor gets valid student proposals with files",
      studentRequests: formattedRequests
    });

  } catch (err) {
    console.error("Error fetching supervisor requests:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


module.exports.respondtoStudentRequest = async (req, res) => {
    const { response, studentEmail, supervisorEmail } = req.body;

    if (!supervisorEmail || !studentEmail || !response) {
        return res.status(400).json({ error: 'Supervisor email, Student email, and Response are required' });
    }

    try {
        // ✅ Find supervisor and populate required fields
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

        // ✅ Find student by email
        const student = await Student.findOne({ email: studentEmail });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // ✅ Count accepted students under the supervisor
        const acceptedStudentsCount = await Student.countDocuments({
            'supervisorRequest.supervisor': supervisor._id,
            'supervisorRequest.status': 'accepted'
        });

        if (response === 'accepted' && acceptedStudentsCount >= 15) {
            return res.status(400).json({ error: 'Supervisor has already accepted 15 students' });
        }

        // ✅ Find request in supervisor's record
        const studentRequest = supervisor.studentRequests.find(req =>
            req.student && req.student._id.toString() === student._id.toString()
        );

        if (!studentRequest) {
            return res.status(404).json({ error: 'Student request not found in supervisor record' });
        }

        // ✅ Update supervisor's request
        studentRequest.status = response;
        await supervisor.save();

        // ✅ Update student's supervisorRequest array
        if (Array.isArray(student.supervisorRequest)) {
            const matchedRequest = student.supervisorRequest.find(
                req => req.supervisor.toString() === supervisor._id.toString()
            );

            if (matchedRequest) {
                matchedRequest.status = response;
                await student.save();
            }
        }

        // ✅ Construct proposal file link
        const proposalFileLink = studentRequest.projectProposal?.proposalFile
            ? `${req.protocol}://${req.get('host')}/file/view-file/${studentRequest.projectProposal.proposalFile}`
            : null;

        // ✅ Send response
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
                    proposalFile: proposalFileLink
                } : null
            }
        });

    } catch (err) {
        console.error("Error responding to student request:", err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// ✅ Supervisor views list of accepted students under their supervision
module.exports.viewListofStudentsUnderSupervision = async (req, res) => {
  try {
    const { email } = req.params;

    // Step 1: Find supervisor by email
    const supervisor = await Supervisor.findOne({ email })
      .populate({
        path: 'studentRequests.student',
        select: 'username email'
      })
      .populate({
        path: 'studentRequests.projectProposal',
        select: 'projectName proposalFile'
      });

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found with the provided email." });
    }

    // Step 2: Filter only 'accepted' student requests
    const acceptedRequests = supervisor.studentRequests.filter(req =>
      req.status === 'accepted' &&
      req.student &&
      req.projectProposal
    );

    if (!acceptedRequests.length) {
      return res.status(404).json({ message: "No accepted students found under this supervisor." });
    }

    // Step 3: Format the response
    const formattedStudents = acceptedRequests.map(req => ({
      studentUsername: req.student.username,
      studentEmail: req.student.email,
      projectName: req.projectProposal.projectName,
      proposalFile: `${req.protocol}://${req.get('host')}/file/view-file/${req.projectProposal.proposalFile}`
    }));

    // Step 4: Send response
    res.status(200).json({
      message: "List of accepted students under your supervision.",
      students: formattedStudents
    });

  } catch (err) {
    console.error("Error fetching supervised students:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.getChapterSubmissionsBySupervisorEmail = async (req, res) => {
  try {
    const { supervisorEmail, chapterNumber } = req.params;

    const submissions = await ChapterWiseSubmission.find({
      supervisorEmail,
      chapterNumber: parseInt(chapterNumber)
    }).select('studentEmail chapterFile projectName grading marks feedback');

    if (submissions.length === 0) {
      return res.status(200).json({
        message: 'No submissions found for this chapter',
        submissions: []
      });
    }

    const formatted = submissions.map((s) => ({
      email: s.studentEmail,
      fileURL: s.chapterFile,
      projectName: s.projectName,
      grading: s.grading,
      marks: s.marks,
      feedback: s.feedback
    }));

    res.status(200).json({
      message: 'Chapter submissions retrieved successfully',
      submissions: formatted
    });

  } catch (err) {
    console.error('Error fetching chapter submissions:', err.message);
    res.status(500).json({
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

// Supervisor grades a specific chapter submission and provides feedback
module.exports.gradeChapterSubmission = async (req, res) => {
  const { studentEmail, chapterNumber, grade, feedback } = req.body;

  if (!studentEmail || grade === undefined || chapterNumber === undefined) {
    return res.status(400).json({ 
      error: 'studentEmail, chapterNumber, and grade are required',
      success: false
    });
  }

  try {
    const submission = await ChapterWiseSubmission.findOneAndUpdate(
      {
        studentEmail,
        chapterNumber: parseInt(chapterNumber)
      },
      {
        grading: 'isGraded',
        marks: parseInt(grade),
        feedback: feedback || ''
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ 
        error: 'Submission not found',
        success: false
      });
    }

    res.status(200).json({
      message: 'Chapter submission graded successfully',
      success: true,
      submission: {
        studentEmail: submission.studentEmail,
        chapterNumber: submission.chapterNumber,
        marks: submission.marks,
        grading: submission.grading,
        feedback: submission.feedback
      }
    });

  } catch (err) {
    console.error('Error grading chapter submission:', err.message);
    res.status(500).json({ 
      error: 'Internal Server Error',
      success: false
    });
  }
};

const ProjectSchema = require('../models/ProjectSchema');
module.exports.getTotalProjectsBySupervisor = async (req, res) => {
  try {
    const { supervisorEmail } = req.params;

    // Step 1: Find the supervisor by email
    const supervisor = await Supervisor.findOne({ email: supervisorEmail });

    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found." });
    }

    // Step 2: Count the number of projects assigned to this supervisor
    const totalProjects = await ProjectSchema.countDocuments({ supervisorId: supervisor._id });

    return res.status(200).json({
      message: `Total number of projects for supervisor ${supervisor.username}`,
      supervisorEmail,
      totalProjects
    });

  } catch (err) {
    console.error("Error fetching total projects by supervisor:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports.getAcceptedStudentsBySupervisor = async (req, res) => {
  try {
    const { supervisorEmail } = req.params;

    // Find supervisor by email and populate student + projectProposal details
    const supervisor = await Supervisor.findOne({ email: supervisorEmail })
      .populate({
        path: 'studentRequests.student',
        model: 'Student' // populate full student document
      })
      .populate({
        path: 'studentRequests.projectProposal',
        model: 'ProjectProposal' // populate full proposal document
      });

    if (!supervisor) {
      return res.status(404).json({ success: false, message: 'Supervisor not found' });
    }

    // Filter only accepted students
    const acceptedStudents = supervisor.studentRequests.filter(
      req => req.status === 'accepted'
    );

    res.status(200).json({
      success: true,
      acceptedStudents
    });
  } catch (error) {
    console.error('Error fetching accepted students:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};


exports.getUpdatedStudentRequests = async (req, res) => {
  try {
    const supervisorId = req.params.id;

    const supervisor = await Supervisor.findById(supervisorId)
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

    // Use a Map to keep only the latest request per student email
    const seen = new Map();

    supervisor.studentRequests.forEach(req => {
      const email = req.student?.email;
      if (email && !seen.has(email)) {
        seen.set(email, {
          studentUsername: req.student?.username,
          studentEmail: email,
          projectName: req.projectProposal?.projectName || "",
          proposalFile: req.projectProposal?.proposalFile || "",
          status: req.status || "pending"
        });
      }
    });

    const uniqueStudentRequests = Array.from(seen.values());

    return res.status(200).json({ studentRequests: uniqueStudentRequests });

  } catch (err) {
    console.error("Error fetching student requests:", err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports.getPhaseOneSubmissionsBySupervisorEmail = async (req, res) => {
  try {
    const { supervisorEmail, phaseNumberOne } = req.params;

    const submissions = await FypSubmissionSchema.find({
      supervisorEmail,
      phaseNumberOne: phaseNumberOne.toString()
    }).select('studentEmail projectFile projectName grading marks feedback');

    if (submissions.length === 0) {
      return res.status(200).json({
        message: 'No submissions found for Phase One',
        submissions: []
      });
    }

    const formatted = submissions.map((s) => ({
      email: s.studentEmail,
      fileURL: s.projectFile,
      projectName: s.projectName,
      grading: s.grading,
      marks: s.marks,
      feedback: s.feedback
    }));

    res.status(200).json({
      message: 'Phase One submissions retrieved successfully',
      submissions: formatted
    });

  } catch (err) {
    console.error('❌ Error fetching phase submissions:', err.message);
    res.status(500).json({
      message: 'Internal Server Error',
      error: err.message
    });
  }
};
module.exports.gradePhaseOneSubmission = async (req, res) => {
  const { studentEmail, phaseNumberOne, grade, feedback } = req.body;

  if (!studentEmail || grade === undefined || phaseNumberOne === undefined) {
    return res.status(400).json({ 
      error: 'studentEmail, phaseNumberOne, and grade are required',
      success: false
    });
  }

  try {
    const submission = await FypSubmissionSchema.findOneAndUpdate(
      {
        studentEmail,
        phaseNumberOne: phaseNumberOne
      },
      {
        grading: 'isGraded',
        marks: parseInt(grade),
        feedback: feedback || ''
      },
      { new: true }
    );

    if (!submission) {
      return res.status(404).json({ 
        error: 'Submission not found',
        success: false
      });
    }

    res.status(200).json({
      message: 'Phase One submission graded successfully',
      success: true,
      submission: {
        studentEmail: submission.studentEmail,
        phaseNumberOne: submission.phaseNumberOne,
        marks: submission.marks,
        grading: submission.grading,
        feedback: submission.feedback
      }
    });

  } catch (err) {
    console.error('Error grading submission:', err.message);
    res.status(500).json({ 
      error: 'Internal Server Error',
      success: false
    });
  }
};



module.exports.getPhaseTwoSubmissionsBySupervisorEmail = async (req, res) => {
  try {
    const { supervisorEmail, phaseNumberTwo } = req.params;

    const submissions = await FypSubmissionSchema.find({
      supervisorEmail,
      phaseNumberTwo: phaseNumberTwo.toString()
    }).select('studentEmail projectFile projectName grading marks feedback');

    if (submissions.length === 0) {
      return res.status(200).json({
        message: 'No submissions found for Phase One',
        submissions: []
      });
    }

    const formatted = submissions.map((s) => ({
      email: s.studentEmail,
      fileURL: s.projectFile,
      projectName: s.projectName,
      grading: s.grading,
      marks: s.marks,
      feedback: s.feedback
    }));

    res.status(200).json({
      message: 'Phase Two submissions retrieved successfully',
      submissions: formatted
    });

  } catch (err) {
    console.error('❌ Error fetching phase 2 submissions:', err.message);
    res.status(500).json({
      message: 'Internal Server Error',
      error: err.message
    });
  }
};


module.exports.getStudentRequestsBySupervisorId = async (req, res) => {
  try {
    const { id } = req.params;

    const supervisor = await Supervisor.findById(id)
      .populate({
        path: 'studentRequests.student',
        model: 'Student',
        select: 'username email'
      })
      .populate({
        path: 'studentRequests.projectProposal',
        model: 'ProjectProposal',
        select: 'projectName proposalFile'
      });

    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    // Transform the data into a flat list for frontend
    const studentRequests = supervisor.studentRequests.map(req => ({
      studentUsername: req.student?.username || 'Unknown',
      studentEmail: req.student?.email || '',
      projectName: req.projectProposal?.projectName || '',
      proposalFile: req.projectProposal?.proposalFile || '',
      status: req.status,
    }));

    res.status(200).json({ studentRequests });
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
