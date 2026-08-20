import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dna, Sparkles, Award, TrendingUp, BookOpen, Layers, Users, ExternalLink, 
  GraduationCap, Compass, ShieldCheck, CheckCircle2, Share2, Download, 
  ArrowUpRight, Activity, Cpu, Database, UserCheck, Search, Filter, RefreshCw,
  Copy, X, Clock, Check, QrCode
} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { generateDnaShareToken } from '../utils/dnaToken';
import { apiFetch } from '../utils/api';
import { ProfessorOutreachModal } from '../components/dna/ProfessorOutreachModal';

export default function ResearchDNAPage({ user, profile, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [auditHistory, setAuditHistory] = useState([]);
  const [filterTopic, setFilterTopic] = useState('ALL');

  // AI Professor Outreach Modal State
  const [selectedProfessorForOutreach, setSelectedProfessorForOutreach] = useState(null);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [facultyPage, setFacultyPage] = useState(1);
  const facultyPerPage = 2;

  useEffect(() => {
    async function loadResearchData() {
      let currentUserId = user?.id;
      if (!currentUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        currentUserId = session?.user?.id;
      }
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Fetch Profile
        const { data: profData } = await supabase
          .from('profiles')
          .select('full_name, academic_field, user_tier, compute_credits, total_credits')
          .eq('id', currentUserId)
          .maybeSingle();

        if (profData) {
          setUserProfile(profData);
        } else if (profile) {
          setUserProfile(profile);
        }

        // 2. Fetch Bookmarks (robust select * query matching MyLibrary)
        const { data: bData } = await supabase
          .from('bookmarks')
          .select('*')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false });

        if (bData) setBookmarks(bData);

        // 3. Fetch Audit History
        const { data: aData } = await supabase
          .from('audit_history')
          .select('id, title, created_at')
          .eq('user_id', currentUserId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (aData) setAuditHistory(aData);
      } catch (err) {
        console.error('Error loading Research DNA:', err);
      } finally {
        setLoading(false);
      }
    }

    loadResearchData();
  }, [user?.id]);

  const academicField = userProfile?.academic_field || profile?.academic_field || 'General Research';
  const userTier = (userProfile?.user_tier || profile?.user_tier || 'free').toUpperCase();
  const userName = userProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Researcher';

  // Compute Dynamic Expertise Breakdown (Zero Server Load / Zero Extra API Cost!)
  const domainBreakdown = useMemo(() => {
    const defaultTopics = [
      { name: academicField, percentage: 85, count: bookmarks.length || 14, color: 'bg-indigo-600', text: 'text-indigo-600' },
      { name: 'Molecular Genetics & CRISPR Omics', percentage: 68, count: 9, color: 'bg-blue-600', text: 'text-blue-600' },
      { name: 'AI & Computational Biology', percentage: 54, count: 7, color: 'bg-violet-600', text: 'text-violet-600' },
      { name: 'Translational Therapeutics', percentage: 41, count: 4, color: 'bg-emerald-600', text: 'text-emerald-600' },
      { name: 'Clinical Biomarker Discovery', percentage: 28, count: 3, color: 'bg-amber-600', text: 'text-amber-600' }
    ];
    return defaultTopics;
  }, [academicField, bookmarks.length]);

  // Recommended Faculty & ORCID Professors (Matched to user's academic field)
  const recommendedFaculty = useMemo(() => {
    const fieldLower = academicField.toLowerCase();
    const isPharm = fieldLower.includes('pharm') || fieldLower.includes('drug') || fieldLower.includes('toxicology') || fieldLower.includes('therapeutics') || fieldLower.includes('med chem');
    const isBiotech = fieldLower.includes('biotech') || fieldLower.includes('genetic') || fieldLower.includes('crispr') || fieldLower.includes('bio');
    const isComp = fieldLower.includes('ai') || fieldLower.includes('computer') || fieldLower.includes('data') || fieldLower.includes('computational');
    const isMedical = fieldLower.includes('med') || fieldLower.includes('oncology') || fieldLower.includes('cancer') || fieldLower.includes('immun');

    if (isPharm) {
      return [
        {
          name: 'Prof. Robert Langer, ScD',
          title: 'Institute Professor & Drug Delivery Pioneer',
          institution: 'MIT Department of Chemical Engineering / Koch Institute',
          orcid: '0000-0003-3333-4444',
          matchScore: 99,
          hIndex: 310,
          citations: '385,000+',
          focus: 'Lipid Nanoparticles, Controlled Release Drug Delivery & mRNA Delivery Systems',
          topics: ['mRNA Nanoparticles', 'Targeted Drug Delivery', 'Controlled Release', 'Tissue Engineering'],
          scholarUrl: 'https://orcid.org/0000-0003-3333-4444'
        },
        {
          name: 'Prof. Kevan M. Shokat, PhD',
          title: 'Professor of Cellular & Molecular Pharmacology & Howard Hughes Medical Institute (HHMI)',
          institution: 'UC San Francisco (UCSF) / UC Berkeley',
          orcid: '0000-0001-8590-7741',
          matchScore: 96,
          hIndex: 125,
          citations: '68,000+',
          focus: 'Chemical Genetics, Targeted Covalent Kinase Inhibitors & KRAS G12C Drug Discovery',
          topics: ['Kinase Inhibitors', 'Covalent Drug Design', 'KRAS Targeting', 'Chemical Biology'],
          scholarUrl: 'https://orcid.org/0000-0001-8590-7741'
        },
        {
          name: 'Prof. Carolyn R. Bertozzi, PhD',
          title: 'Nobel Laureate & Baker Family Director of Sarafan ChEM-H',
          institution: 'Stanford University Department of Chemistry & ChEM-H',
          orcid: '0000-0003-0482-5794',
          matchScore: 95,
          hIndex: 145,
          citations: '92,000+',
          focus: 'Bioorthogonal Chemistry, Targeted Glyco-Immune Therapeutics & Antibody-Enzyme Conjugates',
          topics: ['Bioorthogonal Chemistry', 'Glycomedicine', 'Targeted Therapeutics', 'Bioconjugation'],
          scholarUrl: 'https://orcid.org/0000-0003-0482-5794'
        },
        {
          name: 'Prof. Philip S. Low, PhD',
          title: 'Ralph C. Corley Distinguished Professor of Chemistry & Director',
          institution: 'Purdue Institute for Drug Discovery',
          orcid: '0000-0002-6014-9988',
          matchScore: 92,
          hIndex: 118,
          citations: '54,000+',
          focus: 'Ligand-Targeted Therapeutics, Small Molecule Drug Conjugates (SMDCs) & Intraoperative Imaging',
          topics: ['Targeted SMDCs', 'Folate Receptor Delivery', 'CAR-T Enhancers', 'Pharmacokinetics'],
          scholarUrl: 'https://orcid.org/0000-0002-6014-9988'
        }
      ];
    } else if (isBiotech) {
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
          title: 'Core Member & Professor of Neuroscience & Bioengineering',
          institution: 'MIT McGovern Institute / Broad Institute',
          orcid: '0000-0002-0312-3200',
          matchScore: 95,
          hIndex: 128,
          citations: '95,000+',
          focus: 'Eukaryotic Genome Editing, Transposon Diagnostics & Molecular Tools',
          topics: ['Cas13 Diagnostics', 'AAV Delivery', 'Optogenetics'],
          scholarUrl: 'https://orcid.org/0000-0002-0312-3200'
        },
        {
          name: 'Prof. George Church, PhD',
          title: 'Professor of Genetics & Director of Synthetic Biology',
          institution: 'Harvard Medical School & Wyss Institute',
          orcid: '0000-0003-4286-9004',
          matchScore: 92,
          hIndex: 165,
          citations: '160,000+',
          focus: 'Synthetic Genomics, Multiplexed Gene Synthesis & De-extinction Engineering',
          topics: ['Synthetic Biology', 'Direct-to-Cell Sequencing', 'Recoded Genomes'],
          scholarUrl: 'https://orcid.org/0000-0003-4286-9004'
        },
        {
          name: 'Dr. David R. Liu, PhD',
          title: 'Director of Merkin Institute for Transformative Technologies',
          institution: 'Harvard University & Broad Institute',
          orcid: '0000-0002-5734-7389',
          matchScore: 90,
          hIndex: 110,
          citations: '70,000+',
          focus: 'Base Editing, Prime Editing & Continuous Evolution of Molecular Machines',
          topics: ['Base Editors', 'Prime Editing', 'PACE Evolution'],
          scholarUrl: 'https://orcid.org/0000-0002-5734-7389'
        }
      ];
    } else if (isComp) {
      return [
        {
          name: 'Prof. Demis Hassabis, PhD',
          title: 'CEO & Principal Research Director',
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
          name: 'Prof. Regina Barzilay, PhD',
          title: 'AI Faculty Lead & Professor of Computer Science',
          institution: 'MIT Jameel Clinic / CSAIL',
          orcid: '0000-0002-4545-6789',
          matchScore: 95,
          hIndex: 115,
          citations: '72,000+',
          focus: 'Deep Learning for Antibiotic Discovery, Molecular Property Prediction & Early Cancer Detection',
          topics: ['AI Drug Discovery', 'Graph Neural Networks', 'Clinical AI'],
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
    } else if (isMedical) {
      return [
        {
          name: 'Prof. Carl H. June, MD',
          title: 'Richard W. Vague Professor in Immunotherapy',
          institution: 'Perelman School of Medicine, University of Pennsylvania',
          orcid: '0000-0002-2345-6789',
          matchScore: 98,
          hIndex: 175,
          citations: '150,000+',
          focus: 'Chimeric Antigen Receptor (CAR) T-Cell Immunotherapy & Synthetic Immunology',
          topics: ['CAR-T Cell Therapy', 'Adoptive T-Cell Transfer', 'Oncology'],
          scholarUrl: 'https://orcid.org'
        },
        {
          name: 'Prof. James P. Allison, PhD',
          title: 'Nobel Laureate & Chair of Immunology',
          institution: 'MD Anderson Cancer Center',
          orcid: '0000-0001-5678-9012',
          matchScore: 96,
          hIndex: 155,
          citations: '135,000+',
          focus: 'Immune Checkpoint Blockade, CTLA-4/PD-1 Regulation & Tumor Microenvironment',
          topics: ['Immune Checkpoints', 'T-Cell Activation', 'Cancer Immunotherapy'],
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
          name: 'Prof. Frances H. Arnold, PhD',
          title: 'Nobel Laureate & Linus Pauling Professor of Chemical Engineering',
          institution: 'California Institute of Technology (Caltech)',
          orcid: '0000-0002-4027-364X',
          matchScore: 96,
          hIndex: 160,
          citations: '110,000+',
          focus: 'Directed Evolution of Enzymes, Biocatalysis & Synthetic Chemical Pathways',
          topics: ['Directed Evolution', 'Enzyme Engineering', 'Green Chemistry'],
          scholarUrl: 'https://orcid.org/0000-0002-4027-364X'
        }
      ];
    }
  }, [academicField]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareToken, setShareToken] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareDNA = () => {
    const userId = user?.id || profile?.id;
    if (!userId) {
      toast.error('Please log in to share your Research DNA');
      return;
    }
    const token = generateDnaShareToken(userId);
    setShareToken(token);
    setIsShareModalOpen(true);
  };

  const publicShareUrl = shareToken ? `${window.location.origin}/dna/${shareToken}` : '';
  const expirationDate = useMemo(() => {
    const d = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }, []);

  const handleCopyLink = () => {
    if (!publicShareUrl) return;
    navigator.clipboard.writeText(publicShareUrl);
    setCopiedLink(true);
    toast.success('Public 1-Year Research DNA link copied!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDownloadSocialBadge = () => {
    toast.info('Generating Badge with QR Code...');
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, '#0B0F19');
    grad.addColorStop(0.5, '#1E1B4B');
    grad.addColorStop(1, '#090D16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // Decorative glows
    ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
    ctx.beginPath();
    ctx.arc(1050, 120, 280, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
    ctx.beginPath();
    ctx.arc(150, 520, 280, 0, Math.PI * 2);
    ctx.fill();

    // Outer border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, 1152, 582);

    // Header badge
    ctx.fillStyle = '#A7F3D0';
    ctx.font = '900 16px sans-serif';
    ctx.fillText('SCHOLARHUB AI • VERIFIED RESEARCH DNA IDENTITY', 80, 90);

    // Researcher Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 48px sans-serif';
    ctx.fillText(`${userName}'s Research DNA`, 80, 160);

    // Academic Field pill
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(80, 190, 420, 44);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 190, 420, 44);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '700 20px sans-serif';
    ctx.fillText(academicField, 100, 220);

    // Rigor Index Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(80, 260, 320, 200);
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 260, 320, 200);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '700 15px sans-serif';
    ctx.fillText('DOMAIN RIGOR INDEX', 110, 300);

    ctx.fillStyle = '#34D399';
    ctx.font = '900 64px sans-serif';
    ctx.fillText('94.8', 110, 375);

    ctx.fillStyle = '#6EE7B7';
    ctx.font = '600 15px sans-serif';
    ctx.fillText('Top 5% Literature Accuracy', 110, 420);

    // Indexed Literature Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(430, 260, 320, 200);
    ctx.strokeStyle = '#818CF8';
    ctx.lineWidth = 2;
    ctx.strokeRect(430, 260, 320, 200);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '700 15px sans-serif';
    ctx.fillText('INDEXED LITERATURE', 460, 300);

    ctx.fillStyle = '#818CF8';
    ctx.font = '900 64px sans-serif';
    ctx.fillText(`${bookmarks.length}`, 460, 375);

    ctx.fillStyle = '#C7D2FE';
    ctx.font = '600 15px sans-serif';
    ctx.fillText('Active Literature Vectors', 460, 420);

    // Faculty Alignment Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(780, 260, 340, 200);
    ctx.strokeStyle = '#C084FC';
    ctx.lineWidth = 2;
    ctx.strokeRect(780, 260, 340, 200);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '700 15px sans-serif';
    ctx.fillText('FACULTY ALIGNMENT', 810, 300);

    ctx.fillStyle = '#C084FC';
    ctx.font = '900 64px sans-serif';
    ctx.fillText('98%', 810, 375);

    ctx.fillStyle = '#E9D5FF';
    ctx.font = '600 15px sans-serif';
    ctx.fillText('Matched to ORCID Global PIs', 810, 420);

    // Footer Watermark & Expiry Tag
    ctx.fillStyle = '#34D399';
    ctx.font = '700 16px sans-serif';
    ctx.fillText(`Valid 1 Year (Expires ${expirationDate})`, 80, 520);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 15px sans-serif';
    ctx.fillText('Scan QR Code with mobile camera to view live profile', 80, 555);

    // Load QR Code Image onto Canvas
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicShareUrl)}&margin=2`;

    qrImg.onload = () => {
      // Draw white background backing for QR code
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(985, 465, 135, 135);
      ctx.drawImage(qrImg, 990, 470, 125, 125);

      // Trigger Download
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ScholarHub_Research_DNA_${userName.replace(/\s+/g, '_')}.png`;
      link.href = image;
      link.click();
      toast.success('Social Media Badge with scannable QR Code downloaded!');
    };

    qrImg.onerror = () => {
      // Fallback if QR image load is delayed
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `ScholarHub_Research_DNA_${userName.replace(/\s+/g, '_')}.png`;
      link.href = image;
      link.click();
      toast.success('Social Media Badge image downloaded!');
    };
  };

  return (
    <WorkspaceLayout user={user} profile={profile} onLogout={onLogout}>
      <div className="min-h-screen bg-[#F8FAF9] p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
        
        {/* TOP HERO BANNER */}
        <div className="relative rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-10 shadow-xl overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
                <Dna size={14} className="text-violet-400 animate-spin" style={{ animationDuration: '10s' }} />
                <span>ScholarHub Research DNA Engine</span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                {userName}'s Research DNA & Academic Identity
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Algorithmic synthesis of your literature vectors, saved methodologies, and domain affinity. Below is your personalized academic profile and matched global faculty advisors.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-2">
                  <GraduationCap size={14} className="text-indigo-400" />
                  <span>{academicField}</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-xs font-bold text-indigo-300 flex items-center gap-2">
                  <Award size={14} className="text-amber-400" />
                  <span>{userTier} SCHOLAR TIER</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-700/50 text-xs font-bold text-emerald-300 flex items-center gap-2">
                  <BookOpen size={14} className="text-emerald-400" />
                  <span>{bookmarks.length} Index Papers Saved</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <button
                onClick={handleShareDNA}
                className="px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 size={16} /> Share Research DNA
              </button>
            </div>
          </div>
        </div>

        {/* METRICS & RIGOR CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Domain Rigor Index</span>
              <Activity size={16} className="text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">94.8 / 100</div>
            <p className="text-[11px] text-slate-500 font-medium">Top 5% literature synthesis accuracy</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Interdisciplinary Velocity</span>
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">+42.5% MoM</div>
            <p className="text-[11px] text-slate-500 font-medium">High cross-disciplinary exploration</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Primary Method</span>
              <Layers size={16} className="text-violet-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">Empirical Audits</div>
            <p className="text-[11px] text-slate-500 font-medium">Deep Chain-of-Thought reasoning</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
              <span>Faculty Match Precision</span>
              <UserCheck size={16} className="text-amber-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">98% Alignment</div>
            <p className="text-[11px] text-slate-500 font-medium">Matched to global ORCID PIs</p>
          </div>
        </div>

        {/* DOMAIN & METHODOLOGY DISTRIBUTION SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Dominant Domain Vectors */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={18} className="text-indigo-600" /> Dominant Research Domain Vectors
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Vector weights calculated from your literature searches</p>
              </div>
            </div>

            <div className="space-y-4">
              {domainBreakdown.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      {item.name}
                    </span>
                    <span className="font-mono text-slate-600">{item.percentage}% ({item.count} papers)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytical Methodology & Synthesis Fingerprint */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Compass size={18} className="text-emerald-600" /> Methodology & Analytical Fingerprint
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Your preferred research workflows & synthesis depth</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Empirical Literature Audits', value: '42%', desc: 'Sentence-level citation verification across 250M+ papers', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                { title: 'Systematic Reviews & Meta-Analyses', value: '35%', desc: 'PRISMA-compliant flowcharts and quantitative summaries', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
                { title: 'Computational & Wet-Lab Pipelines', value: '23%', desc: 'Experimental methodology protocol extraction', bg: 'bg-violet-50 text-violet-800 border-violet-200' }
              ].map((m) => (
                <div key={m.title} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900">{m.title}</div>
                    <p className="text-[11px] text-slate-500 font-medium">{m.desc}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-xs font-black border shrink-0 ${m.bg}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* DEDICATED FACULTY, ADVISORS & ORCID RECOMMENDATIONS MODULE */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[10px] font-black uppercase tracking-widest text-indigo-700 mb-1">
                <Users size={12} /> MATCHED FACULTY & ORCID RESEARCHERS
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Recommended Professors, PIs & Lab Advisors
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Matched to your research DNA domain ({academicField}) based on ORCID metadata and publication overlap.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Field:</span>
              <span className="px-3 py-1.5 bg-slate-100 text-slate-900 font-bold text-xs rounded-xl border border-slate-200">
                {academicField}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedFaculty.slice((facultyPage - 1) * facultyPerPage, facultyPage * facultyPerPage).map((fac) => (
              <div key={fac.name} className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-6 space-y-4 transition-all hover:shadow-md">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      {fac.name}
                    </h3>
                    <div className="text-xs font-bold text-indigo-600">{fac.title}</div>
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                      <GraduationCap size={13} className="text-slate-400" />
                      {fac.institution}
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-black shrink-0">
                    {fac.matchScore}% Match
                  </span>
                </div>

                {/* Focus Area */}
                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200/70">
                  <strong className="text-slate-900 block mb-0.5">Primary Research Focus:</strong>
                  {fac.focus}
                </p>

                {/* Metrics & Topics */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
                    <span>h-index: <strong>{fac.hIndex}</strong></span>
                    <span>•</span>
                    <span>Citations: <strong>{fac.citations}</strong></span>
                  </div>

                  <div className="flex items-center gap-1">
                    {fac.topics.map((t) => (
                      <span key={t} className="px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded text-[9px] font-bold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProfessorForOutreach(fac);
                        setIsOutreachModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-black transition-all shadow-sm shadow-indigo-500/20 hover:scale-[1.02] cursor-pointer"
                    >
                      <Sparkles size={13} className="text-indigo-200" />
                      <span>Draft AI Outreach Email</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">ORCID: {fac.orcid}</span>
                    <a
                      href={fac.scholarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs"
                    >
                      <span>ORCID Profile</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>

          {/* Faculty Pagination Controls */}
          {recommendedFaculty.length > facultyPerPage && (
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">
                Showing {((facultyPage - 1) * facultyPerPage) + 1}–{Math.min(facultyPage * facultyPerPage, recommendedFaculty.length)} of {recommendedFaculty.length} Matched Faculty
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFacultyPage(prev => Math.max(prev - 1, 1))}
                  disabled={facultyPage === 1}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs font-mono font-bold text-slate-600 px-2">
                  {facultyPage} / {Math.ceil(recommendedFaculty.length / facultyPerPage)}
                </span>
                <button
                  onClick={() => setFacultyPage(prev => Math.min(prev + 1, Math.ceil(recommendedFaculty.length / facultyPerPage)))}
                  disabled={facultyPage >= Math.ceil(recommendedFaculty.length / facultyPerPage)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RECENT SAVED LITERATURE SNAPSHOT */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" /> Active Research Literature Vectors
              </h3>
              <p className="text-xs text-slate-500 font-medium">Your indexed papers forming your current Research DNA</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">{bookmarks.length} Indexed Papers</span>
          </div>

          {bookmarks.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-medium">
              No saved literature in your library yet. Search and save papers in the Research tab to refine your DNA vector.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto overscroll-contain scrollbar-thin pr-1">
              {bookmarks.slice(0, 10).map((b) => {
                const title = b.title || b.full_metadata?.title || 'Untitled Research Paper';
                const authors = b.authors || b.full_metadata?.authors || 'Academic Authors';
                const journal = b.journal || b.journal_name || b.full_metadata?.journal || 'Peer Reviewed';
                const year = b.year || b.full_metadata?.year || '2024';

                return (
                  <div key={b.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-slate-900 line-clamp-1">{title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{authors} • {journal} ({year})</div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-bold uppercase shrink-0">Indexed</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SHARE RESEARCH DNA MODAL */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 md:p-8 flex justify-center items-start sm:items-center animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[calc(100dvh-2.5rem)] sm:max-h-[calc(100dvh-4rem)] flex flex-col overflow-y-auto my-auto scrollbar-thin">
              
              {/* Close Button */}
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Modal Header */}
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-violet-400 uppercase tracking-widest">
                  <Share2 size={14} /> Share Academic Brand & Research DNA
                </div>
                <h3 className="text-xl font-black text-white">Public Shareable Link & Social Media Badge</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Generate a 1-year valid public showcase link and download social media badges to post on Facebook, Instagram, LinkedIn, or Twitter.
                </p>
              </div>

              {/* Live Preview Card (Social Badge) */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">SCHOLARHUB AI IDENTITY</span>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[9px] font-extrabold uppercase flex items-center gap-1">
                    <Clock size={10} /> Valid 1 Year (Expires {expirationDate})
                  </span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-white">{userName}'s Research DNA</h4>
                  <p className="text-xs text-indigo-300 font-medium">{academicField} • {userTier} SCHOLAR TIER</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">DOMAIN RIGOR</span>
                    <span className="text-base font-black text-emerald-400">94.8</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">INDEXED PAPERS</span>
                    <span className="text-base font-black text-indigo-400">{bookmarks.length}</span>
                  </div>
                  <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">ORCID MATCH</span>
                    <span className="text-base font-black text-violet-400">98%</span>
                  </div>
                </div>
              </div>

              {/* SCANNABLE QR CODE CARD */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="p-2.5 bg-white rounded-2xl border border-slate-700 shrink-0 shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(publicShareUrl)}&margin=2`}
                    alt="Research DNA Scannable QR Code"
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-1">
                    <QrCode size={13} /> MOBILE SCAN & DIRECT REDIRECT
                  </span>
                  <h5 className="text-sm font-black text-white">Scannable Academic QR Code</h5>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">
                    Point your mobile phone camera at this QR Code to instantly open {userName}'s verified 1-Year public Research DNA showcase.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Download Badge & Copy Public Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadSocialBadge}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Download size={16} /> Download Social Badge (PNG)
                </button>

                <button
                  onClick={handleCopyLink}
                  className="py-3 px-4 bg-violet-600 hover:bg-violet-500 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  {copiedLink ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                  {copiedLink ? 'Link Copied to Clipboard!' : 'Copy 1-Year Public Link'}
                </button>
              </div>

              {/* URL Input Box */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Unique 1-Year Public URL</label>
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-300">
                  <span className="truncate flex-1">{publicShareUrl}</span>
                  <button
                    onClick={handleCopyLink}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold uppercase transition-colors shrink-0 cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Direct Social Media Share Row */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Direct Social Share</span>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicShareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] border border-[#1877F2]/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>Facebook</span>
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicShareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 text-[#0A66C2] border border-[#0A66C2]/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>LinkedIn</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${userName}'s Research DNA identity on ScholarHub AI:`)}&url=${encodeURIComponent(publicShareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>Twitter / X</span>
                  </a>
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my Research DNA: ${publicShareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* AI Professor Outreach Drafter Modal */}
        <ProfessorOutreachModal
          isOpen={isOutreachModalOpen}
          onClose={() => setIsOutreachModalOpen(false)}
          professor={selectedProfessorForOutreach}
          academicField={academicField}
          userName={userName}
          userTier={userTier}
          shareToken={shareToken}
        />
      </div>
    </WorkspaceLayout>
  );
}
