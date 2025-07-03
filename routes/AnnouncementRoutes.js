const express = require('express');
const router = express.Router();
const cors = require('cors');
const AnnouncementController = require('./../controller/AnnouncementController');

// Create ann/ouncement
router.post('/createAnnouncement', cors(),  AnnouncementController.createAnnouncement);

// Get all announcement
router.get('/getAllAnnouncement', cors(), AnnouncementController.getAnnouncement);

// Update announcement
 router.put('/updateAnnouncement/:id', cors(), AnnouncementController.updateAnnouncement);

//  Delete announcement
router.delete('/deleteAnnouncement/:content', cors(),  AnnouncementController.deleteAnnouncement);

//show announcement to  students 
router.get('/showannouncementtostudents',cors(),AnnouncementController.showannouncementtostudent);

//show announcement to supervisors 
router.get('/showannouncementtosupervisor',cors(),AnnouncementController.showannouncementtosupervisor);

//show announcement to evaluators
router.get('/showannouncementtoevaluators',cors(),AnnouncementController.showannouncementtoevaluator);

//show announcement to admin
router.get('/showannouncementtoadmin',cors(),AnnouncementController.showannouncementtoadmin);



module.exports = router;