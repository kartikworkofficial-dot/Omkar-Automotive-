import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Button } from '@/src/components/ui/button';
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';

export function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{key: string, value: string}[]>([]);
  const [inStock, setInStock] = useState(true);

  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [fetching, setFetching] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, 'categories'));
      setCategories(snapshot.docs.map(d => ({ id: d.id, name: d.data().name })));
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditing) {
      const fetchProduct = async () => {
        try {
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || '');
            setDescription(data.description || '');
            setLongDescription(data.longDescription || '');
            setPrice(data.price || 0);
            setCategoryId(data.categoryId || '');
            setImage(data.image || '');
            setImages(data.images || []);
            setFeatures(data.features || []);
            
            const specs = data.specifications || {};
            setSpecifications(Object.entries(specs).map(([key, value]) => ({ key, value: String(value) })));
            
            setInStock(data.inStock ?? true);
          } else {
            alert("Product not found");
            navigate('/admin');
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setFetching(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !categoryId || !image) {
      alert("Please fill in all required fields.");
      return;
    }

    setSaving(true);
    try {
      const specsObj: Record<string, string> = {};
      specifications.forEach(s => {
        if (s.key && s.value) specsObj[s.key] = s.value;
      });

      const productData = {
        name,
        description,
        longDescription,
        price: Number(price),
        categoryId,
        image,
        images: images.filter(i => i.trim() !== ''),
        features: features.filter(f => f.trim() !== ''),
        specifications: specsObj,
        inStock,
        updatedAt: serverTimestamp(),
      };

      if (isEditing) {
        await updateDoc(doc(db, 'products', id), productData);
      } else {
        const newDocRef = doc(collection(db, 'products'));
        await setDoc(newDocRef, {
          ...productData,
          createdAt: serverTimestamp(),
        });
      }
      navigate('/admin');
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product.");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="pt-32 pb-24 min-h-screen bg-light">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/admin" className="inline-flex items-center text-sm font-medium text-steel hover:text-secondary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-steel/20 p-6 md:p-10">
          <h1 className="text-3xl font-display font-bold text-darker mb-8">
            {isEditing ? 'Edit Product' : 'Create New Product'}
          </h1>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-darker mb-2">Product Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-darker mb-2">Price (₹) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  required
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-darker mb-2">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="w-5 h-5 rounded border-steel/20 text-secondary focus:ring-secondary/20"
                  />
                  <span className="text-sm font-medium text-darker">In Stock</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-darker mb-2">Short Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary h-24"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darker mb-2">Long Description *</label>
              <textarea
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                className="w-full p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary h-40"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darker mb-2">Main Image URL *</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-darker mb-2">Additional Image URLs</label>
              {images.map((img, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => {
                      const newImages = [...images];
                      newImages[index] = e.target.value;
                      setImages(newImages);
                    }}
                    className="flex-1 p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  />
                  <Button type="button" variant="outline" onClick={() => setImages(images.filter((_, i) => i !== index))}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setImages([...images, ''])} className="mt-2">
                <Plus className="w-4 h-4 mr-2" /> Add Image
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-darker mb-2">Features</label>
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[index] = e.target.value;
                      setFeatures(newFeatures);
                    }}
                    className="flex-1 p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  />
                  <Button type="button" variant="outline" onClick={() => setFeatures(features.filter((_, i) => i !== index))}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setFeatures([...features, ''])} className="mt-2">
                <Plus className="w-4 h-4 mr-2" /> Add Feature
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-darker mb-2">Specifications</label>
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Key (e.g. Weight)"
                    value={spec.key}
                    onChange={(e) => {
                      const newSpecs = [...specifications];
                      newSpecs[index].key = e.target.value;
                      setSpecifications(newSpecs);
                    }}
                    className="w-1/3 p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 10kg)"
                    value={spec.value}
                    onChange={(e) => {
                      const newSpecs = [...specifications];
                      newSpecs[index].value = e.target.value;
                      setSpecifications(newSpecs);
                    }}
                    className="flex-1 p-3 border border-steel/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                  />
                  <Button type="button" variant="outline" onClick={() => setSpecifications(specifications.filter((_, i) => i !== index))}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setSpecifications([...specifications, {key: '', value: ''}])} className="mt-2">
                <Plus className="w-4 h-4 mr-2" /> Add Specification
              </Button>
            </div>

            <div className="pt-6 border-t border-steel/10 flex justify-end">
              <Button type="submit" disabled={saving} className="flex items-center gap-2 px-8">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Product'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
