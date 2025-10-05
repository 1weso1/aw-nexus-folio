import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, ArrowLeft, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  published_at: string;
  read_time: number;
  author_name: string;
  author_image?: string;
  author_bio?: string;
  category: string;
  tags: string[];
  view_count: number;
}

interface SEOMetadata {
  seo_title: string;
  meta_description: string;
  keywords: string[];
  faq_schema?: any;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [seoMetadata, setSeoMetadata] = useState<SEOMetadata | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return;

      setLoading(true);

      // Fetch blog post
      const { data: postData, error: postError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();

      if (postError || !postData) {
        console.error("Error fetching blog post:", postError);
        setLoading(false);
        return;
      }

      setPost(postData);

      // Fetch SEO metadata
      const { data: seoData } = await supabase
        .from("blog_seo_metadata")
        .select("*")
        .eq("blog_post_id", postData.id)
        .single();

      if (seoData) {
        setSeoMetadata(seoData);
      }

      // Fetch related posts (same category or overlapping tags)
      const { data: related } = await supabase
        .from("blog_posts")
        .select("*")
        .neq("id", postData.id)
        .or(`category.eq.${postData.category},tags.cs.{${postData.tags.join(",")}}`)
        .limit(3);

      if (related) {
        setRelatedPosts(related);
      }

      // Increment view count
      await supabase
        .from("blog_posts")
        .update({ view_count: (postData.view_count || 0) + 1 })
        .eq("id", postData.id);

      setLoading(false);
    };

    fetchBlogPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-hero to-bg-card">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-6 w-3/4 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-hero to-bg-card flex items-center justify-center">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-text-mid mb-6">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog" className="text-brand-primary hover:underline">
            ← Back to Blog
          </Link>
        </Card>
      </div>
    );
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: seoMetadata?.seo_title || post.title,
    description: seoMetadata?.meta_description || post.excerpt,
    image: post.featured_image,
    datePublished: post.published_at,
    dateModified: post.published_at,
    author: {
      "@type": "Person",
      name: post.author_name,
      description: post.author_bio,
    },
    publisher: {
      "@type": "Person",
      name: "Ahmed Wesam",
      url: "https://ahmedwesam.com",
    },
    keywords: seoMetadata?.keywords?.join(", "),
    articleSection: post.category,
  };

  return (
    <>
      <SEO
        title={seoMetadata?.seo_title || post.title}
        description={seoMetadata?.meta_description || post.excerpt}
        image={post.featured_image}
        article={{
          publishedTime: post.published_at,
          section: post.category,
          tags: post.tags,
        }}
        author={{
          name: post.author_name,
          bio: post.author_bio,
          image: post.author_image,
        }}
        breadcrumbs={breadcrumbs}
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-b from-bg-hero to-bg-card">
        <article className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/blog">Blog</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{post.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Back Button */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-accent transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{post.category}</Badge>
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-text-high mb-4">
              {post.title}
            </h1>

            <p className="text-xl text-text-mid mb-6">{post.excerpt}</p>

            <div className="flex flex-wrap items-center gap-4 text-text-mid text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author_name}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.published_at}>
                  {new Date(post.published_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.read_time} min read</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Author Bio */}
          {post.author_bio && (
            <Card className="p-6 mb-12 bg-bg-card/50 border-border">
              <div className="flex items-start gap-4">
                {post.author_image && (
                  <img
                    src={post.author_image}
                    alt={post.author_name}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-text-high mb-2">
                    About {post.author_name}
                  </h3>
                  <p className="text-text-mid">{post.author_bio}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-text-high mb-6">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.id}
                    to={`/blog/${related.slug}`}
                    className="group"
                  >
                    <Card className="h-full p-4 hover:border-brand-primary transition-colors">
                      <Badge variant="secondary" className="mb-3">
                        {related.category}
                      </Badge>
                      <h3 className="text-lg font-semibold text-text-high mb-2 group-hover:text-brand-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-text-mid text-sm line-clamp-2 mb-3">
                        {related.excerpt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-mid">
                        <Clock className="w-3 h-3" />
                        <span>{related.read_time} min read</span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </>
  );
};

export default BlogPost;
