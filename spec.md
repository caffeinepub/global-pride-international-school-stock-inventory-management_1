# Specification

## Summary
**Goal:** Add a login page with credential validation to the Stock & Inventory Manager, protecting existing routes without changing any other functionality.

**Planned changes:**
- Create a `Login.tsx` component with username and password fields, using the existing `useAuth` hook to validate hardcoded credentials stored in localStorage
- Show an inline error alert on invalid credentials and redirect to the Dashboard on success
- Add an `AuthGuard` to `App.tsx` that redirects unauthenticated users to `/login` and authenticated users away from `/login` to `/dashboard`
- Register the `/login` route in the app router

**User-visible outcome:** Users are required to log in before accessing any protected page (Dashboard, Inventory, Billing, Reports). Invalid credentials show an error message; valid credentials grant access to the application.
