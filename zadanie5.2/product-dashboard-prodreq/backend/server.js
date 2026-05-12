const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
const instanceId = process.env.INSTANCE_ID || process.env.HOSTNAME || 'unknown-instance';

const DATA_DIR = '/data';
const DATA_FILE = path.join(DATA_DIR, 'items.json');

const defaultItems = [
  { id: 1, name: 'Laptop Pro 14', price: 4999.99 },
  { id: 2, name: 'Monitor 27', price: 1199.0 },
  { id: 3, name: 'Mysz bezprzewodowa', price: 149.5 }
];

app.use(express.json());

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultItems, null, 2), 'utf8');
  }
}

async function readItems() {
  const data = await fs.readFile(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

async function writeItems(items) {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
}

app.get('/items', async (req, res) => {
  try {
    const items = await readItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się odczytać produktów.' });
  }
});

app.post('/items', async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || typeof price !== 'number' || Number.isNaN(price)) {
      return res.status(400).json({ error: 'Pola name i price są wymagane.' });
    }

    const items = await readItems();

    const newItem = {
      id: items.length ? Math.max(...items.map(item => item.id)) + 1 : 1,
      name,
      price
    };

    items.push(newItem);
    await writeItems(items);

    return res.status(201).json(newItem);
  } catch (error) {
    return res.status(500).json({ error: 'Nie udało się zapisać produktu.' });
  }
});

app.get('/stats', async (req, res) => {
  try {
    const items = await readItems();

    res.json({
      totalProducts: items.length,
      instanceId
    });
  } catch (error) {
    res.status(500).json({ error: 'Nie udało się pobrać statystyk.' });
  }
});

ensureDataFile()
  .then(() => {
    app.listen(port, '0.0.0.0', () => {
      console.log(`Backend listening on port ${port}; instance ${instanceId}`);
      console.log(`Data file: ${DATA_FILE}`);
    });
  })
  .catch((error) => {
    console.error('Błąd inicjalizacji danych:', error);
    process.exit(1);
  });