const money = (value) => `LKR ${value.toLocaleString()}`;

const statusClass = {
  'Received': 'text-bg-danger',
  'Preparing': 'text-bg-warning',
  'Out for Delivery': 'text-bg-info',
  'Delivered': 'text-bg-success',
  'Cancelled': 'text-bg-secondary'
};

const pageMeta = {
  dashboard: ['Dashboard', 'Restaurant overview'],
  orders: ['Orders', 'Live order management and rider assignment'],
  riders: ['Riders', 'Delivery staff and availability'],
  inventory: ['Inventory', 'Ingredient stock control'],
  purchasing: ['Purchasing', 'Supplier restock records'],
  expenses: ['Expenses', 'Business expense tracking'],
  invoices: ['Invoices', 'Customer invoice records'],
  reports: ['Reports & Analytics', 'Business performance overview']
};

let invoiceModal, riderModal, sidebarOffcanvas;

function statusBadge(status) {
  return `<span class="badge status-badge ${statusClass[status] || 'text-bg-secondary'}">${status}</span>`;
}

function showView(view) {
  document.querySelectorAll('.admin-view').forEach((el) => el.classList.remove('active'));
  document.getElementById(view)?.classList.add('active');
  document.querySelectorAll('[data-view]').forEach((link) => link.classList.toggle('active', link.dataset.view === view));
  const meta = pageMeta[view];
  if (meta) {
    document.getElementById('pageTitle').textContent = meta[0];
    document.getElementById('pageSubtitle').textContent = meta[1];
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (sidebarOffcanvas && window.innerWidth < 992) sidebarOffcanvas.hide();
}

function renderStatCards() {
  const todayOrders = orders.length;
  const salesTotal = orders.reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const activeRiders = riders.filter((r) => r.status !== 'Off duty').length;
  const cards = [
    { label: "Today's Orders", value: todayOrders, icon: 'fa-receipt', color: '#dbeafe', iconColor: '#1d4ed8' },
    { label: 'Sales Total', value: money(salesTotal), icon: 'fa-sack-dollar', color: '#dcfce7', iconColor: '#166534' },
    { label: 'Pending Orders', value: pending, icon: 'fa-clock', color: '#fef3c7', iconColor: '#92400e' },
    { label: 'Active Riders', value: activeRiders, icon: 'fa-motorcycle', color: '#fee2e2', iconColor: '#991b1b' }
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
  document.getElementById('recentOrdersTable').innerHTML = orders.slice(0, 4).map((o) => `
    <tr><td>${o.id}</td><td>${o.customer}</td><td>${money(o.total)}</td><td>${statusBadge(o.status)}</td></tr>
  `).join('');
}

function renderOrders(filter = 'All') {
  const rows = filter === 'All' ? orders : orders.filter((o) => o.status === filter);
  document.getElementById('ordersTable').innerHTML = rows.map((o) => `
    <tr>
      <td class="text-nowrap">${o.id}</td>
      <td>${o.customer}</td>
      <td>${o.items}</td>
      <td class="text-nowrap">${money(o.total)}</td>
      <td><span class="badge status-badge ${o.payment === 'Paid' ? 'text-bg-success' : 'text-bg-danger'}">${o.payment}</span></td>
      <td>${statusBadge(o.status)}</td>
      <td>
        <select class="form-select form-select-sm" style="min-width:150px">
          <option value="-" ${o.rider === '-' ? 'selected' : ''}>Unassigned</option>
          ${riders.map((r) => `<option ${r.name.startsWith(o.rider) ? 'selected' : ''}>${r.name}</option>`).join('')}
        </select>
      </td>
    </tr>
  `).join('');
}

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
  const active = orders.find((o) => rider.name.startsWith(o.rider) && o.status === 'Out for Delivery');
  document.getElementById('riderModalName').textContent = rider.name;
  document.getElementById('riderModalBody').innerHTML = active ? `
    <strong class="d-block mb-1">${active.id}</strong>
    <p class="small mb-1">${active.items}</p>
    <p class="small text-muted-cb mb-2">${active.customer} · ${active.type}</p>
    <span class="badge status-badge text-bg-info mb-3">${active.status}</span>
    <button class="btn btn-primary w-100">Mark as Delivered</button>
  ` : `<p class="small text-muted-cb mb-0">No active delivery assigned right now.</p>`;
  riderModal.show();
}

function renderInventory() {
  document.getElementById('inventoryTable').innerHTML = inventory.map((entry) => {
    const low = entry.stock < entry.min;
    const pct = Math.min(100, Math.round((entry.stock / (entry.min * 2)) * 100));
    return `
      <tr class="${low ? 'low-row' : ''}">
        <td>${entry.item}</td>
        <td>${entry.stock}</td>
        <td><div class="stock-bar ${low ? 'low' : ''}"><span style="width:${pct}%"></span></div></td>
        <td>${entry.unit}</td>
        <td>${entry.min}</td>
        <td><span class="badge status-badge ${low ? 'text-bg-danger' : 'text-bg-success'}">${low ? 'Low stock' : 'Healthy'}</span></td>
      </tr>
    `;
  }).join('');
}

function renderPurchases() {
  document.getElementById('purchaseTable').innerHTML = purchases.map((p) => `
    <tr>
      <td>${p.supplier}</td><td>${p.item}</td><td>${p.qty}</td><td>${money(p.cost)}</td><td>${p.date}</td>
      <td><span class="badge status-badge ${p.status === 'Paid' ? 'text-bg-success' : 'text-bg-warning'}">${p.status}</span></td>
    </tr>
  `).join('');
}

function renderExpenses() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categories = new Set(expenses.map((e) => e.category)).size;
  document.getElementById('expenseStats').innerHTML = [
    { label: 'Total Recorded', value: money(total) },
    { label: 'Entries', value: expenses.length },
    { label: 'Categories Tracked', value: categories }
  ].map((c) => `
    <div class="col-6 col-lg-4">
      <div class="card stat-card border-0 shadow-sm p-3 h-100">
        <span class="small text-muted-cb">${c.label}</span>
        <span class="stat-value">${c.value}</span>
      </div>
    </div>
  `).join('');
  document.getElementById('expenseTable').innerHTML = expenses.map((e) => `
    <tr><td>${e.category}</td><td>${money(e.amount)}</td><td>${e.date}</td><td>${e.note}</td></tr>
  `).join('');
}

