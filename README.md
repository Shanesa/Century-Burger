# Century Burger UI Demo

This folder contains the interactive client demo.

## Demo Objective

Show the client how the Century Burger online ordering and restaurant management system will look and feel before full development starts.

This is a UI-only click-through prototype. It uses dummy data only and does not include real authentication, real payments, a real database, or backend functionality.

## Demo Stack

- Static HTML
- Bootstrap 5 (grid, components) + Font Awesome (icons) + Chart.js (report charts) via CDN
- Poppins (body) + Archivo Black (headings) via Google Fonts
- Mock data in `assets/js/data.js`
- No backend, no API calls, no WordPress/WooCommerce connection

This is enough for client approval and can be published directly with GitHub Pages, Netlify, or Vercel.

## Two Entry Points

The demo is now shaped as two separate applications, like a real product would be:

- `index.html` — the customer storefront (menu, item detail modal, checkout, order tracking, order history)
- `admin/index.html` — the admin system, with a fixed sidebar + topbar dashboard shell (Dashboard, Orders, Riders, Inventory, Purchasing, Expenses, Invoices, Reports)

Each links to the other ("View Admin System" / "View Storefront") so the client can move between the two experiences.

## File Structure

- `index.html` — customer storefront screens
- `admin/index.html` — admin dashboard shell and screens
- `assets/css/style.css` — shared theme layer on top of Bootstrap (colors, fonts, sidebar, cards)
- `assets/js/data.js` — editable mock data (menu, orders, inventory, riders, purchases, expenses, reports)
- `assets/js/main.js` — customer site navigation, cart, and mock checkout logic
- `assets/js/admin.js` — admin sidebar navigation, table rendering, and Chart.js reports
- `assets/img/` — local demo imagery, placeholder brand assets, favicon, and fallback food image

## Asset Structure

- `assets/img/century-burger-logo.svg` — placeholder demo logo used by storefront and admin
- `assets/img/favicon.svg` — browser tab icon
- `assets/img/placeholder-food.svg` — fallback image if a menu image fails to load
- `assets/img/*.jpg` — demo food images used by the hero, menu cards, and item detail modal
- `assets/css/style.css` — shared storefront/admin styles
- `assets/js/data.js` — shared mock data
- `assets/js/main.js` — storefront scripts
- `assets/js/admin.js` — admin scripts

Bootstrap, Font Awesome, Google Fonts, and Chart.js are still loaded from CDN for this demo. If the client needs a fully offline package later, those vendor libraries can be downloaded into `assets/vendor/` and linked locally.

## Menu Photography

Menu, hero, and item-detail images are free-to-use stock photos (Pexels license — free for commercial use, no attribution required), chosen to visually match each menu item. They are **not** photos of Century Burger's actual food and should be replaced with real product photography once available.

## Demo Style

- Warm burger restaurant palette: charcoal base, burnt-orange/red accent, cream backgrounds
- Bold condensed heading font, clean sans-serif body font
- Mobile-first responsive layout (sidebar collapses to an off-canvas panel on mobile)
- Demo Mode badge visible in both the storefront footer and the admin sidebar

Colors, fonts, images, and branding are placeholders until Century Burger provides official brand assets.

## Screen Coverage

- Customer website: Home / Menu (`index.html#home`)
- Online ordering: Item Detail modal and Checkout
- Online payments: Mock payment method + demo card selector
- Invoice generation: Admin → Invoices → Preview
- Live order tracking: Checkout → Tracking screen
- Rider management: Admin → Orders (assign rider) and Admin → Riders (rider list + app preview)
- Admin dashboard: Admin → Dashboard
- Inventory management: Admin → Inventory (ingredient list, level bars, add-stock modal, search + filters)
- Automatic ingredient consumption: working in the demo — every menu item has a recipe in `data.js`; starting an order (or using the "See how stock goes down" simulator) deducts qty × recipe from stock. Out-of-stock ingredients block the sale until stock is added. State persists in localStorage; the sidebar Reset button restores defaults.
- Low stock alerts: live Dashboard alert listing the actual low/finished ingredients, bell dot, sidebar counter, and Inventory highlighting
- Purchasing management: Admin → Purchasing
- Expense management: Admin → Expenses
- Reports and analytics: Admin → Reports (Chart.js bar charts)

## Demo Payment Cards

- Success card: `4242 4242 4242 4242`
- Failed card: `4000 0000 0000 0002`
- Expiry: `12/30`
- CVC: `123`

These are UI-only demo values. No real payment is processed.

## Client Presentation

Use `DEMO_WALKTHROUGH.md` to present the customer flow, payment states, admin dashboard, inventory, reports, rider preview, and invoice preview.
