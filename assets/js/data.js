/* ==========================================================================
   Century Burger demo data — edit this file to change what the demo shows.
   Inventory quantities use base units: g (grams), ml, or pcs (pieces).
   ========================================================================== */

const menuItems = [
  { id: 1, name: 'Century Classic Burger', category: 'Burgers', price: 1450, color: '#c2410c', img: 'assets/img/century-classic-burger.jpg', desc: 'Beef patty, cheddar, lettuce, tomato, pickles, and Century sauce.' },
  { id: 2, name: 'Spicy Volcano Burger', category: 'Burgers', price: 1650, color: '#991b1b', img: 'assets/img/spicy-volcano-burger.jpg', desc: 'Crispy chicken, jalapenos, hot sauce, slaw, and melted cheese.' },
  { id: 3, name: 'Double Smash Burger', category: 'Burgers', price: 1950, color: '#7c2d12', img: 'assets/img/double-smash-burger.jpg', desc: 'Two smashed beef patties, double cheese, grilled onions, and house sauce.' },
  { id: 4, name: 'Crispy Chicken Burger', category: 'Burgers', price: 1550, color: '#ea580c', img: 'assets/img/crispy-chicken-burger.jpg', desc: 'Golden chicken fillet, lettuce, mayo, cheese, and toasted bun.' },
  { id: 5, name: 'Loaded Fries', category: 'Sides', price: 950, color: '#f59e0b', img: 'assets/img/loaded-fries.jpg', desc: 'Crispy fries loaded with cheese sauce, onions, and spicy mayo.' },
  { id: 6, name: 'Chicken Nuggets', category: 'Sides', price: 850, color: '#d97706', img: 'assets/img/chicken-nuggets.jpg', desc: 'Six-piece crispy nuggets with your choice of dip.' },
  { id: 7, name: 'Iced Milo', category: 'Drinks', price: 550, color: '#78350f', img: 'assets/img/iced-milo.jpg', desc: 'Cold Milo with ice and creamy topping.' },
  { id: 8, name: 'Lime Mojito', category: 'Drinks', price: 650, color: '#16a34a', img: 'assets/img/lime-mojito.jpg', desc: 'Fresh lime, mint, soda, and crushed ice.' },
  { id: 9, name: 'Family Burger Combo', category: 'Combos', price: 4990, color: '#b91c1c', img: 'assets/img/family-burger-combo.jpg', desc: 'Four burgers, two loaded fries, four drinks, and sauces.' },
  { id: 10, name: 'Solo Feast Combo', category: 'Combos', price: 2390, color: '#dc2626', img: 'assets/img/solo-feast-combo.jpg', desc: 'One burger, fries, nuggets, and one drink.' }
];

/* ---- Ingredients the kitchen keeps in stock ------------------------------
   stock + min are in the base unit shown. The demo shows kg / L automatically
   when a gram or ml number is 1000 or more. */
const inventoryData = [
  { id: 'beef',    name: 'Beef (patty meat)',  stock: 5000,  unit: 'g',   min: 1000,  supplier: 'Colombo Meat Co.' },
  { id: 'chicken', name: 'Chicken fillets',    stock: 2400,  unit: 'g',   min: 1500,  supplier: 'Colombo Meat Co.' },
  { id: 'buns',    name: 'Burger buns',        stock: 58,    unit: 'pcs', min: 40,    supplier: 'Fresh Foods Lanka' },
  { id: 'cheese',  name: 'Cheese slices',      stock: 85,    unit: 'pcs', min: 50,    supplier: 'Fresh Foods Lanka' },
  { id: 'lettuce', name: 'Lettuce',            stock: 900,   unit: 'g',   min: 1200,  supplier: 'Green Farm' },
  { id: 'fries',   name: 'French fries',       stock: 22000, unit: 'g',   min: 15000, supplier: 'Fresh Foods Lanka' },
  { id: 'nuggets', name: 'Chicken nuggets',    stock: 96,    unit: 'pcs', min: 60,    supplier: 'Colombo Meat Co.' },
  { id: 'sauce',   name: 'House sauce',        stock: 3500,  unit: 'ml',  min: 5000,  supplier: 'Green Farm' },
  { id: 'milo',    name: 'Milo powder',        stock: 1800,  unit: 'g',   min: 800,   supplier: 'Fresh Foods Lanka' },
  { id: 'lime',    name: 'Fresh lime',         stock: 40,    unit: 'pcs', min: 25,    supplier: 'Green Farm' },
  { id: 'cups',    name: 'Drink cups',         stock: 120,   unit: 'pcs', min: 80,    supplier: 'Pack Lanka' }
];

/* ---- Recipes: what one unit of each menu item uses -----------------------
   Selling 8 Classic Burgers deducts 8 × 100 g beef, 8 buns, and so on. */
