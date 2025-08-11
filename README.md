# 🏗️ Rental Management System

A complete React.js frontend for managing equipment and tool rentals with a modern, mobile-first responsive design.

## ✨ Features

### 🔐 Authentication & User Management
- **Login/Signup System** with role-based access (Customer/Admin)
- **Protected Routes** for authenticated users
- **Context API** for global state management
- **JWT Token** based authentication

### 🏠 Customer Features
- **Browse Equipment** with advanced filtering and search
- **Product Details** with image galleries and specifications
- **Booking System** with date pickers and availability checks
- **My Rentals** page to track booking status
- **Responsive Design** optimized for all devices

### 👨‍💼 Admin Features
- **Dashboard** with KPI cards and analytics charts
- **Product Management** (Add, Edit, Delete, Toggle Availability)
- **Rental Analytics** with Recharts integration
- **User Management** and system overview

### 📱 Responsive Design
- **Mobile-First** approach with Tailwind CSS
- **Responsive Grid** (1 column mobile, 2 tablet, 4 desktop)
- **Hamburger Menu** for mobile navigation
- **Touch-Friendly** interface elements

## 🚀 Tech Stack

- **Frontend Framework**: React.js 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS 3
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Date Picker**: React Datepicker
- **Build Tool**: Create React App

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rental-management-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Tailwind CSS Setup
The project is already configured with Tailwind CSS. The configuration files are:
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `src/index.css` - Main CSS file with Tailwind imports

### 4. Start Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

### 5. Build for Production
```bash
npm run build
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.js      # Navigation with mobile menu
│   ├── Footer.js      # Footer with links
│   ├── ProductCard.js # Product display card
│   └── ProtectedRoute.js # Route protection component
├── context/            # React Context for state
│   └── AuthContext.js # Authentication context
├── pages/              # Page components
│   ├── HomePage.js    # Main product listing
│   ├── LoginPage.js   # User authentication
│   ├── SignupPage.js  # User registration
│   ├── ProductDetailsPage.js # Product details & booking
│   ├── MyRentalsPage.js # User rental history
│   ├── AdminDashboardPage.js # Admin analytics
│   ├── AdminProductsPage.js # Product management
│   └── NotFoundPage.js # 404 error page
├── utils/              # Utility functions
│   └── api.js         # Axios API configuration
├── App.js             # Main app component
├── index.js           # App entry point
└── index.css          # Global styles & Tailwind
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Main brand color
- **Secondary**: Gray (#64748B) - Text and borders
- **Success**: Green (#22C55E) - Positive actions
- **Accent**: Red (#EF4444) - Errors and warnings

### Typography
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 300, 400, 500, 600, 700

### Components
- **Buttons**: Primary, Secondary, Danger variants
- **Cards**: Consistent shadow and border radius
- **Forms**: Input fields with focus states
- **Tables**: Responsive with hover effects

## 📱 Responsive Breakpoints

- **Mobile**: `< 640px` (1 column grid)
- **Tablet**: `640px - 1024px` (2 column grid)
- **Desktop**: `> 1024px` (4 column grid)

## 🔐 Authentication Flow

1. **Login/Signup**: Users authenticate with email/password
2. **Role Assignment**: Customer or Admin role assigned
3. **Protected Routes**: Role-based access control
4. **Token Management**: JWT tokens for API calls

## 📊 Demo Credentials

### Customer Account
- **Email**: customer@demo.com
- **Password**: password123

### Admin Account
- **Email**: admin@demo.com
- **Password**: password123

## 🚀 Key Features Implementation

### Product Management
- **CRUD Operations**: Create, Read, Update, Delete products
- **Image Upload**: Placeholder images with real upload capability
- **Category Management**: Construction, Gardening, Painting, Cleaning
- **Stock Tracking**: Available units and availability status

### Booking System
- **Date Selection**: Start and end date pickers
- **Price Calculation**: Automatic total based on duration
- **Availability Check**: Real-time availability verification
- **Status Tracking**: Pending, Confirmed, Active, Completed

### Admin Dashboard
- **KPI Cards**: Total rentals, revenue, active rentals, products
- **Analytics Charts**: Rental trends, category distribution, top products
- **Recent Activity**: Latest rentals and system updates

## 🔧 Customization

### Adding New Categories
1. Update `categories` array in relevant components
2. Add category-specific styling if needed
3. Update filter components

### Modifying API Endpoints
1. Edit `src/utils/api.js`
2. Update base URL and endpoint configurations
3. Modify API function calls in components

### Styling Changes
1. Modify `src/index.css` for global styles
2. Update `tailwind.config.js` for custom colors/themes
3. Use Tailwind utility classes for component-specific styling

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📦 Build & Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

### Serve Production Build
```bash
npx serve -s build
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📱 Mobile Optimization

- **Touch-Friendly**: Large touch targets
- **Responsive Images**: Optimized for mobile screens
- **Fast Loading**: Optimized bundle size
- **Offline Ready**: Service worker ready

## 🔒 Security Features

- **Protected Routes**: Authentication required for sensitive pages
- **Role-Based Access**: Admin-only features protected
- **Input Validation**: Form validation and sanitization
- **Secure API Calls**: Token-based authentication

## 🚀 Performance Optimizations

- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Responsive images with proper sizing
- **Bundle Optimization**: Tree shaking and minification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🎯 Future Enhancements

- **Real-time Chat**: Customer support integration
- **Payment Gateway**: Stripe/PayPal integration
- **Push Notifications**: Booking reminders
- **Advanced Analytics**: More detailed reporting
- **Mobile App**: React Native version
- **Multi-language**: Internationalization support

---

**Built with ❤️ using React.js and Tailwind CSS**
