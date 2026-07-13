/* ==========================================================================
   Century Burger admin — demo logic.
   The inventory engine: every menu item has a recipe (see data.js).
   Selling N of an item deducts N × each recipe amount from stock.
   Stock ≤ minimum → "Running low". Stock 0 → "Finished" and the order
   cannot be started until stock is added back.
   Demo state persists in localStorage; the Reset button restores data.js.
   ========================================================================== */

const STORE_KEY = 'cb_demo_state_v1';
const INBOX_KEY = 'cb_incoming_orders';

const money = (value) => `LKR ${Math.round(value).toLocaleString()}`;

function fmtQty(qty, unit) {
  if ((unit === 'g' || unit === 'ml') && Math.abs(qty) >= 1000) {
    const big = Math.round((qty / 1000) * 100) / 100;
    return `${big.toLocaleString()} ${unit === 'g' ? 'kg' : 'L'}`;
  }
  return `${Math.round(qty).toLocaleString()} ${unit}`;
}

const nowTime = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/* ---------------- State ---------------- */

let state;

function defaultState() {
  return {
    inventory: JSON.parse(JSON.stringify(inventoryData)),
    orders: JSON.parse(JSON.stringify(ordersData)),
    purchases: JSON.parse(JSON.stringify(purchasesData)),
    expenses: JSON.parse(JSON.stringify(expensesData)),
    activity: [
      { t: '11:52 AM', text: 'Order CB-1046 received — waiting to be started.', dir: 'in' },
      { t: '11:35 AM', text: 'Order CB-1045 used 260 g chicken, 2 buns, 2 cheese slices, 50 g lettuce, 40 ml sauce.', dir: 'out' },
      { t: '09:10 AM', text: 'Bought 5 kg beef from Colombo Meat Co. — added to stock.', dir: 'in' }
    ],
    nextOrderNum: 1049
  };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.inventory && parsed.orders) return parsed;
    }
  } catch (e) { /* corrupted storage falls back to defaults */ }
  return defaultState();
}

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* demo only */ }
}

/* Orders placed on the customer site land here as "Received". */
function pullIncomingOrders() {
  try {
    const inbox = JSON.parse(localStorage.getItem(INBOX_KEY) || '[]');
    if (!inbox.length) return;
    inbox.forEach((entry) => {
      state.orders.unshift({
        id: `CB-${state.nextOrderNum++}`,
        customer: entry.customer || 'Website customer',
        items: entry.items || [],
        status: 'Received', type: entry.type || 'Pickup',
        rider: '-', time: nowTime(),
        payment: entry.payment || 'Paid', consumed: false
      });
      logActivity(`Order ${state.orders[0].id} came in from the website.`, 'in');
    });
    localStorage.removeItem(INBOX_KEY);
    save();
  } catch (e) { /* ignore bad inbox data */ }
}

/* ---------------- Inventory engine ---------------- */

const getIng = (id) => state.inventory.find((i) => i.id === id);
const getItem = (id) => menuItems.find((m) => m.id === id);

function invStatus(ing) {
  if (ing.stock <= 0) return 'Out';
  if (ing.stock <= ing.min) return 'Low';
  return 'OK';
}

/* Total ingredient usage for a list of {id, qty} order lines. */
function usageFor(items) {
  const usage = {};
  items.forEach((line) => {
    (recipes[line.id] || []).forEach((r) => {
      usage[r.ing] = (usage[r.ing] || 0) + r.qty * line.qty;
    });
  });
  return usage;
}

function shortagesFor(items) {
  const usage = usageFor(items);
  return Object.entries(usage)
    .filter(([id, need]) => (getIng(id)?.stock ?? 0) < need)
    .map(([id, need]) => ({ ing: getIng(id), need }));
}

function usageSentence(usage) {
  return Object.entries(usage)
    .map(([id, qty]) => fmtQty(qty, getIng(id).unit) + ' ' + getIng(id).name.toLowerCase())
    .join(', ');
}

/* Take ingredients out of stock and tell the owner what happened. */
function consumeUsage(usage, reason) {
  const newlyLow = [];
  Object.entries(usage).forEach(([id, qty]) => {
    const ing = getIng(id);
    const before = invStatus(ing);
    ing.stock = Math.max(0, ing.stock - qty);
    const after = invStatus(ing);
    if (before === 'OK' && after !== 'OK') newlyLow.push(ing);
    if (after === 'Out') logActivity(`${ing.name} is finished — add stock to keep selling.`, 'alert');
  });
  logActivity(`${reason} used ${usageSentence(usage)}.`, 'out');
  if (newlyLow.length) {
    toast(`${newlyLow.map((i) => i.name).join(' and ')} ${newlyLow.length > 1 ? 'are' : 'is'} now running low.`, 'warn');
  }
}

function addStock(id, qty, sourceText) {
  const ing = getIng(id);
  ing.stock += qty;
  logActivity(`Added ${fmtQty(qty, ing.unit)} ${ing.name.toLowerCase()}${sourceText ? ' — ' + sourceText : ''}.`, 'in');
}

function logActivity(text, dir) {
  state.activity.unshift({ t: nowTime(), text, dir });
  state.activity = state.activity.slice(0, 30);
}

/* ---------------- UI helpers ---------------- */

const statusClass = {
  'Received': 'text-bg-danger',
  'Preparing': 'text-bg-warning',
  'Out for Delivery': 'text-bg-info',
  'Delivered': 'text-bg-success',
  'Cancelled': 'text-bg-secondary'
};
const statusLabel = {
  'Received': 'New order',
  'Preparing': 'Preparing',
  'Out for Delivery': 'On the road',
  'Delivered': 'Done'
};

