import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BASE_URL = 'https://scholarhub-ai.com';

/**
 * Universal SEO & Meta-Tag Manager Component
 * Dynamically enforces canonical URLs to https://scholarhub-ai.com, updates page titles,
 * OpenGraph tags, Twitter cards, and injects Schema.org JSON-LD structured data.
 */
export default function SEOHead({
  title = 'ScholarHub AI | The Global Academic Research Hub & AI Discovery Engine',
  description = 'ScholarHub AI is the ultimate AI Research IDE for global scholars. Search 250M+ scientific papers, perform deep literature synthesis, and access AI research tools.',
  keywords = 'ScholarHub AI, AI Research, Academic Search, PubMed, arXiv, Literature Synthesis, Systematic Review, Research Grants, Academic Academy',
  canonicalPath,
  schemaJson = null
}) {
  const location = useLocation();
  const currentPath = canonicalPath || location.pathname;
  const canonicalUrl = `${BASE_URL}${currentPath.startsWith('/') ? currentPath : `/${currentPath}`}`;

  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Helper to set or create meta tag
    const setMeta = (attrName, attrVal, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content || '');
    };

    // 3. Set standard meta tags
    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMeta('name', 'googlebot', 'index, follow');

    // 4. OpenGraph Tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'ScholarHub AI');
    setMeta('property', 'og:image', `${BASE_URL}/logo.png`);

    // 5. Twitter Card Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:url', canonicalUrl);
    setMeta('name', 'twitter:image', `${BASE_URL}/logo.png`);

    // 6. Hardened Canonical Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 7. Inject Dynamic Schema.org JSON-LD if provided
    let scriptTag = document.getElementById('dynamic-page-schema-ld');
    if (schemaJson) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'dynamic-page-schema-ld';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schemaJson);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    return () => {
      // Clean up dynamic schema tag on unmount
      const existingScript = document.getElementById('dynamic-page-schema-ld');
      if (existingScript) existingScript.remove();
    };
  }, [title, description, keywords, canonicalUrl, schemaJson]);

  return null;
}
