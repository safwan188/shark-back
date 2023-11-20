// Import the Equipment model
const Equipment = require('../models/Equipment');


// In your equipmentController.js file
exports.createEquipment = async (req, res) => {
  try {
    const newEquipment = new Equipment({
      name: req.body.name,
      imageUrl: req.file ? req.file.path : null, // req.file will have the file that multer saved
    });

    const savedEquipment = await newEquipment.save();
    res.status(201).json(savedEquipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find();

    // Modify the `imageUrl` field to be a full path
    const updatedEquipment = equipment.map(item => {
      if (item.imageUrl) {
        // Normalize the path to use forward slashes only
        const normalizedImagePath = item.imageUrl.replace(/\\/g, '/');
        item.imageUrl = `${req.protocol}://${req.get('host')}/${normalizedImagePath}`;
      }
      return item;
    });

    res.json(updatedEquipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET - Retrieve a single equipment by ID
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT - Update an equipment
exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // This option returns the updated document
    );

    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json(equipment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Delete an equipment
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipment) {
      return res.status(404).json({ message: 'Equipment not found' });
    }
    res.json({ message: 'Equipment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
