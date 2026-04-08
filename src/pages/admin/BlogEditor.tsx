import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { Navigate, useNavigate, useParams, Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Button } from '@/src/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';

export function BlogEditor() {
  const { id } = useParams();
  const isEditing = !!id;
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const docRef = doc(db, 'blogs', id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTitle(data.title || '');
        setExcerpt(data.excerpt || '');
        setContent(data.content || '');
        setImageUrl(data.imageUrl || '');
        setPublished(data.published ?? true);
      } else {
        alert("Blog post not found.");
        navigate('/admin');
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert("Title and content are required.");
      return;
    }

    setSaving(true);
    try {
      const blogData = {
        title,
        excerpt,
        content,
        imageUrl,
        published,
        updatedAt: serverTimestamp(),
      };

      if (isEditing) {
        await updateDoc(doc(db, 'blogs', id!), blogData);
      } else {
        const newDocRef = doc(collection(db, 'blogs'));
        await setDoc(newDocRef, {
          ...blogData,
          authorId: user!.uid,
          createdAt: serverTimestamp(),
        });
      }
      navigate('/admin');
    } catch (error) {
      console.error("Error saving blog:", error);
      alert("Failed to save blog post.");
    } finally {
      setSaving(false);
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <main className="pt-32 pb-24 min-h-screen bg-light">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">
        <div className="mb-8">
          <Link to="/admin" className="text-steel hover:text-primary flex items-center gap-2 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-steel/20 p-6 md:p-10">
          <h1 className="text-3xl font-display font-bold text-darker mb-8">
            {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
          </h1>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-darker mb-2">Title *</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-steel/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Enter blog title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-darker mb-2">Featured Image URL</label>
              <input 
                type="url" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full p-3 border border-steel/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="https://example.com/image.jpg"
              />
              {imageUrl && (
                <div className="mt-4 aspect-video w-full max-w-md rounded-lg overflow-hidden border border-steel/20">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-darker mb-2">Short Excerpt</label>
              <textarea 
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full p-3 border border-steel/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-24 resize-none"
                placeholder="A brief summary of the post..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-darker mb-2">Content (Markdown Supported) *</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-steel/30 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-96 font-mono text-sm"
                placeholder="Write your blog content here..."
                required
              />
            </div>

            <div className="flex items-center gap-3 py-4 border-y border-steel/10">
              <input 
                type="checkbox" 
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-5 h-5 rounded border-steel/30 text-primary focus:ring-primary"
              />
              <label htmlFor="published" className="font-medium text-darker cursor-pointer">
                Publish immediately
              </label>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving} className="flex items-center gap-2 px-8">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Post'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
