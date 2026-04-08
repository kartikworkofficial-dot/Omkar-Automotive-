import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/src/firebase";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  createdAt: any;
}

export function Blog() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const q = query(
          collection(db, "blogs"),
          where("published", "==", true),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        const fetchedBlogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as BlogPost[];
        setBlogs(fetchedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <main className="pt-32 pb-24 min-h-screen bg-light">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-darker mb-6">Automotive Insights</h1>
          <p className="text-xl text-dark">Expert tips, maintenance guides, and news from the Omkar Automotive team.</p>
        </div>

        {loading ? (
          <div className="text-center text-steel py-12">Loading articles...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-steel py-12">No articles published yet. Check back soon!</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-steel/20 rounded-2xl overflow-hidden group hover:border-secondary/30 transition-colors flex flex-col shadow-sm"
              >
                <div className="aspect-video overflow-hidden relative bg-steel/10">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-steel/50">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-steel text-xs mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date'}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-display font-bold text-darker mb-3 group-hover:text-secondary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-dark text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <Link to={`/blog/${post.id}`} className="text-secondary text-sm font-medium flex items-center gap-2 group-hover:gap-3 transition-all mt-auto w-fit">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
