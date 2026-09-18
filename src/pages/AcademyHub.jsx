import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, RefreshCw, Loader2, Bot, Compass, Award, Sparkles
} from 'lucide-react';
import WorkspaceLayout from '../components/WorkspaceLayout';
import ModuleSidebar from '../components/intelligence/ModuleSidebar';
import LessonCard from '../components/intelligence/LessonCard';
import ResearchPrinciplesSection from '../components/intelligence/ResearchPrinciplesSection';
import SEOHead from '../components/SEOHead';
import { BASE_URL } from '../utils/api';
import { supabase } from '../supabaseClient';

const AcademyHub = ({ user, profile, onLogout, liveUsersCount }) => {
  const navigate = useNavigate();

  // Mode: 'lessons' | 'principles'
  const [hubMode, setHubMode] = useState('principles');

  // Academy states
  const [modules, setModules] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({});
  const [currentModuleId, setCurrentModuleId] = useState('research-fundamentals');
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadingLesson, setLoadingLesson] = useState(false);

  // Helper to fetch auth token
  const getAuthHeader = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        return { Authorization: `Bearer ${session.access_token}` };
      }
    } catch (e) {
      /* ignore */
    }
    return {};
  };

  // Fetch Lessons for a Specific Module
  const fetchModuleLessons = useCallback(async (modId) => {
    if (!modId) return;
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/intelligence/academy/lessons/${modId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const lesList = data.lessons || [];
        setLessonsMap(prev => ({ ...prev, [modId]: lesList }));

        if (lesList.length > 0 && modId === currentModuleId && !currentLessonId) {
          setCurrentLessonId(lesList[0].id);
        }
      } else {
        setLessonsMap(prev => ({ ...prev, [modId]: prev[modId] || [] }));
      }
    } catch (e) {
      console.error(`[AcademyHub] Error fetching lessons for ${modId}:`, e);
      setLessonsMap(prev => ({ ...prev, [modId]: prev[modId] || [] }));
    }
  }, [currentModuleId, currentLessonId]);

  // Fetch Module Cards
  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/intelligence/academy/modules`, { headers });
      if (res.ok) {
        const data = await res.json();
        const mods = data.modules || [];
        setModules(mods);

        if (mods.length > 0) {
          const firstModId = currentModuleId || mods[0].id;
          setCurrentModuleId(firstModId);
          fetchModuleLessons(firstModId);
        }
      }
    } catch (e) {
      console.error('[AcademyHub] Error fetching modules:', e);
    } finally {
      setLoading(false);
    }
  }, [currentModuleId, fetchModuleLessons]);

  // Fetch Detail for Current Selected Lesson
  const fetchLessonDetail = useCallback(async (lesId) => {
    if (!lesId) return;
    try {
      setLoadingLesson(true);
      const headers = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/intelligence/academy/lesson/${lesId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCurrentLesson(data.lesson || null);
      }
    } catch (e) {
      console.error(`[AcademyHub] Error fetching lesson detail ${lesId}:`, e);
    } finally {
      setLoadingLesson(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules, user?.id]);

  useEffect(() => {
    if (currentModuleId) {
      fetchModuleLessons(currentModuleId);
    }
  }, [currentModuleId, fetchModuleLessons]);

  useEffect(() => {
    if (currentLessonId) {
      fetchLessonDetail(currentLessonId);
    }
  }, [currentLessonId, fetchLessonDetail]);

  const handleSelectLesson = (modId, lesId) => {
    setCurrentModuleId(modId);
    setCurrentLessonId(lesId);
    setHubMode('lessons');
  };

  const handleToggleProgress = async (lesId, newStatus) => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${BASE_URL}/api/intelligence/academy/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ lesson_id: lesId, completed: newStatus })
      });

      if (res.ok) {
        fetchModules();
        fetchModuleLessons(currentModuleId);
        if (currentLesson && currentLesson.id === lesId) {
          setCurrentLesson(prev => prev ? { ...prev, completed: newStatus } : prev);
        }
      }
    } catch (e) {
      console.error('[AcademyHub] Error toggling progress:', e);
    }
  };

  // Construct Dynamic Schema.org JSON-LD for Academic Academy Courses & Lessons
  const academySchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": currentLesson?.title || "Academic Research Protocols & Literature Review Academy | ScholarHub AI",
    "description": currentLesson?.description || "Structured courses on research methodology, literature reviews, thesis protocols, and scientific writing.",
    "provider": {
      "@type": "Organization",
      "name": "ScholarHub AI Academy",
      "url": "https://scholarhub-ai.com"
    },
    "educationalLevel": currentLesson?.difficulty || "Beginner to Advanced",
    "hasCourseInstance": {
      "@type": "CourseInstance",
      "courseMode": "Online",
      "url": `https://scholarhub-ai.com/academy?module=${currentModuleId}${currentLessonId ? `&lesson=${currentLessonId}` : ''}`
    }
  };

  const handleOpenAIMentor = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    window.dispatchEvent(new CustomEvent('toggle-support-bot', {
      detail: {
        lessonTitle: currentLesson?.title || 'Scientific Research Methodology & Principles',
        lessonContent: currentLesson?.content_md || '20 Core Principles of Research, Literature Review Frameworks, and Family PhD Budget Calculator.'
      }
    }));
  };

  return (
    <WorkspaceLayout user={user} profile={profile} onLogout={onLogout} hideNav={true}>
      <SEOHead
        title={`${currentLesson?.title ? `${currentLesson.title} | ` : ''}Academic Research Academy & Thesis Protocols | ScholarHub AI`}
        description={currentLesson?.description || "Master academic literature synthesis, research protocols, and statistical design with ScholarHub AI Academy."}
        canonicalPath={`/academy${currentLessonId ? `?module=${currentModuleId}&lesson=${currentLessonId}` : ''}`}
        schemaJson={academySchema}
      />
      <div className="w-full px-4 sm:px-6 md:px-8 2xl:px-12 space-y-6 py-4">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                Research Academy & Mentorship
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] tracking-tight">
              Beginner to Pro Research Academy
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal max-w-xl">
              Master 20 scientific research principles, family PhD financial calculators, thesis protocols, and 1-on-1 AI Research Mentorship.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAIMentor}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <Bot size={16} />
              <span>Ask AI Mentor</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
          <button
            onClick={() => setHubMode('principles')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              hubMode === 'principles'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <Compass size={15} />
            <span>20 Core Principles & Financial Calculator</span>
          </button>

          <button
            onClick={() => setHubMode('lessons')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              hubMode === 'lessons'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
            }`}
          >
            <BookOpen size={15} />
            <span>Structured Modules & Lessons</span>
          </button>
        </div>

        {/* Main Content Render */}
        {hubMode === 'principles' ? (
          <ResearchPrinciplesSection onOpenMentor={handleOpenAIMentor} />
        ) : (
          /* Dual Layout: Sidebar & Reader Content */
          loading ? (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-80 h-96 rounded-2xl bg-white border border-slate-200/80 p-5 animate-pulse" />
              <div className="flex-1 h-96 rounded-2xl bg-white border border-slate-200/80 p-5 animate-pulse" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <ModuleSidebar
                modules={modules}
                currentModuleId={currentModuleId}
                currentLessonId={currentLessonId}
                lessonsMap={lessonsMap}
                onSelectLesson={handleSelectLesson}
                onToggleProgress={handleToggleProgress}
                onExpandModule={(modId) => fetchModuleLessons(modId)}
                user={user}
              />

              <div className="flex-1 w-full">
                {loadingLesson ? (
                  <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 animate-pulse">
                    <Loader2 size={28} className="animate-spin text-slate-600 mb-2" />
                    <span className="text-xs font-medium text-slate-700">Loading Lesson Content...</span>
                  </div>
                ) : (
                  <LessonCard
                    lesson={currentLesson}
                    user={user}
                    profile={profile}
                    onToggleProgress={handleToggleProgress}
                    onOpenMentor={handleOpenAIMentor}
                  />
                )}
              </div>
            </div>
          )
        )}

      </div>
    </WorkspaceLayout>
  );
};

export default AcademyHub;
