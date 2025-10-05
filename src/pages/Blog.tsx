import { Calendar, Clock, Tag, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  published_at: string;
  read_time: number;
  tags: string[];
  is_featured: boolean;
  category: string;
}

const publishedPosts: BlogPost[] = [];

export default function Blog() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .order('published_at', { ascending: false });

        if (error) throw error;
        if (data) setBlogPosts(data);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags || [])));

  const filteredPosts = blogPosts.filter(post => {
    const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    return matchesTag && matchesSearch;
  });

  const featuredPosts = filteredPosts.filter(post => post.is_featured);
  const regularPosts = filteredPosts.filter(post => !post.is_featured);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse py-20">
            <div className="h-12 bg-muted rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded w-2/3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Blog & Insights"
        description="Thoughts on leadership, CRM automation, community building, and the intersection of systems thinking with human impact."
        keywords={["blog", "CRM automation", "leadership", "community building", "HubSpot", "n8n", "workflows"]}
        url="/blog"
      />
      <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <section className="py-20 text-center">
          <h1 className="hero-text mb-6">Blog & Insights</h1>
          <p className="text-xl body-large max-w-3xl mx-auto">
            Thoughts on leadership, CRM automation, community building, and the intersection of systems thinking with human impact.
          </p>
        </section>

        {/* Search & Filters */}
        <section className="py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50"
              />
            </div>

            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === null ? "neon" : "glass"}
                size="sm"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? "neon" : "glass"}
                  size="sm"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-8">
            <h2 className="text-2xl font-sora font-bold text-text-primary mb-8">Featured Posts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.slug} className="project-card group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-text-secondary">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(post.published_at).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.read_time} min read
                        </div>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold font-sora text-text-primary group-hover:text-neon-primary transition-colors">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>

                    <p className="body-large line-clamp-3">{post.excerpt}</p>

                    <div className="flex flex-wrap gap-2">
                      {post.tags && post.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSelectedTag(tag)}
                          className="px-2 py-1 bg-neon-primary/10 text-neon-primary text-xs rounded-md border border-neon-primary/20 hover:bg-neon-primary/20 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="pt-2">
                      <Button asChild variant="ghost" className="text-neon-primary hover:text-neon-primary">
                        <Link to={`/blog/${post.slug}`}>
                          Read More →
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Regular Posts */}
        {regularPosts.length > 0 && (
          <section className="py-8">
            <h2 className="text-2xl font-sora font-bold text-text-primary mb-8">All Posts</h2>
            <div className="space-y-6">
              {regularPosts.map((post) => (
                <article key={post.slug} className="glass rounded-xl p-6 hover-lift group">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-4 text-sm text-text-secondary">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(post.published_at).toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.read_time} min read
                        </div>
                      </div>

                      <h3 className="text-lg font-bold font-sora text-text-primary group-hover:text-neon-primary transition-colors">
                        <Link to={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h3>

                      <p className="body-large text-sm">{post.excerpt}</p>

                      <div className="flex flex-wrap gap-2">
                        {post.tags && post.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className="px-2 py-1 bg-neon-primary/10 text-neon-primary text-xs rounded-md border border-neon-primary/20 hover:bg-neon-primary/20 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="lg:ml-6">
                      <Button asChild variant="ghost" className="text-neon-primary hover:text-neon-primary">
                        <Link to={`/blog/${post.slug}`}>
                          Read More →
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* No Posts / Coming Soon */}
        {blogPosts.length === 0 ? (
          <section className="py-16 text-center">
            <div className="glass rounded-2xl p-12">
              <h3 className="text-2xl font-sora font-semibold text-text-primary mb-4">Posts coming soon—subscribe for updates</h3>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50"
                />
                <Button variant="hero">Subscribe</Button>
              </div>
            </div>
          </section>
        ) : (
          <>
            {filteredPosts.length === 0 && (
              <section className="py-16 text-center">
                <div className="glass rounded-2xl p-12">
                  <h3 className="text-xl font-sora font-semibold text-text-primary mb-2">No posts found</h3>
                  <Button variant="neon" onClick={() => { setSearchQuery(""); setSelectedTag(null); }}>Clear Filters</Button>
                </div>
              </section>
            )}
          </>
        )}

        {/* Newsletter Signup */}
        <section className="py-16">
          <div className="glass rounded-3xl p-8 md:p-12 text-center">
            <h2 className="section-heading mb-6">Stay Updated</h2>
            <p className="body-large mb-8 max-w-2xl mx-auto">
              Get notified when I publish new posts about CRM automation, leadership, and community building.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 glass rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-neon-primary/50"
              />
              <Button variant="hero">
                Subscribe
              </Button>
            </div>
            
            <p className="text-text-secondary text-sm mt-4">
              No spam, unsubscribe anytime. Usually 1-2 posts per month.
            </p>
          </div>
        </section>
      </div>
    </div>
    </>
  );
}