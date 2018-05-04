var request = require('request');

var testurl = 'https://horizon-testnet.stellar.org'
var stellarSdk = require('stellar-sdk');
stellarSdk.Network.useTestNetwork();
var server = new stellarSdk.Server(testurl);
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
        url: "https://horizon-testnet.stellar.org/accounts/"+adminid,
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
    var id = adminid
    
    server.loadAccount(id).then(function(account){
        var info = {
            desc: 'Balance for '+id,
            balance: account.balances[0].balance
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
