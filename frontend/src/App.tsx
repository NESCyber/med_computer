import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdPopup from './components/AdPopup';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';

const AppContent: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col min-h-screen bg-bgdark">
      <AdPopup />
      <Navbar />
      
      {/* Global Floating WhatsApp Support Widget */}
      <a
        href={`https://wa.me/${settings.whatsapp_number}?text=Hello%20MED%20Computers,%20I%20have%20a%20question%20about%20your%20hardware%20configurations.`}
        target="_blank"
        rel="noreferrer"
        className="whatsapp-btn"
        title="Chat with Support on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.906-6.99C16.255 1.86 13.782 1.828 12.007 1.828c-5.44 0-9.865 4.42-9.869 9.864-.001 1.776.47 3.514 1.365 5.058L2.516 21.36l4.131-1.082-.001-.004-.001-.002L6.647 19.15zm10.375-4.47c-.29-.145-1.722-.85-1.99-.947-.267-.097-.463-.146-.658.146-.195.29-.755.947-.925 1.142-.17.195-.34.218-.63.073-1.293-.647-2.13-1.167-2.977-2.618-.23-.396.23-.367.658-1.22.073-.146.037-.272-.018-.38-.056-.11-.463-1.115-.634-1.528-.166-.4-.363-.346-.502-.353-.13-.006-.279-.007-.428-.007-.15 0-.393.056-.6.282-.206.226-.788.77-.788 1.876 0 1.106.802 2.17.915 2.324.112.154 1.579 2.41 3.826 3.38.535.23 1.002.38 1.345.49.537.17 1.026.146 1.412.088.43-.064 1.722-.703 1.964-1.383.243-.68.243-1.262.17-1.38-.073-.118-.266-.19-.556-.336z"/>
        </svg>
      </a>
      <main className="flex-1 w-full">
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
