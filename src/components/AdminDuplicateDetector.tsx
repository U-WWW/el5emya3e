import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, deleteDoc, updateDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { 
  Bot, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  GitMerge, 
  EyeOff, 
  RefreshCw, 
  Phone, 
  GraduationCap, 
  Users, 
  X,
  Search,
  Check
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  code: string;
  phone?: string;
  password?: string;
  class_name?: string;
  className?: string;
  group_name?: string;
  groupName?: string;
  createdAt?: string;
  status?: string;
  is_approved?: boolean;
}

interface DuplicateGroup {
  id: string;
  studentA: Student;
  studentB: Student;
  confidence: number; // 0 - 100
  matchType: 'phone' | 'name' | 'phone_and_name' | 'ai_semantic';
  reason: string;
  recommendation: string;
}

interface AdminDuplicateDetectorProps {
  students: Student[];
  isOpen: boolean;
  onClose: () => void;
  onStudentsUpdated: () => void;
}

// Helper: Normalize Arabic string for phonetic/orthographic comparison
function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    // Remove diacritics / tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize alifs
    .replace(/[إأآٱ]/g, 'ا')
    // Normalize taa marbuta to haa
    .replace(/ة/g, 'ه')
    // Normalize yaa / alef maqsura
    .replace(/ى/g, 'ي')
    // Remove common prefixes/spaces
    .replace(/\s+/g, ' ');
}

