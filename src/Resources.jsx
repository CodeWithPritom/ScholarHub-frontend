import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Dna, ArrowLeft, ExternalLink, Globe, BookOpen, Microscope } from 'lucide-react'

const Resources = () => {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const resources = [
    {
      category: "Global Health & Policy",
      icon: <Globe size={24} className="text-blue-500" />,
      links: [
        { title: "World Health Organization (WHO)", url: "https://www.who.int/", desc: "Global public health information and data." },
        { title: "Centers for Disease Control (CDC)", url: "https://www.cdc.gov/", desc: "US health security and disease prevention." },
        { title: "Global Health Observatory", url: "https://www.who.int/data/gho", desc: "WHO's gateway to health-related statistics." }
      ]
    },
    {
      category: "Literature & Databases",
      icon: <BookOpen size={24} className="text-indigo-500" />,
      links: [
        { title: "PubMed Central (PMC)", url: "https://www.ncbi.nlm.nih.gov/pmc/", desc: "Free full-text archive of biomedical and life sciences." },
        { title: "ClinicalTrials.gov", url: "https://clinicaltrials.gov/", desc: "Database of privately and publicly funded clinical studies." },
        { title: "Cochrane Library", url: "https://www.cochranelibrary.com/", desc: "High-quality, independent evidence to inform healthcare decision-making." }
      ]
    },
    {
      category: "Bioinformatics Tools",
      icon: <Microscope size={24} className="text-emerald-500" />,
      links: [
        { title: "BLAST (Basic Local Alignment Search Tool)", url: "https://blast.ncbi.nlm.nih.gov/Blast.cgi", desc: "Find regions of similarity between biological sequences." },
        { title: "Ensembl Genome Browser", url: "https://www.ensembl.org/", desc: "Explore chordate genomes." },
        { title: "UniProt", url: "https://www.uniprot.org/", desc: "Comprehensive, high-quality, and freely accessible resource of protein sequence and functional information." }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200 py-3' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-black text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Dna size={20} className="text-blue-600" />
            <span className="text-sm font-black tracking-tight text-slate-900 uppercase">
              Medical <span className="text-blue-600">Resources</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-32 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            External Medical <span className="text-blue-600">Resources</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
            A curated collection of essential databases, clinical registries, and bioinformatics tools for professional researchers.
          </p>
        </div>

        <div className="space-y-12">
          {resources.map((section, idx) => (
            <section key={idx}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-black tracking-tight">{section.category}</h2>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.links.map((link, i) => (
                  <a 
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors pr-4">
                        {link.title}
                      </h3>
                      <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-500 shrink-0" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed mt-auto">
                      {link.desc}
                    </p>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Resources
