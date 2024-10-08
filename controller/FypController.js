// controllers/fypHeadController.js
const FYPHead = require('./../models/FypHead');
const Supervisor = require('./../models/Supervisor');
const Student = require('./../models/Student');


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
        if(supervisor.email.endsWith('@faculty.uol.edu.pk')){
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


// Create Supervisor
module.exports.addSupervisor = async (req, res) => {
    try {
        const { username, email, domain, office } = req.body;
        const newSupervisor = new Supervisor({ username, email, domain, office });
        const response = await newSupervisor.save();
        console.log('Supervisor data saved');
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get Supervisors
module.exports.getSupervisors = async (req, res) => {
    try {
        const data = await Supervisor.find().select('email username domain office');
        console.log('Supervisors data fetched');
        res.status(200).json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Update Supervisor
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

// Delete Supervisor
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

// Student requests a supervisor
module.exports.requestSupervisor = async (req, res) => {
    const { studentId, studentName, supervisorName, supervisorId } = req.body;
    try {
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) {
            return res.status(404).json({ msg: 'Supervisor not found' });
        }
        student.supervisorRequest = { supervisor: supervisorId, supervisorName: supervisorName, status: 'pending' };
        await student.save();
        supervisor.studentRequests.push({ student: studentId, studentName: studentName, status: 'pending' });
        await supervisor.save();
        res.status(200).json(student);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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

// Get supervisor's student requests
module.exports.getSupervisorRequests = async (req, res) => {
    try {
        const supervisor = await Supervisor.findById(req.params.supervisorId).populate({
            path: 'studentRequests.student',
            select: 'id username'
        });
        if (!supervisor) {
            return res.status(404).json({ msg: 'Supervisor not found' });
        }
        res.json(supervisor.studentRequests);
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

// Supervisor responds to a student request
module.exports.respondRequest = async (req, res) => {
    const { supervisorId, studentId, response } = req.body;

    try {
        const supervisor = await Supervisor.findById(supervisorId);
        if (!supervisor) {
            return res.status(404).json({ msg: 'Supervisor not found' });
        }

        const acceptedStudentsCount = await Student.countDocuments({
            'supervisorRequest.supervisor': supervisorId,
            'supervisorRequest.status': 'accepted'
        });

        if (acceptedStudentsCount >= 15) {
            return res.status(400).json({ msg: 'Supervisor has already accepted 15 students' });
        }

        const studentRequest = supervisor.studentRequests.find(req => req.student.toString() === studentId);
        if (!studentRequest) {
            return res.status(404).json({ msg: 'Student request not found' });
        }

        studentRequest.status = response;
        await supervisor.save();

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        if (student.supervisorRequest.supervisor.toString() === supervisorId) {
            student.supervisorRequest.status = response;
            await student.save();
        }

        res.status(200).json(supervisor);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

