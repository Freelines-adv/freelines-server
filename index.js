const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

// Allow CORS from GitHub Pages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://freelines-adv.github.io');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Health check
app.get('/', (req, res) => res.json({ status: 'FreeLines Server Running ✅' }));

// Send notification to specific employee
app.post('/notify', async (req, res) => {
  const { empName, title, body } = req.body;

  if (!empName || !title || !body) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${process.env.ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        filters: [{ field: 'external_user_id', value: empName }],
        headings: { en: title, ar: title },
        contents: { en: body, ar: body },
        ios_badge_type: 'Increase',
        ios_badge_count: 1,
        ttl: 86400
      })
    });

    const data = await response.json();
    console.log(`Notification sent to ${empName}:`, data);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
