import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Newspaper, Download, ExternalLink, Mail, Phone, MapPin, 
  Check, Copy, ArrowRight, ShieldCheck, Database, Zap, 
  Layers, User, Clock, FileText, Share2, Sparkles, Building, Globe, BookOpen
} from 'lucide-react';
import { FaFacebook, FaLinkedin, FaGithub, FaYoutube } from 'react-icons/fa';
import { toast } from 'sonner';
import SEOHead from '../components/SEOHead';
import Footer from '../Footer';
import Navbar from '../components/Navbar';
import creatorImg from '../assets/images/creator.jpg';
import { 
  PRESS_RELEASES, 
  MEDIA_COVERAGE, 
  BRAND_ASSETS, 
  COMPANY_FACTS, 
  MEDIA_CONTACTS 
} from '../data/pressData';

const Press = ({ user, profile, onLogout, liveUsersCount }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedLinkSlug, setCopiedLinkSlug] = useState(null);

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    toast.success(`Copied ${email} to clipboard!`);
    setTimeout(() => setCopiedEmail(false), 3000);
  };

  const handleCopyReleaseLink = (slug) => {
    const fullUrl = `${window.location.origin}/press/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkSlug(slug);
    toast.success('Press release URL copied to clipboard!');
    setTimeout(() => setCopiedLinkSlug(null), 3000);
  };

  const handleDownloadAsset = (asset) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.downloadFileName || 'scholarhub-asset';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading ${asset.name}...`);
  };

  const pressSchemaJson = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "ScholarHub AI Press Room",
    "description": "Official press releases, media assets, founder background, and journalist resources from ScholarHub AI.",
    "url": "https://scholarhub-ai.com/press",
    "publisher": {
      "@type": "Organization",
      "name": "ScholarHub AI",
      "url": "https://scholarhub-ai.com",
      "logo": "https://scholarhub-ai.com/logo.png"
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500/20 flex flex-col">
      <SEOHead
        title="ScholarHub AI Press Room | News, Media & Press Kit"
        description="Official media center for ScholarHub AI. Access verified press releases, brand assets, architecture documentation, founder biography, and journalist contact resources."
        canonicalPath="/press"
        schemaJson={pressSchemaJson}
      />

      {/* Top Main Navigation */}
      <Navbar user={user} profile={profile} onLogout={onLogout} liveUsersCount={liveUsersCount} />

      {/* Hero Header Section */}
      <header className="relative bg-slate-900 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Newspaper size={13} />
            <span>Official Newsroom & Media Center</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            ScholarHub AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-blue-400">Press Room</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
            Official announcements, press releases, media assets, and research intelligence for journalists, universities, and technology publications.
          </p>

          {/* Quick Anchor Navigation Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-300">
            <a href="#press-releases" className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 rounded-xl transition-all">
              Press Releases
            </a>
            <a href="#media-coverage" className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 rounded-xl transition-all">
              Media Coverage
            </a>
            <a href="#about" className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 rounded-xl transition-all">
              About Platform
            </a>
            <a href="#founder" className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 rounded-xl transition-all">
              Founder
            </a>
            <a href="#brand-assets" className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 rounded-xl transition-all">
              Brand Assets
            </a>
            <a href="#key-facts" className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 rounded-xl transition-all">
              Key Facts
            </a>
            <a href="#media-contact" className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-sm">
              Media Inquiries
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* ─── SECTION 1: LATEST PRESS RELEASES ─── */}
        <section id="press-releases" className="space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Announcements</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Official Press Releases</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">{PRESS_RELEASES.length} Available</span>
          </div>

          <div className="grid gap-6">
            {PRESS_RELEASES.map((pr) => (
              <article 
                key={pr.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full">
                      {pr.category}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {pr.date}
                    </span>
                    <span className="text-slate-400">• {pr.readTime}</span>
                  </div>

                  <Link to={`/press/${pr.slug}`}>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {pr.title}
                    </h3>
                  </Link>

                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
                    {pr.summary}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <Link
                    to={`/press/${pr.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider"
                  >
                    <span>Read Full Press Release</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <button
                    onClick={() => handleCopyReleaseLink(pr.slug)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Copy direct press release link"
                  >
                    {copiedLinkSlug === pr.slug ? (
                      <>
                        <Check size={13} className="text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} className="text-slate-500" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ─── SECTION 2: VERIFIED MEDIA COVERAGE ─── */}
        <section id="media-coverage" className="space-y-6 scroll-mt-24">
          <div className="pb-3 border-b border-slate-200">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">News & Features</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Media Coverage</h2>
          </div>

          {MEDIA_COVERAGE.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {MEDIA_COVERAGE.map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <span className="text-xs font-bold text-indigo-600">{item.publication}</span>
                  <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-500">{item.date}</p>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-indigo-600 flex items-center gap-1">
                    Read Article <ExternalLink size={12} />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-10 sm:p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Newspaper size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Media Coverage Coming Soon</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                ScholarHub AI is actively collaborating with academic correspondents, technology journalists, and educational publications. Verified third-party news coverage will be indexed here.
              </p>
              <div className="pt-2">
                <a
                  href="#media-contact"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                >
                  <span>Journalists can submit inquiries below</span>
                  <ArrowRight size={12} />
                </a>
              </div>
            </div>
          )}
        </section>

        {/* ─── SECTION 3: ABOUT SCHOLARHUB AI ─── */}
        <section id="about" className="space-y-6 scroll-mt-24">
          <div className="pb-3 border-b border-slate-200">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Company Overview</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">About ScholarHub AI</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6">
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
              <strong>ScholarHub AI</strong> (<a href="https://scholarhub-ai.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">scholarhub-ai.com</a>) is an academic research and literature synthesis platform designed to streamline how university students, researchers, and scientific laboratories discover, evaluate, and synthesize peer-reviewed literature.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                  <Database size={15} />
                  <span>Federated Academic Search</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Queries NCBI PubMed, arXiv, and OpenAlex concurrently with deduplication and verified citation indexing.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                  <ShieldCheck size={15} />
                  <span>Anti-Hallucination Grounding</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  AI synthesis is strictly bounded by retrieved paper payloads, preventing fabricated citations and fake DOIs.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                  <Layers size={15} />
                  <span>Interactive Visual Topologies</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Renders concept networks and citation trees in real time using Cytoscape.js and Apache ECharts.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs">
                  <BookOpen size={15} />
                  <span>SCImago Journal Quartiles (Q1–Q4)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pre-indexed journal impact classifications provide instant indicators of publication authority.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 4: FOUNDER PROFILE ─── */}
        <section id="founder" className="space-y-6 scroll-mt-24">
          <div className="pb-3 border-b border-slate-200">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Leadership</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Founder & Lead System Architect</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <img 
              src={COMPANY_FACTS.founder ? creatorImg : creatorImg} 
              alt="Arup Bhowmik Pritom" 
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl object-cover border border-slate-200 shadow-md shrink-0" 
            />

            <div className="space-y-4 text-center md:text-left flex-1">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Arup Bhowmik Pritom</h3>
                <p className="text-xs sm:text-sm font-bold text-indigo-600 uppercase tracking-wider mt-0.5">
                  Founder & Lead System Architect, ScholarHub AI
                </p>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Arup Bhowmik Pritom is a Bangladeshi software engineer and system architect specializing in asynchronous distributed backends, academic data federation, and grounded artificial intelligence pipelines. Operating from Dhaka, Bangladesh, he engineered ScholarHub AI to bridge the gap between vast academic databases and the modern researcher's need for deterministic, verifiable literature synthesis.
              </p>

              <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                <a href="https://github.com/CodeWithPritom" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors">
                  <FaGithub size={16} />
                </a>
                <a href="https://www.linkedin.com/in/arup-bhowmik-pritom/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 flex items-center justify-center transition-colors">
                  <FaLinkedin size={16} />
                </a>
                <a href="https://www.facebook.com/people/ScholarHub-AI-Advanced-Research-Discovery-Hub/61590477040942/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-blue-600 flex items-center justify-center transition-colors">
                  <FaFacebook size={16} />
                </a>
                <a href="https://www.youtube.com/@CodeWithPritom-360" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-red-600 flex items-center justify-center transition-colors">
                  <FaYoutube size={16} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: BRAND & MEDIA ASSETS ─── */}
        <section id="brand-assets" className="space-y-6 scroll-mt-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Downloads</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Official Brand Assets</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">Public Assets</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BRAND_ASSETS.map((asset) => (
              <div 
                key={asset.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div className="space-y-3">
                  <div className="h-44 bg-slate-100/80 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-slate-200/60">
                    <img 
                      src={asset.url} 
                      alt={asset.name} 
                      className="max-h-full max-w-full object-contain rounded-lg" 
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>{asset.type}</span>
                      <span>{asset.dimensions}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{asset.name}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                      {asset.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDownloadAsset(asset)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download Asset</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SECTION 6: KEY FACTS SHEET ─── */}
        <section id="key-facts" className="space-y-6 scroll-mt-24">
          <div className="pb-3 border-b border-slate-200">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Fact Sheet</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Key Facts</h2>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5">
                <span className="font-bold text-slate-500">Company / Product Name:</span>
                <span className="sm:col-span-2 font-bold text-slate-900">{COMPANY_FACTS.companyName}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5 bg-slate-50/50">
                <span className="font-bold text-slate-500">Founder & Role:</span>
                <span className="sm:col-span-2 font-bold text-slate-900">{COMPANY_FACTS.founder} ({COMPANY_FACTS.role})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5">
                <span className="font-bold text-slate-500">Headquarters / Origin:</span>
                <span className="sm:col-span-2 font-bold text-slate-900">{COMPANY_FACTS.headquarters}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5 bg-slate-50/50">
                <span className="font-bold text-slate-500">Official Website:</span>
                <span className="sm:col-span-2 font-bold text-indigo-600">
                  <a href={COMPANY_FACTS.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {COMPANY_FACTS.website}
                  </a>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5">
                <span className="font-bold text-slate-500">Integrated Academic Sources:</span>
                <div className="sm:col-span-2 font-medium text-slate-700 space-y-1">
                  {COMPANY_FACTS.primaryRepositories.map((repo, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span>{repo}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5 bg-slate-50/50">
                <span className="font-bold text-slate-500">Business Model:</span>
                <span className="sm:col-span-2 font-medium text-slate-700">{COMPANY_FACTS.pricingTiers}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 p-4 sm:p-5">
                <span className="font-bold text-slate-500">Current Deployment Status:</span>
                <span className="sm:col-span-2 font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {COMPANY_FACTS.deploymentStatus}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 7: MEDIA INQUIRIES & CONTACT ─── */}
        <section id="media-contact" className="space-y-6 scroll-mt-24">
          <div className="pb-3 border-b border-slate-200">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Communications</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Media & Press Inquiries</h2>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-black">Get in Touch with Our Communications Team</h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xl leading-relaxed">
                For interview requests, technical briefings, product demonstrations, or press quotes, please contact us through the channels below.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Primary Press Email</span>
                <div className="flex items-center justify-between gap-2">
                  <a href={`mailto:${MEDIA_CONTACTS.pressEmail}`} className="text-sm sm:text-base font-bold text-white hover:text-indigo-300 transition-colors">
                    {MEDIA_CONTACTS.pressEmail}
                  </a>
                  <button
                    onClick={() => handleCopyEmail(MEDIA_CONTACTS.pressEmail)}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors cursor-pointer"
                    title="Copy press email"
                  >
                    {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">Direct Inquiries</span>
                <div className="flex items-center justify-between gap-2">
                  <a href={`mailto:${MEDIA_CONTACTS.directEmail}`} className="text-sm sm:text-base font-bold text-white hover:text-indigo-300 transition-colors">
                    {MEDIA_CONTACTS.directEmail}
                  </a>
                  <button
                    onClick={() => handleCopyEmail(MEDIA_CONTACTS.directEmail)}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition-colors cursor-pointer"
                    title="Copy founder email"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 border-t border-slate-800">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-indigo-400" /> {MEDIA_CONTACTS.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={13} className="text-emerald-400" /> {MEDIA_CONTACTS.phone}
                </span>
              </div>
              <span className="text-slate-500 italic">{MEDIA_CONTACTS.responseWindow}</span>
            </div>
          </div>
        </section>

      </main>

      <Footer user={user} />
    </div>
  );
};

export default Press;
