# Odoo Hackathon 2025

## Team 248

*Members:*
- Parth Srivastava
- Advait Pandya
- Parth Lathiya
- Nihar Mehta

---

## Problem Statement 3: RentalHub - Rental Management System

RentalHub is an integrated rental management system developed for the Odoo Hackathon 2025. It aims to streamline the process of managing rental assets, customers, contracts, and payments for businesses of any size.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)

---

## Overview

RentalHub provides a seamless experience for rental businesses to manage their inventory, track orders, handle payments, and interact with customers. The system is built using Odoo as the backend, with a modern frontend interface for ease of use.

---

## Features

- Asset management: Add, update, and track rental items.
- Customer management: Register and manage customers.
- Rental contracts: Generate, edit, and monitor rental agreements.
- Payment tracking: Integrated payment flow and history.
- Dashboard: At-a-glance overview of metrics and activity.
- Notifications: Alerts for overdue rentals, payments, and asset availability.

---

## Tech Stack

- **Backend:** Odoo (Python, PostgreSQL), Node.js (Express), MongoDB
- **Frontend:** React (TypeScript), Vite, Tailwind CSS, HTML, CSS, JavaScript
- **API:** RESTful (Express controllers, Odoo integration)

---

## Frontend Setup

1. Clone the repository and navigate to the frontend directory:

   ```bash
   git clone https://github.com/nihar245/odoo_rental_system.git
   cd odoo_rental_system/Frontend
   ```

2. Install all dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm i vite
   npm run dev
   ```

   The frontend will be available at [http://localhost:5173](http://localhost:5173) by default.

---

## Backend Setup

1. Make sure you have Node.js and MongoDB installed and running locally.

2. Navigate to the backend directory:

   ```bash
   cd odoo_rental_system/Backend
   ```

3. Install all dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the Backend directory and add your environment variables. Example:

   ```env
   MONGODB_URI=mongodb://localhost:27017
   PORT=8000
   ACCESS_TOKEN_SECRET=your_access_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   CORS_ORIGIN=http://localhost:5173
   ```

5. Start the backend server:

   ```bash
   npm run dev
   ```

   The backend server will start at [http://localhost:8000](http://localhost:8000) by default.

6. **API Endpoints:**
   - Users: `/api/v1/users`
   - Products: `/api/v1/products`
   - Rentals: `/api/v1/rentals`
   - Invoices: `/api/v1/invoices`
