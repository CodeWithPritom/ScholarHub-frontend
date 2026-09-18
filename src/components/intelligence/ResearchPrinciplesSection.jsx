import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calculator, CheckCircle2, AlertCircle, HelpCircle, 
  Sparkles, ChevronRight, DollarSign, Users, ShieldAlert, FileText, 
  Compass, Lightbulb, Target, Layers, BarChart3, Scale, Code, Award, 
  GraduationCap, ArrowRight, HeartHandshake, UserCheck, Flame
} from 'lucide-react';

// Unsplash high-resolution academic & research photography (valid online open-source images)
const RESEARCH_IMAGES = {
  hero: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80", // Scientist lab & microscope
  literature: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80", // Library books & study
  analytics: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", // Data visualization dashboard
  family: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80", // Family university graduation
};

const PRINCIPLES_DATA = [
  {
    id: 1,
    title: "1. Research vs. Project",
    subtitle: "Project builds a system; Research answers a fundamental gap.",
    category: "Foundation",
    icon: Compass,
    color: "blue",
    content_bn: "Project-এর লক্ষ্য হতে পারে 'একটি face recognition system বানানো'। কিন্তু Research-এর প্রশ্ন—'কম আলোতে face recognition-এর accuracy কেন কমে যায় এবং resource-constrained environment-এ কোন preprocessing strategy তা উল্লেখযোগ্যভাবে উন্নত করতে পারে?'",
    takeaway: "Project creates a deliverable; Research uncovers new human knowledge."
  },
  {
    id: 2,
    title: "2. Problem First, Solution Second",
    subtitle: "Never start with 'I want to use Deep Learning / LLMs'.",
    category: "Foundation",
    icon: Target,
    color: "indigo",
    content_bn: "ভালো গবেষণা শুরু হয় প্রশ্ন দিয়ে: 'কোন সমস্যাটি এখনো যথেষ্ট ভালোভাবে সমাধান হয়নি?' 'আমি CNN দিয়ে pneumonia detection করব'—এটি সাধারণ। কিন্তু 'কম মানের X-ray image এবং সীমিত computational resources-এর ক্ষেত্রে detection কীভাবে নির্ভরযোগ্য করা যায়?'—এটি research problem।",
    takeaway: "Start with an unsolved problem, not a trendy algorithm."
  },
  {
    id: 3,
    title: "3. What is a Real Research Gap?",
    subtitle: "Gap is not just 'nobody did this before'.",
    category: "Methodology",
    icon: HelpCircle,
    color: "purple",
    content_bn: "Gap হতে পারে existing method-এর সীমাবদ্ধ accuracy, নির্দিষ্ট dataset-এ কাজের অভাব, computational cost বেশি হওয়া, reproducibility-র অভাব, কিংবা বাস্তব পরিবেশে validation না থাকা। 'কেন করা দরকার এবং আগের কাজ কোথায় সীমাবদ্ধ'—এটাই শক্তিশালী gap।",
    takeaway: "Demonstrate WHY the limitation matters to the scientific community."
  },
  {
    id: 4,
    title: "4. Systematic Literature Review",
    subtitle: "Synthesize: Who → How → What → Limitation → Next Step.",
    category: "Methodology",
    icon: BookOpen,
    color: "emerald",
    content_bn: "৫০টি paper পড়ে summary লিখলেই literature review হয় না। দেখতে হবে কোন model কোন ধরনের data-তে কাজ করে, কোন metric ব্যবহার করেছে, এবং কোথায় সীমাবদ্ধ। Pattern খুঁজুন—কোন গুরুত্বপূর্ণ বিষয় আগের গবেষণায় বাদ পড়েছে।",
    takeaway: "Synthesize findings across papers to locate unexplored gaps."
  },
  {
    id: 5,
    title: "5. Critical Paper Evaluation",
    subtitle: "Not every paper on Google Scholar is high quality.",
    category: "Methodology",
    icon: CheckCircle2,
    color: "amber",
    content_bn: "দেখতে হবে কোথায় published (Scopus / IEEE / Nature / peer-reviewed), methodology কতটা শক্তিশালী, dataset credible কি না, sample size যথেষ্ট কি না, baseline comparison আছে কি না এবং ফলাফল reproducible কি না।",
    takeaway: "Evaluate methodology rigor over raw citation counts."
  },
  {
    id: 6,
    title: "6. Precise Research Question",
    subtitle: "Avoid vague topics like 'AI in Healthcare'.",
    category: "Formulation",
    icon: Lightbulb,
    color: "sky",
    content_bn: "'AI in healthcare' কোনো research question নয়; এটি একটি বিশাল ক্ষেত্র। কিন্তু 'Can a lightweight vision transformer maintain competitive diagnostic performance under limited computational resources?' একটি সুনির্দিষ্ট প্রশ্ন।",
    takeaway: "A precise question dictates your data, methods, and evaluation criteria."
  },
  {
    id: 7,
    title: "7. Data-Aware Model Selection",
    subtitle: "Problem → Data → Constraints → Model.",
    category: "Formulation",
    icon: Layers,
    color: "violet",
    content_bn: "AI research-এ ভুল ক্রম: Dataset → Model → Accuracy। সঠিক ক্রম: Problem → Data → Constraints → Objective → Model Selection → Optimization → Evaluation। মাত্র ১,০০০ ছবি থাকলে বিশাল LLM/ViT ব্যবহারের যৌক্তিকতা তৈরি করুন।",
    takeaway: "Data characteristics dictate model complexity."
  },
  {
    id: 8,
    title: "8. Dataset Pitfalls & Biases",
    subtitle: "High Accuracy ≠ Good Research.",
    category: "Data Integrity",
    icon: AlertCircle,
    color: "rose",
    content_bn: "Dataset-এ sampling bias, class imbalance, missing values, duplicate samples বা data leakage থাকতে পারে। Training ও test set-এ একই ব্যক্তির ছবি থাকলে accuracy ৯৮% হলেও real-world performance ব্যর্থ হবে।",
    takeaway: "Audit datasets for data leakage and class distribution bias."
  },
  {
    id: 9,
    title: "9. Mandatory Baselines",
    subtitle: "93% accuracy is meaningless without a baseline comparison.",
    category: "Evaluation",
    icon: BarChart3,
    color: "teal",
    content_bn: "আপনি ৯৩% accuracy পেলেন। এটি ভালো না খারাপ? Baseline যদি ৯১% দেয়, তবে এটি উন্নতি। কিন্তু baseline যদি ৯৫% দেয়, তবে ৯৩% উন্নতি নয়। Baseline comparison গবেষণার মূল স্তম্ভ।",
    takeaway: "Always benchmark against competitive state-of-the-art baselines."
  },
  {
    id: 10,
    title: "10. Comprehensive Evaluation Metrics",
    subtitle: "Accuracy is deceiving on imbalanced data.",
    category: "Evaluation",
    icon: Scale,
    color: "cyan",
    content_bn: " dataset-এর ৯৫% negative এবং ৫% positive হলে, model সব negative বললে accuracy হবে ৯৫%, কিন্তু model ব্যর্থ। তাই Precision, Recall, F1-score, AUROC, IoU, Dice coefficient ইত্যাদি ব্যবহার করুন।",
    takeaway: "Select metrics that reflect real-world failure consequences."
  },
  {
    id: 11,
    title: "11. Multiple Types of Novelty",
    subtitle: "You don't need to invent a new Neural Architecture.",
    category: "Contribution",
    icon: Sparkles,
    color: "amber",
    content_bn: "Novelty হতে পারে নতুন algorithm, existing algorithm-এর নতুন combination, নতুন dataset, নতুন application domain, নতুন evaluation framework, অথবা existing method-এর সীমাবদ্ধতা উন্মোচন।",
    takeaway: "Novelty includes domain applications, benchmark frameworks, and analytical insights."
  },
  {
    id: 12,
    title: "12. Statistical vs. Practical Significance",
    subtitle: "A 0.3% gain may not justify high computational cost.",
    category: "Contribution",
    icon: Award,
    color: "emerald",
    content_bn: "Accuracy ৯০.১% থেকে ৯০.৪% হলে তা statistically significant হতে পারে, কিন্তু বাস্তবে বিশাল computing cost থাকলে তা justified নয়। আবার high-stakes medical detection-এ ০.৫% উন্নতিও জীবন বাঁচাতে পারে।",
    takeaway: "Demonstrate practical value alongside p-values."
  },
  {
    id: 13,
    title: "13. Reproducibility Principle",
    subtitle: "'It worked on my machine' is not research evidence.",
    category: "Rigor",
    icon: Code,
    color: "blue",
    content_bn: "অন্য researcher যেন একই ফলাফল পায়, তার জন্য প্রয়োজন code documentation, random seed, dataset specification, hyperparameters, এবং evaluation protocol।",
    takeaway: "Share code, seeds, and execution protocols for open science."
  },
  {
    id: 14,
    title: "14. Validity of Negative Results",
    subtitle: "Disproving a hypothesis with strong evidence is valuable research.",
    category: "Rigor",
    icon: ShieldAlert,
    color: "purple",
    content_bn: "গবেষণা তখনই সফল নয় যখন আপনার method জেতে। যদি প্রমাণ করতে পারেন যে একটি প্রচলিত method নির্দিষ্ট অবস্থায় কাজ করে না এবং কেন কাজ করে না—সেটিও অত্যন্ত মূল্যবান আবিষ্কার।",
    takeaway: "Research seeks truth, not personal confirmation."
  },
  {
    id: 15,
    title: "15. Research Ethics & Compliance",
    subtitle: "Human data requires IRB and informed consent.",
    category: "Ethics",
    icon: HeartHandshake,
    color: "rose",
    content_bn: "Human/medical data নিয়ে কাজ করলে informed consent, privacy, anonymization, IRB approval এবং conflict of interest নিশ্চিত করতে হবে। সঠিক গবেষণা নৈতিকতা যেকোনো পেপারের চেয়ে বড়।",
    takeaway: "Ethical compliance precedes manuscript publication."
  },
  {
    id: 16,
    title: "16. Responsible AI Assistant Usage",
    subtitle: "AI can assist brainstorming, but you own intellectual responsibility.",
    category: "Ethics",
    icon: UserCheck,
    color: "indigo",
    content_bn: "ChatGPT/Copilot ভুয়া reference বা hallucinated citation তৈরি করতে পারে। AI আপনার assistant হতে পারে, scientific judgment-এর বিকল্প নয়। সব reference ও math নিজে যাচাই করুন।",
    takeaway: "Manually verify all AI-generated literature references and data."
  },
  {
    id: 17,
    title: "17. Contribution over Paper Count",
    subtitle: "One high-impact paper beats ten superficial papers.",
    category: "Career",
    icon: GraduationCap,
    color: "emerald",
    content_bn: "'Scopus paper লাগবে' চিন্তায় salami publication বা weak venue-তে দৌড়ালে গবেষণার মান নষ্ট হয়। একটি গভীর ও টেকসই আবিষ্কার ১০টি দুর্বল পেপারের চেয়ে বেশি সম্মানিত।",
    takeaway: "Prioritize scientific depth over paper quantity."
  },
  {
    id: 18,
    title: "18. Selecting the Right Advisor",
    subtitle: "Mentoring style and availability matter more than designation.",
    category: "Career",
    icon: Users,
    color: "amber",
    content_bn: "Supervisor নির্বাচন করার সময় recent publications, research group culture, availability, এবং mentoring style দেখুন। একজন ভালো supervisor আপনার হয়ে কাজ করবেন না; আপনাকে researcher বানাবেন।",
    takeaway: "Choose advisors based on active mentorship and alignment."
  },
  {
    id: 19,
    title: "19. Frustration Tolerance",
    subtitle: "Research is a marathon of hypothesis failures and redesigns.",
    category: "Mindset",
    icon: Flame,
    color: "rose",
    content_bn: "৩ মাসে ফল না এলে হতাশ হবেন না। Dataset পরিবর্তন, method fail হওয়া, hypothesis বাতিল হওয়া—গবেষণার স্বাভাবিক অংশ। সবচেয়ে বড় skill হলো ধৈর্য ধরে প্রশ্নটিকে আঁকড়ে রাখা।",
    takeaway: "Resilience in adversity is the core trait of a scholar."
  },
  {
    id: 20,
    title: "20. The Ultimate Question",
    subtitle: "What new knowledge am I adding to human civilization?",
    category: "Mindset",
    icon: Lightbulb,
    color: "sky",
    content_bn: "নিজের কাজ শেষে প্রশ্ন করুন: 'আমার কারণে পৃথিবী কী নতুন বিষয় জানতে পারল?' 'আমি একটি model বানিয়েছি' না বলে বলুন: 'resource-constrained অবস্থায় প্রচলিত পদ্ধতির limitation উন্মোচন করে একটি lightweight কৌশল বানিয়েছি।'",
    takeaway: "Measure your success by the new knowledge contributed to humanity."
  }
];

