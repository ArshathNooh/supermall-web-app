# Super Mall Web Application

A comprehensive web application for managing shops, products, offers, and locations in a shopping mall. Built with Firebase for authentication, database, and hosting.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Firebase Configuration](#firebase-configuration)
- [Architecture & Design](#architecture--design)
- [Usage Guide](#usage-guide)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Authentication
- ✅ Secure user authentication with Firebase Auth
- ✅ Role-based access control (Admin/User)
- ✅ User registration and login
- ✅ Session management

### Admin Features
- ✅ **Shop Management**: Create, update, delete, and view shop details
- ✅ **Product Management**: Full CRUD operations for products
- ✅ **Offer Management**: Create and manage discounts and offers
- ✅ **Location Management**: Assign shops to floors and categories
- ✅ **Data Analytics**: View statistics and reports
- ✅ **Action Logging**: All admin actions are logged

### User Features
- ✅ **Browse Shops**: View all available shops
- ✅ **Product Browsing**: Browse products by category and floor
- ✅ **Search & Filter**: Search and filter products and shops
- ✅ **Product Comparison**: Compare multiple products side-by-side
- ✅ **View Offers**: See all active offers from shops

### UI/UX Features
- ✅ Modern admin dashboard design
- ✅ Fully responsive (Desktop, Tablet, Mobile)
- ✅ Clean, flat design with soft shadows
- ✅ Intuitive navigation
- ✅ Real-time data updates

## 🛠 Tech Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables
- **JavaScript (ES6+)**: Vanilla JavaScript, no frameworks

### Backend & Services
- **Firebase Authentication**: User authentication
- **Firebase Firestore**: NoSQL database
- **Firebase Hosting**: Static hosting

### Development Tools
- **Git**: Version control
- **GitHub**: Repository hosting

## 📁 Project Structure

```
super-mall-app/
├── public/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # All styles
│   └── app.js             # Main application logic
├── firebase/
│   └── firebaseConfig.js  # Firebase configuration
├── services/
│   ├── auth.js            # Authentication service
│   ├── shops.js           # Shops CRUD service
│   ├── products.js        # Products CRUD service
│   └── offers.js          # Offers CRUD service
└── README.md              # This file
```

## 🚀 Setup Instructions

### Prerequisites

1. **Node.js** (optional, for local development server)
2. **Firebase Account**: Sign up at [firebase.google.com](https://firebase.google.com)
3. **Git**: For version control
4. **Modern Web Browser**: Chrome, Firefox, Safari, or Edge

### Step 1: Clone or Download the Project

```bash
git clone <your-repository-url>
cd super-mall-app
```

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project" or select an existing project
3. Enable the following services:
   - **Authentication**: 
     - Go to Authentication > Sign-in method
     - Enable "Email/Password"
   - **Firestore Database**:
     - Go to Firestore Database
     - Click "Create database"
     - Start in "Test mode" (for development)
     - Choose a location
   - **Hosting** (optional for deployment):
     - Go to Hosting
     - Follow setup instructions

### Step 3: Configure Firebase

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click the web icon (`</>`) to add a web app
4. Register your app and copy the configuration object
5. Open `firebase/firebaseConfig.js`
6. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 4: Set Up Firestore Security Rules

Go to Firestore Database > Rules and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Shops collection
    match /shops/{shopId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Products collection
    match /products/{productId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Offers collection
    match /offers/{offerId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Step 5: Run the Application

#### Option A: Using a Local Server (Recommended)

If you have Python installed:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Or using Node.js (http-server):
```bash
npm install -g http-server
http-server -p 8000
```

Then open: `http://localhost:8000/public/`

#### Option B: Direct File Access

Simply open `public/index.html` in your web browser (some features may not work due to CORS).

### Step 6: Create Your First Admin User

1. Open the application
2. Click "Register"
3. Enter your email and password
4. Select "Admin" as the role
5. Click "Register"
6. You'll be automatically logged in

**Note**: In production, you should create admin users programmatically or through Firebase Console for security.

## 🏗 Architecture & Design

### System Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (HTML/CSS/JS)  │
└────────┬────────┘
         │
         │ HTTP/HTTPS
         │
┌────────▼────────┐
│  Firebase Auth  │ ◄─── Authentication
└────────┬────────┘
         │
┌────────▼────────┐
│  Firestore DB  │ ◄─── Data Storage
└────────────────┘
```

### Application Flow

1. **User Authentication**
   - User logs in via Firebase Auth
   - User role is fetched from Firestore
   - UI is updated based on role (Admin/User)

2. **Data Management**
   - Services handle all CRUD operations
   - Data is stored in Firestore collections
   - Real-time updates via Firestore listeners

3. **UI Updates**
   - Event-driven architecture
   - Modular service layer
   - Centralized state management

### Service Layer Architecture

```
app.js (Main Application)
    │
    ├── authService (Authentication)
    ├── shopsService (Shop Management)
    ├── productsService (Product Management)
    └── offersService (Offer Management)
```

### Data Models

#### User
```javascript
{
  email: string,
  role: 'admin' | 'user',
  createdAt: timestamp
}
```

#### Shop
```javascript
{
  name: string,
  description: string,
  floor: string,
  category: string,
  location: string,
  contact: string,
  email: string,
  openingHours: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Product
```javascript
{
  name: string,
  description: string,
  shopId: string,
  shopName: string,
  price: number,
  category: string,
  brand: string,
  features: string[],
  imageUrl: string,
  inStock: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### Offer
```javascript
{
  title: string,
  description: string,
  shopId: string,
  shopName: string,
  discount: number,
  discountType: 'percentage' | 'fixed',
  productIds: string[],
  validFrom: timestamp,
  validUntil: timestamp,
  isActive: boolean,
  terms: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Security Considerations

1. **Authentication**: All routes require authentication
2. **Authorization**: Admin-only actions are protected
3. **Input Validation**: All inputs are sanitized
4. **Firestore Rules**: Server-side security rules
5. **XSS Prevention**: HTML escaping for user inputs

## 📖 Usage Guide

### For Administrators

#### Managing Shops
1. Navigate to "Shops" in the sidebar
2. Click "+ Add Shop" to create a new shop
3. Fill in shop details (name, floor, category are required)
4. Click "Save"
5. Use "Edit" or "Delete" buttons to manage existing shops

#### Managing Products
1. Navigate to "Products"
2. Click "+ Add Product"
3. Select a shop, enter product details
4. Add features as comma-separated values
5. Save the product

#### Managing Offers
1. Navigate to "Offers"
2. Click "+ Add Offer"
3. Select shop, set discount amount and type
4. Set validity dates
5. Save the offer

#### Viewing Reports
1. Navigate to "Reports"
2. View shop distribution by floor and category
3. Analyze product pricing data

### For Users

#### Browsing Shops
1. Navigate to "Shops"
2. Use search to find specific shops
3. Filter by floor or category
4. Click "View" to see shop details

#### Browsing Products
1. Navigate to "Products"
2. Search for products
3. Filter by category or price range
4. Select products to compare
5. Click "Compare Products" to see side-by-side comparison

#### Viewing Offers
1. Navigate to "Offers"
2. Browse all active offers
3. Click "View" to see offer details

## 🧪 Testing

### Manual Test Cases

#### Authentication Tests

1. **User Registration**
   - ✅ Register with valid email and password
   - ✅ Register with invalid email (should fail)
   - ✅ Register with weak password (should fail)
   - ✅ Register with existing email (should fail)

2. **User Login**
   - ✅ Login with correct credentials
   - ✅ Login with incorrect password (should fail)
   - ✅ Login with non-existent email (should fail)

3. **Logout**
   - ✅ Logout successfully
   - ✅ Verify user is redirected to login screen

#### Shop Management Tests (Admin Only)

1. **Create Shop**
   - ✅ Create shop with all required fields
   - ✅ Create shop without required fields (should fail)
   - ✅ Verify shop appears in list

2. **Update Shop**
   - ✅ Edit shop details
   - ✅ Verify changes are saved

3. **Delete Shop**
   - ✅ Delete shop
   - ✅ Verify shop is removed from list

4. **Filter Shops**
   - ✅ Filter by floor
   - ✅ Filter by category
   - ✅ Search shops by name

#### Product Management Tests

1. **Create Product**
   - ✅ Create product with all fields
   - ✅ Create product with required fields only
   - ✅ Verify product appears in list

2. **Product Comparison**
   - ✅ Select 2+ products
   - ✅ Click "Compare Products"
   - ✅ Verify comparison view shows all selected products

3. **Filter Products**
   - ✅ Filter by category
   - ✅ Filter by price range
   - ✅ Search products

#### Offer Management Tests

1. **Create Offer**
   - ✅ Create offer with percentage discount
   - ✅ Create offer with fixed amount discount
   - ✅ Set validity dates

2. **View Active Offers**
   - ✅ Verify only active offers are shown
   - ✅ Verify expired offers are hidden

### Automated Testing (Future Enhancement)

Consider adding:
- Unit tests for services
- Integration tests for Firebase operations
- E2E tests with Cypress or Playwright

## 🚀 Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project**:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory as `public`
   - Configure as single-page app: No
   - Set up automatic builds: No

4. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

5. **Access your app**:
   Your app will be available at: `https://YOUR_PROJECT_ID.web.app`

### Environment Configuration

For production:
1. Update Firestore security rules (see Step 4 in Setup)
2. Configure CORS if needed
3. Set up custom domain (optional)
4. Enable Firebase Analytics (optional)

## 📝 Logging

The application includes comprehensive logging:

- **Info Logs**: User actions, data loading
- **Error Logs**: Failed operations, errors
- **Warn Logs**: Warnings and important notices

All logs are timestamped and can be viewed in the browser console.

## 🔒 Security Best Practices

1. **Never commit Firebase config with real credentials to public repos**
2. **Use environment variables for sensitive data**
3. **Implement proper Firestore security rules**
4. **Validate all user inputs**
5. **Use HTTPS in production**
6. **Regularly update dependencies**

## 🐛 Troubleshooting

### Common Issues

1. **Firebase not initialized**
   - Check `firebaseConfig.js` has correct values
   - Verify Firebase SDK is loaded

2. **Authentication not working**
   - Check Email/Password is enabled in Firebase Console
   - Verify Firestore rules allow user creation

3. **Data not loading**
   - Check Firestore security rules
   - Verify user is authenticated
   - Check browser console for errors

4. **CORS errors**
   - Use a local server instead of file://
   - Check Firebase configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name/Team

## 🙏 Acknowledgments

- Firebase for providing excellent backend services
- Modern web standards for making this possible

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review Firebase documentation

---

**Built with ❤️ for efficient mall management**

