const crypto = require('crypto');

export const config = {
    api: {
        bodyParser: false,
    },
};

// Standard Node.js stream reader (more reliable than for-await on some Vercel versions)
function getRawBody(req) {
    return new Promise((resolve, reject) => {
        let bodyChunks = [];
        req.on('error', (err) => reject(err));
        req.on('data', (chunk) => bodyChunks.push(chunk));
        req.on('end', () => {
            const rawBody = Buffer.concat(bodyChunks).toString('utf8');
            resolve(rawBody);
        });
    });
}

function verifyPaddleSignature(signature, rawBody, secret) {
    if (!signature || !secret) return false;

    const parts = signature.split(';');
    const timestamp = parts.find(p => p.startsWith('t=')).split('=')[1];
    const receivedHash = parts.find(p => p.startsWith('h=')).split('=')[1];

    const signedPayload = `${timestamp}:${rawBody}`;
    const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    return crypto.timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expectedHash));
}

module.exports = async (req, res) => {
    // 1. Respond to GET (Browser tests)
    if (req.method === 'GET') {
        return res.status(200).send('◈ IN-NO-V8 Webhook Listener Active (Accepts POST only)');
    }

    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        // 2. Capture Raw Body with a 5-second timeout safeguard
        const rawBody = await Promise.race([
            getRawBody(req),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout reading body')), 5000))
        ]);

        const signature = req.headers['paddle-signature'];
        const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

        // 3. Signature Verification
        if (!verifyPaddleSignature(signature, rawBody, webhookSecret)) {
            console.warn('[SECURITY] Invalid Signature');
            return res.status(401).send('Unauthorized');
        }

        // 4. Success logic
        const event = JSON.parse(rawBody);
        console.log(`[PADDLE] Received: ${event.event_type}`);
        
        return res.status(200).send('Webhook Received');

    } catch (err) {
        console.error('[ERROR]', err.message);
        return res.status(500).send('Error Processing Webhook');
    }
};
