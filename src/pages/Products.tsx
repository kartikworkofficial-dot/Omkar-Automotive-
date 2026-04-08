import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Filter, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { useCart } from "@/src/contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
}

export function Products() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnapshot = await getDocs(query(collection(db, 'categories'), orderBy('createdAt', 'desc')));
        const fetchedCategories = catSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
        setCategories(fetchedCategories);

        const prodSnapshot = await getDocs(query(collection(db, 'products'), orderBy('createdAt', 'desc')));
        const fetchedProducts = prodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : 'Uncategorized';
  };

  const filteredProducts = products.filter((product) => {
    const categoryName = getCategoryName(product.categoryId);
    const matchesCategory = activeCategory === "All" || categoryName === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    addToCart(product);
  };

  return (
    <main className="pt-32 pb-24 min-h-screen bg-light">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-display font-bold text-darker mb-6"
          >
            Premium Automotive <span className="text-secondary">Products</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-dark"
          >
            Explore our curated selection of high-quality automotive parts, accessories, and care products.
          </motion.p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          {/* Categories */}
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveCategory("All")}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeCategory === "All"
                    ? "bg-secondary text-white shadow-md"
                    : "bg-white text-darker border border-steel/20 hover:border-secondary/50 hover:text-secondary"
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.name)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category.name
                      ? "bg-secondary text-white shadow-md"
                      : "bg-white text-darker border border-steel/20 hover:border-secondary/50 hover:text-secondary"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:w-72 relative shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-steel" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-steel/20 rounded-full leading-5 bg-white placeholder-steel focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary sm:text-sm transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="text-center py-24">
            <p className="text-dark">Loading products...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-2xl border border-steel/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
              >
                {/* Image Container */}
                <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-light block">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-darker/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Button variant="secondary" size="icon" className="rounded-full w-12 h-12 bg-white text-darker hover:bg-secondary hover:text-white" onClick={(e) => handleAddToCart(e, product)}>
                      <ShoppingCart className="w-5 h-5" />
                    </Button>
                  </div>
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-darker shadow-sm">
                    {getCategoryName(product.categoryId)}
                  </div>
                </Link>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  <Link to={`/products/${product.id}`} className="block mb-2 group-hover:text-secondary transition-colors">
                    <h3 className="text-lg font-display font-bold text-darker line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-dark text-sm mb-4 line-clamp-2 flex-1">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-steel/10">
                    <span className="text-xl font-bold text-darker">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <Link to={`/products/${product.id}`}>
                      <Button variant="ghost" size="sm" className="text-secondary hover:text-secondary hover:bg-secondary/10 px-3">
                        Details <ArrowRight className="ml-1.5 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-steel/10">
            <Filter className="w-12 h-12 text-steel/50 mx-auto mb-4" />
            <h3 className="text-xl font-display font-bold text-darker mb-2">No products found</h3>
            <p className="text-dark">Try adjusting your search or category filter.</p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => { setActiveCategory("All"); setSearchQuery(""); }}
            >
              Clear Filters
            </Button>
          </div>
        )}

      </div>
    </main>
  );
}
