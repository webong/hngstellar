var request = require('request');

var testurl = 'https://horizon-testnet.stellar.org'
var stellarSdk = require('stellar-sdk');
stellarSdk.Network.useTestNetwork();
var server = new stellarSdk.Server(testurl);
var keypair = stellarSdk.Keypair; 
var pair = keypair.random();


var sendres = function(res,status,content){
    res.status(status);
    res.json(content);
}

module.exports.createAcct = function(req, res) {
    
    var options = {
        url: "https://friendbot.stellar.org/",
        qs: {addr: pair.publicKey()},
        json: true
    }
    
    var callback = function(err, response, body){
        if(err){
            return sendRes(res, 400, err)
        }
        var info = {
            id: pair.publicKey(),
            secret: pair.secret(),
            receipt: body
        }
        
        sendres(res, 200, info)
    }
    
    request(options, callback)
             
}

module.exports.streamPayment = function (req, res){
    var id = req.params.id
    
    var options = {
        url: 'https://horizon-testnet.stellar.org/accounts/'+id+'/payments',
        json: true,
        headers: {
            'Accept':'text/event-stream'
        }
    }
    
    var callback = function (err, response, body){
        if (err) {
            return sendres(res, 400, {"Error":err})
        }
        sendres(res, 200, {"NewPayment":body})
    }
    
    request(options, callback)
    
}

module.exports.checkBalance = function (req, res){
    var id = req.params.id
    
    server.loadAccount(id).then(function(account){
        var info = {
            desc: 'Balances for '+id,
            balances: account.balances
        }
        
        sendres(res, 200, info)
    })
}

module.exports.pay = function (req, res){
    var sourceSecret = req.params.secret //payers secret
    var destinationid = req.params.id //beneficiary's id
    var amount = req.params.amount //amount to be paid a string
    
    var sourceKeys = keypair.fromSecret(sourceSecret)
    
    var transaction;
    
    server.loadAccount(destinationid)
        .catch(stellarSdk.NotFoundError, function(error){
            sendres(res, 400, {"Error":error})
            throw new Error('The destination account does not exist!');
        })
        .then(function(){
            return server.loadAccount(sourceKeys.publicKey());
        })
        .then(function(sourceAccount){
            transaction = new stellarSdk.TransactionBuilder(sourceAccount)
                .addOperation(stellarSdk.Operation.payment({
                destination: destinationid,
                asset: stellarSdk.Asset.native(),
                amount: amount
            }))
                .addMemo(stellarSdk.Memo.text('Test Transaction'))
                .build();
            transaction.sign(sourceKeys);
            return server.submitTransaction(transaction);
        })
        .then(function(result){
            sendres(res, 200, {"message":"Success!", "results":result})
            console.log('Success! Results:', result)
        })
        .catch(function(error){
            sendres(res, 400, {"message":"Something went wrong!", "error":error})
            console.error('Something went wrong!', error)
        })
}