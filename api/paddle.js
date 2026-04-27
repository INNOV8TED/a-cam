const crypto = require('crypto');

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function verifyPaddleSignature(signature, rawBody, secret) {
    if (!signature || !secret) return false;

    const parts = signature.split(';');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const hashPart = parts.find(p => p.startsWith('h='));

    if (!timestampPart || !hashPart) return false;

    const timestamp = timestampPart.split('=')[1];
    const receivedHash = hashPart.split('=')[1];

    const signedPayload = `${timestamp}:${rawBody}`;
    const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    // LOGGING FOR DEBUGGING
    console.log(`[SECURITY_DEBUG] Received Hash: ${receivedHash.substring(0, 8)}...`);
    console.log(`[SECURITY_DEBUG] Expected Hash: ${expectedHash.substring(0, 8)}...`);
    console.log(`[SECURITY_DEBUG] Payload Length: ${rawBody.length}`);

    try {
        return crypto.timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expectedHash));
    } catch (e) {
        return false;
    }
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const signature = req.headers['paddle-signature'];
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('[CONFIG] PADDLE_WEBHOOK_SECRET IS MISSING IN VERCEL ENV');
        return res.status(500).send('Config Error');
    }

    try {
        const rawBody = await getRawBody(req);

        if (!verifyPaddleSignature(signature, rawBody, webhookSecret)) {
            console.warn('[SECURITY] Invalid Paddle Signature');
            return res.status(401).send('Unauthorized');
        }

        const event = JSON.parse(rawBody);
        console.log(`[PADDLE] SUCCESS: Received ${event.event_type}`);

        return res.status(200).send('OK');
    } catch (err) {
        console.error('[ERROR]', err.message);
        return res.status(500).send('Error');
    }
};
