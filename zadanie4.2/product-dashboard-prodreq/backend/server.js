const express = require('express');

const app = express();
const port = Number(process.env.PORT) || 3000;
const instanceId = process.env.INSTANCE_ID || process.env.HOSTNAME || 'unknown-instance';

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const items = [
  { id: 1, name: 'Laptop Pro 14', price: 4999.99 },
  { id: 2, name: 'Monitor 27', price: 1199.0 },
  { id: 3, name: 'Mysz bezprzewodowa', price: 149.5 }
];

app.get('/items', (req, res) => {
  res.json(items);
});

app.post('/items', (req, res) => {
  const { name, price } = req.body;

  if (!name || typeof price !== 'number' || Number.isNaN(price)) {
    return res.status(400).json({ error: 'Pola name i price są wymagane.' });
  }

  const newItem = {
    id: items.length + 1,
    name,
    price
  };

  items.push(newItem);
  return res.status(201).json(newItem);
});

app.get('/stats', (req, res) => {
  res.json({
    totalProducts: items.length,
    instanceId
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend listening on port ${port}; instance ${instanceId}`);
});
