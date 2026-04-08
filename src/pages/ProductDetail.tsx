import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, CheckCircle2, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { useCart } from "@/src/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  categoryId: string;
  image: string;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  inStock: boolean;
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { addToCart, setIsCartOpen } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const prodData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(prodData);
          
          if (prodData.categoryId) {
            const catRef = doc(db, 'categories', prodData.categoryId);
            const catSnap = await getDoc(catRef);
            if (catSnap.exists()) {
              setCategoryName(catSnap.data().name);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product);
      setIsCartOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center bg-light">
        <p className="text-dark">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex flex-col items-center justify-center bg-light">
        <h2 className="text-3xl font-display font-bold text-darker mb-4">Product Not Found</h2>
        <p className="text-dark mb-8">The product you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate("/products")}>Back to Products</Button>
      </div>
    );
  }

  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <main className="pt-32 pb-24 min-h-screen bg-light">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center text-sm font-medium text-steel hover:text-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-steel/10 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            
            {/* Image Gallery */}
            <div className="p-6 lg:p-10 bg-light/30 border-b lg:border-b-0 lg:border-r border-steel/10">
              <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-steel/10 mb-6 relative">
                <img 
                  src={allImages[activeImage]} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-4"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImage === idx ? "border-secondary" : "border-transparent hover:border-steel/30"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {activeImage !== idx && <div className="absolute inset-0 bg-white/40" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6 lg:p-10 flex flex-col">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider rounded-full">
                    {categoryName || 'Uncategorized'}
                  </span>
                  {product.inStock ? (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> In Stock
                    </span>
                  ) : (
                    <span className="text-red-500 text-sm font-medium">Out of Stock</span>
                  )}
                </div>
                
                <h1 className="text-3xl md:text-4xl font-display font-bold text-darker mb-4 leading-tight">
                  {product.name}
                </h1>
                
                <div className="text-3xl font-bold text-darker mb-6">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
                
                <p className="text-dark text-lg leading-relaxed mb-8">
                  {product.description}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10 pb-10 border-b border-steel/10">
                <Button 
                  size="lg" 
                  className="flex-1 h-14 text-base bg-secondary hover:bg-secondary-dark text-white shadow-lg shadow-secondary/20"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1 h-14 text-base border-steel/30 hover:bg-light"
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                >
                  Buy Now
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-light flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-darker">Genuine Parts</h4>
                    <p className="text-xs text-steel mt-0.5">100% authentic products</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-light flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-darker">Fast Delivery</h4>
                    <p className="text-xs text-steel mt-0.5">Across Maharashtra</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-light flex items-center justify-center shrink-0">
                    <RotateCcw className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-darker">Easy Returns</h4>
                    <p className="text-xs text-steel mt-0.5">7-day return policy</p>
                  </div>
                </div>
              </div>

              {/* Details Tabs (Simplified as sections for now) */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-display font-bold text-darker mb-4">Product Overview</h3>
                  <p className="text-dark leading-relaxed">
                    {product.longDescription}
                  </p>
                </div>
                
                {product.features && product.features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-display font-bold text-darker mb-4">Key Features</h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                          <span className="text-dark">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div>
                    <h3 className="text-xl font-display font-bold text-darker mb-4">Specifications</h3>
                    <div className="bg-light rounded-xl overflow-hidden border border-steel/10">
                      {Object.entries(product.specifications).map(([key, value], idx) => (
                        <div key={key} className={`flex flex-col sm:flex-row sm:items-center p-4 ${idx !== 0 ? 'border-t border-steel/10' : ''}`}>
                          <span className="sm:w-1/3 font-medium text-darker mb-1 sm:mb-0">{key}</span>
                          <span className="sm:w-2/3 text-dark">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
