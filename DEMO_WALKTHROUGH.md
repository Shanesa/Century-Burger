# Century Burger Demo Walkthrough

Use this order when presenting the demo to the client.

> Tip: press **Reset** (bottom of the admin sidebar) before every presentation
> so the demo numbers start fresh.

## 1. Customer Menu

- Open `index.html`
- Show the hero panel and category filters
- Click Burgers, Sides, Drinks, and Combos
- Click an item's image to open the Item Detail modal

## 2. Item Detail

- Show item image placeholder, description, size, add-ons, and quantity
- Click Add to Cart

## 3. Checkout + Demo Card Payment

- Go to the cart icon in the navbar (Checkout)
- Show delivery vs pickup toggle
- Show address field
- Select Demo card payment
- Use success card: `4242 4242 4242 4242`
- Click Pay Demo Card & Place Order
- Show the successful order tracking screen

## 4. Failed Payment State

- Return to Checkout
- Click Use Failed Card
- Failed card: `4000 0000 0000 0002`
- Click Pay Demo Card & Place Order
- Show the payment failed message

## 5. Enter the Admin System

- Click "Admin" in the navbar or "View Admin System" on the hero — this opens `admin/index.html`
- Show the Dashboard: stat cards, the live low-stock alert (it lists the actual
  ingredients that are low), recent orders, and the sales chart
- **The order placed on the website in step 3 appears at the top of the
  orders list as a "New order"** — point this out, it always lands well

## 6. The Inventory Story (the highlight — client's main request)

This is the recipe-based stock system from the client's
`Inventory Management Example.pdf`, working live:

Inventory has three big tabs. Walk them left to right:

**Tab 1 — "What can we make?"** (the screen the owner will live on)

1. Every food shows a photo and a big number: *we can still make 30*
2. Tap the Classic Burger — the popup explains it in one glance:
   each ingredient, what one burger needs, what's left, and a yellow
   **"Runs out first"** tag on the ingredient that sets the limit
3. Tap **Add stock** right on that ingredient, type the amount, save —
   go back to the tile and the number went UP. Say it out loud:
   *"Lettuce was the problem. We bought lettuce. Now we can make 50."*

**Tab 2 — "Ingredients"** (the traditional list)

4. Enough / Running low / Finished cards, then the full list the
   traditional way: *58 pcs left, 5 kg left*, level bars, search,
   and an **Add** button on every row
5. Below it: the **Recipes** card (how the system knows what to deduct)
   and the **Stock activity** feed written in plain sentences

**Tab 3 — "Try a sale"** (the teaching card)

6. Pick *Century Classic Burger*, set quantity to **8** and read the beef
   row out loud: *100 g × 8 = 800 g used · 5 kg − 800 g = 4.2 kg left* —
   this is exactly the example from the client's PDF
7. Click **Record this sale** — stock drops instantly everywhere
8. Crank the quantity up until an ingredient runs out — the button
   disables itself: *out of stock blocks sales*

## 7. The Touch Till — Sell (POS)

Built for counter staff with zero training. Best shown on a tablet or phone.

1. Open **Sell (POS)** in the sidebar
2. Say the script out loud as you tap: *"Customer wants ten classic burgers.
   Tap the burger… tap 10… Add… Take payment. That's it."*
3. Show the receipt popup — payment received, stock updated automatically
4. Go to **Inventory** and show the beef went down by 10 × 100 g = 1 kg
5. Back on the till, point out the smart tiles: when an ingredient runs out,
   every item that needs it grays out as **Finished** and shows
   **"Only N left"** warnings before that — staff can never sell food the
   kitchen can't make
6. On a phone, show the bottom bar with the running total and Pay button

## 8. Orders Deduct Stock Automatically

- Open **Orders**
- Find the "New order" from the website and click **Start preparing**
- A message appears listing exactly which ingredients were taken out of stock
- If stock is missing, the button is replaced by a red **No stock** notice
  with a "Buy stock" shortcut
- Walk the order through: Send with rider → Mark delivered

## 9. Buy Stock (Purchasing)

- Open **Buy stock**, choose an ingredient, enter a quantity, click
  **Add to stock** — inventory goes up immediately and the purchase is logged

## 10. Riders + Finance Screens

- Open Riders, click "View" on a rider to preview their mobile app screen
- Open Expenses and add an expense with the form
- Open Invoices and click "Preview" on an order to show the mock invoice
- Open Reports and show the sales-by-day and top-selling-items charts

## Important Client Note

This is a UI-only prototype: no real login, payment gateway, database, or
rider tracking. The stock deduction is real *within the demo* (it runs in the
browser and survives page refreshes via localStorage) so the client can feel
exactly how the final inventory system will behave. Use the **Reset** button
in the sidebar to restore the starting numbers.
