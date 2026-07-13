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

1. Open **Inventory**
2. Show the three cards at the top: Enough stock / Running low / Finished
3. Use the **"See how stock goes down when you sell"** simulator:
   - Pick *Century Classic Burger*, set quantity to **8**
   - Read the beef row out loud: *100 g × 8 = 800 g used · 5 kg − 800 g = 4.2 kg left*
   - This is exactly the example from the client's PDF
4. Click **Record this sale** — stock drops instantly, the ingredient table
   updates, and the sale appears in **Stock activity**
5. Show the **Recipes** card — this is how the system knows what to deduct
6. Show the ingredient table: plain badges (Enough / Running low / Finished),
   level bars, and the per-row **Add** button
7. Crank the simulator quantity up until an ingredient runs out — the
   **Record this sale** button disables itself: *out of stock blocks sales*

## 7. Orders Deduct Stock Automatically

- Open **Orders**
- Find the "New order" from the website and click **Start preparing**
- A message appears listing exactly which ingredients were taken out of stock
- If stock is missing, the button is replaced by a red **No stock** notice
  with a "Buy stock" shortcut
- Walk the order through: Send with rider → Mark delivered

## 8. Buy Stock (Purchasing)

- Open **Buy stock**, choose an ingredient, enter a quantity, click
  **Add to stock** — inventory goes up immediately and the purchase is logged

## 9. Riders + Finance Screens

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