const pageMeta = {
  dashboard: ['Dashboard', 'How the restaurant is doing today'],
  pos: ['Sell', 'Tap what the customer buys — stock and receipt happen by themselves'],
  orders: ['Orders', 'Move each order along — stock updates by itself'],
  riders: ['Riders', 'Your delivery team'],
  inventory: ['Inventory', 'What is in the kitchen and what needs buying'],
  purchasing: ['Buy stock', 'Record new stock when it arrives'],
  expenses: ['Expenses', 'Keep track of what the business spends'],
  invoices: ['Invoices', 'A bill for every order'],
  reports: ['Reports', 'How the business performed']
};

let invoiceModal, riderModal, stockModal, posQtyModal, receiptModal, sidebarOffcanvas;
let currentOrderFilter = 'All';
let currentInvFilter = 'All';
let currentView = 'dashboard';
let stockModalTarget = null;

/* POS till state — lives only until payment is taken */
let posTicket = [];
let posCategory = 'All';
let posQtyItem = null;
let posQtyValue = 1;

function statusBadge(status) {
  return `<span class="badge status-badge ${statusClass[status] || 'text-bg-secondary'}">${statusLabel[status] || status}</span>`;
}

function toast(message, kind = 'success') {
  const icons = { success: 'fa-circle-check', warn: 'fa-triangle-exclamation', danger: 'fa-circle-xmark', info: 'fa-circle-info' };
  const bg = { success: 'toast-success', warn: 'toast-warn', danger: 'toast-danger', info: 'toast-info' };
  const el = document.createElement('div');
  el.className = `toast align-items-center border-0 cb-toast ${bg[kind]}`;
  el.innerHTML = `<div class="d-flex"><div class="toast-body"><i class="fa-solid ${icons[kind]} me-2"></i>${message}</div>
    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  document.getElementById('toastZone').appendChild(el);
  const t = new bootstrap.Toast(el, { delay: 4200 });
  el.addEventListener('hidden.bs.toast', () => el.remove());
  t.show();
}

function showView(view) {
  currentView = view;
  document.querySelectorAll('.admin-view').forEach((el) => el.classList.remove('active'));
  document.getElementById(view)?.classList.add('active');
  updatePosBar();
  document.querySelectorAll('[data-view]').forEach((link) => link.classList.toggle('active', link.dataset.view === view));
  const meta = pageMeta[view];
  if (meta) {
    document.getElementById('pageTitle').textContent = meta[0];
    document.getElementById('pageSubtitle').textContent = meta[1];
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (sidebarOffcanvas && window.innerWidth < 992) sidebarOffcanvas.hide();
}

const itemsLabel = (items) => items.map((l) => `${getItem(l.id)?.name || 'Item'} ×${l.qty}`).join(', ');
const orderTotal = (items) => items.reduce((sum, l) => sum + (getItem(l.id)?.price || 0) * l.qty, 0);

/* ---------------- Render: shared bits ---------------- */

function refreshAll() {
  renderNavCounts();
  renderStockAlert();
  renderStatCards();
  renderRecentOrders();
  renderOrders();
  renderInventoryStats();
  renderInventory();
  renderPOS();
  renderSimulator();
  renderRecipe();
  renderActivity();
  renderPurchases();
  renderInvoices();
  save();
}

function renderNavCounts() {
  const pending = state.orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const lowCount = state.inventory.filter((i) => invStatus(i) !== 'OK').length;
  document.getElementById('navOrderCount').textContent = pending || '';
  document.getElementById('navLowCount').textContent = lowCount || '';
  document.getElementById('bellDot').style.display = lowCount ? 'block' : 'none';
}

function renderStockAlert() {
  const low = state.inventory.filter((i) => invStatus(i) === 'Low');
  const out = state.inventory.filter((i) => invStatus(i) === 'Out');
  const box = document.getElementById('stockAlertBox');
  if (!low.length && !out.length) {
    box.innerHTML = `<div class="alert alert-success d-flex align-items-center gap-2 rounded-4">
      <i class="fa-solid fa-circle-check fs-5"></i><div>All ingredients have enough stock right now.</div></div>`;
    return;
  }
  const pills = [
    ...out.map((i) => `<span class="stock-pill out"><i class="fa-solid fa-circle-xmark me-1"></i>${i.name} — finished</span>`),
    ...low.map((i) => `<span class="stock-pill low"><i class="fa-solid fa-triangle-exclamation me-1"></i>${i.name} — ${fmtQty(i.stock, i.unit)} left</span>`)
  ].join(' ');
  box.innerHTML = `
    <div class="alert ${out.length ? 'alert-danger' : 'alert-warning'} rounded-4">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <div>
          <strong class="d-block mb-1"><i class="fa-solid fa-triangle-exclamation me-1"></i>${out.length ? 'Some ingredients are finished' : 'Some ingredients are running low'}</strong>
          <div class="d-flex flex-wrap gap-1">${pills}</div>
        </div>
        <button class="btn btn-dark btn-sm" data-view="inventory"><i class="fa-solid fa-boxes-stacked me-1"></i>Open inventory</button>
      </div>
    </div>`;
  box.querySelector('[data-view]').addEventListener('click', () => showView('inventory'));
}

function renderStatCards() {
  const todayOrders = state.orders.length;
  const salesTotal = state.orders.reduce((sum, o) => sum + orderTotal(o.items), 0);
  const pending = state.orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const lowCount = state.inventory.filter((i) => invStatus(i) !== 'OK').length;
  const cards = [
    { label: "Today's orders", value: todayOrders, icon: 'fa-receipt', color: '#dbeafe', iconColor: '#1d4ed8' },
    { label: 'Sales today', value: money(salesTotal), icon: 'fa-sack-dollar', color: '#dcfce7', iconColor: '#166534' },
    { label: 'Orders in progress', value: pending, icon: 'fa-fire-burner', color: '#fef3c7', iconColor: '#92400e' },
    { label: 'Stock warnings', value: lowCount, icon: 'fa-boxes-stacked', color: '#fee2e2', iconColor: '#991b1b' }
  ];
  document.getElementById('statCards').innerHTML = cards.map((c) => `
    <div class="col-6 col-lg-3">
      <div class="card stat-card border-0 shadow-sm p-3 h-100">
        <div class="stat-icon mb-2" style="background:${c.color};color:${c.iconColor}"><i class="fa-solid ${c.icon}"></i></div>
        <span class="small text-muted-cb">${c.label}</span>
        <span class="stat-value">${c.value}</span>
      </div>
    </div>
  `).join('');
}

function renderRecentOrders() {
  document.getElementById('recentOrdersTable').innerHTML = state.orders.slice(0, 4).map((o) => `
    <tr><td>${o.id}</td><td>${o.customer}</td><td>${money(orderTotal(o.items))}</td><td>${statusBadge(o.status)}</td></tr>
  `).join('');
}

/* ---------------- Render: orders ---------------- */

function nextStepButton(o) {
  if (o.status === 'Received') {
    const short = shortagesFor(o.items);
    if (short.length) {
      const first = short[0];
      return `<button class="btn btn-outline-danger btn-sm" disabled title="Not enough stock">
          <i class="fa-solid fa-ban me-1"></i>No stock</button>
        <div class="small text-danger mt-1">Need ${fmtQty(first.need, first.ing.unit)} ${first.ing.name.toLowerCase()}, have ${fmtQty(first.ing.stock, first.ing.unit)}.
          <a href="#" class="link-brand" onclick="showView('purchasing');return false;">Buy stock</a></div>`;
    }
    return `<button class="btn btn-primary btn-sm" onclick="advanceOrder('${o.id}')"><i class="fa-solid fa-fire-burner me-1"></i>Start preparing</button>`;
  }
  if (o.status === 'Preparing') {
    return o.type === 'Delivery'
      ? `<button class="btn btn-dark btn-sm" onclick="advanceOrder('${o.id}')"><i class="fa-solid fa-motorcycle me-1"></i>Send with rider</button>`
      : `<button class="btn btn-dark btn-sm" onclick="advanceOrder('${o.id}')"><i class="fa-solid fa-bag-shopping me-1"></i>Mark collected</button>`;
  }
  if (o.status === 'Out for Delivery') {
    return `<button class="btn btn-success btn-sm" onclick="advanceOrder('${o.id}')"><i class="fa-solid fa-check me-1"></i>Mark delivered</button>`;
  }
  return '<span class="small text-muted-cb"><i class="fa-solid fa-check-double me-1"></i>Finished</span>';
}

function advanceOrder(orderId) {
  const o = state.orders.find((x) => x.id === orderId);
  if (!o) return;
  if (o.status === 'Received') {
    const short = shortagesFor(o.items);
    if (short.length) { toast('Not enough stock to make this order.', 'danger'); return; }
    const usage = usageFor(o.items);
    o.status = 'Preparing';
    if (!o.consumed) {
      consumeUsage(usage, `Order ${o.id}`);
      o.consumed = true;
      toast(`Order ${o.id} started. Stock reduced: ${usageSentence(usage)}.`, 'info');
    }
  } else if (o.status === 'Preparing') {
    o.status = o.type === 'Delivery' ? 'Out for Delivery' : 'Delivered';
    toast(o.type === 'Delivery' ? `Order ${o.id} is on the road.` : `Order ${o.id} collected by the customer.`);
  } else if (o.status === 'Out for Delivery') {
    o.status = 'Delivered';
    toast(`Order ${o.id} delivered. Nice work!`);
  }
  refreshAll();
}

function renderOrders() {
  const rows = currentOrderFilter === 'All' ? state.orders : state.orders.filter((o) => o.status === currentOrderFilter);
  document.getElementById('ordersTable').innerHTML = rows.length ? rows.map((o) => `
    <tr>
      <td class="text-nowrap fw-semibold">${o.id}</td>
      <td>${o.customer}</td>
      <td>${itemsLabel(o.items)}</td>
      <td class="text-nowrap">${money(orderTotal(o.items))}</td>
      <td><span class="badge status-badge ${o.payment === 'Paid' ? 'text-bg-success' : 'text-bg-danger'}">${o.payment}</span></td>
      <td>${statusBadge(o.status)}</td>
      <td>
        ${o.type === 'Delivery' ? `
        <select class="form-select form-select-sm" style="min-width:130px" onchange="assignRider('${o.id}', this.value)">
          <option value="-" ${o.rider === '-' ? 'selected' : ''}>Choose...</option>
          ${riders.map((r) => `<option ${r.name.startsWith(o.rider) ? 'selected' : ''}>${r.name}</option>`).join('')}
        </select>` : '<span class="small text-muted-cb">Pickup</span>'}
      </td>
      <td class="text-nowrap">${nextStepButton(o)}</td>
    </tr>
  `).join('') : `<tr><td colspan="8" class="text-center text-muted-cb py-4">No orders here right now.</td></tr>`;
}

function assignRider(orderId, riderName) {
  const o = state.orders.find((x) => x.id === orderId);
  if (!o) return;
  o.rider = riderName === '-' ? '-' : riderName.split(' ')[0];
  save();
}

/* ---------------- Render: riders ---------------- */

function renderRiders() {
  document.getElementById('ridersTable').innerHTML = riders.map((r, index) => `
    <tr>
      <td class="d-flex align-items-center gap-2">
        <span class="avatar-circle" style="width:38px;height:38px;font-size:.75rem;">${r.name.split(' ').map((n) => n[0]).join('')}</span>
        ${r.name}
      </td>
      <td>${r.phone}</td>
      <td><span class="badge status-badge ${r.status === 'Available' ? 'text-bg-success' : 'text-bg-info'}">${r.status}</span></td>
      <td>${r.deliveries}</td>
      <td><button class="btn btn-outline-secondary btn-sm" onclick="openRiderPreview(${index})">View</button></td>
    </tr>
  `).join('');
}

function openRiderPreview(index) {
  const rider = riders[index];
  const active = state.orders.find((o) => rider.name.startsWith(o.rider) && o.status === 'Out for Delivery');
  document.getElementById('riderModalName').textContent = rider.name;
  document.getElementById('riderModalBody').innerHTML = active ? `
    <strong class="d-block mb-1">${active.id}</strong>
    <p class="small mb-1">${itemsLabel(active.items)}</p>
    <p class="small text-muted-cb mb-2">${active.customer} · ${active.type}</p>
    <span class="badge status-badge text-bg-info mb-3">On the road</span>
    <button class="btn btn-primary w-100" onclick="advanceOrder('${active.id}'); riderModal.hide();">Mark as delivered</button>
  ` : `<p class="small text-muted-cb mb-0">No active delivery assigned right now.</p>`;
  riderModal.show();
}

/* ---------------- Render: inventory ---------------- */

function renderInventoryStats() {
  const ok = state.inventory.filter((i) => invStatus(i) === 'OK').length;
  const low = state.inventory.filter((i) => invStatus(i) === 'Low').length;
  const out = state.inventory.filter((i) => invStatus(i) === 'Out').length;
  const cards = [
    { label: 'Enough stock', value: ok, icon: 'fa-circle-check', tone: 'good' },
    { label: 'Running low', value: low, icon: 'fa-triangle-exclamation', tone: 'warn' },
    { label: 'Finished', value: out, icon: 'fa-circle-xmark', tone: 'bad' }
  ];
  document.getElementById('invStats').innerHTML = cards.map((c) => `
    <div class="col-4">
      <div class="card stat-card border-0 shadow-sm p-3 h-100 inv-stat ${c.tone}">
        <span class="small text-muted-cb"><i class="fa-solid ${c.icon} me-1"></i>${c.label}</span>
        <span class="stat-value">${c.value}</span>
      </div>
    </div>
  `).join('');
}

function renderInventory() {
  const query = (document.getElementById('invSearch').value || '').toLowerCase();
  const rows = state.inventory.filter((ing) => {
    const st = invStatus(ing);
    if (currentInvFilter === 'Low' && st !== 'Low') return false;
    if (currentInvFilter === 'Out' && st !== 'Out') return false;
    return ing.name.toLowerCase().includes(query);
  });
  document.getElementById('inventoryTable').innerHTML = rows.length ? rows.map((ing) => {
    const st = invStatus(ing);
    const pct = Math.min(100, Math.round((ing.stock / (ing.min * 2)) * 100));
    const badge = st === 'OK'
      ? '<span class="badge status-badge text-bg-success"><i class="fa-solid fa-check me-1"></i>Enough</span>'
      : st === 'Low'
        ? '<span class="badge status-badge text-bg-warning"><i class="fa-solid fa-triangle-exclamation me-1"></i>Running low</span>'
        : '<span class="badge status-badge text-bg-danger"><i class="fa-solid fa-xmark me-1"></i>Finished</span>';
    return `
      <tr class="${st === 'Out' ? 'low-row' : ''}">
        <td><strong class="d-block">${ing.name}</strong><span class="small text-muted-cb">${ing.supplier}</span></td>
        <td class="fw-bold text-nowrap fs-6">${fmtQty(ing.stock, ing.unit)}</td>
        <td><div class="stock-bar ${st === 'OK' ? '' : st === 'Low' ? 'low' : 'out'}"><span style="width:${pct}%"></span></div></td>
        <td class="text-nowrap">${fmtQty(ing.min, ing.unit)}</td>
        <td>${badge}</td>
        <td class="text-end"><button class="btn btn-outline-primary btn-sm text-nowrap" onclick="openStockModal('${ing.id}')"><i class="fa-solid fa-plus me-1"></i>Add</button></td>
      </tr>
    `;
  }).join('') : `<tr><td colspan="6" class="text-center text-muted-cb py-4">Nothing matches — try a different search or filter.</td></tr>`;
}

function openStockModal(ingId) {
  const ing = getIng(ingId);
  stockModalTarget = ingId;
  document.getElementById('stockModalTitle').textContent = `Add stock — ${ing.name}`;
  document.getElementById('stockModalCurrent').innerHTML = `You have <strong>${fmtQty(ing.stock, ing.unit)}</strong> now. Alerts start below ${fmtQty(ing.min, ing.unit)}.`;
  document.getElementById('stockModalUnit').textContent = `(in ${ing.unit})`;
  document.getElementById('stockModalQty').value = ing.unit === 'pcs' ? 50 : 1000;
  document.getElementById('stockModalNote').value = '';
  stockModal.show();
}

function saveStockModal() {
  const ing = getIng(stockModalTarget);
  const qty = parseInt(document.getElementById('stockModalQty').value, 10);
  if (!ing || !qty || qty < 1) { toast('Enter how much stock you are adding.', 'warn'); return; }
  const note = document.getElementById('stockModalNote').value.trim();
  addStock(ing.id, qty, note || 'added by hand');
  stockModal.hide();
  toast(`${ing.name}: added ${fmtQty(qty, ing.unit)}. Now ${fmtQty(ing.stock, ing.unit)}.`);
  refreshAll();
}

/* ---------------- Render: simulator (the "try it" card) ---------------- */

function renderSimulator() {
  const select = document.getElementById('simProduct');
  if (!select.options.length) {
    select.innerHTML = menuItems.map((m) => `<option value="${m.id}" ${m.id === 1 ? 'selected' : ''}>${m.name}</option>`).join('');
  }
  const productId = parseInt(select.value, 10);
  const qty = Math.max(1, parseInt(document.getElementById('simQty').value, 10) || 1);
  const recipe = recipes[productId] || [];
  let blocked = false;

  document.getElementById('simResult').innerHTML = recipe.map((r) => {
    const ing = getIng(r.ing);
    const used = r.qty * qty;
    const left = ing.stock - used;
    const short = left < 0;
    if (short) blocked = true;
    const pctLeft = ing.stock > 0 ? Math.max(0, Math.round((left / ing.stock) * 100)) : 0;
    return `
      <div class="sim-row ${short ? 'short' : ''}">
        <div class="sim-row-top">
          <strong>${ing.name}</strong>
          <span class="small text-muted-cb">${fmtQty(r.qty, ing.unit)} each</span>
        </div>
        <div class="sim-math">
          ${fmtQty(r.qty, ing.unit)} × ${qty} = <b>${fmtQty(used, ing.unit)} used</b>
          <span class="sim-sep">·</span>
          ${fmtQty(ing.stock, ing.unit)} − ${fmtQty(used, ing.unit)} =
          ${short
            ? `<b class="text-danger">not enough! You are short ${fmtQty(-left, ing.unit)}</b>`
            : `<b class="${left <= ing.min ? 'text-warning-cb' : 'text-success'}">${fmtQty(left, ing.unit)} left${left <= ing.min ? ' (low)' : ''}</b>`}
        </div>
        <div class="sim-bar"><span class="left ${short ? 'short' : ''}" style="width:${short ? 0 : pctLeft}%"></span><span class="used" style="width:${short ? 100 : 100 - pctLeft}%"></span></div>
      </div>
    `;
  }).join('');

  const applyBtn = document.getElementById('simApply');
  applyBtn.disabled = blocked;
  document.getElementById('simApplyHint').textContent = blocked
    ? 'Not enough stock for that many — add stock first or lower the number.'
    : 'This takes the ingredients out of stock, like a real sale.';
}

function applySimulator() {
  const productId = parseInt(document.getElementById('simProduct').value, 10);
  const qty = Math.max(1, parseInt(document.getElementById('simQty').value, 10) || 1);
  const item = getItem(productId);
  const items = [{ id: productId, qty }];
  if (shortagesFor(items).length) { toast('Not enough stock for that sale.', 'danger'); return; }
  const usage = usageFor(items);
  consumeUsage(usage, `Sale of ${qty} × ${item.name}`);
  toast(`Recorded: ${qty} × ${item.name}. Stock reduced: ${usageSentence(usage)}.`, 'info');
  refreshAll();
}

/* ---------------- Sell (POS) — touch-first till ----------------
   Tap a food picture → choose how many → Take payment.
   Payment records the sale as a finished order and deducts every
   ingredient through the same recipe engine as everything else. */

const posImg = (item) => `../${item.img}`;

/* How many of this item the kitchen can still make, counting what is
   already on the ticket. */
function posCanMake(itemId) {
  const recipe = recipes[itemId] || [];
  if (!recipe.length) return 99;
  const pending = usageFor(posTicket);
  return Math.max(0, Math.min(...recipe.map((r) => {
    const left = (getIng(r.ing)?.stock || 0) - (pending[r.ing] || 0);
    return Math.floor(left / r.qty);
  })));
}

const posTicketTotal = () => posTicket.reduce((sum, l) => sum + (getItem(l.id)?.price || 0) * l.qty, 0);

function renderPOS() {
  const grid = document.getElementById('posGrid');
  if (!grid) return;
  const items = posCategory === 'All' ? menuItems : menuItems.filter((m) => m.category === posCategory);
  grid.innerHTML = items.map((item) => {
    const can = posCanMake(item.id);
    const soldOut = can <= 0;
    const badge = soldOut
      ? '<span class="pos-flag out">Finished</span>'
      : can <= 10 ? `<span class="pos-flag low">Only ${can} left</span>` : '';
    return `
      <button class="pos-tile ${soldOut ? 'soldout' : ''}" ${soldOut ? 'disabled' : ''} onclick="openPosQty(${item.id})">
        <span class="pos-tile-art">
          <img src="${posImg(item)}" alt="${item.name}" onerror="this.src='../assets/img/placeholder-food.svg'">
          ${badge}
        </span>
        <span class="pos-tile-body">
          <span class="pos-tile-name">${item.name}</span>
          <span class="pos-tile-price">${money(item.price)}</span>
        </span>
      </button>
    `;
  }).join('');

  const box = document.getElementById('posTicket');
  box.innerHTML = posTicket.length ? posTicket.map((line) => {
    const item = getItem(line.id);
    return `
      <div class="pos-line">
        <div class="pos-line-info">
          <strong>${item.name}</strong>
          <span class="small text-muted-cb">${money(item.price)} each</span>
        </div>
        <div class="pos-line-qty">
          <button onclick="changeTicketQty(${line.id}, -1)" aria-label="One less">−</button>
          <b>${line.qty}</b>
          <button onclick="changeTicketQty(${line.id}, 1)" aria-label="One more">+</button>
        </div>
        <strong class="pos-line-total">${money(item.price * line.qty)}</strong>
      </div>
    `;
  }).join('') : '<p class="small text-muted-cb py-3 mb-0 text-center">Tap a food picture to start the order.</p>';

  document.getElementById('posTotal').textContent = money(posTicketTotal());
  document.getElementById('posPay').disabled = !posTicket.length;
  updatePosBar();
}

function updatePosBar() {
  const bar = document.getElementById('posBottomBar');
  if (!bar) return;
  const count = posTicket.reduce((sum, l) => sum + l.qty, 0);
  bar.style.display = currentView === 'pos' && count ? 'flex' : 'none';
  document.getElementById('posBarCount').textContent = `${count} item${count === 1 ? '' : 's'}`;
  document.getElementById('posBarTotal').textContent = money(posTicketTotal());
}

function openPosQty(itemId) {
  posQtyItem = getItem(itemId);
  posQtyValue = 1;
  document.getElementById('posQtyImg').src = posImg(posQtyItem);
  document.getElementById('posQtyName').textContent = posQtyItem.name;
  document.getElementById('posQtyPrice').textContent = money(posQtyItem.price);
  renderPosQty();
  posQtyModal.show();
}

function renderPosQty() {
  const can = posCanMake(posQtyItem.id);
  posQtyValue = Math.min(Math.max(1, posQtyValue), Math.max(1, can));
  document.getElementById('posQtyNum').textContent = posQtyValue;
  document.getElementById('posQtyTotal').textContent = money(posQtyItem.price * posQtyValue);
  const avail = document.getElementById('posQtyAvail');
  avail.textContent = can <= 10 ? `Enough ingredients for ${can} more` : 'Plenty of ingredients';
  avail.className = `small mb-3 ${can <= 10 ? 'text-warning-cb fw-semibold' : 'text-muted-cb'}`;
  document.getElementById('posQtyPlus').disabled = posQtyValue >= can;
}

function confirmPosQty() {
  const existing = posTicket.find((l) => l.id === posQtyItem.id);
  if (existing) existing.qty += posQtyValue;
  else posTicket.push({ id: posQtyItem.id, qty: posQtyValue });
  posQtyModal.hide();
  renderPOS();
}

function changeTicketQty(itemId, delta) {
  const line = posTicket.find((l) => l.id === itemId);
  if (!line) return;
  if (delta > 0 && posCanMake(itemId) <= 0) {
    toast('Not enough ingredients for one more.', 'warn');
    return;
  }
  line.qty += delta;
  if (line.qty <= 0) posTicket = posTicket.filter((l) => l.id !== itemId);
  renderPOS();
}

function completeSale() {
  if (!posTicket.length) return;
  if (shortagesFor(posTicket).length) {
    toast('Not enough stock for this order — remove something or add stock.', 'danger');
    return;
  }
  const usage = usageFor(posTicket);
  const orderId = `CB-${state.nextOrderNum++}`;
  const total = posTicketTotal();
  state.orders.unshift({
    id: orderId, customer: 'Counter sale',
    items: posTicket.map((l) => ({ ...l })),
    status: 'Delivered', type: 'Counter', rider: '-',
    time: nowTime(), payment: 'Paid', consumed: true
  });
  consumeUsage(usage, `Counter sale ${orderId}`);

  document.getElementById('receiptBody').innerHTML = `
    <div class="text-center mb-2">
      <strong class="d-block">CENTURY BURGER</strong>
      <span class="small text-muted-cb">${orderId} · ${nowTime()}</span>
    </div>
    ${posTicket.map((l) => {
      const item = getItem(l.id);
      return `<div class="receipt-line"><span>${l.qty} × ${item.name}</span><span>${money(item.price * l.qty)}</span></div>`;
    }).join('')}
    <div class="receipt-line total"><span>Total — paid in cash</span><span>${money(total)}</span></div>
  `;
  posTicket = [];
  receiptModal.show();
  refreshAll();
}

/* ---------------- Render: recipes ---------------- */

function renderRecipe() {
  const select = document.getElementById('recipeProduct');
  if (!select.options.length) {
    select.innerHTML = menuItems.map((m) => `<option value="${m.id}">${m.name}</option>`).join('');
  }
  const productId = parseInt(select.value, 10);
  const recipe = recipes[productId] || [];
  document.getElementById('recipeList').innerHTML = recipe.map((r) => {
    const ing = getIng(r.ing);
    const st = invStatus(ing);
    return `
      <div class="recipe-line">
        <span class="recipe-dot ${st === 'OK' ? 'ok' : st === 'Low' ? 'low' : 'out'}"></span>
        <span class="flex-grow-1">${ing.name}</span>
        <strong>${fmtQty(r.qty, ing.unit)}</strong>
      </div>
    `;
  }).join('') || '<p class="small text-muted-cb mb-0">No recipe set for this item yet.</p>';
}

/* ---------------- Render: activity ---------------- */

function renderActivity() {
  const icons = { in: 'fa-arrow-down text-success', out: 'fa-arrow-up text-danger-cb', alert: 'fa-triangle-exclamation text-warning-cb' };
  document.getElementById('stockActivity').innerHTML = state.activity.slice(0, 12).map((a) => `
    <div class="activity-line">
      <span class="activity-icon"><i class="fa-solid ${icons[a.dir] || 'fa-circle-info'}"></i></span>
      <div><div class="small">${a.text}</div><span class="activity-time">${a.t}</span></div>
    </div>
  `).join('') || '<p class="small text-muted-cb mb-0">No stock movement yet today.</p>';
}

/* ---------------- Render: purchasing ---------------- */

function renderPurchases() {
  const select = document.getElementById('poIngredient');
  if (!select.options.length) {
    select.innerHTML = state.inventory.map((i) => `<option value="${i.id}">${i.name}</option>`).join('');
    select.addEventListener('change', updatePoUnitHint);
    updatePoUnitHint();
  }
  document.getElementById('purchaseTable').innerHTML = state.purchases.map((p) => {
    const ing = getIng(p.ing);
    return `
    <tr>
      <td>${p.supplier}</td><td>${ing ? ing.name : p.ing}</td><td>${ing ? fmtQty(p.qty, ing.unit) : p.qty}</td>
      <td>${money(p.cost)}</td><td>${p.date}</td>
      <td><span class="badge status-badge ${p.status === 'Paid' ? 'text-bg-success' : 'text-bg-warning'}">${p.status}</span></td>
    </tr>
  `;}).join('');
}

function updatePoUnitHint() {
  const ing = getIng(document.getElementById('poIngredient').value);
  if (ing) {
    document.getElementById('poUnitHint').textContent = `(in ${ing.unit})`;
    document.getElementById('poSupplier').value = ing.supplier;
  }
}

function addPurchase() {
  const ing = getIng(document.getElementById('poIngredient').value);
  const qty = parseInt(document.getElementById('poQty').value, 10);
  const cost = parseInt(document.getElementById('poCost').value, 10) || 0;
  const supplier = document.getElementById('poSupplier').value.trim() || 'Supplier';
  if (!ing || !qty || qty < 1) { toast('Choose an ingredient and how much you bought.', 'warn'); return; }
  state.purchases.unshift({ supplier, ing: ing.id, qty, cost, date: new Date().toISOString().slice(0, 10), status: 'Paid' });
  addStock(ing.id, qty, `bought from ${supplier}`);
  toast(`${ing.name}: added ${fmtQty(qty, ing.unit)} to stock. Now ${fmtQty(ing.stock, ing.unit)}.`);
  refreshAll();
}

/* ---------------- Render: expenses ---------------- */

function renderExpenses() {
  const total = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const categories = new Set(state.expenses.map((e) => e.category)).size;
  document.getElementById('expenseStats').innerHTML = [
    { label: 'Total recorded', value: money(total) },
    { label: 'Entries', value: state.expenses.length },
    { label: 'Categories', value: categories }
  ].map((c) => `
    <div class="col-6 col-lg-4">
      <div class="card stat-card border-0 shadow-sm p-3 h-100">
        <span class="small text-muted-cb">${c.label}</span>
        <span class="stat-value">${c.value}</span>
      </div>
    </div>
  `).join('');
  document.getElementById('expenseTable').innerHTML = state.expenses.map((e) => `
    <tr><td>${e.category}</td><td>${money(e.amount)}</td><td>${e.date}</td><td>${e.note}</td></tr>
  `).join('');
}

function addExpense() {
  const category = document.getElementById('expCategory').value;
  const amount = parseInt(document.getElementById('expAmount').value, 10);
  const date = document.getElementById('expDate').value || new Date().toISOString().slice(0, 10);
  const note = document.getElementById('expNote').value.trim() || '—';
  if (!amount || amount < 1) { toast('Enter the amount you spent.', 'warn'); return; }
  state.expenses.unshift({ category, amount, date, note });
  toast(`Saved: ${category} expense of ${money(amount)}.`);
  renderExpenses();
  save();
}

/* ---------------- Render: invoices ---------------- */

function renderInvoices() {
  document.getElementById('invoiceTable').innerHTML = state.orders.map((o, index) => `
    <tr>
      <td>INV-${o.id.replace('CB-', '')}</td>
      <td>${o.id}</td>
      <td>${o.customer}</td>
      <td>${money(orderTotal(o.items))}</td>
      <td><span class="badge status-badge ${o.payment === 'Paid' ? 'text-bg-success' : 'text-bg-danger'}">${o.payment}</span></td>
      <td><button class="btn btn-outline-secondary btn-sm" onclick="openInvoice(${index})">Preview</button></td>
    </tr>
  `).join('');
}

function openInvoice(index) {
  const o = state.orders[index];
  const subtotal = orderTotal(o.items);
  const fee = o.type === 'Delivery' ? 350 : 0;
  document.getElementById('invoiceBody').innerHTML = `
    <div class="d-flex justify-content-between align-items-start mb-3">
      <div><h4 class="display-font mb-0">Century Burger</h4><span class="small text-muted-cb">Mock PDF invoice preview</span></div>
      <strong>INV-${o.id.replace('CB-', '')}</strong>
    </div>
    <p class="small mb-3">Customer: ${o.customer}<br>Order: ${o.id}<br>Date: ${new Date().toISOString().slice(0, 10)}</p>
    <table class="table">
      <tbody>
        ${o.items.map((l) => `<tr><td>${getItem(l.id).name} ×${l.qty}</td><td class="text-end">${money(getItem(l.id).price * l.qty)}</td></tr>`).join('')}
        <tr><td>Delivery fee</td><td class="text-end">${money(fee)}</td></tr>
        <tr><th>Total</th><th class="text-end">${money(subtotal + fee)}</th></tr>
      </tbody>
    </table>
  `;
  invoiceModal.show();
}

/* ---------------- Render: reports & analytics ---------------- */

function renderReportStats() {
  const totalSales = reportSales.reduce((a, b) => a + b, 0);
  const avgOrder = state.orders.length ? Math.round(state.orders.reduce((s, o) => s + orderTotal(o.items), 0) / state.orders.length) : 0;
  document.getElementById('reportStats').innerHTML = [
    { label: 'Total sales (7 days)', value: money(totalSales) },
    { label: 'Orders today', value: state.orders.length },
    { label: 'Average order value', value: money(avgOrder) }
  ].map((c) => `
    <div class="col-6 col-lg-4">
      <div class="card stat-card border-0 shadow-sm p-3 h-100">
        <span class="small text-muted-cb">${c.label}</span>
        <span class="stat-value">${c.value}</span>
      </div>
    </div>
  `).join('');
}

function buildCharts() {
  const gridColor = 'rgba(28, 19, 13, 0.07)';
  const tickColor = '#75665d';
  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => money(ctx.parsed.y) } } },
    scales: {
      y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor, callback: (v) => 'LKR ' + (v / 1000) + 'k' } },
      x: { grid: { display: false }, ticks: { color: tickColor } }
    }
  };
  const barData = {
    labels: dayLabels,
    datasets: [{ data: reportSales, backgroundColor: '#ea580c', borderRadius: { topLeft: 4, topRight: 4 }, barPercentage: 0.55 }]
  };
  new Chart(document.getElementById('dashboardChart'), { type: 'bar', data: barData, options: barOptions });
  new Chart(document.getElementById('salesChart'), { type: 'bar', data: barData, options: barOptions });

  new Chart(document.getElementById('topItemsChart'), {
    type: 'bar',
    data: {
      labels: topItems.map((t) => t.name),
      datasets: [{ data: topItems.map((t) => t.value), backgroundColor: '#b91c1c', borderRadius: { topRight: 4, bottomRight: 4 }, barPercentage: 0.55 }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.x} sold` } } },
      scales: {
        x: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor } },
        y: { grid: { display: false }, ticks: { color: tickColor } }
      }
    }
  });
}

