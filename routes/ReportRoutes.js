const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const authJwt = require('../Middleware/auth');
const upload=require('../Middleware/multerConfig');
const { generatePDF } = require('../Middleware/pdfgenerator'); // Use correct path to your generatePDF function
const fs = require('fs');
const Report = require('../models/Report');
const path = require('path');

// Route to GET all reports
router.get('/', [authJwt.verifyToken], ReportController.index);
// route for expert to post his findings and findings photos
router.put('/findings/:id', upload.array('findingsPhotos', 5),[authJwt.verifyToken], ReportController.saveimageandfindings);

router.put('/:id', ReportController.update);
router.get('/getopen', [authJwt.verifyToken], ReportController.getOpenReports);

router.put('/updatestatus/:id',[authJwt.verifyToken], ReportController.assignExpert);
router.get('/reportsbyexpert/:id', [authJwt.verifyToken],ReportController.getReportsByExpert);
// Route to POST a new report
// Route to POST a new report with image upload
router.post('/', [authJwt.verifyToken, upload.array('customerPhotos', 5)], ReportController.create);

// Route to GET a single report by ID
router.get('/:id',[authJwt.verifyToken], ReportController.show);
// Generate PDF report by report ID
// Inside your Express.js route handler
router.get('/:id/pdf',[authJwt.verifyToken], async (req, res) => {
    try {
      // Fetch and populate the report document
    const report = await Report.findById(req.params.id)
        .populate('customer')
        .populate('property')
        .populate('expert')
        .exec();
  
      if (!report) {
        return res.status(404).send('Report not found');
      }
  
      // Define the filename for the PDF
      const fileName = `report-${report.index}.pdf`;
      // Define the outputPath as an absolute path
      const outputPath = './uploads/pdf'+ fileName; // Adjust the directory as needed
  
      // Call your generatePDF function
      await generatePDF(report, outputPath);
  
      // Set the absolute path for res.sendFile
      const absolutePath = path.resolve(outputPath);
  
      // Send the PDF file
      res.sendFile(absolutePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Unable to send PDF');
        } else {
          // Optionally delete the PDF file after sending it
          fs.unlink(absolutePath, (unlinkErr) => {
            if (unlinkErr) console.error(unlinkErr);
          });
        }
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
  });
  
// Route to PUT (update) a report by ID
router.put('/:id',[authJwt.verifyToken], ReportController.update);


module.exports = router;
