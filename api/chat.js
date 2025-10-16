export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ message: '✅ API is working fine!' });
  } else {
    res.status(405).json({ error: 'Method not allowed. Use GET for test.' });
  }
}
