import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/src/contexts/CartContext';
import { Button } from '@/src/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsCartOpen(false);
    // Navigate to checkout page (to be implemented)
    alert("Checkout functionality will be implemented soon!");
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-darker/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-steel/10">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-secondary" />
                <h2 className="text-xl font-display font-bold text-darker">Your Cart</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-steel hover:text-secondary transition-colors rounded-full hover:bg-light"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-light rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-10 h-10 text-steel/50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-darker mb-1">Your cart is empty</h3>
                    <p className="text-dark">Looks like you haven't added any products yet.</p>
                  </div>
                  <Button 
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/products');
                    }}
                    className="mt-4"
                  >
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 bg-light/50 p-3 rounded-xl border border-steel/10">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shrink-0 border border-steel/10">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-darker text-sm line-clamp-2">{item.name}</h4>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-steel hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="font-bold text-secondary">
                            ₹{item.price.toLocaleString('en-IN')}
                          </div>
                          
                          <div className="flex items-center bg-white border border-steel/20 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1.5 text-darker hover:bg-light transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-darker">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1.5 text-darker hover:bg-light transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-steel/10 bg-light/30">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-dark font-medium">Subtotal</span>
                  <span className="text-2xl font-display font-bold text-darker">
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="w-full h-14 text-lg bg-secondary hover:bg-secondary-dark text-white shadow-lg shadow-secondary/20"
                >
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
