const express = require('express');
const UserController = require('../controllers/UserController'); // Ensure this path is correct

const router = express.Router();
const authJwt = require('../Middleware/auth');

// Route to create a new user
//router.post('/', [authJwt.verifyToken],UserController.createUser);

// Route to retrieve all users
//router.get('/',  [authJwt.verifyToken],UserController.getAllUsers);

// Route to retrieve a single user by ID
//router.get('/:id', [  authJwt.verifyToken],UserController.getUserById);


// Route for user login
router.post('/login', UserController.loginUser);

// Route for user registration
//router.post('/register', UserController.registerUser);

module.exports = router;
