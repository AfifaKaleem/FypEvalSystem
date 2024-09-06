const express = require('express');
const router = express.Router();
const cors = require('cors');
const AnnouncementController = require('./../controller/AnnouncementController');


// Create ann/ouncement
router.post('/createAnnouncement', cors(),  AnnouncementController.createAnnouncement);


// // Create announcement for students from fypHead
// router.post('/postAnnouncementtoStudent/:userType', cors(),  AnnouncementController.postAnnouncementtoStudent);

// // Create announcement for supervisors from fypHead
// router.post('/postAnnouncementtoSupervisor/:userType', cors(),  AnnouncementController.postAnnouncementtoSupervisor)

// // Create announcement for admin from fypHead
// router.post('/postAnnouncementtoAdmin/:userType', cors(),  AnnouncementController.postAnnouncementtoAdmin)


// // Create announcement for evaluator from fypHead
// router.post('/postAnnouncementtoEvaluator/:userType', cors(),  AnnouncementController.postAnnouncementtoEvaluator)

// Get all announcement
router.get('/getAllAnnouncement', cors(), AnnouncementController.getAnnouncement);

// router.get('/getAllPanels',cors(),AnnouncementController.showToAll);

// Update announcement
 router.put('/updateAnnouncement/:id', cors(), AnnouncementController.updateAnnouncement);

//  Delete announcement
router.delete('/deleteAnnouncement/:id', cors(),  AnnouncementController.deleteAnnouncement);

//show announcement to specific user students 
router.get('/showfypheadannouncementtostudents',cors(),AnnouncementController.showfypheadannouncementtostudents);

// //show announcement to specific user supervisors
// router.get('/showfypheadannouncementtosupervisors/:userType',cors(),AnnouncementController.showfypheadannouncementtosupervisors);


// //show announcement to specific user evaluator
// router.get('/showfypheadannouncementtoevaluators/:userType',cors(),AnnouncementController.showfypheadannouncementtoevaluators);

// //show announcement to specific user admin
// router.get('/showfypheadannouncementtoadmin/:userType',cors(),AnnouncementController.showfypheadannouncementtoadmin);

module.exports = router;