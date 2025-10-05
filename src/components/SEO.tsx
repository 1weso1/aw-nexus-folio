import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string[];
  author?: {
    name: string;
    bio?: string;
    image?: string;
  };
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
  structuredData?: object | object[];
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function SEO({
  title = "Ahmed Wesam",
  description = "CRM & Automation specialist blending data-driven outreach with digital innovation.",
  image = "/lovable-uploads/d565c3d6-458e-41eb-8e16-a1ddcfbdc719.png",
  url = "https://ahmedwesam.com",
  type = "website",
  keywords = [],
  author,
  article,
  structuredData,
  breadcrumbs,
}: SEOProps) {
  const fullTitle = title === "Ahmed Wesam" ? title : `${title} | Ahmed Wesam`;
  const fullUrl = url.startsWith('http') ? url : `https://ahmedwesam.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://ahmedwesam.com${image}`;

  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://ahmedwesam.com/#person",
    name: "Ahmed Wesam",
    url: "https://ahmedwesam.com",
    image: "https://ahmedwesam.com/lovable-uploads/d565c3d6-458e-41eb-8e16-a1ddcfbdc719.png",
    description: "CRM & Automation specialist, Automation Architect, and community leader",
    jobTitle: "CRM & Automation Specialist",
    knowsAbout: ["CRM Automation", "HubSpot", "n8n", "Workflow Automation", "Supabase", "Student Leadership"],
    sameAs: [
      "https://www.linkedin.com/in/ahmed-wesam-3b57bb1b1",
      "https://www.instagram.com/movebue",
      "https://www.instagram.com/buerotaract"
    ],
  };

  // Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url.startsWith('http') ? crumb.url : `https://ahmedwesam.com${crumb.url}`
    }))
  } : null;

  // Combine all structured data
  const allStructuredData = [
    organizationSchema,
    breadcrumbSchema,
    ...(Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [])
  ].filter(Boolean);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Author */}
      {author && <meta name="author" content={author.name} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Ahmed Wesam" />
      
      {/* Article specific OG tags */}
      {article?.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
      {article?.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
      {article?.section && <meta property="article:section" content={article.section} />}
      {article?.tags?.map(tag => <meta key={tag} property="article:tag" content={tag} />)}
      {author && <meta property="article:author" content={author.name} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      {author && <meta name="twitter:creator" content={author.name} />}
      
      {/* Additional meta tags */}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data */}
      {allStructuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}