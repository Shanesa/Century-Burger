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

const orders = [
  { id: 'CB-1048', customer: 'Naveen Perera', items: 'Double Smash Burger x2', total: 3900, status: 'Preparing', type: 'Delivery', rider: 'Kasun', time: '12:18 PM', payment: 'Paid' },
  { id: 'CB-1047', customer: 'Ayesha Fernando', items: 'Family Burger Combo x1', total: 4990, status: 'Out for Delivery', type: 'Delivery', rider: 'Ruwan', time: '12:05 PM', payment: 'Paid' },
  { id: 'CB-1046', customer: 'Dilan Silva', items: 'Spicy Volcano Burger x1, Iced Milo x1', total: 2200, status: 'Received', type: 'Pickup', rider: '-', time: '11:52 AM', payment: 'Unpaid' },
  { id: 'CB-1045', customer: 'Tharushi Jay', items: 'Crispy Chicken Burger x2', total: 3100, status: 'Delivered', type: 'Delivery', rider: 'Imran', time: '11:35 AM', payment: 'Paid' },
  { id: 'CB-1044', customer: 'Sahan Wick', items: 'Solo Feast Combo x1', total: 2390, status: 'Delivered', type: 'Pickup', rider: '-', time: '11:12 AM', payment: 'Paid' },
  { id: 'CB-1043', customer: 'Minali K', items: 'Loaded Fries x2, Lime Mojito x2', total: 3200, status: 'Delivered', type: 'Delivery', rider: 'Kasun', time: '10:58 AM', payment: 'Paid' }
];

const inventory = [
  { item: 'Burger Buns', stock: 34, unit: 'pcs', min: 40 },
  { item: 'Beef Patties', stock: 62, unit: 'pcs', min: 30 },
  { item: 'Chicken Fillets', stock: 18, unit: 'pcs', min: 25 },
  { item: 'Cheddar Cheese', stock: 85, unit: 'slices', min: 50 },
  { item: 'Lettuce', stock: 4, unit: 'kg', min: 5 },
  { item: 'French Fries', stock: 22, unit: 'kg', min: 15 },
  { item: 'Sauce Mix', stock: 7, unit: 'liters', min: 10 },
  { item: 'Drink Cups', stock: 120, unit: 'pcs', min: 80 }
];

const riders = [
  { name: 'Kasun Rodrigo', phone: '077 123 4567', status: 'Available', deliveries: 8 },
  { name: 'Ruwan Perera', phone: '076 555 9191', status: 'On delivery', deliveries: 6 },
  { name: 'Imran Hassan', phone: '071 777 2020', status: 'Available', deliveries: 5 }
];

const purchases = [
  { supplier: 'Fresh Foods Lanka', item: 'Burger Buns', qty: '100 pcs', cost: 12500, date: '2026-07-07', status: 'Paid' },
  { supplier: 'Colombo Meat Co.', item: 'Beef Patties', qty: '80 pcs', cost: 48000, date: '2026-07-06', status: 'Paid' },
  { supplier: 'Green Farm', item: 'Lettuce', qty: '10 kg', cost: 6800, date: '2026-07-05', status: 'Pending' }
];

const expenses = [
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