function renderInvoices() {
  document.getElementById('invoiceTable').innerHTML = orders.map((o, index) => `
    <tr>
      <td>INV-${o.id.replace('CB-', '')}</td>
      <td>${o.id}</td>
      <td>${o.customer}</td>
      <td>${money(o.total)}</td>
      <td><span class="badge status-badge ${o.payment === 'Paid' ? 'text-bg-success' : 'text-bg-danger'}">${o.payment}</span></td>
      <td><button class="btn btn-outline-secondary btn-sm" onclick="openInvoice(${index})">Preview</button></td>
    </tr>
  `).join('');
}

function openInvoice(index) {
  const o = orders[index];
  document.getElementById('invoiceBody').innerHTML = `
    <div class="d-flex justify-content-between align-items-start mb-3">
      <div><h4 class="display-font mb-0">Century Burger</h4><span class="small text-muted-cb">Mock PDF Invoice Preview</span></div>
      <strong>INV-${o.id.replace('CB-', '')}</strong>
    </div>
    <p class="small mb-3">Customer: ${o.customer}<br>Order: ${o.id}<br>Date: 2026-07-07</p>
    <table class="table">
      <tbody>
        <tr><td>${o.items}</td><td class="text-end">${money(o.total)}</td></tr>
        <tr><td>Delivery Fee</td><td class="text-end">${o.type === 'Delivery' ? 'LKR 350' : 'LKR 0'}</td></tr>
        <tr><th>Total</th><th class="text-end">${money(o.total + (o.type === 'Delivery' ? 350 : 0))}</th></tr>
      </tbody>
    </table>
  `;
  invoiceModal.show();
}

function renderReportStats() {
  const totalSales = reportSales.reduce((a, b) => a + b, 0);
  const avgOrder = Math.round(orders.reduce((s, o) => s + o.total, 0) / orders.length);
  document.getElementById('reportStats').innerHTML = [
    { label: 'Total Sales (7 days)', value: money(totalSales) },
    { label: 'Orders Today', value: orders.length },
    { label: 'Average Order Value', value: money(avgOrder) }
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
  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { callback: (v) => 'LKR ' + (v / 1000) + 'k' } } }
  };
  const barData = {
    labels: dayLabels,
    datasets: [{ data: reportSales, backgroundColor: '#f97316', borderRadius: 8 }]
  };
  new Chart(document.getElementById('dashboardChart'), { type: 'bar', data: barData, options: barOptions });
  new Chart(document.getElementById('salesChart'), { type: 'bar', data: barData, options: barOptions });

  new Chart(document.getElementById('topItemsChart'), {
    type: 'bar',
    data: {
      labels: topItems.map((t) => t.name),
      datasets: [{ data: topItems.map((t) => t.value), backgroundColor: '#b91c1c', borderRadius: 8 }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true } }
    }
  });
}

function init() {
  invoiceModal = new bootstrap.Modal(document.getElementById('invoiceModal'));
  riderModal = new bootstrap.Modal(document.getElementById('riderModal'));
  sidebarOffcanvas = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('sidebar'));

  document.querySelectorAll('[data-view]').forEach((link) => link.addEventListener('click', (event) => {
    event.preventDefault();
    showView(link.dataset.view);
  }));

  document.querySelectorAll('#orderFilters button').forEach((btn) => btn.addEventListener('click', () => {
    document.querySelectorAll('#orderFilters button').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    renderOrders(btn.dataset.status);
  }));

  renderStatCards();
  renderRecentOrders();
  renderOrders();
  renderRiders();
  renderInventory();
  renderPurchases();
  renderExpenses();
  renderInvoices();
  renderReportStats();
  buildCharts();
}

document.addEventListener('DOMContentLoaded', init);
