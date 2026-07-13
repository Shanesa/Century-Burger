const money = (value) => `LKR ${value.toLocaleString()}`;
const assetPath = (path) => path.startsWith('assets/') ? path : `assets/img/${path}`;
let cart = [
  { ...menuItems[0], qty: 1 },
  { ...menuItems[4], qty: 1 }
];
let paymentMode = 'success';
let itemModal;

function setActiveNav(route) {
  document.querySelectorAll('[data-route]').forEach((link) => {
    link.classList.toggle('active', link.dataset.route === route);
  });
}

function showScreen(route) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  const target = document.getElementById(route);
  if (target) {
    target.classList.add('active');
    setActiveNav(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function renderMenu(category = 'All') {
  const grid = document.getElementById('menuGrid');
  const filtered = category === 'All' ? menuItems : menuItems.filter((item) => item.category === category);
  grid.innerHTML = filtered.map((item) => `
    <div class="col">
      <article class="food-card card h-100 border-0 shadow-sm">
        <button class="food-art" style="--card-color:${item.color}" onclick="openItem(${item.id})">
          <img src="${assetPath(item.img)}" alt="${item.name}" onerror="this.src='assets/img/placeholder-food.svg'">
          <span class="art-tag">${item.category}</span>
        </button>
        <div class="card-body d-flex flex-column">
          <p class="hero-eyebrow mb-1" style="color:var(--cb-orange-dark)">${item.category}</p>
          <h6 class="mb-1">${item.name}</h6>
          <p class="text-muted-cb small flex-grow-1">${item.desc}</p>
          <div class="d-flex justify-content-between align-items-center">
            <strong>${money(item.price)}</strong>
            <button class="btn btn-primary btn-sm" onclick="addToCart(${item.id})">Add</button>
          </div>
        </div>
      </article>
    </div>
  `).join('');
}

function openItem(id) {
  const item = menuItems.find((entry) => entry.id === id);
  document.getElementById('itemTitle').textContent = item.name;
  document.getElementById('itemDesc').textContent = item.desc;
  document.getElementById('itemPrice').textContent = money(item.price);
  document.getElementById('itemArt').style.setProperty('--card-color', item.color);
  document.getElementById('itemArt').innerHTML = `<img src="${assetPath(item.img)}" alt="${item.name}" onerror="this.src='assets/img/placeholder-food.svg'"><span class="art-tag">${item.category}</span>`;
  document.getElementById('itemAddBtn').onclick = () => { addToCart(item.id); itemModal.hide(); };
  itemModal.show();
}

function addToCart(id) {
  const item = menuItems.find((entry) => entry.id === id);
  const existing = cart.find((entry) => entry.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  renderCart();
  document.getElementById('cartCount').textContent = cart.reduce((sum, entry) => sum + entry.qty, 0);
}

function changeQty(id, delta) {
  cart = cart.map((item) => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter((item) => item.qty > 0);
  renderCart();
  document.getElementById('cartCount').textContent = cart.reduce((sum, entry) => sum + entry.qty, 0);
}

function renderCart() {
  const list = document.getElementById('cartItems');
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = document.querySelector('input[name="fulfillment"]:checked')?.value === 'Delivery' ? 350 : 0;
  list.innerHTML = cart.length ? cart.map((item) => `
    <div class="list-group-item d-flex justify-content-between align-items-center px-0">
      <div>
        <strong class="d-block">${item.name}</strong>
        <span class="text-muted-cb small">${money(item.price)} each</span>
      </div>
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-dark btn-sm rounded-circle" style="width:30px;height:30px;" onclick="changeQty(${item.id}, -1)">-</button>
        <b>${item.qty}</b>
        <button class="btn btn-dark btn-sm rounded-circle" style="width:30px;height:30px;" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('') : '<p class="text-muted-cb small mb-0">Your cart is empty. Add items from the menu.</p>';
  document.getElementById('subtotal').textContent = money(subtotal);
  document.getElementById('deliveryFee').textContent = money(delivery);
  document.getElementById('grandTotal').textContent = money(subtotal + delivery);
}

function setDemoCard(mode) {
  paymentMode = mode;
  const result = document.getElementById('paymentResult');
  if (mode === 'success') {
    document.getElementById('cardNumber').value = '4242 4242 4242 4242';
    document.getElementById('cardName').value = 'Century Demo';
    document.getElementById('cardExpiry').value = '12/30';
    document.getElementById('cardCvc').value = '123';
    result.textContent = 'Success demo card selected. Payment will be approved.';
    result.className = 'payment-result rounded-3 p-2 mt-3 mb-0 success';
  } else {
    document.getElementById('cardNumber').value = '4000 0000 0000 0002';
    document.getElementById('cardName').value = 'Failed Demo';
    document.getElementById('cardExpiry').value = '12/30';
    document.getElementById('cardCvc').value = '123';
    result.textContent = 'Failed demo card selected. Client can see the error state.';
    result.className = 'payment-result rounded-3 p-2 mt-3 mb-0 fail';
  }
}

/* Hands the order to the admin demo (same browser) so it appears as a
   new order there — starting it deducts ingredients from inventory. */
function sendOrderToAdmin(paid) {
  try {
    const inbox = JSON.parse(localStorage.getItem('cb_incoming_orders') || '[]');
    inbox.push({
      customer: 'Website customer',
      items: cart.map((line) => ({ id: line.id, qty: line.qty })),
      type: document.querySelector('input[name="fulfillment"]:checked')?.value === 'Delivery' ? 'Delivery' : 'Pickup',
      payment: paid ? 'Paid' : 'Unpaid'
    });
    localStorage.setItem('cb_incoming_orders', JSON.stringify(inbox));
  } catch (e) { /* demo only */ }
}

function placeDemoOrder() {
  const method = document.getElementById('paymentMethod').value;
  const isCard = method.toLowerCase().includes('card');
  const result = document.getElementById('paymentResult');
  if (isCard && paymentMode === 'fail') {
    result.textContent = 'Demo payment failed. Please use the success demo card or choose cash on delivery.';
    result.className = 'payment-result rounded-3 p-2 mt-3 mb-0 fail';
    return;
  }
  if (isCard) {
    result.textContent = 'Processing demo payment...';
    result.className = 'payment-result rounded-3 p-2 mt-3 mb-0 processing';
    setTimeout(() => {
      result.textContent = 'Demo payment approved. Order created successfully.';
      result.className = 'payment-result rounded-3 p-2 mt-3 mb-0 success';
      sendOrderToAdmin(true);
      showScreen('tracking');
    }, 450);
    return;
  }
  result.textContent = 'Cash on delivery selected. Order created without card payment.';
  result.className = 'payment-result rounded-3 p-2 mt-3 mb-0 success';
  sendOrderToAdmin(false);
  showScreen('tracking');
}

function init() {
  itemModal = new bootstrap.Modal(document.getElementById('itemModal'));
  document.querySelectorAll('[data-route]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    showScreen(link.dataset.route);
  }));
  document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
    document.querySelectorAll('[data-category]').forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    renderMenu(button.dataset.category);
  }));
  document.querySelectorAll('input[name="fulfillment"]').forEach((input) => input.addEventListener('change', renderCart));
  document.getElementById('paymentMethod').addEventListener('change', (event) => {
    const isCard = event.target.value.toLowerCase().includes('card');
    document.getElementById('cardBox').style.display = isCard ? 'block' : 'none';
    document.getElementById('placeOrder').textContent = isCard ? 'Pay Demo Card & Place Order' : 'Place Cash Order';
  });
  document.getElementById('useDemoCard').addEventListener('click', () => setDemoCard('success'));
  document.getElementById('useFailCard').addEventListener('click', () => setDemoCard('fail'));
  document.getElementById('placeOrder').addEventListener('click', placeDemoOrder);
  renderMenu();
  renderCart();
  document.getElementById('cartCount').textContent = cart.reduce((sum, entry) => sum + entry.qty, 0);
}

document.addEventListener('DOMContentLoaded', init);
