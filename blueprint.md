
# Averzo - B2B2D2C E-commerce Platform Blueprint

## 1. Project Overview

Averzo is a multi-faceted e-commerce platform designed to operate on a B2B2D2C (Business-to-Business-to-Distributor-to-Customer) model. It integrates a rich online storefront for end-users with powerful, role-based dashboards for administrators, vendors, artisans (home businesses), physical outlet managers, delivery riders, and a sales force. The platform supports a wide range of products, complex logistics, point-of-sale (POS) operations, and leverages AI for enhanced decision-making and marketing.

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

- **Authentication:** Secure user registration (Customer, Vendor, Rider, Sales, Artisan) and login with email/password and Google OAuth.
- **Product Catalog:**
    - Multi-level category pages (e.g., Men's Fashion > Topwear > T-Shirts).
    - Advanced filtering by brand, color, size, price range, and discounts.
    - Product sorting (Newest, Price Asc/Desc).
    - Live search functionality.
- **Product Detail Page (PDP):**
    - Image and video gallery.
    - Variant selection (color, size) with dynamic price and stock updates.
    - Real-time stock availability check.
    - "Frequently Bought Together" and "Related Products" sections.
    - Q&A and Customer Reviews sections.
    - SEO-optimized with dynamic metadata and structured data (Schema.org).
- **Special Product Types:**
    - **Pre-order:** Support for upcoming products with partial payment options.
    - **Flash Sale:** Time-limited deals with countdown timers.
- **Shopping & Checkout:**
    - Persistent shopping cart with item reservation timers.
    - Product comparison tool.
    - Multi-step checkout process with support for:
        - **Delivery Options:** Location-based express delivery via "Averzo Rider" (for short distances) or standard third-party couriers.
        - **Store Pickup:** Option to collect orders from a designated outlet.
        - Multiple shipping addresses.
        - Coupon, Gift Card, and Loyalty Point redemption.
        - Cash on Delivery (COD) and Online Payments (SSLCommerz).
- **Customer Account:**
    - Role-specific dashboard.
    - Order history and tracking.
    - Profile and address management.
    - Wishlist functionality.
    - Loyalty points and membership tier tracking.
- **Personalization:**
    - **"For You" Section:** AI-powered product recommendations on the homepage based on user's wishlist and browsing history. Displays bestsellers for new or guest users.
- **Public Storefronts:**
    - **Artisan Pages (`/artisan/[id]`):** Dedicated public pages for each artisan showcasing their profile, bio, cover photo, and all their products.
    - **Outlet Pages (`/outlet/[id]`):** Public pages for each physical outlet showing its location, status, and available inventory.

### 3.2. Admin Dashboard (`/dashboard`)

- **Analytics:** KPI cards (revenue, orders, users) and sales charts.
- **User Management:** View all users, filter by role, approve/reject pending accounts, and assign sales reps to customers.
- **Product Management:** Approve or reject vendor-submitted products. Add and edit products directly.
- **Logistics:**
    - Approve/reject vendor stock requests and issue delivery challans.
    - Initiate and monitor inter-outlet stock transfers.
- **Marketing & Promotions:**
    - Create and manage coupons and gift cards.
    - Manage storefront appearance (hero banners, carousels via Store Assets).
    - Send push notifications (to all, by role, or to a specific user).
- **AI-Powered Tools:**
    - **Delivery Monitor:** Analyze active deliveries for potential issues.
    - **Replenishment Advisor:** Generate stock reorder recommendations for outlets.
    - **Sales Route Planner:** Optimize daily routes for the sales force.

### 3.3. Vendor & Artisan Portal (`/vendor`, `/artisan`)

- **Dashboard:** Overview of sales, top-selling products, and stock status.
- **Product Management:**
    - Add new products (with pending admin approval).
    - Use an **AI-powered tool to generate product descriptions**.
    - View listed products and monitor pre-order/wishlist counts.
- **Logistics (Vendor only):** Create stock requests to supply physical outlets. View delivery challans.
- **Promotions:** Create vendor/artisan-specific coupons for their products.
- **Settings:** Update public profile info, including bio and cover photo (for artisans).

### 3.4. Outlet Portal (`/outlet`)

- **Point of Sale (POS):**
    - Barcode/camera scanning and product search.
    - Customer selection (including NFC card scanning).
    - Integrated application of all discount types.
    - Multiple payment methods (Cash, Card, Mobile).
    - Printable thermal receipts.
- **Inventory Management:**
    - View live stock levels for all product variants.
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

The Firestore database structure is defined in `docs/backend.json`. Key collections and recent updates include:

- `/users/{userId}`: Stores all user data. New fields include `coverPhotoURL` and `bio` for artisan/vendor profiles.
- `/products/{productId}`: Contains detailed product information. New fields for SEO (`metaTitle`, `metaDescription`) and shipping (`weight`, `dimensions`) have been added.
- `/orders/{orderId}`: Stores all online and sales-rep-placed orders.
- `/pos_sales/{saleId}`: Logs all sales made through the Point of Sale system.
- `/outlets/{outletId}`: Information about physical store locations.
- `/stock_requests`, `/delivery_challans`, `/stock_transfers`: Collections for managing logistics and inventory movement.
- `/coupons`, `/gift_cards`: Manages promotional codes and gift cards.
- `/settings/{settingId}`: Stores global application settings like loyalty rules and registration permissions.

## 5. Project Structure

- `/src/app/(auth)`: Public routes for authentication (login, register).
- `/src/app/(protected)`: Role-based protected routes for different user dashboards. New top-level directories for `artisan`, `rider`, and `sales` have been added.
- `/src/app/(store)`: Public-facing storefront pages. New pages for artisan stores (`/artisan/[id]`) and outlet stores (`/outlet/[id]`) are included.
- `/src/app/api`: Server-side API routes.
- `/src/components`: Reusable React components.
- `/src/hooks`: Custom React hooks.
- `/src/lib`: Utility functions and static data.
- `/src/types`: TypeScript type definitions for data models.
- `/src/ai`: Genkit flows and AI-related server actions.

## 6. AI & Genkit Integration

The application leverages Genkit to integrate various AI-powered features:

- **Product Description Generator:** Assists vendors/admins in creating compelling product descriptions.
- **Product Recommender:** Provides personalized "For You" product recommendations.
- **Delivery Monitor:** Identifies potential issues with active deliveries for admins.
- **Replenishment Planner:** Suggests stock replenishment for outlet managers.
- **Sales Route Planner:** Generates optimized routes for sales representatives.
- **Notification Flows:** A suite of flows for sending targeted push notifications.
