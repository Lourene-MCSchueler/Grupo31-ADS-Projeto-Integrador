const { Router } = require('express');

const router = Router();

require('./auth')(router);

module.exports = router;
