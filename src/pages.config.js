/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminDashboard from './pages/AdminDashboard.jsx';
import Browse from './pages/Browse.jsx';
import Contact from './pages/Contact.jsx';
import EditProduct from './pages/EditProduct.jsx';
import Favorites from './pages/Favorites.jsx';
import Home from './pages/Home.jsx';
import Messages from './pages/Messages.jsx';
import MyProducts from './pages/MyProducts.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Publish from './pages/Publish.jsx';
import License from './pages/License.jsx';
import SellerReviews from './pages/SellerReviews.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "Browse": Browse,
    "Contact": Contact,
    "EditProduct": EditProduct,
    "Favorites": Favorites,
    "Home": Home,
    "Messages": Messages,
    "MyProducts": MyProducts,
    "ProductDetails": ProductDetails,
    "Publish": Publish,
    "License": License,
    "SellerReviews": SellerReviews,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};