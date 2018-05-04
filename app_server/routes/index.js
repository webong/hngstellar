var express = require('express');
var router = express.Router();
var homeController = require('../controllers/main');
var api = require('../controllers/api');


/* GET home page. */
router.get('/', homeController.home);

router.get('/api', homeController.home);

router.get('/api/createAcct', api.createAcct);

router.get('/api/createAdminAcct', api.createAdminAcct);

router.get('/api/moreCoins', api.moreCoins);

router.get('/api/account/transHistory/:id', api.transactionHistory);

router.get('/api/account/offers/:id', api.accountOffers);

router.get('/api/account/checkBalance/:id', api.checkBalance);

router.get('/api/pay/:secret/:id/:amount', api.pay);

router.get('/api/trade', api.trade);




module.exports = router;
