
// Import any necessary dependencies
const Expert = require('../models/Experts');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const saltRounds = 10; // or another number you prefer
// Define controller methods
const expertController = {
  // Get all experts
  getAllExperts: async (req, res) => {
    try {
      const experts = await Expert.find();
      res.status(200).json(experts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create multiple experts
  createMultipleExperts: async (req, res) => {
    const experts = req.body;
    const saltRounds = 10; // Define the saltRounds for bcrypt
  
    try {
      let newExperts = [];
      let newUsers = [];
  
      for (const expert of experts) {
        // Save each expert individually
        const newExpert = new Expert(expert);
        await newExpert.save();
        newExperts.push(newExpert);
  
        // Create a corresponding user for each expert
        const username = newExpert.tz;
        const password = await bcrypt.hash(newExpert.tz + newExpert.phone.slice(-3), saltRounds);
  
        const newUser = new User({
          username: username,
          password: password,
          userType: 'inspector',
          name: newExpert.name
        });
  
        // Save each user individually
        await newUser.save();
        newUsers.push(newUser);
      }
  
      // Respond with the new expert data
      res.status(201).json({ message: 'Experts created successfully',});
    } catch (error) {
      res.status(400).json({ message: 'Failed to create experts.', error: error.message });
    }
  },
  
getExpertBytz: async (req, res) => {
    try {
      const expert = await Expert.findOne({tz:req.user.username});
      res.status(200).json(expert);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
      
  // Get a single expert by ID
  getExpertById: async (req, res) => {
    try {
      const expert = await Expert.findById(req.params.id);
      res.status(200).json(expert);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create a new expert
 // Create a new expert
// Create a new expert
createExpert: async (req, res) => {
  // Create a new expert with the request body
  const expert = new Expert(req.body);

  try {
    // Save the new expert
    const newExpert = await expert.save();

    try {
      // Construct username and password from the new expert's details
      const username = newExpert.tz;
      const password = await bcrypt.hash(newExpert.tz + newExpert.phone.slice(-3), saltRounds);

      // Create a new user for the expert
      const user = new User({
        username: username,
        password: password, // In a real-world scenario, you would hash this password before saving
        userType: 'inspector',
        name:newExpert.name
      });

      // Save the new user
      const newUser = await user.save();

      // Respond with the new expert and user data
      res.status(201).json({ expert: newExpert, user: newUser });
    } catch (userError) {
      // If saving the user failed, delete the new expert and respond with an error
      await Expert.findByIdAndDelete(newExpert._id);
      res.status(500).json({ message: 'Failed to create user for expert, expert not saved.', error: userError.message });
    }
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      res.status(409).json({ message: 'Expert already exists.', error: error.message });
    } else {
      res.status(400).json({ message: 'Failed to create expert.', error: error.message });
    }
  
  }
},



  // Update an existing expert by ID
  updateExpertById: async (req, res) => {
    try {
      const expert = await Expert.findById(req.params.id);
      // Update any necessary properties
      const updatedExpert = await expert.save();
      res.status(200).json(updatedExpert);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete an existing expert by ID
  deleteExpertById: async (req, res) => {
    try {
      const expert = await Expert.findById(req.params.id);
      await expert.remove();
      res.status(200).json({ message: 'Expert deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

// Export the controller
module.exports = expertController;
