import React, { useState } from 'react';
import { 
  CheckCircle2, Circle, Clock, Sparkles, Download, 
  BookOpen, Bot
} from 'lucide-react';
import { BASE_URL } from '../../utils/api';
import { supabase } from '../../supabaseClient';

const LessonCard = ({ lesson, user, profile, onToggleProgress, onOpenMentor }) => {
  const [topicInput, setTopicInput] = useState('');
  const [generatingThesis, setGeneratingThesis] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState('');

  if (!lesson) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-[12px] border border-slate-200/80 bg-white p-8 text-center shadow-2xs">
        <BookOpen size={28} className="mb-2 text-slate-300" />
        <h4 className="text-sm font-bold font-sds-content text-slate-700">Select a Lesson to Begin</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1 font-normal leading-relaxed">
          Choose any module from the sidebar to explore structured lessons and research frameworks.
        </p>
      </div>
    );
  }

  const {
    id,
    module_id,
    title,
    description,
    content_md,
    difficulty = 'beginner',
    estimated_minutes = 15,
    completed = false
  } = lesson;

  const handleGenerateThesis = async (e) => {
    e.preventDefault();
    if (!topicInput.trim() || generatingThesis) return;

    setGeneratingThesis(true);
    setGeneratedOutline('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(`${BASE_URL}/api/intelligence/academy/generate-thesis-outline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ research_topic: topicInput.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedOutline(data.outline_md || '');
      } else {
        alert('Thesis Generator is available for Starter and Pro members.');
      }
    } catch (err) {
      console.error('[LessonCard] Thesis generation error:', err);
    } finally {
      setGeneratingThesis(false);
    }
  };

  const handleDownload = () => {
    if (!generatedOutline) return;
    const blob = new Blob([generatedOutline], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Thesis_Outline_${topicInput.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col space-y-6 rounded-[12px] border border-slate-200/80 bg-white p-4 sm:p-6 sm:p-8 shadow-2xs">
      {/* Lesson Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-[12px] bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 capitalize">
              {difficulty}
            </span>
            <span className="text-slate-400 font-normal">{estimated_minutes} min read</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-sds-content text-slate-900 tracking-tight leading-snug">
            {title}
          </h2>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => onToggleProgress && onToggleProgress(id, !completed)}
              className={`inline-flex items-center gap-1.5 rounded-[12px] px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                completed
                  ? 'bg-slate-100 text-slate-800'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {completed ? <CheckCircle2 size={15} className="text-slate-800" /> : <Circle size={15} />}
              <span>{completed ? 'Completed' : 'Mark Completed'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (!user) {
                toast.info('Please log in to access your AI Research Mentor.');
                window.location.href = '/auth';
                return;
              }
              onOpenMentor && onOpenMentor();
            }}
            className="inline-flex items-center gap-1.5 rounded-[12px] bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white transition-all cursor-pointer shadow-2xs"
          >
            <Bot size={14} />
            <span>Ask AI Mentor</span>
          </button>
        </div>
      </div>

      {/* Lesson Overview Description */}
      {description && (
        <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50 border border-slate-200/60 rounded-[12px] p-6">
          {description}
        </p>
      )}

      {/* Universal Reader View Content */}
      <div className="prose prose-slate max-w-none text-slate-800 text-sm leading-relaxed space-y-4 font-normal">
        {content_md ? (
          <div dangerouslySetInnerHTML={{ 
            __html: content_md
              .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold font-sds-content text-slate-900 mt-6 mb-3 tracking-tight">$1</h1>')
              .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold font-sds-content text-slate-900 mt-5 mb-2 tracking-tight">$1</h2>')
              .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold text-slate-800 mt-4 mb-2">$1</h3>')
              .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
              .replace(/- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 my-1 font-normal">$1</li>')
              .replace(/\n\n/g, '<br/>')
          }} />
        ) : (
          <p className="text-slate-400 italic">No content available for this lesson.</p>
        )}
      </div>

      {/* Thesis Blueprint Generator Tool */}
      {module_id === 'thesis-writing' && (
        <div className="mt-8 rounded-[12px] border border-slate-200 bg-slate-50 p-4 sm:p-6 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Interactive Blueprint Tool
          </span>
          <h4 className="text-base font-bold font-sds-content text-slate-900 tracking-tight mb-1">
            Generate Thesis Chapter Outline
          </h4>
          <p className="text-xs text-slate-600 font-normal mb-4 leading-relaxed">
            Enter your specific research topic to generate a structured, chapter-by-chapter dissertation outline.
          </p>

          <form onSubmit={handleGenerateThesis} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              placeholder="e.g. CRISPR-Cas9 Gene Editing in Sickle Cell Anemia"
              className="flex-1 w-full rounded-[12px] border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!topicInput.trim() || generatingThesis}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[12px] bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Sparkles size={14} />
              <span>{generatingThesis ? 'Generating...' : 'Generate Outline'}</span>
            </button>
          </form>

          {generatedOutline && (
            <div className="mt-6 rounded-[12px] border border-slate-200 bg-white p-4 sm:p-6 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-700">Generated Thesis Outline</span>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[12px] bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  <Download size={13} />
                  <span>Download .MD</span>
                </button>
              </div>

              <pre className="max-h-80 overflow-y-auto rounded-[12px] bg-slate-900 p-4 sm:p-6 text-xs text-slate-200 whitespace-pre-wrap font-mono">
                {generatedOutline}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonCard;
