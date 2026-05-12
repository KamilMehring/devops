const listElement = document.getElementById('products-list');
const form = document.getElementById('product-form');
const message = document.getElementById('form-message');
const refreshBtn = document.getElementById('refresh-btn');

async function loadProducts() {
  listElement.innerHTML = '<li>Ładowanie...</li>';

  try {
    const response = await fetch('/api/items');
    const items = await response.json();

    if (!Array.isArray(items) || items.length === 0) {
      listElement.innerHTML = '<li>Brak produktów.</li>';
      return;
    }

    listElement.innerHTML = items
      .map(item => `<li><strong>${item.name}</strong> - ${Number(item.price).toFixed(2)} PLN</li>`)
      .join('');
  } catch (error) {
    listElement.innerHTML = '<li>Błąd podczas pobierania produktów.</li>';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = form.name.value.trim();
  const price = Number(form.price.value);

  message.textContent = 'Trwa zapisywanie...';
  message.className = 'message';

  try {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, price })
    });

    if (!response.ok) {
      throw new Error('Nie udało się dodać produktu');
    }

    form.reset();
    message.textContent = 'Produkt został dodany.';
    message.className = 'message success';
    await loadProducts();
  } catch (error) {
    message.textContent = 'Błąd podczas dodawania produktu.';
    message.className = 'message error';
  }
});

refreshBtn.addEventListener('click', loadProducts);
loadProducts();