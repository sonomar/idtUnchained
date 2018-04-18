/*
Before start:
1. Use "create-btc-address.js" to create a bitcoin address.
2. Save the address and WIF private key, eg: n1mafk6ocbr65b4UGyfZwj1jfmUm33MPvP (address), 92PibKf7Dh2tyngTpwzXGmyWpvQYS5kRC78dg97gwBNYCbYBaVi (private key)

Reference: https://bitcoin.org/en/developer-reference#remote-procedure-calls-rpcs
*/

const http = require('http');


// wrapper for JSON-RPC calls
const JsonRpc = (method, params, cb) => {
  let options = {
    host: '54.82.43.6',
    port: '3000',
    auth: 'test:kY4oFXLLF_oScWqI52xUyuSHK87n0XvYYD9_pHhYk9o=',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  let data = {
    jsonrpc: '2.0',
    method: method,
    params: params
  };

  let req = http.request(options, (res) => {
    let body = '';

    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      cb(null, JSON.parse(body));
    });
  });

  req.on('error', (e) => {
    cb(e, null);
  });

  req.write(JSON.stringify(data));
  req.end();
}

const testAddress = 'n1mafk6ocbr65b4UGyfZwj1jfmUm33MPvP';
const testPrivateKey = '92PibKf7Dh2tyngTpwzXGmyWpvQYS5kRC78dg97gwBNYCbYBaVi';

// Step 1: import address to get UTXOs
JsonRpc('importaddress', [testAddress], (err, data) => {
  if (err) {
    console.log(err);
  } else {
    console.log('import address result:', data);


    // Step 2: get UTXOs
    JsonRpc('listunspent', [0, 9999, [testAddress]], (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log('list unspent result:', data);
        // a UTXO looks like this:
        // {
        //   txid: 'f41981c1bd55015cbae01472247312f9f08cdbef3824dfcc6c3716bf0b62ea43',
        //   vout: 0,
        //   address: 'n1mafk6ocbr65b4UGyfZwj1jfmUm33MPvP',
        //   account: '',
        //   scriptPubKey: '76a914de26b3dd5d02b5fdec93096b604e64ed55a1decb88ac',
        //   amount: 0.65,
        //   confirmations: 1,
        //   spendable: false,
        //   solvable: false,
        //   safe: true
        // }


        // Step 3: create a raw transaction with any available UTXO
        let utxo = data.result[0];
        JsonRpc('createrawtransaction', [
          // inputs
          [{
            txid: utxo.txid,
            vout: utxo.vout
          }],

          // outputs
          {
            'mqVvUjU7Gf2Wbv9Zs2JUvVyhKtDHgqGZtY': parseFloat((utxo.amount - 0.00001).toFixed(5))
          }
        ], (error, data) => {
          if (error) {
            console.log(error);
          } else {
            console.log('create raw transaction result:', data);


            // Step 4: sign the transaction with the private key
            JsonRpc('signrawtransaction', [data.result, null, [testPrivateKey]], (error, data) => {
              if (error) {
                console.log(error);
              } else {
                console.log('sign raw transaction result:', data);


                // Step 5: send the signed transaction (which is a hex string)
                JsonRpc('sendrawtransaction', [data.result.hex], (error, data) => {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('send raw transaction result:', data);
                    console.log('view transaction at:', `https://www.blocktrail.com/tBTC/tx/${data.result}`);
                  }
                });
              }
            });
          }
        });
      }
    });
  }
});