const express = require('express');
const router = express.Router();
const expertRequest = require('../controllers/ExpertRequestController');
const authJwt = require('../Middleware/auth');

router.post('/',[  authJwt.verifyToken], expertRequest.createRequest);
router.get('/',[  authJwt.verifyToken],expertRequest.getAllRequests);
router.get('/:id',[  authJwt.verifyToken], expertRequest.getRequest);
router.put('/:id',[  authJwt.verifyToken], expertRequest.updateRequest);
router.put('/:id/assignexpert', [  authJwt.verifyToken],expertRequest.assignExpert);
router.delete('/:id',[  authJwt.verifyToken], expertRequest.deleteRequest);

module.exports = router;
