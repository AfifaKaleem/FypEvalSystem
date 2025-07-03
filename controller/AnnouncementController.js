const mongoose = require('mongoose');
const Announcement = require('./../models/Annoucement');
const FypHead = require('./../models/Admin');
const Student = require('../models/Student');
const Evaluator = require('../models/Evaluator');
const Supervisor = require('../models/Supervisor');

module.exports.createAnnouncement = async (req, res) => {
    try {
        const data = req.body;

        // TEMP: Simulate Admin role for testing
        const userRole = "Admin"; // Replace with req.user.role if using auth

        if (userRole !== "Admin") {
            return res.status(403).json({ message: 'Access denied. Only Admin can perform this action.' });
        }

        const newAnnouncement = new Announcement(data);
        const response = await newAnnouncement.save();

        if (!response) {
            return res.status(400).json({ error: "Announcement not created" });
        }

        await FypHead(response);

        return res.status(201).json({
            message: "Announcement Created successfully",
            announcement: response
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


module.exports.getAnnouncement = async(req,res)=>{
    try{
        const data = await Announcement.find().populate('content ');
        console.log('Announcement data fetched');
        await FypHead(data);
        await Student(data);
        await Evaluator(data);
        await Supervisor(data);
        res.status(200).json({ message:"Announcement data fetched",data });
    } catch(err){
        console.log(err);
        res.status(500).json({error: "Internal Server Error"})
    }
}
module.exports.deleteAnnouncement = async (req, res) => {
  try {
    const content = req.params.content;

    // Find the announcement(s) by content
    const announcements = await Announcement.find({ content: content });

    if (!announcements || announcements.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    // Delete all matching announcements
    await Announcement.deleteMany({ content: content });

    console.log('Announcement(s) deleted successfully');

    // If FypHead expects the deleted announcements, pass them
    await FypHead(announcements);

    res.status(200).json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports.updateAnnouncement = async (req, res) => {
    try {
        const announcementId = req.params.id;
        const updatedAnnouncementData = req.body;

        const response = await Announcement.findByIdAndUpdate(announcementId, updatedAnnouncementData, {
            new: true, // Return the updated document
            runValidators: true, // Run mongoose validation
        });

        if (!response) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        console.log('Announcement updated successfully');
        await FypHead(response);
        res.status(200).json(response);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// //fyphead post announcement only for students 
// module.exports.postAnnouncementtoStudent = async (req, res) => {
//     try {
//         const { content } = req.body;
//         const author = req.user._id; // assuming req.user contains the logged-in user details

//         const newAnnouncement = new Announcement({
//             content,
//             author,
//             audience: 'students'
//         });

//         await newAnnouncement.save();
//         res.status(201).json({ message: 'Announcement posted successfully.' });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to post announcement.' });
//     }
// };

// module.exports.postAnnouncementtoStudent = async(req,res) =>{



// }

// //fyphead post announcement only for supervisors 
// module.exports.postAnnouncementtoSupervisor = async (req, res) => {
//     try {
//         const { content } = req.body;
//         const author = req.user._id; // assuming req.user contains the logged-in user details

//         const newAnnouncement = new Announcement({
//             content,
//             author,
//             audience: 'supervisors '
//         });

//         await newAnnouncement.save();
//         res.status(201).json({ message: 'Announcement posted successfully.' });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to post announcement.' });
//     }
// };

// //fyphead post announcement only for admin 
// module.exports.postAnnouncementtoAdmin = async (req, res) => {
//     try {
//         const { content } = req.body;
//         const author = req.user._id; // assuming req.user contains the logged-in user details

//         const newAnnouncement = new Announcement({
//             content,
//             author,
//             audience: 'admin '
//         });

//         await newAnnouncement.save();
//         res.status(201).json({ message: 'Announcement posted successfully.' });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to post announcement.' });
//     }
// };


// //fyphead post announcement only for evaluators 
// module.exports.postAnnouncementtoEvaluator = async (req, res) => {
//     try {
//         const { content } = req.body;
//         const author = req.user._id; // assuming req.user contains the logged-in user details

//         const newAnnouncement = new Announcement({
//             content,
//             author,
//             audience: 'evaluators '
//         });

//         await newAnnouncement.save();
//         res.status(201).json({ message: 'Announcement posted successfully.' });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to post announcement.' });
//     }
// };


module.exports.showannouncementtostudent = async (req, res) => {
    try {
        const announcements = await Announcement.find(
            { audience: { $in: ['Student'] } },  // Filter
            { content: 1, DateandTime: 1, _id: 0 } // Projection
        );

        res.status(200).json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
};



module.exports.showannouncementtosupervisor = async (req, res) => {
    try {
        const announcements = await Announcement.find(
            { audience: { $in: ['Supervisor'] } },  // Filter
            { content: 1, DateandTime: 1, _id: 0 } // Projection
        );

        res.status(200).json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
};



module.exports.showannouncementtoevaluator = async (req, res) => {
    try {
        const announcements = await Announcement.find(
            { audience: { $in: ['Evaluator'] } },  // Filter
            { content: 1, DateandTime: 1, _id: 0 } // Projection
        );

        res.status(200).json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
};

module.exports.showannouncementtoadmin = async (req, res) => {
    try {
        const announcements = await Announcement.find(
            { audience: { $in: ['Admin'] } },  // Filter
            { content: 1, DateandTime: 1, _id: 0 } // Projection
        );

        res.status(200).json(announcements);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
};
