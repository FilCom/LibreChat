const express = require('express');
const requireJwtAuth = require('../middleware/requireJwtAuth');
const {
  getUserController,
  updateUserPluginsController,
  getUsersController,
} = require('../controllers/UserController');

const router = express.Router();

router.get('/', requireJwtAuth, getUserController);
router.post('/plugins', requireJwtAuth, updateUserPluginsController);
router.get('/all', requireJwtAuth, getUsersController);

module.exports = router;
