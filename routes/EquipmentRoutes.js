const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/EquipmentController');
const upload=require('../Middleware/multerConfig');
const authJwt = require('../Middleware/auth');
router.post('/',[  authJwt.verifyToken], upload.single('equipmentImage'), equipmentController.createEquipment);
router.get('/', [  authJwt.verifyToken],equipmentController.getAllEquipment);
router.get('/:id',[  authJwt.verifyToken], equipmentController.getEquipmentById);
router.put('/:id',[  authJwt.verifyToken], equipmentController.updateEquipment);
router.delete('/:id',[  authJwt.verifyToken], equipmentController.deleteEquipment);

module.exports = router;
