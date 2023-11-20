
const Report = require('../models/Report');
const ExpertRequest = require('../models/ExpertRequest');
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
  // Create a new report
  async create(req, res) {
    try {
      const report = new Report(req.body);
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
      if (!expert || !inspectionDate || !expertRequest) {
        return res.status(400).json({ message: 'Expert, inspectionDate and expertRequest must be provided' });
      }

      const report = await Report.findByIdAndUpdate(req.params.id,{expert:expert,inspectionDate:inspectionDate,status:"assigned",} , { new: true });
      if (!report) throw new Error('Report not found');
      const expertRequest1 = await ExpertRequest.findByIdAndUpdate(expertRequest,{status:"accepted"}, { new: true });
      if (!expertRequest1) throw new Error('ExpertRequest not found');

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
      // `req.files` contains information about the uploaded files.
      // You can process and save this information as needed.
      // For example, you could save the file paths to the report.
      const imagePaths = req.files.map(file => file.path);
  
      const report = await Report.findByIdAndUpdate(
        req.params.id,
        { findings: req.body.findings, findingsPhotos: imagePaths,status:"completed" },
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
      const report = await Report.find({expert:req.params.id})
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
