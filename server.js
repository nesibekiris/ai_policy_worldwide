const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DATA_PATH = path.join(ROOT_DIR, 'src', 'data', 'countries.json');

app.use(express.json());
app.use(express.static(ROOT_DIR));

app.get('/api/countries', async (_req, res) => {
  try {
    const fileContents = await fs.readFile(DATA_PATH, 'utf-8');
    const data = JSON.parse(fileContents);

    if (!Array.isArray(data?.countries)) {
      throw new Error('Invalid countries payload.');
    }

    res.json({ countries: data.countries });
  } catch (error) {
    console.error('Error loading countries data:', error);
    res.status(500).json({ error: 'Unable to load country data.' });
  }
});

app.get('*', (_req, res, next) => {
  if (_req.path.includes('.')) {
    return next();
  }

  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
