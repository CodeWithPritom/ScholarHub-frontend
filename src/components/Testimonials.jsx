import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, X, User, ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: "Prof. Dr. Ahmed Wasif Reza",
    role: "Dean, Faculty of Sciences and Engineering, EWU",
    text: "The platform looks very promising... I am truly happy to see your progress and would like to congratulate you on this impressive achievement. Your dedication and innovation are clearly reflected in the platform.",
    image: "/dean.jpg",
    badge: "Dean's Verification",
    badgeColor: "bg-amber-100 text-amber-700"
  },
  {
    id: 2,
    name: "Dr. Sarah Jenkins",
    role: "Postdoctoral Researcher, Stanford",
    text: "ScholarHub AI has completely transformed my literature review process. The speed at which it synthesizes complex papers and extracts methodologies is unprecedented. It's an indispensable tool for any serious researcher.",
    image: null,
    badge: "PhD Researcher",
    badgeColor: "bg-blue-100 text-blue-700"
  },
  {
    id: 3,
    name: "Dr. Michael Chen",
    role: "Lead Scientist, BioTech Innovations",
    text: "The zero-hallucination guardrails give me the confidence to use this in my daily workflow. Connecting multiple specialized databases into a single, queryable interface saves me hours every week.",
    image: null
  },
  {
    id: 4,
    name: "Elena Rodriguez",
    role: "PhD Candidate, MIT",
    text: "The sheer accuracy of the Llama 3.1 model when analyzing academic texts is astounding. It accurately summarizes findings without losing the nuanced details that are critical in our field.",
    image: null,
    badge: "Early Access",
    badgeColor: "bg-emerald-100 text-emerald-700"
  },
  {
    id: 5,
    name: "Dr. James Wilson",
    role: "Research Director, Global Health Institute",
    text: "A truly enterprise-grade platform. The cross-device synchronization and the intuitive user interface make managing hundreds of academic papers incredibly straightforward.",
    image: null
  }
];

const Testimonials = () => {
  const [selectedReview, setSelectedReview] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef(null);

  const infiniteTestimonials = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  // Initialize scroll position to the middle set to allow scrolling left immediately
  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.offsetWidth || 0;
      const gap = 24;
      const setWidth = (cardWidth + gap) * TESTIMONIALS.length;
      scrollRef.current.scrollLeft = setWidth;
    }
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    
    const cardWidth = scrollRef.current.children[0]?.offsetWidth || 0;
    const gap = 24;
    const setWidth = (cardWidth + gap) * TESTIMONIALS.length;

    // Seamlessly jump back to the middle set if we reach the bounds
    if (scrollLeft >= setWidth * 2) {
      scrollRef.current.scrollLeft = scrollLeft - setWidth;
    } else if (scrollLeft <= 0) {
      scrollRef.current.scrollLeft = scrollLeft + setWidth;
    }
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const cardWidth = scrollRef.current.children[0]?.offsetWidth || 400;
        const gap = 24;
        scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.offsetWidth || 400;
      scrollRef.current.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.offsetWidth || 400;
      scrollRef.current.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-32 relative z-10 bg-slate-900 border-t border-slate-800 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">Trusted by Scholars Worldwide</h2>
        <p className="text-slate-400 font-medium max-w-2xl mx-auto text-lg">
          See what top researchers and institutions are saying about ScholarHub AI.
        </p>
      </div>

      {/* Carousel Container */}
      <div 
        className="w-full relative px-6 md:px-12 max-w-[1400px] mx-auto group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-hide pb-12 hide-scrollbars"
        >
          {infiniteTestimonials.map((testimonial, index) => {
            const isLong = testimonial.text.length > 130;
            const displayText = isLong ? testimonial.text.slice(0, 130) + "..." : testimonial.text;

            return (
              <div 
                key={`${testimonial.id}-${index}`}
                className="shrink-0 w-full md:w-[calc(33.333%-1rem)] snap-center md:snap-start bg-white text-slate-800 rounded-[2rem] p-8 shadow-2xl relative flex flex-col justify-between"
              >
                {/* Large subtle quote icon in background */}
                <div className="absolute top-4 left-4 text-slate-100 pointer-events-none">
                  <Quote size={80} strokeWidth={1} />
                </div>
                
                {/* Badge at top right */}
                {testimonial.badge && (
                  <div className="absolute top-6 right-6">
                    <span className={`px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full ${testimonial.badgeColor}`}>
                      {testimonial.badge}
                    </span>
                  </div>
                )}
                
                <div className="relative z-10 mb-8 mt-12 flex-1">
                  <p className="text-slate-600 text-lg leading-relaxed font-medium">
                    "{displayText}"
                    {isLong && (
                      <button 
                        onClick={() => setSelectedReview(testimonial)}
                        className="text-blue-600 hover:text-blue-700 font-bold ml-2 text-sm uppercase tracking-wide transition-colors"
                      >
                        ...more
                      </button>
                    )}
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 pt-6 border-t border-slate-100 shrink-0">
                  {testimonial.image ? (
                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 text-slate-400">
                      <User size={20} />
                    </div>
                  )}
                  <div>
                    <h4 className="text-slate-900 font-bold leading-snug">{testimonial.name}</h4>
                    <p className="text-slate-500 text-sm leading-snug">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Navigation Arrows (Desktop Only) */}
        <button
          onClick={handleScrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.1)] hidden md:flex hover:scale-110 border border-slate-200 transition-transform opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={handleScrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.1)] hidden md:flex hover:scale-110 border border-slate-200 transition-transform opacity-0 group-hover:opacity-100 cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedReview(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-10 w-full max-w-2xl relative shadow-2xl"
            >
              <button 
                onClick={() => setSelectedReview(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-slate-200 mb-6">
                <Quote size={40} />
              </div>
              
              <p className="text-xl sm:text-2xl text-slate-700 leading-relaxed font-serif italic mb-10">
                "{selectedReview.text}"
              </p>
              
              <div className="flex items-center gap-5 pt-6 border-t border-slate-100">
                {selectedReview.image ? (
                  <img src={selectedReview.image} alt={selectedReview.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 text-slate-400">
                    <User size={28} />
                  </div>
                )}
                <div>
                  <h4 className="text-slate-900 font-bold text-lg sm:text-xl">{selectedReview.name}</h4>
                  <p className="text-slate-500 text-sm sm:text-base">{selectedReview.role}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbars::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbars {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </section>
  );
};

export default Testimonials;
