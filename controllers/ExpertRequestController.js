const ExpertRequest = require('../models/ExpertRequest');
const Report = require('../models/Report');
const createRequest = async (req, res) => {
  const { report, expert,  date ,status} = req.body;

  try {
    const expertRequest = new ExpertRequest({
      report,
      expert,
        date,
        status,
     
    });

    const savedRequest = await expertRequest.save();

    res.json(savedRequest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getAllRequests = async (req, res) => {
  try {
    const expertRequests = await ExpertRequest.find()
      .populate({
        path: 'report',
        populate: [
          { path: 'property' }, // Assuming 'property' is a ref in 'report'
          { path: 'customer' }  // Assuming 'customer' is a ref in 'report'
        ]
      })
      .populate('expert'); // Populates 'expert' within 'ExpertRequest'
    
    res.json(expertRequests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getRequest = async (req, res) => {
    try {
      const expertRequest = await ExpertRequest.findById(req.params.id);
      res.json(expertRequest);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  const assignExpert = async (req, res) => {
    try {
      // Find the expert request by the provided ID
      const expertRequest = await ExpertRequest.findById(req.params.id);
  
      // If expertRequest exists
      if (expertRequest) {
        // Find the associated report using the report ID from the expert request
        const report = await Report.findById(expertRequest.report);
  
        if (report && expertRequest.expert) {
          // Assign the expert ID to the report's expert field
          report.expert = expertRequest.expert;
          // Save the updated report to the database
          report.status = 'assigned';
          const savedReport = await report.save();
  
          // Optionally, update the expert request to reflect that an expert has been assigned
          // This step depends on your application logic and whether such an update is needed
          // ...
  
          // Return the saved report in the response
          res.json(savedReport);
        } else {
          // If the report is not found or the expert ID is not provided, return an error
          res.status(404).json({ error: "Report not found or expert ID not provided." });
        }
      } else {
        // If the expertRequest is not found, return an error
        res.status(404).json({ error: "Expert request not found." });
      }
    } catch (err) {
      // If there's an error in the try block, return a 500 error with the error message
      res.status(500).json({ error: err.message });
    }
  };
  
  const updateRequest = async (req, res) => {
    try {
      const expertRequest = await ExpertRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(expertRequest);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  const deleteRequest = async (req, res) => {
    try {
      await ExpertRequest.findByIdAndDelete(req.params.id);
      res.json({ message: 'Deleted ExpertRequest' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  module.exports = {
    createRequest,
    getAllRequests,
    getRequest,
    assignExpert,
    updateRequest,
    deleteRequest,
  };
