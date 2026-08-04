const crypto = require('crypto');
async function test() {
  const apiKey = '474efd96cebcbb463705a112b133ae1c8ef21685eb2089c1';
  const apiSecret = '746ea39afebc1fb781e4f29674fea7ad8907ccfcb622cc6146db9e870fb1ee68';
  const baseUrl = 'https://sunpaytm.quest';

  function generateSignature(bodyStr, secret) {
    return crypto.createHmac('sha256', secret).update(bodyStr).digest('hex').toLowerCase();
  }

  const payload = {
    order_id: '3434f903-53c8-4cfb-81a8-5c40c9db0c13',
    amount: 500,
    currency: 'INR',
    method: 'upi',
    customer_name: 'User',
    notify_url: 'https://trovaaa.vercel.app/api/wallet/sunpays-payin-ipn/b14ed658d0fbda54d296a336c28f3e59a333b29ef5ee8fb62a5e67900010c5fd'
  };

  const body = JSON.stringify(payload);
  const signature = generateSignature(body, apiSecret);

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
  console.log('Status:', response.status);
  console.log('Response:', text);
}
test();
