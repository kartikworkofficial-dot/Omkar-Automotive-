import { useEffect, useState } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs, deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Button } from '@/src/components/ui/button';
import { Plus, Edit, Trash2, LogOut, Package, FileText, Tags } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  published: boolean;
  createdAt: any;
}

interface Product {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

export function AdminDashboard() {
  const { user, isAdmin, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'blogs' | 'products' | 'categories'>('blogs');
  
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fetching, setFetching] = useState(true);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setFetching(true);
    try {
      if (activeTab === 'blogs') {
        const q = query(collection(db, 'blogs'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setBlogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BlogPost[]);
      } else if (activeTab === 'products') {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      } else if (activeTab === 'categories') {
        const q = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[]);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await deleteDoc(doc(db, 'blogs', id));
        setBlogs(blogs.filter(b => b.id !== id));
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Failed to delete blog.");
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product.");
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category? Products in this category will need to be updated.")) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        setCategories(categories.filter(c => c.id !== id));
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category.");
      }
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      if (editingCategory) {
        await setDoc(doc(db, 'categories', editingCategory.id), { name: categoryName }, { merge: true });
      } else {
        const newDocRef = doc(collection(db, 'categories'));
        await setDoc(newDocRef, { name: categoryName, createdAt: serverTimestamp() });
      }
      setIsCategoryModalOpen(false);
      setCategoryName('');
      setEditingCategory(null);
      fetchData();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category.");
    }
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryName(category.name);
    } else {
      setEditingCategory(null);
      setCategoryName('');
    }
    setIsCategoryModalOpen(true);
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="pt-32 pb-24 min-h-screen bg-light">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-darker mb-2">Admin Dashboard</h1>
            <p className="text-dark">Manage your website's content and products.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={logout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setActiveTab('blogs')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'blogs' ? 'bg-primary text-white shadow-md' : 'bg-white text-darker border border-steel/20 hover:bg-steel/5'
            }`}
          >
            <FileText className="w-5 h-5" /> Blogs
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'products' ? 'bg-primary text-white shadow-md' : 'bg-white text-darker border border-steel/20 hover:bg-steel/5'
            }`}
          >
            <Package className="w-5 h-5" /> Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'categories' ? 'bg-primary text-white shadow-md' : 'bg-white text-darker border border-steel/20 hover:bg-steel/5'
            }`}
          >
            <Tags className="w-5 h-5" /> Categories
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-steel/20 overflow-hidden">
          
          {/* Header Action */}
          <div className="p-4 border-b border-steel/10 flex justify-between items-center bg-steel/5">
            <h2 className="font-bold text-lg text-darker capitalize">{activeTab} Management</h2>
            {activeTab === 'blogs' && (
              <Link to="/admin/blog/new">
                <Button size="sm" className="flex items-center gap-2"><Plus className="w-4 h-4" /> New Post</Button>
              </Link>
            )}
            {activeTab === 'products' && (
              <Link to="/admin/product/new">
                <Button size="sm" className="flex items-center gap-2"><Plus className="w-4 h-4" /> New Product</Button>
              </Link>
            )}
            {activeTab === 'categories' && (
              <Button size="sm" onClick={() => openCategoryModal()} className="flex items-center gap-2"><Plus className="w-4 h-4" /> New Category</Button>
            )}
          </div>

          {fetching ? (
            <div className="p-8 text-center text-steel">Loading {activeTab}...</div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'blogs' && (
                blogs.length === 0 ? (
                  <div className="p-12 text-center text-dark">No blog posts found.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-steel/20">
                        <th className="p-4 font-bold text-darker">Title</th>
                        <th className="p-4 font-bold text-darker">Status</th>
                        <th className="p-4 font-bold text-darker">Date</th>
                        <th className="p-4 font-bold text-darker text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {blogs.map(blog => (
                        <tr key={blog.id} className="border-b border-steel/10 hover:bg-steel/5 transition-colors">
                          <td className="p-4 font-medium text-darker">{blog.title}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${blog.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {blog.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-4 text-dark text-sm">
                            {blog.createdAt?.toDate ? blog.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link to={`/admin/blog/edit/${blog.id}`}>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0"><Edit className="w-4 h-4" /></Button>
                              </Link>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleDeleteBlog(blog.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {activeTab === 'products' && (
                products.length === 0 ? (
                  <div className="p-12 text-center text-dark">No products found.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-steel/20">
                        <th className="p-4 font-bold text-darker">Name</th>
                        <th className="p-4 font-bold text-darker">Price</th>
                        <th className="p-4 font-bold text-darker">Stock</th>
                        <th className="p-4 font-bold text-darker text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id} className="border-b border-steel/10 hover:bg-steel/5 transition-colors">
                          <td className="p-4 font-medium text-darker">{product.name}</td>
                          <td className="p-4 text-dark">₹{product.price.toLocaleString('en-IN')}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link to={`/admin/product/edit/${product.id}`}>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0"><Edit className="w-4 h-4" /></Button>
                              </Link>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleDeleteProduct(product.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}

              {activeTab === 'categories' && (
                categories.length === 0 ? (
                  <div className="p-12 text-center text-dark">No categories found.</div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-steel/20">
                        <th className="p-4 font-bold text-darker">Category Name</th>
                        <th className="p-4 font-bold text-darker text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(category => (
                        <tr key={category.id} className="border-b border-steel/10 hover:bg-steel/5 transition-colors">
                          <td className="p-4 font-medium text-darker">{category.name}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => openCategoryModal(category)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleDeleteCategory(category.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-darker/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-darker mb-4">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
            <form onSubmit={handleSaveCategory}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-darker mb-2">Category Name</label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancel</Button>
                <Button type="submit">Save Category</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
