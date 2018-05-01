var express = require('express');
var router = express.Router();
var homeController = require('../controllers/main');
var api = require('../controllers/api');


/* GET home page. */
router.get('/', homeController.home);

router.get('/api', homeController.home);

router.post('/api/account/new', api.createAccount);

router.get('/api/account/:id/payments', api.streamPayment);

router.get('/api/account/:id/balance', api.checkBalance);

router.post('/api/pay', api.pay);

module.exports = router;
