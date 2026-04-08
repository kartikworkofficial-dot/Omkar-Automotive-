import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/firebase';
import { Calendar, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BlogPostData {
  title: string;
  content: string;
  imageUrl: string;
  createdAt: any;
  published: boolean;
}

export function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'blogs', id!);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as BlogPostData;
          if (data.published) {
            setPost(data);
          }
        }
      } catch (error) {
        console.error("Error fetching blog post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen pt-32 pb-24 flex items-center justify-center text-steel">Loading article...</div>;
  }

  if (!post) {
    return (
      <main className="pt-32 pb-24 min-h-screen bg-light flex flex-col items-center justify-center">
        <h1 className="text-3xl font-display font-bold text-darker mb-4">Article Not Found</h1>
        <p className="text-dark mb-8">The blog post you are looking for does not exist or has been removed.</p>
        <Link to="/blog" className="text-primary hover:text-secondary font-bold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-32 pb-24 min-h-screen bg-light">
      <article className="container mx-auto px-4 md:px-6 max-w-4xl">
        <Link to="/blog" className="text-steel hover:text-primary flex items-center gap-2 transition-colors w-fit mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to all articles
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-steel/20 overflow-hidden">
          {post.imageUrl && (
            <div className="w-full aspect-[21/9] md:aspect-[21/9] relative bg-steel/10">
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          
          <div className="p-6 md:p-12">
            <div className="flex items-center gap-4 text-steel text-sm mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date'}
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold text-darker mb-8 leading-tight">
              {post.title}
            </h1>

            <div className="prose prose-lg prose-slate max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-primary hover:prose-a:text-secondary prose-img:rounded-xl">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