const ResearchPrinciplesSection = ({ onOpenMentor }) => {
  const [activeTab, setActiveTab] = useState('principles'); // 'principles' | 'phd_calculator' | 'case_study'
  const [selectedPrinciple, setSelectedPrinciple] = useState(PRINCIPLES_DATA[0]);

  // Family PhD Calculator State
  const [stipend, setStipend] = useState(2500);
  const [rent, setRent] = useState(1200);
  const [food, setFood] = useState(500);
  const [dependents, setDependents] = useState(1); // 0, 1, 2
  const [childcare, setChildcare] = useState(400);
  const [insurance, setInsurance] = useState(250);

  // Financial Calculations
  const totalLivingCost = rent + food + (dependents > 0 ? insurance : 100) + (dependents > 1 ? childcare : 0) + 200;
  const netSurplus = stipend - totalLivingCost;

  return (
    <div className="w-full space-y-10 py-2">
      
      {/* Visual Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute inset-0 opacity-25">
          <img src={RESEARCH_IMAGES.hero} alt="Scientific Research Lab" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>ScholarHub AI Research Academy Framework</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Master Scientific Research Methodology: <span className="text-blue-400">From Curiosity to Breakthrough</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
            Research is not just writing code or training models. It is identifying an unsolved gap, formulating precise scientific questions, gathering credible evidence, and contributing new knowledge to human civilization.
          </p>

          {/* Navigation Bar inside Banner */}
          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('principles')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'principles' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <BookOpen size={16} />
              <span>20 Core Research Principles</span>
            </button>

            <button
              onClick={() => setActiveTab('phd_calculator')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'phd_calculator' 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25' 
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Calculator size={16} />
              <span>Family PhD Financial Calculator</span>
            </button>

            <button
              onClick={() => setActiveTab('case_study')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'case_study' 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700'
              }`}
            >
              <Layers size={16} />
              <span>Real Student Transformation Roadmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABS CONTENT */}

      {/* TAB 1: 20 CORE PRINCIPLES */}
      {activeTab === 'principles' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-xl font-bold text-slate-900">20 Fundamental Principles of Scientific Research</h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any principle to view detailed explanation and scientific takeaways.</p>
            </div>
            <button
              onClick={onOpenMentor}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer"
            >
              <HelpCircle size={15} />
              <span>Ask AI Mentor about these Principles</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Grid List */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[640px] overflow-y-auto pr-2 scrollbar-thin">
              {PRINCIPLES_DATA.map((p) => {
                const IconComp = p.icon;
                const isSelected = selectedPrinciple.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPrinciple(p)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]' 
                        : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <IconComp size={18} />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold truncate">{p.title}</h4>
                        <p className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                          {p.subtitle}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`shrink-0 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
                  </div>
                );
              })}
            </div>

            {/* Right Detailed Reader Card */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedPrinciple.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
                      {selectedPrinciple.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Principle #{selectedPrinciple.id} of 20
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      {selectedPrinciple.title}
                    </h3>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {selectedPrinciple.subtitle}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                    {selectedPrinciple.content_bn}
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block mb-0.5">Scientific Takeaway & Action Item:</strong>
                      {selectedPrinciple.takeaway}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={() => {
                        const nextId = selectedPrinciple.id % 20 + 1;
                        const nextItem = PRINCIPLES_DATA.find(p => p.id === nextId);
                        if (nextItem) setSelectedPrinciple(nextItem);
                      }}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <span>Next Principle</span>
                      <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={onOpenMentor}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline cursor-pointer"
                    >
                      Discuss with AI Mentor
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: FAMILY PHD FINANCIAL CALCULATOR */}
      {activeTab === 'phd_calculator' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                PhD Stipend Sustainability Framework
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-white">
                "Fully Funded" Does Not Mean "Fully Affordable"
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                A stipend of $2,500/month might be comfortable for a single scholar, but unsustainable when relocating with a spouse or children. Calculate real monthly surplus after housing, food, dependent insurance, and childcare.
              </p>
            </div>
            <img src={RESEARCH_IMAGES.family} alt="Family PhD Graduation" className="w-32 h-32 rounded-2xl object-cover border-2 border-purple-500/30 shrink-0 hidden sm:block" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Calculator Controls */}
            <div className="lg:col-span-6 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calculator size={18} className="text-purple-600" />
                <span>PhD Family Budget Parameters</span>
              </h4>

              {/* Input: Monthly Stipend */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex justify-between mb-1">
                  <span>Monthly Net Stipend ($)</span>
                  <span className="text-purple-600 font-extrabold">${stipend}</span>
                </label>
                <input 
                  type="range" min="1500" max="5000" step="50" 
                  value={stipend} onChange={(e) => setStipend(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Input: Monthly Family Rent */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex justify-between mb-1">
                  <span>Monthly Family Housing Rent ($)</span>
                  <span className="text-purple-600 font-extrabold">${rent}</span>
                </label>
                <input 
                  type="range" min="500" max="3000" step="50" 
                  value={rent} onChange={(e) => setRent(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Input: Groceries & Food */}
              <div>
                <label className="text-xs font-bold text-slate-700 flex justify-between mb-1">
                  <span>Food & Household Groceries ($)</span>
                  <span className="text-purple-600 font-extrabold">${food}</span>
                </label>
                <input 
                  type="range" min="300" max="1500" step="50" 
                  value={food} onChange={(e) => setFood(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Input: Dependents Count */}
              <div>
                <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Family Composition
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Single Scholar", val: 0 },
                    { label: "Couple (Spouse)", val: 1 },
                    { label: "Couple + Child", val: 2 }
                  ].map((item) => (
                    <button
                      key={item.val}
                      onClick={() => setDependents(item.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        dependents === item.val 
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {dependents > 0 && (
                <div>
                  <label className="text-xs font-bold text-slate-700 flex justify-between mb-1">
                    <span>Dependent Health Insurance Premium ($)</span>
                    <span className="text-purple-600 font-extrabold">${insurance}</span>
                  </label>
                  <input 
                    type="range" min="50" max="800" step="25" 
                    value={insurance} onChange={(e) => setInsurance(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              )}

              {dependents > 1 && (
                <div>
                  <label className="text-xs font-bold text-slate-700 flex justify-between mb-1">
                    <span>Childcare / School Fees ($)</span>
                    <span className="text-purple-600 font-extrabold">${childcare}</span>
                  </label>
                  <input 
                    type="range" min="100" max="2000" step="50" 
                    value={childcare} onChange={(e) => setChildcare(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Results & Financial Position Output */}
            <div className="lg:col-span-6 rounded-3xl border border-slate-200/80 bg-slate-50 p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-2xs">
              <div className="space-y-4">
                <h4 className="text-base font-bold text-slate-900 border-b border-slate-200/80 pb-3">
                  Monthly Cash Flow Breakdown
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">Net Monthly Stipend</span>
                    <span className="font-bold text-slate-900">${stipend}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">Housing Rent</span>
                    <span className="font-semibold text-rose-600">-${rent}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">Food & Groceries</span>
                    <span className="font-semibold text-rose-600">-${food}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">Health Insurance & Utilities</span>
                    <span className="font-semibold text-rose-600">-${dependents > 0 ? insurance : 100}</span>
                  </div>
                  {dependents > 1 && (
                    <div className="flex justify-between py-1 border-b border-slate-200/50">
                      <span className="text-slate-600">Childcare Expenses</span>
                      <span className="font-semibold text-rose-600">-${childcare}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-600">Transit & Miscellaneous</span>
                    <span className="font-semibold text-rose-600">-$200</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Estimated Total Monthly Cost</span>
                    <span className="text-xl font-extrabold text-slate-900">${totalLivingCost}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Real Monthly Buffer</span>
                    <span className={`text-xl font-extrabold ${netSurplus >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {netSurplus >= 0 ? `+$${netSurplus}` : `-$${Math.abs(netSurplus)}`}
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl text-xs leading-relaxed border ${
                  netSurplus >= 200 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : netSurplus >= 0 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <strong className="font-bold block mb-1">Financial Sustainability Assessment:</strong>
                  {netSurplus >= 200 
                    ? "Sustainable Budget: You have a healthy monthly buffer for unexpected expenses and initial settlement setup costs."
                    : netSurplus >= 0 
                    ? "Tight Budget: You break even, but unexpected dental, childcare, or travel costs could cause financial strain. Assume spouse income = $0 until work permit is active."
                    : "Unsustainable Deficit: Total living costs exceed stipend. Consider low cost-of-living cities or securing supplemental departmental TA/RA positions before accepting."}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 leading-normal">
                Formula: <strong className="text-slate-700">Net Funding − Total Family Living Cost = Real Financial Position</strong>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: REAL CASE STUDY ROADMAP */}
      {activeTab === 'case_study' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              End-to-End Practical Example
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-white">
              Case Study: Transforming a Student Idea into a High-Impact Publication
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal max-w-3xl">
              Follow how a general topic ("Bangla Fake News Detection") is transformed step-by-step into a rigorous, publication-ready research study using baseline benchmarking and ethics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: "01. Vague Topic → Problem",
                bad: "I want to detect Bangla fake news using AI.",
                good: "Bangla misinformation classification models suffer from poor domain generalization and class imbalance on low-resource benchmarks.",
                icon: AlertCircle,
                color: "rose"
              },
              {
                step: "02. Literature & Gap",
                bad: "Paper 1 used BERT; Paper 2 used SVM.",
                good: "Existing studies rely on single-domain news corpora and lack evaluation under severe class imbalance and dialectal variation.",
                icon: BookOpen,
                color: "amber"
              },
              {
                step: "03. Question & Baselines",
                bad: "Can my model get 95% accuracy?",
                good: "Which cost-sensitive transformer strategy maximizes Macro-F1 across imbalanced Bangla news domains over state-of-the-art baselines?",
                icon: Target,
                color: "indigo"
              },
              {
                step: "04. Real Contribution",
                bad: "We achieved 94% accuracy with a new model.",
                good: "Evidence-based explanation of domain transfer limits and a lightweight strategy reducing false positives by 14% on imbalanced benchmarks.",
                icon: Award,
                color: "emerald"
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="p-5 rounded-3xl border border-slate-200/80 bg-white space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 border-b border-slate-100 pb-2">
                    <Icon size={16} className={`text-${item.color}-600`} />
                    <span>{item.step}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-900">
                      <strong className="block font-bold mb-0.5 text-[10px] uppercase tracking-wider text-rose-700">Weak Approach:</strong>
                      {item.bad}
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-900">
                      <strong className="block font-bold mb-0.5 text-[10px] uppercase tracking-wider text-emerald-700">Scientific Approach:</strong>
                      {item.good}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default ResearchPrinciplesSection;
