const crypto = require('crypto');

// Vercel config to disable automatic body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to read the raw body from the request stream
async function getRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

// Helper to verify the Paddle Signature
function verifyPaddleSignature(signature, rawBody, secret) {
    if (!signature || !secret) return false;

    const parts = signature.split(';');
    const timestampPart = parts.find(p => p.startsWith('t='));
    const hashPart = parts.find(p => p.startsWith('h='));

    if (!timestampPart || !hashPart) return false;

    const timestamp = timestampPart.split('=')[1];
    const hash = hashPart.split('=')[1];

    const signedPayload = `${timestamp}:${rawBody}`;
    const expectedHash = crypto
        .createHmac('sha256', secret)
        .update(signedPayload)
        .digest('hex');

    try {
        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash));
    } catch (e) {
        return false;
    }
}

/**
 * Vercel Serverless Function for Paddle Webhooks (Production Version)
 */
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const signature = req.headers['paddle-signature'];
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('[CONFIG] PADDLE_WEBHOOK_SECRET is missing');
        return res.status(500).json({ error: 'Server Configuration Error' });
    }

    try {
        // 1. Capture the byte-perfect raw body
        const rawBody = await getRawBody(req);

        // 2. Security Check: Verify Signature
        if (!verifyPaddleSignature(signature, rawBody, webhookSecret)) {
            console.warn('[SECURITY] Invalid Paddle Signature');
            return res.status(401).json({ error: 'Invalid Signature' });
        }

        // 3. Parse the body
        const event = JSON.parse(rawBody);
        console.log(`[PADDLE] Processing event: ${event.event_type}`);

        // 4. Handle Transaction Completion
        if (event.event_type === 'transaction.completed') {
            const { app_slug, user_id } = event.data.custom_data || {};

            if (app_slug && user_id) {
                console.log(`[SUCCESS] Unlocking ${app_slug} for user ${user_id}`);
                // --- DATABASE LOGIC HERE ---
            }
        }

        return res.status(200).json({ message: 'Webhook Received' });

    } catch (err) {
        console.error('[ERROR] Webhook processing failed:', err.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