/* ---------------- Init ---------------- */

function init() {
  state = loadState();
  pullIncomingOrders();

  invoiceModal = new bootstrap.Modal(document.getElementById('invoiceModal'));
  riderModal = new bootstrap.Modal(document.getElementById('riderModal'));
  stockModal = new bootstrap.Modal(document.getElementById('stockModal'));
  posQtyModal = new bootstrap.Modal(document.getElementById('posQtyModal'));
  receiptModal = new bootstrap.Modal(document.getElementById('receiptModal'));
  sidebarOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('sidebar'));

  document.querySelectorAll('[data-view]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    showView(link.dataset.view);
  }));

  document.querySelectorAll('#orderFilters button').forEach((btn) => btn.addEventListener('click', () => {
    document.querySelectorAll('#orderFilters button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentOrderFilter = btn.dataset.status;
    renderOrders();
  }));

  document.querySelectorAll('#invFilters button').forEach((btn) => btn.addEventListener('click', () => {
    document.querySelectorAll('#invFilters button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    currentInvFilter = btn.dataset.invFilter;
    renderInventory();
  }));

  document.getElementById('invSearch').addEventListener('input', renderInventory);

  document.querySelectorAll('#posCats .pos-cat').forEach((btn) => btn.addEventListener('click', () => {
    document.querySelectorAll('#posCats .pos-cat').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    posCategory = btn.dataset.posCat;
    renderPOS();
  }));
  document.getElementById('posQtyMinus').addEventListener('click', () => { posQtyValue -= 1; renderPosQty(); });
  document.getElementById('posQtyPlus').addEventListener('click', () => { posQtyValue += 1; renderPosQty(); });
  document.querySelectorAll('#posQuick button').forEach((btn) => btn.addEventListener('click', () => {
    posQtyValue = parseInt(btn.dataset.q, 10);
    renderPosQty();
  }));
  document.getElementById('posQtyAdd').addEventListener('click', confirmPosQty);
  document.getElementById('posPay').addEventListener('click', completeSale);
  document.getElementById('posClear').addEventListener('click', () => { posTicket = []; renderPOS(); });
  document.getElementById('posBarPay').addEventListener('click', () => {
    document.getElementById('posTicketPanel').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('simProduct').addEventListener('change', renderSimulator);
  document.getElementById('simQty').addEventListener('input', renderSimulator);
  document.getElementById('simMinus').addEventListener('click', () => {
    const el = document.getElementById('simQty');
    el.value = Math.max(1, parseInt(el.value, 10) - 1);
    renderSimulator();
  });
  document.getElementById('simPlus').addEventListener('click', () => {
    const el = document.getElementById('simQty');
    el.value = Math.min(500, (parseInt(el.value, 10) || 0) + 1);
    renderSimulator();
  });
  document.getElementById('simApply').addEventListener('click', applySimulator);
  document.getElementById('recipeProduct').addEventListener('change', renderRecipe);
  document.getElementById('stockModalSave').addEventListener('click', saveStockModal);
  document.getElementById('poAdd').addEventListener('click', addPurchase);
  document.getElementById('expAdd').addEventListener('click', addExpense);
  document.getElementById('alertBell').addEventListener('click', () => showView('inventory'));
  document.getElementById('resetDemo').addEventListener('click', () => {
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(INBOX_KEY);
    state = defaultState();
    toast('Demo data is back to the start.', 'info');
    refreshAll();
    renderExpenses();
  });

  renderRiders();
  renderExpenses();
  renderReportStats();
  refreshAll();
  buildCharts();
}

document.addEventListener('DOMContentLoaded', init);
