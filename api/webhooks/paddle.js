const crypto = require('crypto');

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
 * Vercel Serverless Function for Paddle Webhooks
 */
module.exports = async (req, res) => {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Get the signature from headers
    const signature = req.headers['paddle-signature'];
    const webhookSecret = process.env.PADDLE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('[CONFIG] PADDLE_WEBHOOK_SECRET is missing in environment variables');
        return res.status(500).json({ error: 'Server Configuration Error' });
    }

    // 3. Get the raw body for signature verification
    // Vercel parses the body by default. For signature verification, we should ideally disable it,
    // but we can try to reconstruct it if it's simple JSON.
    // If you encounter verification errors, you'll need to disable bodyParser in vercel.json.
    const rawBody = JSON.stringify(req.body);

    // 4. Security Check: Verify Signature
    if (!verifyPaddleSignature(signature, rawBody, webhookSecret)) {
        console.warn('[SECURITY] Invalid Paddle Signature received');
        return res.status(401).json({ error: 'Invalid Signature' });
    }

    try {
        const event = req.body;
        console.log(`[PADDLE] Processing event: ${event.event_type}`);

        // 5. Handle Transaction Completion
        if (event.event_type === 'transaction.completed') {
            const { app_slug, user_id } = event.data.custom_data || {};

            if (app_slug && user_id) {
                console.log(`[SUCCESS] Unlocking ${app_slug} for user ${user_id}`);
                
                // --- DATABASE LOGIC GOES HERE ---
                // Example: await db.users.updateOne({ id: user_id }, { $set: { [`apps.${app_slug}.unlocked`]: true } });
            } else {
                console.warn('[DATA] Webhook received without app_slug or user_id in custom_data');
            }
        }

        // 6. Acknowledge Receipt
        return res.status(200).json({ message: 'Webhook Processed Successfully' });

    } catch (err) {
        console.error('[ERROR] Failed to process webhook:', err.message);
        return res.status(500).json({ error: 'Internal Processing Error' });
    }
};
