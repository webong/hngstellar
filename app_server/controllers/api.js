var request = require('request');
var axios = require('axios');

// To use the live network, set the hostname to 'horizon.stellar.org'
var url = 'https://horizon-testnet.stellar.org' 

var stellarSdk = require('stellar-sdk');
stellarSdk.Network.useTestNetwork();
// StellarSdk.Network.usePublicNetwork();

var server = new stellarSdk.Server(url);
var keypair = stellarSdk.Keypair; 

var adminid = ''
var adminsecret = ''
var adminSequenceNo = ''

var sendResponse = function(res,status,content){
    res.status(status);
    res.json(content);
}

function getAdminSequenceNo(){
    var options = {
        url: `${url}/${adminid}`,
        json: true
    }
    
    var callback = function(err, response, body){
        if(err){
            console.log(err)
            return
        }
        adminSequenceNo = body.sequence
    }
    
    request(options, callback)
}

var pay = function(res, sourceSecret, destinationid, amount){
    var sourceSecretKey = sourceSecret;
    var sourceKeyPair = stellarSdk.Keypair.fromSecret(sourceSecretKey)
    var sourcePublicKey = sourceKeyPair.publicKey();
    var receiverPublicKey = destinationid;
    var server = new stellarSdk.Server('https://horizon-testnet.stellar.org');
    stellarSdk.Network.useTestNetwork();
    
    server.loadAccount(sourcePublicKey)
        .then(function(account){
            var transaction = new stellarSdk.TransactionBuilder(account)
                .addOperation(stellarSdk.Operation.payment({
                    destination: receiverPublicKey,
                    asset: stellarSdk.Asset.native(),
                    amount: amount
                })).build();
        
            transaction.sign(sourceKeyPair);
        
        server.submitTransaction(transaction)
            .then(function(txnResult){
                    var accountDetails = {
                        id: sourcePublicKey,
                        secret: sourceSecretKey,
                        txn: txnResult
                    }
                    console.log(txnResult); 
                    sendResponse(res, 200, accountDetails)
                })
            .catch(function(err){console.log('an error occurred',err.data.extras.result_codes)})
        }).catch(function(err){console.log(err)})
    
}

module.exports.createAdminAcct = function(req, res) {
    var pair = keypair.random();
    
    var options = {
        url: "https://friendbot.stellar.org/",
        qs: {addr: pair.publicKey()},
        json: true
    }
    
    var callback = function(err, response, body){
        if(err){
            return sendResponse(res, 400, err)
        }
        var accountDetails = {
            id: pair.publicKey(),
            secret: pair.secret(),
            receipt: body
        }
        
        sendResponse(res, 200, accountDetails)
    }
    
    request(options, callback)
             
}

module.exports.moreCoins = function(req, res) {
    
    var options = {
        url: "https://friendbot.stellar.org/",
        qs: {addr: adminid},
        json: true
    }
    
    var callback = function(err, response, body){
        if(err){
            return sendResponse(res, 400, err)
        }
        sendResponse(res, 200, {"message":"you have successfully generated 10,000xlm"})
    }
    
    request(options, callback)
             
}

module.exports.createAcct = function(req, res) {
    var pair = keypair.random();
    
    var options = {
        url: "https://friendbot.stellar.org/",
        qs: {addr: pair.publicKey()},
        json: true
    }
    
    var callback = function(err, response, body){
        if(err){
            return sendResponse(res, 400, err)
        }
        var accountDetails = {
            id: pair.publicKey(),
            secret: pair.secret(),
            receipt: body
        }
        
        pay(res, accountDetails.secret, adminid, '9998.99999');
    }
    
    request(options, callback)
             
}


module.exports.checkBalance = function (req, res){
    var id = req.params.id
    
    server.loadAccount(id).then(function(account){
        var info = {
            desc: 'Balance for '+id,
            balances: account.balances
        }   

         sendResponse(res, 200, info)
    })   
}


module.exports.pay = function (req, res){
    var sourceSecret = req.params.secret //payers secret
    var destinationid = req.params.id //beneficiary's id
    var amount = req.params.amount //amount to be paid a string
    
    pay(req, res, sourceSecret, destinationid, amount)
}


module.exports.transactionHistory = function (req,res){
     var accountId =  req.params.id;
     var payments = server.payments().forAccount(accountId);

        server.transactions()
        .forAccount(accountId)
        .call()
        .then(function (page) {
            console.log('Page 1: ');
            console.log(page.records);
             sendResponse(res, 200, page.records);
            return page.next();
        })
        .then(function (page) {
            console.log('Page 2: ');
            console.log(page.records);
            sendResponse(res, 200, page.records);
        })
        .catch(function (err) {
            console.log(err);
                sendResponse(res, 500, err);
        });
}


// Show all Offers like buy and sell made by an account on stellar blockchain
module.exports.accountOffers = function (req,res) {
    // body...
     var accountId =  req.params.id;

    server.offers('accounts', accountId)
  .call()
  .then(function (offerResult) {
    console.log(offerResult);
     sendResponse(res, 200, offerResult);
  })
  .catch(function (err) {
    console.error(err);
     sendResponse(res, 300, err);
  });
}



module.exports.trade = function (req,res) {
    // body...
    var base_asset_type = 'native'
    var base_asset_code = ''
    var base_asset_issuer = ''
    var counter_asset_type = 'credit_alphanum4'
    var counter_asset_code = 'USD'
    var counter_asset_issuer = 'GA2HGBJIJKI6O4XEM7CZWY5PS6GKSXL6D34ERAJYQSPYA6X6AI7HYW36'
    var link = 'https://horizon.stellar.org/trade_aggregations?base_asset_type=native&counter_asset_code=SLT&counter_asset_issuer=GCKA6K5PCQ6PNF5RQBF7PQDJWRHO6UOGFMRLK3DYHDOI244V47XKQ4GP&counter_asset_type=credit_alphanum4&limit=200&order=asc&resolution=3600000&start_time=1517521726000&end_time=1517532526000'
   // var link = `${url}/trade_aggregations?base_asset_type=${base_asset_type}&base_asset_code=${base_asset_code}&base_asset_issuer=${base_asset_issuer}&counter_asset_type=${counter_asset_type}&counter_asset_code=${counter_asset_code}&counter_asset_issuer=${counter_asset_issuer}&order=asc&resolution=3600000&start_time=1517521726000&end_time=1517532526000`
    console.log(link);

    axios.get(link)
        .then(
            function (trade) {
               //console.log(trade);
              //sendResponse(res, 200, trade);
              res.status(200).json(trade);
        })
        .catch(error => {
            res.status(500).send(error);
        });  

}


