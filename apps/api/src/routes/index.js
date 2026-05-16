const { Router } = require('express');

const router = Router();

require('./auth')(router);
require('./consultas')(router);

module.exports = router;
