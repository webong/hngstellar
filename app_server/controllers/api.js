const request = require('request');

const testurl = 'https://horizon-testnet.stellar.org'
const stellarSdk = require('stellar-sdk');
stellarSdk.Network.useTestNetwork();
const server = new stellarSdk.Server(testurl);
const keypair = stellarSdk.Keypair;


const sendres = function(res,status,content) {
    res.status(status);
    res.json(content);
}

module.exports.createAccount = function(req, res) {

    const pair = keypair.random();

    const options = {
        url: 'https://friendbot.stellar.org/',
        qs: {addr: pair.publicKey()},
        json: true
    };

    const callback = function(err, response, body) {
        if (err) {
            return sendRes(res, 400, err)
        }
        const info = {
            id: pair.publicKey(),
            secret: pair.secret(),
            receipt: body
        }

        sendres(res, 200, info);
    }

    request(options, callback);
}

module.exports.streamPayment = function(req, res) {
    const id = req.params.id

    const options = {
        url: `https://horizon-testnet.stellar.org/accounts/${id}/payments`,
        json: true,
        headers: {
            'Accept': 'text/event-stream',
        }
    }

    const callback = function(err, response, body) {
        if (err) {
            return sendres(res, 400, {'Error': err});
        }
        sendres(res, 200, {'NewPayment': body});
    }

    request(options, callback)

}

module.exports.checkBalance = function(req, res) {
    const id = req.params.id

    server.loadAccount(id).then(function(account) {
        const info = {
            desc: `Balances for ${id}`,
            balances: account.balances
        }

        sendres(res, 200, info)
    })
}

module.exports.pay = function(req, res) {
    const sourceSecret = req.body.secret // payers secret
    const destinationid = req.body.id   // beneficiary's id
    const amount = req.body.amount     // amount to be paid as string

    const sourceKeys = keypair.fromSecret(sourceSecret)

    let transaction;

    server.loadAccount(destinationid)
        .catch(stellarSdk.NotFoundError, function(error) {
            sendres(res, 400, {'Error':error})
            throw new Error('The destination account does not exist!');
        })
        .then(function() {
            return server.loadAccount(sourceKeys.publicKey());
        })
        .then(function(sourceAccount) {
            transaction = new stellarSdk.TransactionBuilder(sourceAccount)
                .addOperation(stellarSdk.Operation.payment({
                destination: destinationid,
                asset: stellarSdk.Asset.native(),
                amount: amount,
            }))
                .addMemo(stellarSdk.Memo.text('Test Transaction'))
                .build();
            transaction.sign(sourceKeys);
            return server.submitTransaction(transaction);
        })
        .then(function(result) {
            sendres(res, 200, {
                'message': 'Success!',
                'results': result,
            });
            console.log('Success! Results:', result);
        })
        .catch(function(error) {
            sendres(res, 400, {
                'message': 'Something went wrong!',
                'error': error,
            });
            console.error('Something went wrong!', error);
        })
}
