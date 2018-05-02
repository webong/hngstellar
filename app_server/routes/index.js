var express = require('express');
var router = express.Router();
var homeController = require('../controllers/main');
var api = require('../controllers/api');


/* GET home page. */
router.get('/', homeController.home);

router.get('/api', homeController.home);

router.get('/api/createAcct', api.createAcct);

router.get('/api/createAdminAcct', api.createAdminAcct);

router.get('/api/checkBalance/:id', api.checkBalance);

router.get('/api/pay/:secret/:id/:amount', api.pay);

router.get('/api/moreCoins', api.moreCoins);


module.exports = router;
