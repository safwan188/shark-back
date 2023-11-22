const User = require('../models/User'); // Import the User model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10; // or another number you prefer

const UserController = {
  // Create a new user
  createUser: async (req, res) => {
    try {
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = new User({
        username,
        password: hashedPassword,
      });
  
      const savedUser=await user.save();
  
      res.status(201).json(savedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Retrieve all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Retrieve a single user by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) res.status(404).json({ message: 'User not found' });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update a user by ID
  updateUser: async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.status(200).json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete a user by ID
  deleteUser: async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser) res.status(404).json({ message: 'User not found' });
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
// Login a user
loginUser: async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Generate a token
    const token = jwt.sign(
      { id: user._id, username: user.username, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '5h' } // Token expires in 5 hours
    );
    res.status(200).json({ token: token, name: user.name });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
},

// Register a user
registerUser: async (req, res) => {
  try {
    let user = await User.findOne({ username: req.body.username });
    if (user) return res.status(400).send('User already exists.');

    // Hash the password
    const salt = await bcrypt.genSalt(10); // You can adjust the salt rounds
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user instance with the hashed password
    user = new User({
      ...req.body,
      password: hashedPassword
    });

    const savedUser = await user.save();
    
    // Generate a token
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username, userType: savedUser.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send the saved user and token back
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: savedUser._id, username: savedUser.username, userType: savedUser.userType },
      token
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
},

};

module.exports = UserController;
