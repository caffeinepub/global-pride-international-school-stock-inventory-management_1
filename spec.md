# Specification

## Summary
**Goal:** Build a desktop web-based Stock & Inventory Management System for Global Pride International School, with hardcoded login, inventory management, billing with print support, date-wise reports, and a summary dashboard — all backed by a persistent Motoko canister.

**Planned changes:**

- **Authentication:** Hardcoded login page (username: `global Pride international school`, password: `gpis@8320`). No sign-up. Session flag stored client-side. All routes redirect to login when unauthenticated. Logout clears session.

- **Backend (Motoko):** Persistent data models for `InventoryItem` (id, name, category, quantity, pricePerItem) and `BillRecord` (id, date, studentName, lineItems, grandTotal, paymentMode). Expose: `addItem`, `updateItem`, `getItems`, `createBill` (with stock validation and deduction), `getBillsByDate`, and a dashboard stats query (totalItems, totalStock, todaySold, todayIncome).

- **Dashboard page:** Four summary cards — Total Items in Inventory, Total Stock Available, Total Stock Sold Today, Total Income Today — fetched from the backend.

- **Inventory page:** Add Item form (name, category, quantity, price per item). Items table with columns: Item Name, Category, Quantity Available, Amount per Item, Actions. Edit item via modal/inline form. Update Stock action to increment existing quantity.

- **Billing page:** Form with Student Name, Payment Mode (Cash/UPI), dynamic line items (item selector from inventory, quantity input, auto-calculated subtotal), auto-calculated Grand Total. Submit deducts stock and saves bill. Print Bill triggers browser print with a clean layout showing Student Name, line items, grand total, and payment mode — no school name or logo. Error shown and submission blocked if requested quantity exceeds stock. Form resets after successful submission.

- **Reports page:** Date picker to select a day. Displays a table of items sold (Item Name, Quantity Sold, Amount Earned per Item), summary totals (Grand Total, Total Units Sold, Total Income), and remaining stock per item. Shows "No records" message when no sales exist for the selected date.

- **Navigation:** Sidebar or top nav with links to Dashboard, Inventory, Billing, and Report. Active page highlighted. Logout button on every authenticated page.

- **Visual theme:** Clean, professional design using warm neutrals (whites, soft greys) with a deep teal or forest green accent. Card-based layouts, consistent typography, subtle shadows. No blue or purple as primary accent.

**User-visible outcome:** An authenticated school administrator can manage inventory items, generate and print student bills (with automatic stock deduction), view a daily dashboard summary, and pull date-wise sales reports — all from a clean desktop web interface.
