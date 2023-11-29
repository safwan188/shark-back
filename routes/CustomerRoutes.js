// routes/customerRoutes.js

const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustomerController');
const authJwt = require('../Middleware/auth');
const { generatePDF } = require('../Middleware/pdfgenerator'); // Use correct path to your generatePDF function
const fs = require('fs');

// Create a new customer
router.post('/',[  authJwt.verifyToken], customerController.createCustomer);
router.post('/customerandproperty', [  authJwt.verifyToken],customerController.createCustomerAndProperty);
router.post('/customerandpropertymany', [  authJwt.verifyToken],customerController.createMultipleCustomersAndProperties);

// Retrieve all customers
router.get('/',[authJwt.verifyToken], customerController.getAllCustomers);

// Retrieve a single customer by ID
router.get('/:id', [  authJwt.verifyToken],customerController.getCustomerById);

// Retrieve properties by customer ID
router.get('/:id/properties',[  authJwt.verifyToken], customerController.getPropertyByCustomer);


// Update a customer by ID
router.put('/:id',[  authJwt.verifyToken], customerController.updateCustomer);


module.exports = router;
