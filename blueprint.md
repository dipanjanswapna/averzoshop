
# Averzo - B2B2D2C E-commerce Platform Blueprint

## 1. Project Overview

Averzo is a multi-faceted e-commerce platform designed to operate on a B2B2D2C (Business-to-Business-to-Distributor-to-Customer) model. It integrates a rich online storefront for end-users with powerful, role-based dashboards for administrators, vendors, physical outlet managers, delivery riders, and a sales force. The platform supports a wide range of products, complex logistics, point-of-sale (POS) operations, and leverages AI for enhanced decision-making and marketing.

## 2. Technology Stack

- **Frontend:** Next.js (App Router), React, TypeScript
- **UI Framework:** Tailwind CSS, shadcn/ui
- **Backend Services:** Firebase (Authentication, Firestore Database)
- **Generative AI:** Google Genkit (Gemini Models)
- **Payment Gateway:** SSLCommerz
- **Mapping & Geolocation:** Barikoi API, Leaflet.js
- **State Management:** Zustand (for client-side state like cart, compare), React Context
- **Form Handling:** React Hook Form, Zod

## 3. Core Features & Modules

### 3.1. Storefront (Customer-Facing)

- **Authentication:** Secure user registration (Customer, Vendor, Rider, Sales) and login with email/password and Google OAuth.
- **Product Catalog:**
    - Multi-level category pages (e.g., Men's Fashion > Topwear > T-Shirts).
    - Advanced filtering by brand, color, size, price range, and discounts.
    - Product sorting (Newest, Price Asc/Desc).
    - Live search functionality.
- **Product Detail Page (PDP):**
    - Image and video gallery.
    - Variant selection (color, size).
    - Real-time stock availability.
    - Pre-order and Flash Sale support with timers.
    - "Frequently Bought Together" and "Related Products" sections.
    - Q&A and Customer Reviews sections.
- **Shopping & Checkout:**
    - Persistent shopping cart with item reservation timers.
    - Product comparison tool.
    - Multi-step checkout process with support for:
        - Delivery or Store Pickup.
        - Multiple shipping addresses.
        - Coupon, Gift Card, and Loyalty Point redemption.
        - Cash on Delivery (COD) and Online Payments (SSLCommerz).
- **Customer Account:**
    - Role-specific dashboard.
    - Order history and tracking.
    - Profile and address management.
    - Wishlist functionality.
    - Loyalty points and membership tier tracking.

### 3.2. Admin Dashboard (`/dashboard`)

- **Analytics:** KPI cards (revenue, orders, users) and sales charts.
- **User Management:** View all users, filter by role, approve/reject pending accounts, and assign sales reps to customers.
- **Product Management:** Approve or reject vendor-submitted products.
- **Logistics:**
    - Approve/reject vendor stock requests and issue delivery challans.
    - Initiate and monitor inter-outlet stock transfers.
- **Marketing & Promotions:**
    - Create and manage coupons and gift cards.
    - Manage storefront appearance (hero banners, carousels).
    - Send push notifications (to all, by role, or to a specific user).
- **AI-Powered Tools:**
    - **Delivery Monitor:** Analyze active deliveries for potential issues.
    - **Replenishment Advisor:** Generate stock reorder recommendations for outlets.
    - **Sales Route Planner:** Optimize daily routes for the sales force.

### 3.3. Vendor Portal (`/vendor`)

- **Dashboard:** Overview of sales, top-selling products, and stock status.
- **Product Management:** Add new products (with pending admin approval), view listed products, and monitor pre-order/wishlist counts.
- **Logistics:** Create stock requests to supply physical outlets. View delivery challans.
- **Promotions:** Create vendor-specific coupons for their products.

### 3.4. Outlet Portal (`/outlet`)

- **Point of Sale (POS):**
    - Barcode/camera scanning and product search.
    - Customer selection (including NFC card scanning).
    - Integrated application of all discount types (promo, loyalty, gift card, card promo).
    - Multiple payment methods (Cash, Card, Mobile).
    - Printable thermal receipts.
- **Inventory Management:**
    - View live stock levels for all product variants in the outlet.
    - Receive stock from vendors (via delivery challans).
    - Dispatch and receive stock for inter-outlet transfers.
- **Order Fulfillment:**
    - Manage online orders routed to the outlet for both delivery and store pickup.
    - Update order status (Preparing, Ready for Pickup).
    - Mark pickup orders as "Fulfilled".

### 3.5. Rider Portal (`/rider`)

- **Dashboard:** Overview of active and completed deliveries.
- **Delivery Management:** View available orders ready for pickup, accept delivery jobs, and update order status to "Out for Delivery" and "Delivered".

### 3.6. Sales Force Automation (SFA) Portal (`/sales`)

- **Dashboard:** View personal performance metrics (customers, orders, sales value).
- **Customer Management:** View and add new customers, who are then automatically assigned to the sales rep.
- **Order Placement:** A dedicated interface to place orders on behalf of managed customers, with access to their discounts and loyalty points.

## 4. Database Schema (`docs/backend.json`)

The Firestore database structure is defined in `docs/backend.json`, which serves as a schema for the application's data models. Key collections include:

- `/users/{userId}`: Stores all user data, including roles, status, addresses, and loyalty information.
- `/products/{productId}`: Contains detailed product information, including variants, stock levels, and special offer details.
- `/orders/{orderId}`: Stores all online and sales-rep-placed orders.
- `/pos_sales/{saleId}`: Logs all sales made through the Point of Sale system.
- `/outlets/{outletId}`: Information about physical store locations.
- `/stock_requests`, `/delivery_challans`, `/stock_transfers`: Collections for managing logistics and inventory movement.
- `/coupons`, `/gift_cards`: Manages promotional codes and gift cards.
- `/settings/{settingId}`: Stores global application settings like loyalty rules and registration permissions.

## 5. Project Structure

- `/src/app/(auth)`: Public routes for authentication (login, register).
- `/src/app/(protected)`: Role-based protected routes for different user dashboards (admin, customer, vendor, etc.).
- `/src/app/(store)`: Public-facing storefront pages (home, product, category, cart, checkout).
- `/src/app/api`: Server-side API routes for handling backend logic like payment verification and order completion.
- `/src/components`: Reusable React components, organized by feature (e.g., `cart`, `product`, `dashboard`).
- `/src/hooks`: Custom React hooks (e.g., `useAuth`, `useCart`, `useFirestoreQuery`).
- `/src/lib`: Utility functions, static data, and external API integrations.
- `/src/types`: TypeScript type definitions for data models (e.g., `Product`, `Order`, `User`).
- `/src/ai`: Genkit flows and AI-related server actions.

## 6. AI & Genkit Integration

The application leverages Genkit to integrate various AI-powered features:

- **Product Description Generator:** (`product-description-generator.ts`) - Assists vendors/admins in creating compelling product descriptions.
- **Product Recommender:** (`product-recommender.ts`) - Provides personalized "For You" product recommendations based on a user's wishlist.
- **Delivery Monitor:** (`delivery-monitoring-dashboard.ts`) - Identifies potential issues with active deliveries for admins.
- **Replenishment Planner:** (`replenishment-planner.ts`) - Analyzes sales data to suggest stock replenishment for outlet managers.
- **Sales Route Planner:** (`sales-route-planner.ts`) - Generates optimized routes for sales representatives.
- **Notification Flows:** (`send-notification-*.ts`) - A suite of flows for sending targeted push notifications.