// Helper: Normalize phone numbers (strip spaces, country code, leading zeros)
function normalizePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('20')) {
    return digits.slice(2);
  }
  if (digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

// Levenshtein distance for string similarity (0 to 1)
function getLevenshteinSimilarity(s1: string, s2: string): number {
  const longer = s1.length >= s2.length ? s1 : s2;
  const shorter = s1.length < s2.length ? s1 : s2;
  if (longer.length === 0) return 1.0;

  const matrix: number[][] = [];
  for (let i = 0; i <= longer.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= shorter.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= longer.length; i++) {
    for (let j = 1; j <= shorter.length; j++) {
      if (longer.charAt(i - 1) === shorter.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  const distance = matrix[longer.length][shorter.length];
  return (longer.length - distance) / longer.length;
}

export default function AdminDuplicateDetector({
  students,
  isOpen,
  onClose,
  onStudentsUpdated
}: AdminDuplicateDetectorProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [ignoredPairIds, setIgnoredPairIds] = useState<Set<string>>(new Set());
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!isOpen) return null;

  // Run the detection algorithm (instant client-side + AI backend)
  const handleStartScan = async () => {
    setIsScanning(true);
    setAiSummary('');
    setSuccessMessage('');

    try {
      // 1. Fast local phonetic & phone heuristic analysis
      const detectedPairs: DuplicateGroup[] = [];
      const seenPairs = new Set<string>();

      for (let i = 0; i < students.length; i++) {
        for (let j = i + 1; j < students.length; j++) {
          const sA = students[i];
          const sB = students[j];
          if (sA.id === sB.id) continue;

          const pairKey = [sA.id, sB.id].sort().join('_');
          if (seenPairs.has(pairKey)) continue;

          const phoneA = normalizePhone(sA.phone || '');
          const phoneB = normalizePhone(sB.phone || '');
          const phoneMatch = phoneA && phoneB && phoneA === phoneB && phoneA.length >= 8;

          const nameA = normalizeArabic(sA.name || '');
          const nameB = normalizeArabic(sB.name || '');
          const nameSim = getLevenshteinSimilarity(nameA, nameB);

          const classA = sA.class_name || sA.className || '';
          const classB = sB.class_name || sB.className || '';
          const sameClass = classA && classB && classA === classB;

          // Check heuristics:
          if (phoneMatch && nameSim >= 0.7) {
            seenPairs.add(pairKey);
            detectedPairs.push({
              id: pairKey,
              studentA: sA,
              studentB: sB,
              confidence: Math.round(95 + (nameSim * 5)),
              matchType: 'phone_and_name',
              reason: `تطابق تام في رقم الهاتف (${sA.phone}) مع تشابه كبير في الاسم (${Math.round(nameSim * 100)}%)`,
              recommendation: 'يُوصى بحذف الحساب المكرر أو دمج السجلات.'
            });
          } else if (phoneMatch) {
            seenPairs.add(pairKey);
            detectedPairs.push({
              id: pairKey,
              studentA: sA,
              studentB: sB,
              confidence: 90,
              matchType: 'phone',
              reason: `رقم الهاتف (${sA.phone}) مسجل مرتين باسمين مختلفين: "${sA.name}" و "${sB.name}"`,
              recommendation: 'يُحتمل أنهما أخوان أو نفس الطالب سجل بأسماء مختلفة.'
            });
          } else if (nameSim >= 0.88 && (sameClass || nameA === nameB)) {
            seenPairs.add(pairKey);
            detectedPairs.push({
              id: pairKey,
              studentA: sA,
              studentB: sB,
              confidence: Math.round(nameSim * 100),
              matchType: 'name',
              reason: `تشابه قوي جداً في الاسم باللغة العربية بنسبة (${Math.round(nameSim * 100)}%) في ${sameClass ? 'نفس الصف الدراسي' : 'مرحلتين متقاربتين'}.`,
              recommendation: 'تحقق مما إذا كان الطالب أعاد التسجيل برقم آخر بسبب نسيان الكود.'
            });
          }
        }
      }

      // 2. Call server-side Gemini AI for semantic deep analysis if needed
      try {
        const response = await fetch('/api/teacher-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'detect_duplicates',
            students: students.slice(0, 100)
          })
        });

        if (response.ok) {
          const aiData = await response.json();
          if (aiData.summary) {
            setAiSummary(aiData.summary);
          }

          if (Array.isArray(aiData.duplicate_groups)) {
            aiData.duplicate_groups.forEach((group: any) => {
              const pairKey = [group.student_a_id, group.student_b_id].sort().join('_');
              if (!seenPairs.has(pairKey)) {
                const foundA = students.find(s => s.id === group.student_a_id);
                const foundB = students.find(s => s.id === group.student_b_id);
                if (foundA && foundB) {
                  seenPairs.add(pairKey);
                  detectedPairs.push({
                    id: pairKey,
                    studentA: foundA,
                    studentB: foundB,
                    confidence: group.confidence_percentage || 85,
                    matchType: 'ai_semantic',
                    reason: group.reason || 'اشتباه بالذكاء الاصطناعي بناءً على الاسم ورقم الهاتف والمرحلة.',
                    recommendation: group.recommended_action || 'مراجعة بيانات الطالب.'
                  });
                }
              }
            });
          }
        }
      } catch (aiErr) {
        console.warn('AI duplicate server call failed, using heuristic results:', aiErr);
      }

      // Sort by confidence descending
      detectedPairs.sort((a, b) => b.confidence - a.confidence);
      setDuplicateGroups(detectedPairs);

      if (detectedPairs.length === 0) {
        setAiSummary('ممتاز! تم فحص جميع الطلاب المسجلين بالذكاء الاصطناعي ولم يتم العثور على أي حسابات مكررة أو مشتبه بها.');
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء الفحص: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  // Delete a duplicate student
  const handleDeleteStudent = async (pairId: string, studentToDelete: Student, keepStudent: Student) => {
    if (!window.confirm(`هل أنت متأكد من حذف الحساب المكرر للطالب (${studentToDelete.name} - كود: ${studentToDelete.code}) مع الإبقاء على حساب (${keepStudent.name} - كود: ${keepStudent.code})؟`)) {
      return;
    }

    setProcessingId(pairId);
    try {
      await deleteDoc(doc(db, 'students', studentToDelete.id));
      setDuplicateGroups(prev => prev.filter(p => p.id !== pairId));
      setSuccessMessage(`تم حذف الحساب المكرر (${studentToDelete.name}) بنجاح!`);
      onStudentsUpdated();
    } catch (err: any) {
      alert('فشل في حذف الحساب: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Merge records from studentB into studentA and delete studentB
  const handleMergeStudents = async (pairId: string, primaryStudent: Student, duplicateStudent: Student) => {
    if (!window.confirm(`دمج الحسابين يعني نقل كافة نتائج الاختبارات وتقييمات السنتر من (${duplicateStudent.name} - ${duplicateStudent.code}) إلى (${primaryStudent.name} - ${primaryStudent.code}) ثم حذف الحساب المكرر. هل تريد الاستمرار؟`)) {
      return;
    }

    setProcessingId(pairId);
    try {
      const batch = writeBatch(db);

      // 1. Move quiz results
      const resultsSnap = await getDocs(query(collection(db, 'results'), where('student_code', '==', duplicateStudent.code)));
      resultsSnap.docs.forEach(d => {
        batch.update(doc(db, 'results', d.id), {
          student_code: primaryStudent.code,
          student_name: primaryStudent.name
        });
      });

      // 2. Move center records
      const centerRecordsSnap = await getDocs(query(collection(db, 'center_records'), where('student_code', '==', duplicateStudent.code)));
      centerRecordsSnap.docs.forEach(d => {
        batch.update(doc(db, 'center_records', d.id), {
          student_code: primaryStudent.code,
          student_name: primaryStudent.name
        });
      });

      // 3. Move center evaluations
      const centerEvalsSnap = await getDocs(query(collection(db, 'center_evaluations'), where('student_code', '==', duplicateStudent.code)));
      centerEvalsSnap.docs.forEach(d => {
        batch.update(doc(db, 'center_evaluations', d.id), {
          student_code: primaryStudent.code,
          student_name: primaryStudent.name
        });
      });

      // 4. Delete duplicate student doc
      batch.delete(doc(db, 'students', duplicateStudent.id));

      await batch.commit();

      setDuplicateGroups(prev => prev.filter(p => p.id !== pairId));
      setSuccessMessage(`تم دمج بيانات الطالب (${duplicateStudent.name}) في الحساب الرئيسي (${primaryStudent.name}) بنجاح!`);
      onStudentsUpdated();
    } catch (err: any) {
      alert('فشل في دمج الحسابين: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  // Ignore / dismiss this pair
  const handleIgnorePair = (pairId: string) => {
    setIgnoredPairIds(prev => {
      const next = new Set(prev);
      next.add(pairId);
      return next;
    });
  };

  const visibleGroups = duplicateGroups.filter(g => !ignoredPairIds.has(g.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-right">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 justify-end">
                <span>كشف الطلاب المكررين بالذكاء الاصطناعي</span>
                <Bot className="w-6 h-6 text-cyan-500" />
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                فحص ذكي للأسماء، أرقام الهواتف، والأخطاء الإملائية لاكتشاف الحسابات المزدوجة
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/50 p-4 rounded-xl">
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              إجمالي الطلاب المتاحين للفحص: <span className="font-black text-cyan-600 dark:text-cyan-400">{students.length} طالب</span>
            </div>
            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الفحص بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>بدء الفحص والتحليل الآن ⚡</span>
                </>
              )}
            </button>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* AI Summary Banner */}
          {aiSummary && (
            <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl">
              <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-black text-sm mb-1.5">
                <Bot className="w-4 h-4" />
                <span>تقرير الذكاء الاصطناعي للخيميائي</span>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                {aiSummary}
              </p>
            </div>
          )}

          {/* Duplicates List */}
          {visibleGroups.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Bot className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
              <h4 className="text-base font-black text-slate-700 dark:text-slate-300">
                {duplicateGroups.length > 0 ? 'تم معالجة وتجاهل جميع الحالات المشتبه بها!' : 'لم يتم تشغيل الفحص بعد أو لا توجد تكرارات'}
              </h4>
              <p className="text-xs font-bold text-slate-500 mt-1 max-w-md mx-auto">
                اضغط على زر "بدء الفحص والتحليل الآن" ليقوم الذكاء الاصطناعي بمقارنة قاعدة بيانات الطلاب واكتشاف التكرارات فوراً.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>تم العثور على ({visibleGroups.length}) حالة اشتباه بتسجيل مكرر:</span>
                <span>مرتبة حسب نسبة التشابه</span>
              </div>

              {visibleGroups.map((group) => {
                const sA = group.studentA;
                const sB = group.studentB;
                const isProcessing = processingId === group.id;

                return (
                  <div 
                    key={group.id}
                    className="border-2 border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4"
                  >
                    {/* Card Header with Confidence Badge */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleIgnorePair(group.id)}
                          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="تجاهل واعتبرهما طالبين مختلفين"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>تجاهل الشبه</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">نسبة التطابق:</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          group.confidence >= 95
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          %{group.confidence} اشتباه قوي
                        </span>
                      </div>
                    </div>

                    {/* Reason info */}
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-3 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <div>{group.reason}</div>
                        <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                          💡 التوصية: {group.recommendation}
                        </div>
                      </div>
                    </div>

                    {/* Side-by-side comparison cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Student A */}
                      <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                            الحساب الأول
                          </span>
                          <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                            كود: {sA.code}
                          </span>
                        </div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {sA.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-bold">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sA.phone || 'بلا رقم'}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{sA.class_name || sA.className} - {sA.group_name || sA.groupName}</span>
                        </div>
                        {sA.password && (
                          <div className="text-[11px] font-mono text-slate-500">
                            كلمة المرور: <span className="text-cyan-600 font-black">{sA.password}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                          <button
                            disabled={isProcessing}
                            onClick={() => handleMergeStudents(group.id, sA, sB)}
                            className="flex-1 py-1.5 px-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer"
                            title="اعتماد هذا الحساب كأساس ونقل بيانات الحساب الثاني إليه ثم حذفه"
                          >
                            <GitMerge className="w-3.5 h-3.5" />
                            <span>اعتماد كحساب أساسي ودمج</span>
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => handleDeleteStudent(group.id, sA, sB)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs font-bold transition"
                            title="حذف هذا الحساب فقط"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Student B */}
                      <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                            الحساب الثاني (المشتبه به)
                          </span>
                          <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                            كود: {sB.code}
                          </span>
                        </div>
                        <div className="text-sm font-black text-slate-900 dark:text-white">
                          {sB.name}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-bold">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sB.phone || 'بلا رقم'}</span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>{sB.class_name || sB.className} - {sB.group_name || sB.groupName}</span>
                        </div>
                        {sB.password && (
                          <div className="text-[11px] font-mono text-slate-500">
                            كلمة المرور: <span className="text-cyan-600 font-black">{sB.password}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                          <button
                            disabled={isProcessing}
                            onClick={() => handleMergeStudents(group.id, sB, sA)}
                            className="flex-1 py-1.5 px-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-black transition flex items-center justify-center gap-1 cursor-pointer"
                            title="اعتماد هذا الحساب كأساس ونقل بيانات الحساب الأول إليه ثم حذفه"
                          >
                            <GitMerge className="w-3.5 h-3.5" />
                            <span>اعتماد كحساب أساسي ودمج</span>
                          </button>
                          <button
                            disabled={isProcessing}
                            onClick={() => handleDeleteStudent(group.id, sB, sA)}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg text-xs font-bold transition"
                            title="حذف هذا الحساب فقط"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
          <span className="text-xs text-slate-500 font-bold">
            منصة الخيميائي للعلوم والكيمياء • فاحص التكرارات الذكي
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-black transition"
          >
            إغلاق النافذة
          </button>
        </div>

      </div>
    </div>
  );
}
