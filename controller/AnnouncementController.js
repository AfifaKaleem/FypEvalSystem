const mongoose = require('mongoose');
const Announcement = require('./../models/Annoucement');
const FypHead = require('./../models/FypHead');
const Student = require('../models/Student');


module.exports.createAnnouncement = async(req,res)=>{
    const requiredRole = "FypHead"
    try{
        const data = req.body;
        // Check if the user is authorized as FypHead
        if (requiredRole !== "FypHead") {
            return res.status(403).json({ message: 'Access denied. Only FYP Head can perform this action.' });
        }
        // if(requiredRole === "FypHead"){
        //     return res.status(200).json({message : "Access granted. Fyp head had just posted a new announcement"})
        // }
        
        const newAnnouncement = new Announcement(data);
        const response = await newAnnouncement.save();
        console.log(response);
        if(!response){
            return res.status(404).json({error: "Announcement is not created"});
        }
        await FypHead(response);
        
        res.status(200).json("Announcement Created successfully", response)
    }catch(err){
        console.log(err);
        res.status(500).json({error :"Internal Server Error"});
    }
}

module.exports.getAnnouncement = async(req,res)=>{
    try{
        const data = await Announcement.find().populate('content');
        console.log('Announcement data fetched');
        await FypHead(data);
        res.status(200).json({ message:"Announcement data fetched",data });
    } catch(err){
        console.log(err);
        res.status(500).json({error: "Internal Server Error"})
    }
}

module.exports.deleteAnnouncement =async(req,res)=>{
    try{
        const announcementId = req.params.id;

        const response = await Announcement.findByIdAndDelete(announcementId);

        if (!response) {
            return res.status(404).json({ error: 'Announcement not found' });
        }
        console.log('Announcement deleted successfully');
        await FypHead(response);
        res.status(200).json({ message: 'Announcement deleted successfully' });

    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }
}

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



// //student receives the announcement of fyp head
module.exports.showfypheadannouncementtostudents = async (req, res) => {
    try {
        const announcements = await Announcement.find({ audience: 'Students' });
        await Student(announcements);
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
};



//supervisors receives the announcement of fyp head
module.exports.showfypheadannouncementtosupervisors = async (req, res) => {
    try {
        const announcements = await Announcement.find({ audience: 'supervisors' }).sort({ date: -1 });
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
};

//evaluators receives the announcement of fyp head
module.exports.showfypheadannouncementtoevaluators = async (req, res) => {
    try {
        const announcements = await Announcement.find({ audience: 'evaluators' }).sort({ date: -1 });
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
};

//admin receives the announcement of fyp head
module.exports.showfypheadannouncementtoadmin = async (req, res) => {
    try {
        const announcements = await Announcement.find({ audience: 'admin' }).sort({ date: -1 });
        res.status(200).json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements.' });
    }
};


//show to all fyp head announcment 


module.exports.showToAll = async(req,res)=>{
    try{
        const audience = req.params
        const ann = await Announcement.find({audience:audience}).select('audience content' );
        if(!ann){
            return res.status(201).json("cannot submit announcement to any panel");

        }
        console.log(ann);
        res.status(200).json({message:"submit announcement to any panel"})


    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }
}


