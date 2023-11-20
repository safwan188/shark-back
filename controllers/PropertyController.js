
const Property = require('../models/Property');
const Customer = require('../models/Customer');
const PropertyController = {
  // GET /properties
  async getAll(req, res) {
    try {
      const properties = await Property.find().populate('customerId');
      res.json(properties);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  // GET /properties/:id
  async getById(req, res) {
    try {
      const property = await Property.findById(req.params.id);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json(property);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  // POST /properties
   // POST /properties
   async create(req, res) {
    try {
      const { customerId } = req.body; // Assuming the customer ID is sent in the request body
      if (!customerId) {
        return res.status(400).json({ message: 'Customer ID must be provided' });
      }

      // First, create the property
      const property = new Property(req.body);
      const savedProperty = await property.save();

      // Second, find the customer and update their properties array
      const updatedCustomer = await Customer.findByIdAndUpdate(
        customerId,
        { $push: { properties: savedProperty._id } },
        { new: true, runValidators: true } // Return the updated customer and run validation
      );

      if (!updatedCustomer) {
        // If the customer doesn't exist, you might want to handle it accordingly
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.json({
        property: savedProperty,
        customer: updatedCustomer // Optional: Return the updated customer data as well
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  // PUT /properties/:id
  async update(req, res) {
    try {
      const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json(property);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },

  // DELETE /properties/:id
  async delete(req, res) {
    try {
      const property = await Property.findByIdAndDelete(req.params.id);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json({ message: 'Property deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  },
};

module.exports = PropertyController;
