# hngstellar

This is a NodeJS api based on the Stellar JS SDK. The useful endpoints are:

# /api/createAccount
This endpoint creates a Stellar account and funds it with 10,000 xlm, pays 9,999 xlm to the admin acct and returns a JSON response containing the account id and secret.
  
# /api/checkBalance/{account-id}
This endpoint returns the balance of a Stellar account, the account id is sent in the request url as a request parameter.
  
# /api/pay/{payer-secret}/{recipient-id}/{amount}
This endpoint transfers a specified amount from a payer's account to a recipient's account. The payer's secret, recipient account id and amount are sent as request parameters in the request url.
