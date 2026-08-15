import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  BarChart2,
  Trash2,
  Award,
  ChevronRight,
  Edit2,
  Check,
  X
} from 'lucide-react';
import { calculateAcademicAnalytics } from '../../utils/analyticsCalculators';

export const AcademicDashboard = () => {
  const { data, addCourse, updateCourseAttendance, updateAcademicGpa, addAssignment, toggleAssignmentStatus, setActiveTab, setAnalyticsCategory } = useTracker();
  const analytics = calculateAcademicAnalytics(data.academic, data.activityLogs);

  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);

  // New Course State
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [credits, setCredits] = useState(4);
  const [faculty, setFaculty] = useState('');
  const [attendance, setAttendance] = useState(85);
  const [targetGrade, setTargetGrade] = useState('A+');

  // New Assignment State
  const [assignCourse, setAssignCourse] = useState(data.academic?.courses[0]?.code || 'CS701');
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
  const [assignPriority, setAssignPriority] = useState('High');
  const [assignMaxScore, setAssignMaxScore] = useState(20);

  // GPA Edit State
  const [isEditingGpa, setIsEditingGpa] = useState(false);
  const [currentGpaInput, setCurrentGpaInput] = useState(data.academic?.currentEstimatedGpa ?? 0.0);
  const [targetGpaInput, setTargetGpaInput] = useState(data.academic?.targetGpa ?? 9.2);

  const handleSaveGpa = (e) => {
    e.preventDefault();
    updateAcademicGpa(currentGpaInput, targetGpaInput);
    setIsEditingGpa(false);
  };

  const handleAddCourse = (e) => {
    e.preventDefault();
    if (!courseCode.trim() || !courseName.trim()) return;
    addCourse({
      code: courseCode.trim().toUpperCase(),
      name: courseName.trim(),
      credits: Number(credits),
      faculty: faculty.trim() || 'Faculty Dept',
      attendance: Number(attendance),
      targetGrade: targetGrade || 'A+'
    });
    setCourseCode('');
    setCourseName('');
    setIsAddingCourse(false);
  };

  const handleAddAssignment = (e) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignDueDate) return;
    addAssignment({
      courseCode: assignCourse,
      title: assignTitle.trim(),
      dueDate: assignDueDate,
      priority: assignPriority,
      maxScore: Number(assignMaxScore)
    });
    setAssignTitle('');
    setAssignDueDate('');
    setIsAddingAssignment(false);
  };

  const goToAcademicAnalytics = () => {
    setAnalyticsCategory('academic');
    setActiveTab('analytics');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 rounded-3xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Academic Preparation & Semester Hub</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                {data.academic?.semester || 'Semester 7'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Coursework Mastery, Assignment Submissions & Attendance Tracker
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToAcademicAnalytics}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-semibold transition"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Academic Analytics</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated GPA Card with Edit capability */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5 relative group">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-medium">Estimated Semester GPA</div>
            {!isEditingGpa && (
              <button
                onClick={() => {
                  setCurrentGpaInput(data.academic?.currentEstimatedGpa ?? 0.0);
                  setTargetGpaInput(data.academic?.targetGpa ?? 9.2);
                  setIsEditingGpa(true);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition text-[11px] flex items-center gap-1"
                title="Edit Current GPA & Target Goal"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span className="text-[10px]">Edit</span>
              </button>
            )}
          </div>

          {!isEditingGpa ? (
            <>
              <div className="text-2xl font-bold text-white font-mono mt-1 flex items-baseline gap-1">
                <span>{data.academic?.currentEstimatedGpa ?? 0.0}</span>
                <span className="text-xs text-slate-400 font-normal">/ 10</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-2 flex items-center justify-between">
                <span>Target Goal: <strong className="font-mono">{data.academic?.targetGpa ?? 9.2}</strong></span>
              </div>
            </>
          ) : (
            <form onSubmit={handleSaveGpa} className="mt-2 space-y-2 animate-fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Current GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={currentGpaInput}
                    onChange={(e) => setCurrentGpaInput(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Goal GPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={targetGpaInput}
                    onChange={(e) => setTargetGpaInput(e.target.value)}
                    className="w-full bg-slate-900 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsEditingGpa(false)}
                  className="px-2 py-1 rounded-lg text-[10px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-semibold flex items-center gap-1 shadow-sm transition"
                >
                  <Check className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Avg Attendance */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">Average Attendance</div>
          <div className={`text-2xl font-bold font-mono mt-1 ${analytics.avgAttendance < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {analytics.avgAttendance}%
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            {analytics.avgAttendance >= 75 ? (
              <span className="text-emerald-400">✓ Safe above 75% threshold</span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Danger: Below 75%</span>
            )}
          </div>
        </div>

        {/* Assignments Turnaround */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">Assignment Submissions</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {analytics.completedAssignments} / {analytics.totalAssignments}
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${analytics.assignmentTurnaround}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5">
            {analytics.assignmentTurnaround}% completed on time
          </div>
        </div>

        {/* Active Courses */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <div className="text-xs text-slate-400 font-medium">Registered Courses</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {(data.academic?.courses || []).length} Subjects
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Total {(data.academic?.courses || []).reduce((a, c) => a + c.credits, 0)} Academic Credits
          </div>
        </div>
      </div>

      {/* Main Grid: Courses (Left) vs Assignments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6 Cols: Courses & Attendance Manager */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Semester Courses & Attendance</h3>
            </div>
            <button
              onClick={() => setIsAddingCourse(!isAddingCourse)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Course</span>
            </button>
          </div>

          {/* Add Course Form */}
          {isAddingCourse && (
            <form onSubmit={handleAddCourse} className="glass-panel p-4 rounded-2xl border border-emerald-500/30 space-y-3 animate-slide-up">
              <h4 className="text-xs font-semibold text-white">Add New Semester Course</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. CS705)"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-emerald-500"
                  required
                />
                <input
                  type="text"
                  placeholder="Course Name"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Credits</label>
                  <input
                    type="number"
                    value={credits}
                    onChange={(e) => setCredits(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Attendance %</label>
                  <input
                    type="number"
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Target Grade</label>
                  <input
                    type="text"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingCourse(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Course
                </button>
              </div>
            </form>
          )}

          {/* Courses List */}
          <div className="space-y-3">
            {(data.academic?.courses || []).map((course) => {
              const isLow = course.attendance < 75;
              return (
                <div key={course.id} className="glass-panel p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                          {course.code}
                        </span>
                        <h4 className="font-semibold text-xs sm:text-sm text-white">{course.name}</h4>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Instructor: {course.faculty} • {course.credits} Credits • Target: <strong className="text-emerald-400">{course.targetGrade}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Bar & Quick Adjuster */}
                  <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Attendance Record:</span>
                      <span className={`font-mono font-bold ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {course.attendance}% {isLow && '⚠️ Warning!'}
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${course.attendance}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400">Min 75% required for exam</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => updateCourseAttendance(course.id, Math.max(0, course.attendance - 2))}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded"
                        >
                          -2%
                        </button>
                        <button
                          onClick={() => updateCourseAttendance(course.id, Math.min(100, course.attendance + 2))}
                          className="px-2 py-0.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs rounded font-medium"
                        >
                          +2%
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 6 Cols: Assignments & Project Deadlines */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Assignments & Course Projects</h3>
            </div>
            <button
              onClick={() => setIsAddingAssignment(!isAddingAssignment)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Assignment</span>
            </button>
          </div>

          {/* Add Assignment Form */}
          {isAddingAssignment && (
            <form onSubmit={handleAddAssignment} className="glass-panel p-4 rounded-2xl border border-emerald-500/30 space-y-3 animate-slide-up">
              <h4 className="text-xs font-semibold text-white">Record New Assignment</h4>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={assignCourse}
                  onChange={(e) => setAssignCourse(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                >
                  {(data.academic?.courses || []).map((c) => (
                    <option key={c.id} value={c.code}>{c.code} - {c.name}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={assignDueDate}
                  onChange={(e) => setAssignDueDate(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Assignment Title (e.g. Socket Programming Lab 2)"
                value={assignTitle}
                onChange={(e) => setAssignTitle(e.target.value)}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Priority</label>
                  <select
                    value={assignPriority}
                    onChange={(e) => setAssignPriority(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={assignMaxScore}
                    onChange={(e) => setAssignMaxScore(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingAssignment(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {/* Assignments List */}
          <div className="space-y-3">
            {(data.academic?.assignments || []).map((assign) => {
              const priorityColors = {
                High: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                Medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                Low: 'bg-slate-700 text-slate-300 border-slate-600'
              };

              return (
                <div
                  key={assign.id}
                  className={`glass-panel p-4 rounded-2xl border transition ${
                    assign.status === 'Completed' ? 'border-white/5 opacity-70' : 'border-emerald-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <button
                        onClick={() => toggleAssignmentStatus(assign.id)}
                        className="mt-0.5 shrink-0"
                      >
                        {assign.status === 'Completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <div className="w-5 h-5 rounded-lg border border-slate-600 hover:border-emerald-400" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono font-semibold">
                            {assign.courseCode}
                          </span>
                          <h4 className={`text-xs font-semibold ${assign.status === 'Completed' ? 'line-through text-slate-400' : 'text-white'}`}>
                            {assign.title}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-emerald-400" /> Due: {assign.dueDate}
                          </span>
                          <span>•</span>
                          <span>Max: {assign.maxScore} pts</span>
                          {assign.grade !== null && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400 font-bold">Grade: {assign.grade}/{assign.maxScore}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${priorityColors[assign.priority]}`}>
                        {assign.priority}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
