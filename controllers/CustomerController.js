const Customer = require('../models/Customer'); // Import the Customer model
const Property = require('../models/Property'); // Import the Property model
const mongoose = require('mongoose');

const CustomerController = {
  // Create a new customer
  createCustomer: async (req, res) => {
    try {
      const newCustomer = new Customer(req.body);
      const savedCustomer = await newCustomer.save();
      res.status(201).json({ message: 'New customer created successfully', customer: savedCustomer });
    } catch (error) {
      res.status(400).json({ error: 'Failed to create customer', details: error.message });
    }
  },
  
  createMultipleCustomersAndProperties: async (req, res) => {
    try {
      const customerProperties = req.body;

      const savedCustomerProperties = [];

      for (let i = 0; i < customerProperties.length; i++) {
        const { name, phone,tz, cityName, street, propertyNumber } = customerProperties[i];

        const newCustomer = new Customer({ name, phone ,tz});
        const savedCustomer = await newCustomer.save();

        const newProperty = new Property({
          cityName,
          street,
          propertyNumber,
          customerId: savedCustomer._id
        });

        const savedProperty = await newProperty.save();

        const customer = await Customer.findByIdAndUpdate(savedCustomer._id, { $push: { properties: savedProperty._id } }, { new: true, runValidators: true });

        savedCustomerProperties.push({ customer: customer, property: savedProperty });
      }

      res.status(201).json({ message: 'Multiple customers and properties created successfully', data: savedCustomerProperties });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create multiple customers and properties', details: error.message });
  }
  },
  createCustomerAndProperty  : async (req, res) => {
    try {
      // Extracting property info and customer info separately from request body
      const { name, phone, tz,cityName, street, propertyNumber } = req.body;
      
      // Creating a new customer
      const newCustomer = new Customer({ name, phone,tz });
      const savedCustomer = await newCustomer.save();
  
      // After saving the customer, create a property with the customerId
      const newProperty = new Property({
        cityName,
        street,
        propertyNumber,
        customerId: savedCustomer._id // Assign the newly created customer's ID
      });
  
      // Save the property to the database
      const savedProperty = await newProperty.save();
      const customer = await Customer.findByIdAndUpdate(savedCustomer._id, { $push: { properties: savedProperty._id } }, { new: true, runValidators: true });
  
      // Respond with both the customer and property data
      res.status(201).json({ message: 'Customer and property created successfully', customer: customer, property: savedProperty });
    } catch (error) {
      res.status(400).json({ error: 'Failed to create customer and property', details: error.message });
    }
  },
  // Retrieve all customers
  getAllCustomers: async (req, res) => {
    try {
      const customers = await Customer.find().populate('properties');
      res.status(200).json({ message: 'Customers retrieved successfully', customers: customers });
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve customers', details: error.message });
    }
  },
  

  // Retrieve a single customer by ID
  getCustomerById: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id).populate('properties');
      if (!customer) {
        res.status(404).json({ message: 'Customer not found' });
      } else {
        res.status(200).json({ message: 'Customer retrieved successfully', customer: customer });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve customer', details: error.message });
    }
  },
  

  
  // Update a customer by ID
  updateCustomer: async (req, res) => {
    try {
      const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedCustomer) {
        res.status(404).json({ message: 'Customer not found' });
      } else {
        res.status(200).json({ message: 'Customer updated successfully', customer: updatedCustomer });
      }
    } catch (error) {
      res.status(400).json({ error: 'Failed to update customer', details: error.message });
    }
  },
  
  getPropertyByCustomer: async (req, res) => {
    try {
      const customer = await Customer.findById(req.params.id);
      if (!customer) {
        res.status(404).json({ message: 'Customer not found' });
      } else {
        const properties = await Property.find({ customerId: customer._id });
        res.status(200).json({ message: 'Properties retrieved successfully', properties: properties });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve properties', details: error.message });
    }
  },
  
  // Delete a customer by ID
  deleteCustomer: async (req, res) => {
    try {
      const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
      if (!deletedCustomer) {
        res.status(404).json({ message: 'Customer not found' });
      } else {
        res.status(200).json({ message: 'Customer deleted successfully' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete customer', details: error.message });
    }
  }
  
};

module.exports = CustomerController;
