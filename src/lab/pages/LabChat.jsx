import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLab } from '../context/LabContext';
import { labApi } from '../utils/labApi';
import { MessageSquare, Send, CheckCircle2, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function LabChat() {
  const { labId } = useParams();
  const { can, userRole } = useLab();

  const [discussions, setDiscussions] = useState([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiscussions() {
      try {
        setLoading(true);
        const res = await labApi.listDiscussions(labId, 'general', labId);
        setDiscussions(res.discussions || []);
      } catch (e) {
        toast.error('Failed to load lab discussions');
      } finally {
        setLoading(false);
      }
    }
    loadDiscussions();
  }, [labId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      const res = await labApi.createDiscussion(labId, {
        entity_type: 'general',
        entity_id: labId,
        content: comment.trim()
      });
      setDiscussions([...discussions, res.discussion]);
      setComment('');
      toast.success('Discussion message posted');
    } catch (e) {
      toast.error('Failed to post message');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-[#171717]">Laboratory Discussions & Peer Reviews</h2>
        <p className="text-xs text-[#737373] mt-0.5">
          General lab communication, scientific debate, and peer feedback.
        </p>
      </div>

      <div className="bg-white border border-[#E5E5DF] rounded-2xl p-6 shadow-xs space-y-4">
        {/* Post Form */}
        <form onSubmit={handlePost} className="flex gap-2">
          <input
            type="text"
            placeholder="Share an observation, question, or protocol notice..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="flex-1 px-4 py-2 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs text-[#171717] focus:outline-none focus:border-[#171717]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <Send size={13} />
            <span>Post</span>
          </button>
        </form>

        {/* Message Thread */}
        <div className="space-y-3 pt-3 border-t border-[#F4F4F0]">
          {loading ? (
            <p className="text-xs text-[#737373] text-center py-6">Loading discussions...</p>
          ) : discussions.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#737373]">
              No discussions yet. Start the conversation with your team!
            </div>
          ) : (
            discussions.map((d) => (
              <div key={d.id} className="p-4 bg-[#FAFAF8] border border-[#E5E5DF] rounded-xl text-xs flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700 shrink-0">
                  <User size={12} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#171717]">Researcher</span>
                    <span className="text-[10px] text-[#A3A3A3]">
                      {d.created_at ? new Date(d.created_at).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <p className="text-[#525252] leading-relaxed whitespace-pre-wrap">{d.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
