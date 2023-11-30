
const Report = require('../models/Report');
const { bucket } = require('../googleCloudStorage'); // Update with the correct path
const { storage } = require('../googleCloudStorage');
const ExpertRequest = require('../models/ExpertRequest');
async  function generateSignedUrl(fileName) {
  const options = {
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000, // URL expires in 15 minutes
  };

  try {
    const [url] = await bucket.file(fileName).getSignedUrl(options);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}
class ReportController {
  // Get all reports
// Get all reports with referenced documents populated
async index(req, res) {
  try {
    const reports = await Report.find()
      .populate('expert')  // Assumes 'expert' is the field name in Report model
      .populate('customer')  // Assumes 'customer' is the field name
      .populate('property');  // Assumes 'property' is the field name

    // If you only want to select specific fields from the populated documents, you can do it like this:
    // .populate({ path: 'expert', select: 'name title -_id' }) // Excluding the id with '-_id'
    
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async getOpenReports(req, res) {
  try {
    const reports = await Report.find({ status: "open" })
      .populate('customer')  // Assumes 'customer' is the field name
      .populate('property');  // Assumes 'property' is the field name

    // Check and load client photos for each report
    const reportsWithPhotos = await Promise.all(reports.map(async (report) => {
      if (report.clientPhotos && report.clientPhotos.length > 0) {
        const signedUrls = await Promise.all(report.clientPhotos.map(async (photo) => {
          // Assuming 'photo' contains the file name or partial path in the bucket
          return generateSignedUrl(photo);
        }));

      

        // Replace the clientPhotos with signed URLs
        report.clientPhotos = signedUrls;
      }
      return report;
    }));

    res.status(200).json(reportsWithPhotos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


    // If you only want to select specific fields from the populated documents, you can do it like this:
    // .populate({ path: 'expert', select: 'name title -_id' }) // Excluding the id with '-_id'
    
  // Create a new report
  async create(req, res) {
    try {
      const clientPhotos = [];

      if (req.files) {
          const uploadPromises = req.files.map((file) =>
              new Promise((resolve, reject) => {
                  const blob = bucket.file(file.originalname);
                  const blobStream = blob.createWriteStream();

                  blobStream.on('error', (err) => reject(err));
                  blobStream.on('finish', () => {
                      const publicUrl = `${blob.name}`;
                      resolve(publicUrl);
                  });

                  blobStream.end(file.buffer);
              })
          );

          // Await all the upload promises
          clientPhotos.push(...(await Promise.all(uploadPromises)));
      }
      const date = new Date();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      const day = date.getDate();
      var season;
      if ((month === 3 && day >= 1) || month === 4 || month === 5 || (month === 6 && day <= 30)) {
        season= 'אביב';
      } else if ((month === 6 && day >= 1) || month === 7 || month === 8 || (month === 9 && day <= 30)) {
        season=  'קיץ';
      } else if ((month === 9 && day >= 1) || month === 10 || month === 11 || (month === 12 && day <= 31)) {
        season=  'סתיו';
      } else {
        season=  'חורף';
      }
      // Create a new report with the request body and image paths
      const reportData = {
        ...req.body,
        clientPhotos: clientPhotos, // Add image paths to the report
        status: "open",
        season:season, // Calculate current season
      };

      const report = new Report(reportData);
      await report.save();
      res.status(201).json(report);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  // Get a single report by ID
  async show(req, res) {
    try {
      const report = await Report.findById(req.params.id)
      .populate('expert')  // Assumes 'expert' is the field name in Report model
      .populate('customer')  // Assumes 'customer' is the field name
      .populate('property');  // Assumes 'property' is the field name
      
      if (!report) throw new Error('Report not found');
      if (report.clientPhotos && report.clientPhotos.length > 0) {
        const signedUrls = await Promise.all(report.clientPhotos.map(async (photo) => {
          // Assuming 'photo' contains the file name or partial path in the bucket
          return generateSignedUrl(photo);
        }));
        const findingsph = await Promise.all(report.findingsPhotos.map(async (photo) => {
          // Assuming 'photo' contains the file name or partial path in the bucket
          return generateSignedUrl(photo);
        }));


        // You can either replace the clientPhotos with signed URLs or create a new field
        report.clientPhotos = signedUrls;
        report.findingsPhotos = findingsph;
      }
      res.status(200).json(report);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
  async update(req, res) {
    try {
      const report = await Report.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!report) throw new Error('Report not found');

      res.status(200).json(report);
    }
    catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Update a report by ID
  async assignExpert(req, res) {
    try {
      const { expert,  inspectionDate,expertRequest } = req.body;
      if (!expert || !inspectionDate ) {
        return res.status(400).json({ message: 'Expert, inspectionDate and expertRequest must be provided' });
      }

      const report = await Report.findByIdAndUpdate(req.params.id,{expert:expert,inspectionDate:inspectionDate,status:"assigned",} , { new: true });
      if (!report) throw new Error('Report not found');
      if (expertRequest){
      const expertRequest1 = await ExpertRequest.findByIdAndUpdate(expertRequest,{status:"accepted"}, { new: true });
      const expertRequest2 = await ExpertRequest.updateMany({report:report._id},{status:"rejected"}, { new: true });
      
      if (!expertRequest1) throw new Error('ExpertRequest not found');
      }
      res.status(200).json(report);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Delete a report by ID
  async delete(req, res) {
    try {
      const report = await Report.findByIdAndDelete(req.params.id);
      if (!report) throw new Error('Report not found');
      res.status(200).json(report);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
  async saveimageandfindings(req, res) {
    try {
      const findingsPhotos = [];

      if (req.files) {
        const uploadPromises = req.files.map((file) =>
          new Promise((resolve, reject) => {
            const uniqueFileName = file.originalname;
            const blob = bucket.file(uniqueFileName);
            const blobStream = blob.createWriteStream({
              resumable: false,
            });

            blobStream.on('error', (err) => reject(err));
            blobStream.on('finish', async () => {
              // Here, you might choose to generate a signed URL instead
              // const signedUrl = await this.generateSignedUrl(uniqueFileName);
              // resolve(signedUrl);

              const publicUrl = `${blob.name}`;
              resolve(publicUrl);
            });

            blobStream.end(file.buffer);
          })
        );

        findingsPhotos.push(...(await Promise.all(uploadPromises)));
      }

      const report = await Report.findByIdAndUpdate(
        req.params.id,
        { findings: req.body.findings, findingsPhotos: findingsPhotos, status: "completed" },
        { new: true }
      );
      
      if (!report) throw new Error('Report not found');
  
      res.status(200).json(report);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
  
  async getReportsByExpert(req, res) {
    try {
      const report = await Report.find({expert:req.params.id,status:"assigned"})
      .populate('expert')  // Assumes 'expert' is the field name in Report model
      .populate('customer')  // Assumes 'customer' is the field name
      .populate('property');  // Assumes 'property' is the field name
      
      if (!report) throw new Error('Report not found');
      

      
      res.status(200).json(report);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new ReportController();
