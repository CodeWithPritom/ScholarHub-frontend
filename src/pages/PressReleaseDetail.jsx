import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, Share2, Copy, Check, 
  Printer, Download, Newspaper, ExternalLink, Mail, 
  MapPin, Phone, Building, User, Bookmark
} from 'lucide-react';
import { FaFacebook, FaLinkedin, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'sonner';
import SEOHead from '../components/SEOHead';
import Footer from '../Footer';
import Navbar from '../components/Navbar';
import { PRESS_RELEASES, MEDIA_CONTACTS } from '../data/pressData';

const PressReleaseDetail = ({ user, profile, onLogout, liveUsersCount }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);

  const release = PRESS_RELEASES.find(pr => pr.slug === slug);

  if (!release) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
        <Navbar user={user} profile={profile} onLogout={onLogout} liveUsersCount={liveUsersCount} />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <Newspaper size={48} className="text-slate-400" />
          <h1 className="text-2xl font-black text-slate-900">Press Release Not Found</h1>
          <p className="text-sm text-slate-500 max-w-sm">
            The requested press release could not be located or may have been archived.
          </p>
          <Link
            to="/press"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md"
          >
            Return to Press Room
          </Link>
        </div>
        <Footer user={user} />
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Press release URL copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(release.title);

  const articleSchemaJson = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": release.title,
    "description": release.subtitle || release.summary,
    "image": [
      "https://scholarhub-ai.com/logo.png"
    ],
    "datePublished": release.isoDate,
    "dateModified": release.isoDate,
    "author": [{
      "@type": "Organization",
      "name": "ScholarHub AI Communications",
      "url": "https://scholarhub-ai.com"
    }],
    "publisher": {
      "@type": "Organization",
      "name": "ScholarHub AI",
      "logo": {
        "@type": "ImageObject",
        "url": "https://scholarhub-ai.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://scholarhub-ai.com/press/${release.slug}`
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500/20 flex flex-col">
      <SEOHead
        title={`${release.title} | ScholarHub AI Press Release`}
        description={release.subtitle || release.summary}
        canonicalPath={`/press/${release.slug}`}
        schemaJson={articleSchemaJson}
      />

      {/* Top Navbar */}
      <Navbar user={user} profile={profile} onLogout={onLogout} liveUsersCount={liveUsersCount} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Navigation Breadcrumb & Back Action */}
        <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-500 print:hidden">
          <Link 
            to="/press" 
            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft size={14} />
            <span>Back to Press Room</span>
          </Link>

          <span className="hidden sm:inline-block text-slate-400">
            For Immediate Release • Official Announcement
          </span>
        </div>

        {/* Press Release Header Article Card */}
        <header className="space-y-4 border-b border-slate-200 pb-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full uppercase tracking-wider">
              {release.category}
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <Calendar size={13} className="text-slate-400" />
              {release.date}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 flex items-center gap-1">
              <Clock size={13} className="text-slate-400" />
              {release.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {release.title}
          </h1>

          {release.subtitle && (
            <p className="text-sm sm:text-base font-semibold text-slate-600 leading-relaxed">
              {release.subtitle}
            </p>
          )}

          {/* Social Share & Action Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Twitter / X"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
              >
                <FaTwitter size={14} />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-600 flex items-center justify-center transition-colors"
              >
                <FaLinkedin size={14} />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-blue-600 flex items-center justify-center transition-colors"
              >
                <FaFacebook size={14} />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${shareTitle}%20${currentUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-emerald-600 flex items-center justify-center transition-colors"
              >
                <FaWhatsapp size={14} />
              </a>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Copy press release link"
              >
                {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Print press release"
              >
                <Printer size={13} />
                <span>Print</span>
              </button>
            </div>
          </div>
        </header>

        {/* Press Release Content Body */}
        <article className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs prose prose-slate max-w-none">
          <div className="space-y-6 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            
            {/* Dateline Callout */}
            <div className="p-4 bg-slate-50 border-l-4 border-indigo-600 rounded-r-xl font-bold text-xs uppercase tracking-wider text-slate-600">
              DHAKA, BANGLADESH — {release.date} — FOR IMMEDIATE RELEASE
            </div>

            <p className="font-semibold text-slate-800 text-base leading-relaxed">
              Independent software engineer and system architect <strong>Arup Bhowmik Pritom</strong> has announced the public release of <a href="https://scholarhub-ai.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">ScholarHub AI</a>, an integrated academic research and literature synthesis platform designed to modernize how university students, researchers, and faculty members discover, analyze, and synthesize scientific literature.
            </p>

            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-1 mt-6">
              The Critical Gap in Academic Research
            </h3>
            <p>
              University scholars and graduate researchers worldwide face severe structural inefficiencies when reviewing scientific literature:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600 font-medium">
              <li><strong>Repository Fragmentation:</strong> Critical scientific discoveries are scattered across isolated databases—including NCBI PubMed for medical sciences, arXiv for physics and computer science, and OpenAlex for global citation graphs.</li>
              <li><strong>AI Citation Hallucination:</strong> Mainstream generic AI chat models frequently invent fake paper titles, non-existent author names, and broken DOIs, making ungrounded AI outputs unsuitable for peer-reviewed academic citations.</li>
              <li><strong>Manual Synthesis Bottleneck:</strong> Manually reading, cross-comparing methodologies, and extracting sample metrics across 40+ papers routinely requires weeks of manual effort.</li>
            </ul>

            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-1 mt-6">
              The Grounded ScholarHub AI Solution
            </h3>
            <p>
              ScholarHub AI eliminates these bottlenecks by coupling federated literature aggregation with a deterministic <strong>Grounded Retrieval-Augmented Generation (RAG)</strong> pipeline.
            </p>
            <p>
              Instead of querying single databases in isolation, ScholarHub AI initiates concurrent asynchronous search queries across PubMed, arXiv, and OpenAlex. The retrieved records are automatically deduplicated by title Levenshtein distance and DOI matching, enriched with citation statistics, and classified with <strong>SCImago Journal Rank (SJR) quartile ratings (Q1–Q4)</strong> directly from a pre-indexed dataset.
            </p>

            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-1 mt-6">
              Key Capabilities & Architectural Highlights
            </h3>
            <div className="grid sm:grid-cols-2 gap-3 my-4 not-prose">
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                <span className="text-xs font-black text-slate-900 block">⚡ Parallel Search Engine</span>
                <span className="text-xs text-slate-500">Queries PubMed, arXiv, and OpenAlex concurrently with sub-second cache lookups via Upstash Redis.</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                <span className="text-xs font-black text-slate-900 block">🛡️ Anti-Hallucination Auditor</span>
                <span className="text-xs text-slate-500">AI models operate strictly on retrieved peer-reviewed abstract payloads, guaranteeing verified citation grounding.</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                <span className="text-xs font-black text-slate-900 block">🌐 Interactive Visual Topologies</span>
                <span className="text-xs text-slate-500">Renders topological concept maps and citation trees in real time using Cytoscape.js and Apache ECharts.</span>
              </div>
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
                <span className="text-xs font-black text-slate-900 block">📑 Universal Citation Export</span>
                <span className="text-xs text-slate-500">Exports formatted references into APA 7th, IEEE, Harvard, MLA, BibTeX, PDF, and XLSX reports.</span>
              </div>
            </div>

            {/* Founder Quote Callout Box */}
            <div className="my-8 p-6 bg-gradient-to-r from-indigo-50/80 to-blue-50/50 border border-indigo-100 rounded-2xl space-y-3 not-prose">
              <div className="text-xs font-black uppercase tracking-wider text-indigo-600">Founder Perspective</div>
              <blockquote className="text-sm sm:text-base font-semibold text-slate-800 italic leading-relaxed">
                "When conducting scientific research, the core challenge is not a lack of information, but the inability to rapidly synthesize verified findings without falling victim to AI hallucinations. We built ScholarHub AI from Bangladesh to provide students and researchers worldwide with a transparent, verifiable tool where every summary is backed by real peer-reviewed papers, verified DOIs, and transparent journal impact rankings."
              </blockquote>
              <div className="text-xs font-bold text-slate-700">
                — Arup Bhowmik Pritom, Founder & Lead System Architect
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-1 mt-6">
              Availability & Platform Access
            </h3>
            <p>
              ScholarHub AI is publicly accessible worldwide at <a href="https://scholarhub-ai.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">https://scholarhub-ai.com</a>. Users can begin searching literature immediately, create personal research workspaces, and access compute quotas tailored for individual and institutional research needs.
            </p>

          </div>
        </article>

        {/* Company Boilerplate & Media Contact Section */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-indigo-400">Official Boilerplate</span>
            <h3 className="text-xl font-black text-white mt-1">About ScholarHub AI</h3>
            <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed mt-2">
              ScholarHub AI (<a href="https://scholarhub-ai.com" target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:underline">https://scholarhub-ai.com</a>) is an academic research and literature synthesis platform engineered to make scientific discovery faster and more dependable. By unifying peer-reviewed repositories—including NCBI PubMed, arXiv, OpenAlex, Semantic Scholar, and SCImago Journal Rank—with a grounded, hallucination-resistant AI architecture, the platform enables students and faculty to perform rapid literature reviews and export verified citations in seconds. Headquartered in Dhaka, Bangladesh, ScholarHub AI serves researchers, scholars, and academic institutions worldwide.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800 grid sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-indigo-400 uppercase tracking-wider block mb-1">Media Contact</span>
              <span className="font-bold text-white block">Arup Bhowmik Pritom</span>
              <span className="text-slate-400 block">Founder & Lead System Architect</span>
              <a href={`mailto:${MEDIA_CONTACTS.pressEmail}`} className="text-indigo-300 hover:underline block mt-1">
                {MEDIA_CONTACTS.pressEmail}
              </a>
            </div>

            <div className="space-y-1 text-slate-400">
              <span className="font-bold text-indigo-400 uppercase tracking-wider block mb-1">Headquarters</span>
              <div className="flex items-center gap-1.5 text-slate-300">
                <MapPin size={12} className="text-indigo-400" />
                <span>{MEDIA_CONTACTS.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Phone size={12} className="text-emerald-400" />
                <span>{MEDIA_CONTACTS.phone}</span>
              </div>
              <span className="text-[11px] text-slate-500 italic block pt-1">
                {MEDIA_CONTACTS.responseWindow}
              </span>
            </div>
          </div>
        </section>

      </main>

      <Footer user={user} />
    </div>
  );
};

export default PressReleaseDetail;
