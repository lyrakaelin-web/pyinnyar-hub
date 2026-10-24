import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { Course, Category, Enrollment } from '../types';
import {
  ShieldCheck,
  BookOpen,
  Plus,
  Users,
  Award,
  CheckCircle2,
  DollarSign,
  Flag,
  Trash2,
  Edit,
  TrendingUp,
  BarChart3,
  Calendar,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    user,
    courses,
    categories,
    enrollments,
    communityPosts,
    addOrUpdateCourse,
    deleteCourse,
    toggleCategoryStatus,
    verifyPaymentAdmin,
    addOpportunity,
    language,
    setCurrentView,
    openAuthModal,
    getAuthHeaders,
  } = useApp();

  const [activeAdminTab, setActiveAdminTab] = useState<'courses' | 'categories' | 'payments' | 'moderation' | 'analytics' | 'roles'>('courses');

  // Role promotion state for Founder & Super Admin
  const [roleEmail, setRoleEmail] = useState('');
  const [roleToAssign, setRoleToAssign] = useState<'admin' | 'instructor'>('instructor');
  const [roleActionStatus, setRoleActionStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPromotingRole, setIsPromotingRole] = useState(false);

  // Modal for new/edit course
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);

  if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-stone-200 shadow-sm text-center space-y-4 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-[#14243A] text-[#C7A66A] flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-widest text-[#A9874B] uppercase">
            Restricted Console
          </span>
          <h2 className="text-lg font-bold text-[#14243A]">Administrator Access Required</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            You must be signed in with an Administrator account to access the PYINNYAR HUB administration console.
          </p>
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => openAuthModal(true, 'login')}
            className="w-full py-2.5 rounded-xl bg-[#14243A] text-white text-xs font-bold hover:bg-[#1E3452] transition-colors"
          >
            Sign In with Admin Credentials
          </button>
          <button
            onClick={() => setCurrentView('home')}
            className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  // Form states for course
  const [cTitle, setCTitle] = useState('');
  const [cTitleMy, setCTitleMy] = useState('');
  const [cCategoryId, setCCategoryId] = useState(1);
  const [cSubcategory, setCSubcategory] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cDescMy, setCDescMy] = useState('');
  const [cDuration, setCDuration] = useState('6 weeks');
  const [cLevel, setCLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [cType, setCType] = useState<'free' | 'paid' | 'certificate'>('free');
  const [cPriceMMK, setCPriceMMK] = useState(0);

  const openNewCourseModal = () => {
    setEditingCourse(null);
    setCTitle('');
    setCTitleMy('');
    setCCategoryId(1);
    setCSubcategory('General');
    setCDesc('');
    setCDescMy('');
    setCDuration('6 weeks');
    setCLevel('Beginner');
    setCType('free');
    setCPriceMMK(0);
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (course: Course) => {
    setEditingCourse(course);
    setCTitle(course.title);
    setCTitleMy(course.titleMy || '');
    setCCategoryId(course.categoryId);
    setCSubcategory(course.subcategory);
    setCDesc(course.description);
    setCDescMy(course.descriptionMy || '');
    setCDuration(course.duration);
    setCLevel(course.level);
    setCType(course.type);
    setCPriceMMK(course.priceMMK);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    addOrUpdateCourse({
      ...(editingCourse ? { id: editingCourse.id } : {}),
      title: cTitle,
      titleMy: cTitleMy,
      categoryId: cCategoryId,
      subcategory: cSubcategory,
      description: cDesc,
      descriptionMy: cDescMy,
      duration: cDuration,
      level: cLevel,
      type: cType,
      priceMMK: cType === 'free' ? 0 : cPriceMMK,
      priceUSD: cType === 'free' ? 0 : Math.round(cPriceMMK / 2500),
      status: 'active',
      thumbnail: editingCourse?.thumbnail || '/src/assets/images/course_tech_coding_1792822969446.jpg',
      instructor: editingCourse?.instructor || {
        id: user.id,
        name: user.name,
        title: 'Academic Faculty Lead',
        avatar: user.avatar,
        bio: 'Senior educator at PYINNYAR HUB.',
      },
      objectives: editingCourse?.objectives || ['Understand core concepts and practical workflows'],
      modules: editingCourse?.modules || [
        {
          id: `mod_${Date.now()}`,
          title: 'Module 1: Foundations',
          titleMy: 'အခန်း ၁: အခြေခံ သဘောတရားများ',
          lessons: [
            {
              id: `les_${Date.now()}`,
              title: '1.1 Comprehensive Overview',
              titleMy: '၁.၁ အထွေထွေ မိတ်ဆက်',
              duration: '20 min',
              durationSeconds: 1200,
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              summary: 'Core introduction and curriculum fundamentals.',
              summaryMy: 'သင်ရိုးအခြေခံ မိတ်ဆက်။',
            },
          ],
        },
      ],
      quizzes: editingCourse?.quizzes || [],
      assignments: editingCourse?.assignments || [],
    });
    setIsCourseModalOpen(false);
  };

  const pendingPayments = Object.values(enrollments).filter(
    (enr) => enr.paymentStatus === 'pending_verification'
  );

  const flaggedPosts = communityPosts.filter((p) => p.isFlagged);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Admin Header */}
      <div className="bg-[#14243A] text-white rounded-2xl p-6 shadow-md border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#C7A66A] text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Authorized Administration Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Academic Operations & Platform Governance</h1>
          <p className="text-xs text-white/70 mt-0.5">
            Logged in as {user.name} ({user.role.toUpperCase()})
          </p>
        </div>

        <button
          onClick={openNewCourseModal}
          className="px-4 py-2.5 rounded-xl bg-[#C7A66A] text-[#14243A] hover:bg-[#D8B77B] text-xs font-bold flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-sm"
        >
          <Plus className="w-4 h-4 text-[#14243A]" />
          <span>Publish New Course</span>
        </button>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl overflow-x-auto text-xs shrink-0">
        <button
          onClick={() => setActiveAdminTab('courses')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'courses' ? 'bg-[#14243A] text-white font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Courses ({courses.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('categories')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'categories' ? 'bg-[#14243A] text-white font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span>30 Categories ({categories.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('payments')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'payments' ? 'bg-[#14243A] text-white font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Payment Verifications ({pendingPayments.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('moderation')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'moderation' ? 'bg-[#14243A] text-white font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Community Moderation ({flaggedPosts.length})</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('analytics')}
          className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeAdminTab === 'analytics' ? 'bg-[#14243A] text-white font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Learning Analytics</span>
        </button>

        {user.role === 'owner' && (
          <button
            onClick={() => setActiveAdminTab('roles')}
            className={`px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeAdminTab === 'roles' ? 'bg-[#A9874B] text-white font-bold shadow-xs' : 'text-amber-800 hover:text-amber-950 font-semibold'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Authorized Staff (Owner Only)</span>
          </button>
        )}
      </div>

      {/* Admin Tab Contents */}
      {activeAdminTab === 'courses' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
              Active & Published Courses
            </h3>
            <span className="text-xs text-stone-500 font-mono">{courses.length} Total</span>
          </div>

          <div className="divide-y divide-stone-100">
            {courses.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={c.thumbnail}
                    alt={c.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-xs font-bold text-[#14243A] block truncate">
                      {c.title}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {c.subcategory} · {c.level} · {c.priceMMK === 0 ? 'Free' : `${c.priceMMK.toLocaleString()} MMK`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditCourseModal(c)}
                    className="p-2 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700"
                    title="Edit Course"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${c.title}?`)) {
                        deleteCourse(c.id);
                      }
                    }}
                    className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'categories' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
              Platform Category Governance (30 Categories)
            </h3>
            <span className="text-xs text-stone-500">Toggle active / coming soon status</span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#A9874B]">{cat.number}.</span>
                    <span className="font-bold text-sm text-[#14243A]">{cat.name}</span>
                    <span className="text-xs text-stone-400">({cat.nameMy})</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{cat.description}</p>
                </div>

                <button
                  onClick={() => toggleCategoryStatus(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                    cat.hasActiveCourses
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-200 text-stone-700'
                  }`}
                >
                  {cat.hasActiveCourses ? 'Active' : 'Coming Soon'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeAdminTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
              Student Enrollment & Slip Verifications
            </h3>
          </div>

          <div className="p-6 text-center text-xs text-stone-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-bold text-stone-800">
              All active enrollments are approved and verified.
            </p>
            <p className="text-[11px] text-stone-400">
              In production, KBZPay and WavePay webhook notifications automatically confirm transactions.
            </p>
          </div>
        </div>
      )}

      {activeAdminTab === 'moderation' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs p-5">
          <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700 mb-3">
            Flagged Community Content Queue
          </h3>
          {flaggedPosts.length > 0 ? (
            <div className="space-y-3">
              {flaggedPosts.map((fp) => (
                <div key={fp.id} className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                  <div className="flex items-center justify-between font-bold text-stone-800 mb-1">
                    <span>{fp.title} (by {fp.authorName})</span>
                    <span className="text-amber-800">Flagged</span>
                  </div>
                  <p className="text-stone-600">{fp.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-stone-500">
              No flagged posts currently pending review.
            </div>
          )}
        </div>
      )}

      {activeAdminTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
            <span className="text-xs text-stone-500 font-medium">Registered Active Learners</span>
            <div className="text-2xl font-black text-[#14243A] tabular-nums">1,248</div>
            <span className="text-[11px] text-emerald-700 font-semibold">+18% this month</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
            <span className="text-xs text-stone-500 font-medium">Course Completion Rate</span>
            <div className="text-2xl font-black text-[#14243A] tabular-nums">74.2%</div>
            <span className="text-[11px] text-stone-500">Above Southeast Asia MOOC average</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-1">
            <span className="text-xs text-stone-500 font-medium">Verified Certificates Issued</span>
            <div className="text-2xl font-black text-[#14243A] tabular-nums">412</div>
            <span className="text-[11px] text-[#A9874B] font-semibold">100% Cryptographic verifiable</span>
          </div>
        </div>
      )}

      {activeAdminTab === 'roles' && user.role === 'owner' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs p-6 space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-[#A9874B]" />
              <h3 className="font-bold text-sm text-[#14243A]">
                Founder & Super Admin: Staff Authorization Delegation
              </h3>
            </div>
            <p className="text-xs text-stone-500">
              Only your verified Founder account (<code className="font-mono text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded">lyrakaelin@gmail.com</code>) has authority to appoint Administrators and approve Instructors. Public users cannot register for privileged roles.
            </p>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!roleEmail.trim()) return;
              setIsPromotingRole(true);
              setRoleActionStatus(null);

              try {
                const res = await fetch('/api/admin/promote-role', {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({
                    targetEmail: roleEmail.trim().toLowerCase(),
                    newRole: roleToAssign,
                  }),
                });
                const data = await res.json();
                if (res.ok && data.success) {
                  setRoleActionStatus({ type: 'success', message: data.message });
                  setRoleEmail('');
                } else {
                  setRoleActionStatus({ type: 'error', message: data.error || 'Role authorization failed.' });
                }
              } catch {
                setRoleActionStatus({ type: 'error', message: 'Failed to contact authorization endpoint.' });
              } finally {
                setIsPromotingRole(false);
              }
            }}
            className="max-w-xl space-y-4 bg-stone-50 p-5 rounded-2xl border border-stone-200"
          >
            <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider">
              Authorize User Role
            </h4>

            {roleActionStatus && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  roleActionStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {roleActionStatus.message}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target User Email
              </label>
              <input
                type="email"
                required
                value={roleEmail}
                onChange={(e) => setRoleEmail(e.target.value)}
                placeholder="registered-user@pyinnyarhub.edu.mm"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#14243A] outline-hidden bg-white"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                User must already have registered an account before role elevation.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Designated Authorization Role
              </label>
              <select
                value={roleToAssign}
                onChange={(e) => setRoleToAssign(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#14243A] outline-hidden bg-white font-medium"
              >
                <option value="instructor">Instructor (Course creation & student grading authority)</option>
                <option value="admin">Administrator (Platform operations & slip verification)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPromotingRole}
              className="px-5 py-2.5 bg-[#14243A] hover:bg-[#1E3452] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {isPromotingRole ? 'Verifying & Updating...' : 'Authorize Staff Role'}
            </button>
          </form>
        </div>
      )}

      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-bold text-base text-[#14243A]">
                {editingCourse ? 'Edit Course Details' : 'Create New Course Program'}
              </h3>
              <button onClick={() => setIsCourseModalOpen(false)}>
                <X className="w-5 h-5 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Course Title (English)</label>
                <input
                  type="text"
                  value={cTitle}
                  onChange={(e) => setCTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Course Title (Myanmar)</label>
                <input
                  type="text"
                  value={cTitleMy}
                  onChange={(e) => setCTitleMy(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Category (1-30)</label>
                  <select
                    value={cCategoryId}
                    onChange={(e) => setCCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.number}. {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    value={cSubcategory}
                    onChange={(e) => setCSubcategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                    placeholder="e.g. Web Development"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description (English)</label>
                <textarea
                  rows={3}
                  value={cDesc}
                  onChange={(e) => setCDesc(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description (Myanmar)</label>
                <textarea
                  rows={2}
                  value={cDescMy}
                  onChange={(e) => setCDescMy(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={cDuration}
                    onChange={(e) => setCDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Level</label>
                  <select
                    value={cLevel}
                    onChange={(e) => setCLevel(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Type</label>
                  <select
                    value={cType}
                    onChange={(e) => setCType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="free">Free</option>
                    <option value="paid">Short Course</option>
                    <option value="certificate">Professional Certificate</option>
                  </select>
                </div>
              </div>

              {cType !== 'free' && (
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Price (MMK)</label>
                  <input
                    type="number"
                    value={cPriceMMK}
                    onChange={(e) => setCPriceMMK(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#14243A] text-white hover:bg-[#1E3452] rounded-xl font-bold"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
