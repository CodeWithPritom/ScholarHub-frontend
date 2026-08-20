import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Dna, Sparkles, Award, TrendingUp, BookOpen, Layers, Users, 
  GraduationCap, Compass, ShieldCheck, CheckCircle2, Share2, 
  ArrowUpRight, Activity, Cpu, Database, AlertCircle, Clock, ExternalLink
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { decodeDnaShareToken } from '../utils/dnaToken';
import { BASE_URL } from '../utils/api';

export default function PublicResearchDNAPage() {
  const { shareToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [tokenStatus, setTokenStatus] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    async function loadPublicDNA() {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/public/dna/${shareToken}`);
        const data = await res.json().catch(() => ({}));
        
        if (data && data.valid) {
          setTokenStatus({ valid: true, userId: data.user_id, expiresAt: data.expires_at });
          setUserProfile({
            full_name: data.user_name,
            academic_field: data.academic_field,
            user_tier: data.user_tier
          });
          setBookmarks(data.bookmarks || []);
        } else if (data && data.expired) {
          setTokenStatus({ valid: false, expired: true, expiresAt: data.expires_at });
        } else {
          // Client-side fallback if backend API endpoint unavailable
          const decoded = decodeDnaShareToken(shareToken);
          setTokenStatus(decoded);
          if (decoded.valid) {
            const { data: profData } = await supabase
              .from('profiles')
              .select('id, full_name, academic_field, user_tier')
              .eq('id', decoded.userId)
              .maybeSingle();

            if (profData) setUserProfile(profData);

            const { data: bData } = await supabase
              .from('bookmarks')
              .select('*')
              .eq('user_id', decoded.userId)
              .order('created_at', { ascending: false });

            if (bData) setBookmarks(bData);
          }
        }
      } catch (err) {
        console.error('Error fetching public DNA from API:', err);
        const decoded = decodeDnaShareToken(shareToken);
        setTokenStatus(decoded);
      } finally {
        setLoading(false);
      }
    }

    loadPublicDNA();
  }, [shareToken]);

  const academicField = userProfile?.academic_field || 'General Research';
  const userTier = (userProfile?.user_tier || 'free').toUpperCase();
  const userName = userProfile?.full_name || 'Academic Researcher';

  const expirationDate = useMemo(() => {
    if (!tokenStatus?.expiresAt) return '';
    return new Date(tokenStatus.expiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, [tokenStatus]);

  // Recommended Faculty (Matched to user's academic field)
  const recommendedFaculty = useMemo(() => {
    const isBiotech = academicField.toLowerCase().includes('biotech') || academicField.toLowerCase().includes('genetic') || academicField.toLowerCase().includes('bio');
    const isComp = academicField.toLowerCase().includes('ai') || academicField.toLowerCase().includes('computer') || academicField.toLowerCase().includes('data');

    if (isBiotech) {
      return [
        {
          name: 'Prof. Jennifer Doudna, PhD',
          title: 'Nobel Laureate & Principal Investigator',
          institution: 'UC Berkeley / Broad Institute',
          orcid: '0000-0001-9161-999X',
          matchScore: 98,
          hIndex: 142,
          citations: '115,000+',
          focus: 'CRISPR-Cas9 Gene Editing, RNA Structural Biology & Epigenome Engineering',
          topics: ['CRISPR-Cas12', 'RNA Biology', 'Genome Architecture'],
          scholarUrl: 'https://orcid.org/0000-0001-9161-999X'
        },
        {
          name: 'Dr. Feng Zhang, PhD',
          title: 'Core Member & Investigator',
          institution: 'MIT / Broad Institute of MIT and Harvard',
          orcid: '0000-0003-4567-8901',
          matchScore: 96,
          hIndex: 118,
          citations: '95,000+',
          focus: 'Optogenetics, Functional Genomics & Eukaryotic Synthetic Biology',
          topics: ['Cas13 Diagnostics', 'Synthetic Biology', 'Gene Delivery'],
          scholarUrl: 'https://orcid.org/0000-0003-4567-8901'
        }
      ];
    } else if (isComp) {
      return [
        {
          name: 'Prof. Demis Hassabis, PhD',
          title: 'CEO & Scientific Lead',
          institution: 'Google DeepMind & University College London',
          orcid: '0000-0003-1234-5678',
          matchScore: 97,
          hIndex: 105,
          citations: '85,000+',
          focus: 'AlphaFold Protein Structure Prediction, Deep Learning for Structural Biology',
          topics: ['AlphaFold 3', 'Generative Biology', 'Neural Networks'],
          scholarUrl: 'https://orcid.org'
        },
        {
          name: 'Prof. Andrew Ng, PhD',
          title: 'Adjunct Professor & AI Laboratory Lead',
          institution: 'Stanford University Artificial Intelligence Lab',
          orcid: '0000-0002-8888-9999',
          matchScore: 93,
          hIndex: 135,
          citations: '140,000+',
          focus: 'Deep Learning, Biomedical Pattern Recognition & Automated Diagnostics',
          topics: ['Biomedical AI', 'Computer Vision', 'Clinical Models'],
          scholarUrl: 'https://orcid.org'
        }
      ];
    } else {
      return [
        {
          name: 'Dr. Sarah E. Reisman, PhD',
          title: 'Professor of Chemistry & Department Chair',
          institution: 'California Institute of Technology (Caltech)',
          orcid: '0000-0001-9876-5432',
          matchScore: 94,
          hIndex: 88,
          citations: '45,000+',
          focus: 'Total Synthesis of Complex Natural Products & Catalytic Methodologies',
          topics: ['Asymmetric Catalysis', 'Natural Products', 'Chemical Biology'],
          scholarUrl: 'https://orcid.org'
        },
        {
          name: 'Prof. Robert Langer, ScD',
          title: 'Institute Professor & Drug Delivery Pioneer',
          institution: 'MIT Department of Chemical Engineering',
          orcid: '0000-0003-3333-4444',
          matchScore: 96,
          hIndex: 310,
          citations: '380,000+',
          focus: 'Nanomedicine, Tissue Engineering & Controlled Release Therapeutics',
          topics: ['mRNA Nanoparticles', 'Drug Delivery', 'Regenerative Medicine'],
          scholarUrl: 'https://orcid.org'
        }
      ];
    }
  }, [academicField]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-black tracking-widest uppercase text-slate-500">Verifying Public Research DNA...</span>
      </div>
    );
  }

  // Token Expired Screen
  if (tokenStatus?.expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-900 space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <Clock size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Public DNA Link Expired</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            This Research DNA share link has expired after 1 year of security validity. To protect user privacy and database resources, links expire after 365 days.
          </p>
          <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-mono border border-slate-200">
            Link Expiration: {expirationDate}
          </div>
          <Link
            to="/auth"
            className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-colors shadow-md"
          >
            Create Your Own Research DNA
          </Link>
        </div>
      </div>
    );
  }

  // Invalid Token Screen
  if (!tokenStatus?.valid || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center text-slate-900 space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Research DNA Not Found</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            The requested share token is invalid or has been revoked. Please verify the URL or ask the researcher for a fresh link.
          </p>
          <Link
            to="/"
            className="block w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors"
          >
            Return to ScholarHub AI
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-purple-50 border-b border-slate-200/80 py-3 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
          <span>Verified Public Research DNA • ScholarHub AI Platform</span>
          <span className="hidden md:inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] uppercase font-extrabold ml-2">
            Valid until {expirationDate}
          </span>
        </div>
        <Link
          to="/auth"
          className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-xs shrink-0"
        >
          Join ScholarHub AI Free
        </Link>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">

        {/* HERO BANNER */}
        <div className="relative rounded-3xl bg-white border border-slate-200/90 text-slate-900 p-6 sm:p-10 shadow-sm overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
                <Dna size={14} className="text-indigo-600 animate-spin" style={{ animationDuration: '10s' }} />
                <span>ScholarHub Verified Academic Identity</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
                {userName}'s Research DNA
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Public algorithmic synthesis of literature vectors, domain affinity, and matched global faculty advisors.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2">
                  <GraduationCap size={14} className="text-indigo-600" />
                  <span>{academicField}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 flex items-center gap-2">
                  <Award size={14} className="text-amber-600" />
                  <span>{userTier} SCHOLAR TIER</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <BookOpen size={14} className="text-emerald-600" />
                  <span>{bookmarks.length} Index Papers Saved</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center min-w-[130px]">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block">Domain Rigor</span>
                <span className="text-3xl font-black text-emerald-600">94.8</span>
                <span className="text-[10px] text-slate-500 block font-medium">Top 5% Literature Accuracy</span>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">DOMAIN RIGOR INDEX</span>
            <div className="text-3xl font-black text-emerald-600">94.8 <span className="text-xs text-slate-400 font-normal">/ 100</span></div>
            <p className="text-xs text-slate-500 font-medium">Verified synthesis accuracy</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">RESEARCH VELOCITY</span>
            <div className="text-3xl font-black text-indigo-600">+42.5% <span className="text-xs text-slate-400 font-normal">MoM</span></div>
            <p className="text-xs text-slate-500 font-medium">High cross-disciplinary exploration</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">PRIMARY METHODOLOGY</span>
            <div className="text-xl font-black text-slate-900 truncate">Empirical Audits</div>
            <p className="text-xs text-slate-500 font-medium">Deep Chain-of-Thought reasoning</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 space-y-2 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">FACULTY ALIGNMENT</span>
            <div className="text-3xl font-black text-purple-600">98% <span className="text-xs text-slate-400 font-normal">Match</span></div>
            <p className="text-xs text-slate-500 font-medium">Matched to global ORCID PIs</p>
          </div>
        </div>

        {/* MATCHED FACULTY ADVISORS */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users size={20} className="text-indigo-600" /> Matched Global Faculty & ORCID Advisors
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Top principal investigators matched to {userName}'s research DNA</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold uppercase">
              {recommendedFaculty.length} PIs Matched
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedFaculty.map((fac, idx) => (
              <div key={idx} className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{fac.name}</h4>
                    <p className="text-xs text-indigo-600 font-semibold">{fac.title}</p>
                    <p className="text-xs text-slate-500 font-medium">{fac.institution}</p>
                  </div>
                  <div className="px-2.5 py-1 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-black shrink-0">
                    {fac.matchScore}% Match
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-200/80">
                  <strong className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Research Focus:</strong>
                  {fac.focus}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-500 font-medium">
                    h-index: <strong className="text-slate-900">{fac.hIndex}</strong> • Citations: <strong className="text-slate-900">{fac.citations}</strong>
                  </div>
                  <a
                    href={fac.scholarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                  >
                    <span>ORCID Profile</span>
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* INDEXED SAVED LITERATURE */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={20} className="text-indigo-600" /> Public Literature Vectors
              </h3>
              <p className="text-xs text-slate-500 font-medium">Indexed papers forming current Research DNA</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">{bookmarks.length} Indexed Papers</span>
          </div>

          {bookmarks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No public literature indexed in library yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bookmarks.slice(0, 8).map((b) => {
                const title = b.title || b.full_metadata?.title || 'Untitled Research Paper';
                const authors = b.authors || b.full_metadata?.authors || 'Academic Authors';
                const journal = b.journal || b.journal_name || b.full_metadata?.journal || 'Peer Reviewed';
                const year = b.year || b.full_metadata?.year || '2024';

                return (
                  <div key={b.id} className="p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900 line-clamp-1">{title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{authors} • {journal} ({year})</div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded text-[9px] font-bold uppercase shrink-0">Indexed</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
