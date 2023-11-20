const express = require('express');
const router = express.Router();
const PropertyController = require('../controllers/PropertyController');
const authJwt = require('../Middleware/auth');

// GET all properties
router.get('/',[authJwt.verifyToken], PropertyController.getAll);

// GET a single property by ID
router.get('/:id',[authJwt.verifyToken], PropertyController.getById);

// CREATE a new property
router.post('/',[authJwt.verifyToken], PropertyController.create);

// UPDATE a property by ID
router.put('/:id', [authJwt.verifyToken],PropertyController.update);

// DELETE a property by ID
router.delete('/:id', [authJwt.verifyToken],PropertyController.delete);

module.exports = router;
