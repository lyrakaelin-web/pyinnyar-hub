import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import {
  Users,
  MessageSquare,
  ThumbsUp,
  Share2,
  Flag,
  Send,
  Shield,
  HelpCircle,
  Plus,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const CommunityView: React.FC = () => {
  const {
    communityPosts,
    addCommunityPost,
    addCommunityReply,
    flagPost,
    language,
    user,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('Technology & Digital Skills');
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const [showGuidelines, setShowGuidelines] = useState(false);

  const categories = [
    'all',
    'Technology & Digital Skills',
    'Global Opportunities & International Education',
    'Business, Finance & Entrepreneurship',
    'Language Learning',
    'Study Groups & Peer Circles',
  ];

  const filteredPosts = communityPosts.filter((post) => {
    if (activeCategory !== 'all' && post.category !== activeCategory) return false;
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    addCommunityPost(newTitle.trim(), newContent.trim(), newPostCategory);
    setNewTitle('');
    setNewContent('');
    setIsNewPostOpen(false);
  };

  const handleSendReply = (postId: string) => {
    const text = replyInputs[postId]?.trim();
    if (!text) return;
    addCommunityReply(postId, text);
    setReplyInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Community Header Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#A9874B] uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>PYINNYAR Community Hub</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#14243A]">
            {language === 'my' ? 'ကျောင်းသား အသိုက်အဝန်းနှင့် ဆွေးနွေးခန်း' : 'Student Discussions & Study Groups'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
            Connect with fellow Myanmar learners, exchange project feedback, coordinate scholarship study circles, and get answers from instructors.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="px-3.5 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-[#A9874B]" />
            <span>Guidelines</span>
          </button>
          <button
            onClick={() => setIsNewPostOpen(!isNewPostOpen)}
            className="px-4 py-2 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#C7A66A]" />
            <span>{t('comm.new_post', language)}</span>
          </button>
        </div>
      </div>

      {/* Guidelines Accordion */}
      {showGuidelines && (
        <div className="bg-[#FAF8F5] border border-[#C7A66A]/40 rounded-2xl p-5 text-xs text-stone-700 space-y-2 animate-in fade-in">
          <h3 className="font-bold text-sm text-[#14243A] flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#C7A66A]" />
            <span>PYINNYAR HUB Community Code of Conduct</span>
          </h3>
          <p>
            1. <strong>Mutual Respect:</strong> We are a safe, inclusive learning space for all Myanmar youth and adult learners regardless of region, background, or identity.
          </p>
          <p>
            2. <strong>Constructive Learning:</strong> Keep discussions focused on academic mastery, skills growth, and career opportunities. No harassment, hate speech, or commercial spam.
          </p>
          <p>
            3. <strong>Content Moderation:</strong> Posts violating guidelines can be flagged by students and will be reviewed by administrators within 2 hours.
          </p>
        </div>
      )}

      {/* New Post Form Drawer */}
      {isNewPostOpen && (
        <form
          onSubmit={handleCreatePost}
          className="bg-white rounded-2xl border border-stone-300 p-5 shadow-md space-y-3"
        >
          <h3 className="font-bold text-sm text-[#14243A]">Create New Discussion Thread</h3>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Topic Category:</label>
            <select
              value={newPostCategory}
              onChange={(e) => setNewPostCategory(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
            >
              {categories.filter((c) => c !== 'all').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Thread Title:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Best resources to practice IELTS speaking part 2?"
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Details & Questions:</label>
            <textarea
              rows={4}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Provide background, share your current thoughts, and describe what help you are looking for..."
              className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
              required
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewPostOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-bold"
            >
              Publish Thread
            </button>
          </div>
        </form>
      )}

      {/* Filter Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
              activeCategory === cat
                ? 'bg-[#14243A] text-white font-semibold'
                : 'bg-white text-stone-700 border border-stone-200 hover:border-[#C7A66A]'
            }`}
          >
            {cat === 'all' ? 'All Threads' : cat}
          </button>
        ))}
      </div>

      {/* Community Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition-all ${
              post.isFlagged ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200/90'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                  alt={post.authorName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#14243A]">{post.authorName}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                      {post.authorRole}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-400">
                    <span>{post.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{post.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Moderation / Flagging action */}
              <button
                onClick={() => {
                  flagPost(post.id);
                  alert('Thank you. This post has been flagged for administrator moderation.');
                }}
                disabled={post.isFlagged}
                className={`text-xs p-1.5 rounded-lg transition-colors ${
                  post.isFlagged ? 'text-amber-600 bg-amber-100' : 'text-stone-400 hover:text-rose-500'
                }`}
                title="Report inappropriate content"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>

            {/* Post Content */}
            <div className="space-y-2">
              <h3 className="font-bold text-base text-[#14243A] leading-snug">
                {post.title}
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Replies section */}
            {post.replies.length > 0 && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Replies ({post.replies.length})
                </span>
                <div className="space-y-2">
                  {post.replies.map((rep) => (
                    <div
                      key={rep.id}
                      className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#14243A]">{rep.authorName}</span>
                          <span className="text-[9px] uppercase px-1 rounded bg-stone-200 text-stone-600 font-semibold">
                            {rep.authorRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400">{rep.createdAt}</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">{rep.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply Input Box */}
            <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
              <input
                type="text"
                value={replyInputs[post.id] || ''}
                onChange={(e) =>
                  setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendReply(post.id);
                }}
                placeholder="Write a helpful response or follow-up question..."
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#C7A66A]"
              />
              <button
                onClick={() => handleSendReply(post.id)}
                className="px-3.5 py-2 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-semibold flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5 text-[#C7A66A]" />
                <span className="hidden sm:inline">Reply</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
