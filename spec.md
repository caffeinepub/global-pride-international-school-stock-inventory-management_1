# Specification

## Summary
**Goal:** Rewrite the authentication guard and the Inventory add-item form from scratch to fix login-on-first-load and broken item creation.

**Planned changes:**
- Rewrite the authentication guard in App.tsx from scratch: synchronously read the session flag from localStorage on every render of protected routes (Dashboard, Inventory, Billing, Reports); redirect to /login immediately if no valid session is found; redirect to /dashboard if a logged-in user navigates to /login
- Rewrite the Add Item form on the Inventory page from scratch: fields for Item Name (text, required), Category (select, required), Quantity (positive integer, required), and Price per Item (positive number, required); on submit, call the backend addItem mutation with the correct argument shape, show a success notification, clear the form, and invalidate the inventory query so the table updates immediately; display inline validation errors for empty fields and backend error messages on failure

**User-visible outcome:** The login page always appears first when opening the app or after logout, with no way to reach protected pages without a session. Adding items from the Inventory page works correctly and the new item appears in the table immediately after submission.