const recipes = {
  1:  [ { ing: 'beef', qty: 100 }, { ing: 'buns', qty: 1 }, { ing: 'cheese', qty: 1 }, { ing: 'lettuce', qty: 30 }, { ing: 'sauce', qty: 20 } ],
  2:  [ { ing: 'chicken', qty: 120 }, { ing: 'buns', qty: 1 }, { ing: 'cheese', qty: 1 }, { ing: 'lettuce', qty: 20 }, { ing: 'sauce', qty: 30 } ],
  3:  [ { ing: 'beef', qty: 200 }, { ing: 'buns', qty: 1 }, { ing: 'cheese', qty: 2 }, { ing: 'sauce', qty: 25 } ],
  4:  [ { ing: 'chicken', qty: 130 }, { ing: 'buns', qty: 1 }, { ing: 'cheese', qty: 1 }, { ing: 'lettuce', qty: 25 }, { ing: 'sauce', qty: 20 } ],
  5:  [ { ing: 'fries', qty: 300 }, { ing: 'cheese', qty: 1 }, { ing: 'sauce', qty: 30 } ],
  6:  [ { ing: 'nuggets', qty: 6 }, { ing: 'sauce', qty: 30 } ],
  7:  [ { ing: 'milo', qty: 30 }, { ing: 'cups', qty: 1 } ],
  8:  [ { ing: 'lime', qty: 2 }, { ing: 'cups', qty: 1 } ],
  9:  [ { ing: 'beef', qty: 200 }, { ing: 'chicken', qty: 250 }, { ing: 'buns', qty: 4 }, { ing: 'cheese', qty: 4 }, { ing: 'lettuce', qty: 100 }, { ing: 'sauce', qty: 130 }, { ing: 'fries', qty: 600 }, { ing: 'cups', qty: 4 }, { ing: 'milo', qty: 60 }, { ing: 'lime', qty: 4 } ],
  10: [ { ing: 'beef', qty: 100 }, { ing: 'buns', qty: 1 }, { ing: 'cheese', qty: 1 }, { ing: 'fries', qty: 300 }, { ing: 'nuggets', qty: 6 }, { ing: 'sauce', qty: 60 }, { ing: 'cups', qty: 1 }, { ing: 'milo', qty: 30 } ]
};

/* ---- Orders. items = menu item id + quantity. ----------------------------
   consumed: true means its ingredients were already taken out of stock. */
const ordersData = [
  { id: 'CB-1048', customer: 'Naveen Perera', items: [ { id: 3, qty: 2 } ], status: 'Preparing', type: 'Delivery', rider: 'Kasun', time: '12:18 PM', payment: 'Paid', consumed: true },
  { id: 'CB-1047', customer: 'Ayesha Fernando', items: [ { id: 9, qty: 1 } ], status: 'Out for Delivery', type: 'Delivery', rider: 'Ruwan', time: '12:05 PM', payment: 'Paid', consumed: true },
  { id: 'CB-1046', customer: 'Dilan Silva', items: [ { id: 2, qty: 1 }, { id: 7, qty: 1 } ], status: 'Received', type: 'Pickup', rider: '-', time: '11:52 AM', payment: 'Unpaid', consumed: false },
  { id: 'CB-1045', customer: 'Tharushi Jay', items: [ { id: 4, qty: 2 } ], status: 'Delivered', type: 'Delivery', rider: 'Imran', time: '11:35 AM', payment: 'Paid', consumed: true },
  { id: 'CB-1044', customer: 'Sahan Wick', items: [ { id: 10, qty: 1 } ], status: 'Delivered', type: 'Pickup', rider: '-', time: '11:12 AM', payment: 'Paid', consumed: true },
  { id: 'CB-1043', customer: 'Minali K', items: [ { id: 5, qty: 2 }, { id: 8, qty: 2 } ], status: 'Delivered', type: 'Delivery', rider: 'Kasun', time: '10:58 AM', payment: 'Paid', consumed: true }
];

const riders = [
  { name: 'Kasun Rodrigo', phone: '077 123 4567', status: 'Available', deliveries: 8 },
  { name: 'Ruwan Perera', phone: '076 555 9191', status: 'On delivery', deliveries: 6 },
  { name: 'Imran Hassan', phone: '071 777 2020', status: 'Available', deliveries: 5 }
];

const purchasesData = [
  { supplier: 'Fresh Foods Lanka', ing: 'buns', qty: 100, cost: 12500, date: '2026-07-07', status: 'Paid' },
  { supplier: 'Colombo Meat Co.', ing: 'beef', qty: 5000, cost: 48000, date: '2026-07-06', status: 'Paid' },
  { supplier: 'Green Farm', ing: 'lettuce', qty: 10000, cost: 6800, date: '2026-07-05', status: 'Pending' }
];

const expensesData = [
  { category: 'Packaging', amount: 8400, date: '2026-07-07', note: 'Burger boxes and paper bags' },
  { category: 'Utilities', amount: 12500, date: '2026-07-06', note: 'Electricity bill' },
  { category: 'Marketing', amount: 15000, date: '2026-07-05', note: 'Social media promotion' },
  { category: 'Salary', amount: 65000, date: '2026-07-01', note: 'Kitchen staff wages' }
];

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const reportSales = [42000, 56000, 38000, 74000, 69000, 82000, 91000];
const topItems = [
  { name: 'Double Smash Burger', value: 88 },
  { name: 'Century Classic Burger', value: 72 },
  { name: 'Spicy Volcano Burger', value: 61 },
  { name: 'Loaded Fries', value: 49 }
];
