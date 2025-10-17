export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      res.status(200).json({ message: '✅ Serverless function is working fine!' });
    } else {
      res.status(405).json({ error: 'Method not allowed. Use GET for test.' });
    }
  } catch (error) {
    console.error('Function crashed:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
