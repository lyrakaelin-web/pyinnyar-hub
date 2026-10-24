import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../utils/translations';
import { Lesson, Quiz, Assignment } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  FileText,
  Download,
  HelpCircle,
  Award,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Send,
  Check,
  X,
  AlertCircle,
  Menu,
} from 'lucide-react';

export const LearningRoomView: React.FC = () => {
  const {
    selectedCourseId,
    selectedLessonId,
    courses,
    enrollments,
    language,
    selectLesson,
    markLessonComplete,
    updateLessonProgress,
    recordQuizAttempt,
    claimCertificate,
    selectCertificate,
    setCurrentView,
    openAiAssistant,
  } = useApp();

  const course = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const enrollment = enrollments[course.id];

  // Flatten all lessons
  const allLessons: Lesson[] = [];
  course.modules.forEach((mod) => {
    mod.lessons.forEach((l) => allLessons.push(l));
  });

  // Current lesson
  const currentLesson =
    allLessons.find((l) => l.id === selectedLessonId) ||
    allLessons[0] || {
      id: 'les_sample',
      title: 'Introduction to Core Principles',
      titleMy: 'အခြေခံသဘောတရားများ မိတ်ဆက်',
      duration: '15 min',
      durationSeconds: 900,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      summary: 'Foundational concepts and principles.',
      summaryMy: 'အခြေခံသဘောတရားများနှင့် အသုံးချနည်းများ။',
      notesMarkdown: '# Study Notes\nMastering foundational syntax, structure, and methodologies.',
      downloadableFiles: [{ name: 'Lecture_Guide.pdf', size: '1.4 MB', type: 'PDF' }],
    };

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const nextLesson = allLessons[currentIndex + 1];
  const prevLesson = allLessons[currentIndex - 1];

  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'downloads' | 'quiz' | 'assignment'>('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(currentLesson.durationSeconds || 600);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Quiz state
  const currentQuiz: Quiz | undefined = course.quizzes[0];
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // Assignment state
  const currentAssignment: Assignment | undefined = course.assignments[0];
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load last accessed time if any
  useEffect(() => {
    if (enrollment?.lastAccessedTimeSeconds && videoRef.current) {
      videoRef.current.currentTime = enrollment.lastAccessedTimeSeconds;
    }
  }, [currentLesson.id]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = Math.floor(videoRef.current.currentTime);
      setCurrentTime(cur);
      if (cur % 5 === 0) {
        updateLessonProgress(course.id, currentLesson.id, cur);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current && videoRef.current.duration) {
      setDuration(Math.floor(videoRef.current.duration));
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleCompleteCurrentLesson = () => {
    markLessonComplete(course.id, currentLesson.id);
    if (nextLesson) {
      selectLesson(nextLesson.id);
    }
  };

  const handleQuizSubmit = () => {
    if (!currentQuiz) return;
    let correctCount = 0;
    currentQuiz.questions.forEach((q) => {
      const studentAns = quizAnswers[q.id];
      if (studentAns !== undefined) {
        if (typeof q.correctAnswer === 'number') {
          if (Number(studentAns) === q.correctAnswer) correctCount++;
        } else {
          if (String(studentAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
            correctCount++;
          }
        }
      }
    });

    const percent = Math.round((correctCount / currentQuiz.questions.length) * 100);
    setQuizScore(percent);
    setQuizSubmitted(true);

    recordQuizAttempt({
      studentId: enrollment?.studentId || 'std_01',
      courseId: course.id,
      quizId: currentQuiz.id,
      score: percent,
      totalQuestions: currentQuiz.questions.length,
      passed: percent >= currentQuiz.passingScore,
      answers: quizAnswers,
    });
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentText.trim()) return;
    setAssignmentSubmitted(true);
  };

  const handleClaimCert = () => {
    const cert = claimCertificate(course.id);
    selectCertificate(cert.id);
  };

  const isCompleted = enrollment?.progressPercent === 100;

  return (
    <div className="space-y-4 pb-20">
      {/* Top Learning Navigation Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 shadow-xs flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentView('course_details')}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#14243A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{language === 'my' ? 'သင်ရိုးအချက်အလက်' : 'Course Overview'}</span>
        </button>

        <div className="text-center truncate px-2">
          <span className="text-[11px] text-stone-400 block truncate">{course.title}</span>
          <h2 className="text-xs sm:text-sm font-bold text-[#14243A] truncate">
            {language === 'my' && currentLesson.titleMy ? currentLesson.titleMy : currentLesson.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50"
            title="Toggle Curriculum List"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            onClick={() => openAiAssistant(true)}
            className="px-2.5 py-1.5 rounded-lg bg-[#F5F0E6] text-[#14243A] hover:bg-[#EBE2D3] border border-[#C7A66A]/40 text-xs font-bold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C7A66A]" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Player on Left, Curriculum Sidebar on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Video / Interactive Tabs */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player Card */}
          <div className="bg-black rounded-2xl overflow-hidden shadow-lg relative aspect-video flex items-center justify-center">
            <video
              ref={videoRef}
              src={currentLesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              playsInline
            />

            {/* Custom Play/Pause Overlay Control */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-[#C7A66A] text-[#14243A] flex items-center justify-center hover:bg-[#D8B77B] transition-transform active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <span className="tabular-nums font-mono text-[11px]">
                  {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} /{' '}
                  {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Playback speed toggle */}
                <button
                  onClick={() => {
                    const next = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 1.5 : 1;
                    setPlaybackRate(next);
                    if (videoRef.current) videoRef.current.playbackRate = next;
                  }}
                  className="px-2 py-0.5 rounded bg-white/20 hover:bg-white/30 text-[11px] font-mono"
                >
                  {playbackRate}x
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Lesson Sub-Navigation Tabs */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-2 flex items-center gap-1 overflow-x-auto text-xs shadow-xs">
            <button
              onClick={() => setActiveTab('video')}
              className={`px-3 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'video' ? 'bg-[#14243A] text-white font-semibold' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{t('learn.video_lesson', language)}</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'notes' ? 'bg-[#14243A] text-white font-semibold' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('learn.notes', language)}</span>
            </button>
            <button
              onClick={() => setActiveTab('downloads')}
              className={`px-3 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'downloads' ? 'bg-[#14243A] text-white font-semibold' : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('learn.downloads', language)}</span>
            </button>
            {course.quizzes.length > 0 && (
              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-3 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'quiz' ? 'bg-[#14243A] text-white font-semibold' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{t('learn.quiz', language)}</span>
              </button>
            )}
            {course.assignments.length > 0 && (
              <button
                onClick={() => setActiveTab('assignment')}
                className={`px-3 py-2 rounded-xl font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeTab === 'assignment' ? 'bg-[#14243A] text-white font-semibold' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{t('learn.assignment', language)}</span>
              </button>
            )}
          </div>

          {/* Tab Content Panes */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            {activeTab === 'video' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-[#14243A]">
                    {language === 'my' && currentLesson.titleMy ? currentLesson.titleMy : currentLesson.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed">
                    {language === 'my' && currentLesson.summaryMy ? currentLesson.summaryMy : currentLesson.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {prevLesson && (
                      <button
                        onClick={() => selectLesson(prevLesson.id)}
                        className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                      >
                        Previous Lesson
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleCompleteCurrentLesson}
                    className="px-4 py-2.5 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-semibold flex items-center gap-2 shadow-xs transition-transform active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#C7A66A]" />
                    <span>{t('learn.mark_completed', language)}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h3 className="font-bold text-sm text-[#14243A]">Module Study Notes</h3>
                  <button
                    onClick={() => {
                      alert('Notes downloaded for offline review.');
                    }}
                    className="text-xs text-[#A9874B] font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Notes</span>
                  </button>
                </div>

                <div className="prose prose-sm max-w-none text-stone-700 leading-relaxed text-xs sm:text-sm space-y-3">
                  <p className="font-semibold text-stone-900">
                    Key Definitions and Core Architecture
                  </p>
                  <p>
                    {currentLesson.summary}
                  </p>
                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 font-mono text-xs text-stone-800">
                    {currentLesson.notesMarkdown || '// Key Takeaway:\nAlways structure components around single responsibilities and maintain immutable state transitions.'}
                  </div>
                  <p className="text-stone-500 text-xs italic">
                    Offline Note: These study materials can be cached on your local device for low-bandwidth reading.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'downloads' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-[#14243A]">
                  Downloadable Exercises & Templates
                </h3>
                <div className="space-y-2">
                  {(currentLesson.downloadableFiles || [
                    { name: 'Lecture_Summary_CheatSheet.pdf', size: '1.4 MB', type: 'PDF' },
                    { name: 'Practice_Starter_Code.zip', size: '3.2 MB', type: 'ZIP' },
                  ]).map((file, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-stone-200 flex items-center justify-between hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#A9874B]" />
                        <div>
                          <span className="text-xs font-semibold text-[#14243A] block">{file.name}</span>
                          <span className="text-[11px] text-stone-400">{file.size} · {file.type}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Starting download for ${file.name}`)}
                        className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-white text-xs font-semibold text-stone-700 flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Smart Quiz System */}
            {activeTab === 'quiz' && currentQuiz && (
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-bold text-base text-[#14243A]">
                      {language === 'my' && currentQuiz.titleMy ? currentQuiz.titleMy : currentQuiz.title}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {currentQuiz.questions.length} Questions · Passing requirement: {currentQuiz.passingScore}%
                    </p>
                  </div>
                  {quizSubmitted && quizScore !== null && (
                    <div className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      quizScore >= currentQuiz.passingScore
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      Score: {quizScore}% {quizScore >= currentQuiz.passingScore ? '(Passed)' : '(Review)'}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {currentQuiz.questions.map((q, qIndex) => {
                    const studentAns = quizAnswers[q.id];
                    const isMultiple = q.type === 'multiple_choice' || q.type === 'true_false';
                    const isAnswered = studentAns !== undefined;

                    return (
                      <div key={q.id} className="p-4 rounded-xl border border-stone-200/90 bg-stone-50/60 space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#14243A] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                            {qIndex + 1}
                          </span>
                          <h4 className="font-semibold text-xs sm:text-sm text-[#14243A]">
                            {language === 'my' && q.questionMy ? q.questionMy : q.question}
                          </h4>
                        </div>

                        {/* Multiple Choice Options */}
                        {isMultiple && q.options && (
                          <div className="space-y-1.5 pl-7">
                            {q.options.map((opt, optIndex) => {
                              const isSelected = studentAns === optIndex;
                              const isCorrect = q.correctAnswer === optIndex;
                              let borderClass = 'border-stone-200 bg-white hover:border-stone-300';

                              if (quizSubmitted) {
                                if (isCorrect) borderClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold';
                                else if (isSelected && !isCorrect) borderClass = 'border-rose-400 bg-rose-50 text-rose-800';
                              } else if (isSelected) {
                                borderClass = 'border-[#14243A] bg-stone-100 font-semibold';
                              }

                              return (
                                <button
                                  key={optIndex}
                                  disabled={quizSubmitted}
                                  onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: optIndex }))}
                                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${borderClass}`}
                                >
                                  <span>{opt}</span>
                                  {quizSubmitted && isCorrect && (
                                    <Check className="w-4 h-4 text-emerald-600" />
                                  )}
                                  {quizSubmitted && isSelected && !isCorrect && (
                                    <X className="w-4 h-4 text-rose-500" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Short Answer input */}
                        {q.type === 'short_answer' && (
                          <div className="pl-7">
                            <input
                              type="text"
                              disabled={quizSubmitted}
                              value={(studentAns as string) || ''}
                              onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                              placeholder="Type your brief answer here..."
                              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
                            />
                          </div>
                        )}

                        {/* Instant Feedback / Explanation after submission */}
                        {quizSubmitted && (
                          <div className="mt-2 pl-7 p-3 rounded-lg bg-stone-100 text-xs text-stone-700 border-l-2 border-[#C7A66A]">
                            <span className="font-bold text-[#14243A] block mb-0.5">Explanation:</span>
                            {language === 'my' && q.explanationMy ? q.explanationMy : q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  {quizSubmitted ? (
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setQuizAnswers({});
                        setQuizScore(null);
                      }}
                      className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      {t('quiz.retry', language)}
                    </button>
                  ) : (
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length === 0}
                      className="px-5 py-2.5 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-semibold disabled:opacity-40 shadow-xs"
                    >
                      {t('quiz.submit', language)}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Assignments Tab */}
            {activeTab === 'assignment' && currentAssignment && (
              <div className="space-y-4">
                <div className="border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-base text-[#14243A]">
                    {language === 'my' && currentAssignment.titleMy ? currentAssignment.titleMy : currentAssignment.title}
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    {language === 'my' && currentAssignment.descriptionMy ? currentAssignment.descriptionMy : currentAssignment.description}
                  </p>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                  <span className="text-xs font-bold text-stone-700 block mb-1">Grading Rubric:</span>
                  <ul className="text-xs text-stone-600 space-y-1 list-disc pl-4">
                    {currentAssignment.rubric.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                {assignmentSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Assignment submitted successfully!</span>
                    </div>
                    <p className="text-emerald-700">
                      Instructor Daw Khin Sandar and Dr. Zaw Min Oo will review your submission and post feedback within 48 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAssignmentSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1">
                        Your Submission (GitHub Repository link or project description):
                      </label>
                      <textarea
                        rows={4}
                        value={assignmentText}
                        onChange={(e) => setAssignmentText(e.target.value)}
                        placeholder="Paste your code link, explanation of approach, or answers to rubric criteria..."
                        className="w-full p-3 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-[#C7A66A] focus:outline-none"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#14243A] text-white hover:bg-[#1E3452] text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-[#C7A66A]" />
                      <span>Submit Assignment</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Curriculum & Completion Checklist */}
        <div className={`space-y-4 ${isSidebarOpen ? 'block' : 'hidden lg:block'}`}>
          {/* Completion & Certificate Trigger Card */}
          <div className="bg-[#14243A] text-white rounded-2xl p-5 border border-white/10 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#C7A66A] font-semibold tracking-wide">
                Progress Status
              </span>
              <span className="font-bold text-sm tabular-nums text-white">
                {enrollment?.progressPercent || 0}%
              </span>
            </div>

            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#C7A66A] h-full rounded-full transition-all duration-300"
                style={{ width: `${enrollment?.progressPercent || 0}%` }}
              />
            </div>

            {isCompleted ? (
              <div className="pt-2">
                <button
                  onClick={handleClaimCert}
                  className="w-full py-2.5 rounded-xl bg-[#C7A66A] text-[#14243A] hover:bg-[#D8B77B] font-bold text-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-sm"
                >
                  <Award className="w-4 h-4 text-[#14243A]" />
                  <span>{t('learn.view_cert', language)}</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-white/70">
                Complete all lessons to generate your official verified PYINNYAR HUB certificate.
              </p>
            )}
          </div>

          {/* Syllabus Modules List */}
          <div className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs">
            <div className="p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-600">
                Course Syllabus
              </h3>
              <span className="text-xs text-stone-500 font-mono">
                {allLessons.length} Lessons
              </span>
            </div>

            <div className="divide-y divide-stone-100 max-h-[500px] overflow-y-auto">
              {course.modules.map((mod) => (
                <div key={mod.id}>
                  <div className="px-4 py-2 bg-stone-100/60 text-[11px] font-bold text-stone-600">
                    {language === 'my' && mod.titleMy ? mod.titleMy : mod.title}
                  </div>
                  {mod.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLesson.id;
                    const isDone = enrollment?.completedLessonIds?.includes(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson.id)}
                        className={`w-full px-4 py-3 text-left flex items-center justify-between gap-3 text-xs transition-colors ${
                          isActive
                            ? 'bg-[#F5F0E6] text-[#14243A] font-semibold border-l-2 border-[#C7A66A]'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          )}
                          <span className="truncate">
                            {language === 'my' && lesson.titleMy ? lesson.titleMy : lesson.title}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-400 shrink-0">{lesson.duration}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
