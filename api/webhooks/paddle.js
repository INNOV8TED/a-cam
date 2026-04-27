/**
 * DEBUG VERSION - BYPASSES SIGNATURE VERIFICATION
 */
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    console.log('[DEBUG] Received POST request from Paddle');
    
    // Return 200 immediately to test connectivity
    return res.status(200).send('OK');
};
