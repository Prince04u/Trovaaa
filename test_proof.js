const crypto = require('crypto');
async function test() {
  const apiKey = '474efd96cebcbb463705a112b133ae1c8ef21685eb2089c1';
  const apiSecret = '746ea39afebc1fb781e4f29674fea7ad8907ccfcb622cc6146db9e870fb1ee68';
  const baseUrl = 'https://sunpaytm.quest';

  const body = '{"order_id":"ce0e7257-51c4-48df-94f0-62f15c08101f","amount":2000,"currency":"INR","method":"upi","customer_name":"User","notify_url":"https://trovaaa.vercel.app/api/wallet/sunpays-payin-ipn/b14ed658d0fbda54d296a336c28f3e59a333b29ef5ee8fb62a5e67900010c5fd"}';

  const signature = crypto.createHmac('sha256', apiSecret).update(body).digest('hex').toLowerCase();
  console.log('Correct Signature is:', signature);

  const response = await fetch(baseUrl + '/api/public/v1/payins', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'x-signature': signature,
    },
    body: body,
  });

  const text = await response.text();
  console.log('Sunpays API Response:', text);
}
test();
