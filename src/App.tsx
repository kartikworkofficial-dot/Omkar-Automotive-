import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/src/components/layout/Navbar";
import { Footer } from "@/src/components/layout/Footer";
import { Home } from "@/src/pages/Home";
import { About } from "@/src/pages/About";
import { ServicesPage } from "@/src/pages/ServicesPage";
import { Gallery } from "@/src/pages/Gallery";
import { TestimonialsPage } from "@/src/pages/TestimonialsPage";
import { Contact } from "@/src/pages/Contact";
import { Blog } from "@/src/pages/Blog";
import { BlogPost } from "@/src/pages/BlogPost";
import { Products } from "@/src/pages/Products";
import { ProductDetail } from "@/src/pages/ProductDetail";
import { AdminLogin } from "@/src/pages/admin/AdminLogin";
import { AdminDashboard } from "@/src/pages/admin/AdminDashboard";
import { BlogEditor } from "@/src/pages/admin/BlogEditor";
import { ProductEditor } from "@/src/pages/admin/ProductEditor";
import { ProtectedRoute } from "@/src/components/ProtectedRoute";
import { Chatbot } from "@/src/components/Chatbot";
import { BookingModal } from "@/src/components/BookingModal";
import { CartDrawer } from "@/src/components/CartDrawer";
import { useState, useEffect } from "react";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { CartProvider } from "@/src/contexts/CartContext";

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const handleOpenBooking = () => setIsBookingOpen(true);
    window.addEventListener("open-booking", handleOpenBooking);
    return () => window.removeEventListener("open-booking", handleOpenBooking);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-light text-darker flex flex-col font-sans">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/testimonials" element={<TestimonialsPage />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/blog/new" element={
                  <ProtectedRoute>
                    <BlogEditor />
                  </ProtectedRoute>
                } />
                <Route path="/admin/blog/edit/:id" element={
                  <ProtectedRoute>
                    <BlogEditor />
                  </ProtectedRoute>
                } />
                <Route path="/admin/product/new" element={
                  <ProtectedRoute>
                    <ProductEditor />
                  </ProtectedRoute>
                } />
                <Route path="/admin/product/edit/:id" element={
                  <ProtectedRoute>
                    <ProductEditor />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
            <Footer />
            <Chatbot />
            <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
            <CartDrawer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
