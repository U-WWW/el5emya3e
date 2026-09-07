import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { 
  UserPlus, 
  X, 
  Sparkles, 
  Check, 
  Copy, 
  Phone, 
  Key, 
  GraduationCap, 
  Users, 
  RefreshCw,
  Send,
  CheckCircle2
} from 'lucide-react';

interface AdminAddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentAdded: (student: any) => void;
  centerGroups: any[];
}

const CLASS_OPTIONS = [
  "الصف الأول الابتدائي",
  "الصف الثاني الابتدائي",
  "الصف الثالث الابتدائي",
  "الصف الرابع الابتدائي",
  "الصف الخامس الابتدائي",
  "الصف السادس الابتدائي",
  "الصف الأول الإعدادي",
  "الصف الثاني الإعدادي",
  "الصف الثالث الإعدادي",
  "الصف الأول الثانوي",
  "الصف الثاني الثانوي",
  "الصف الثالث الثانوي"
];

export default function AdminAddStudentModal({
  isOpen,
  onClose,
  onStudentAdded,
  centerGroups
}: AdminAddStudentModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [className, setClassName] = useState('الصف الأول الثانوي');
  const [groupName, setGroupName] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdStudent, setCreatedStudent] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Generate random 5-digit code and 4-digit password
  const generateUniqueCredentials = async () => {
    const randomCode = Math.floor(10000 + Math.random() * 90000).toString();
    const randomPass = Math.floor(1000 + Math.random() * 9000).toString();
    setCode(randomCode);
    setPassword(randomPass);
  };

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('');
      setParentPhone('');
      setClassName('الصف الأول الثانوي');
      setGroupName(centerGroups.length > 0 ? centerGroups[0].group_name : 'مجموعة السبت والثلثاء');
      setError('');
      setCreatedStudent(null);
      setCopied(false);
      generateUniqueCredentials();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanCode = code.trim().replace(/\D/g, '') || code.trim();
    const cleanPass = password.trim();

    if (!cleanName || !cleanPhone || !cleanCode || !cleanPass) {
      setError('يرجى ملء جميع الحقول الإلزامية (الاسم، الهاتف، الكود، كلمة المرور)');
      setIsSubmitting(false);
      return;
    }

    try {
      // Verify code is not duplicate
      const codeSnap = await getDocs(query(collection(db, 'students'), where('code', '==', cleanCode)));
      if (!codeSnap.empty) {
        setError(`كود الطالب (${cleanCode}) مستخدم بالفعل لطالب آخر! يرجى اختيار كود آخر.`);
        setIsSubmitting(false);
        return;
      }

      // Verify password is not duplicate
      const passSnap = await getDocs(query(collection(db, 'students'), where('password', '==', cleanPass)));
      if (!passSnap.empty) {
        setError(`كلمة المرور (${cleanPass}) مستخدمة بالفعل لطالب آخر! يرجى توليد كلمة مرور أخرى.`);
        setIsSubmitting(false);
        return;
      }

      const newStudentDoc = {
        name: cleanName,
        phone: cleanPhone,
        parent_phone: parentPhone.trim() || cleanPhone,
        class_name: className,
        group_name: groupName || 'مجموعة عامة',
        code: cleanCode,
        password: cleanPass,
        status: 'approved',
        is_approved: true,
        total_score: 0,
        badges: ['Iron Recruit'],
        avatar: 'spiderman',
        createdAt: new Date().toISOString(),
        added_by_admin: true
      };

      const docRef = await addDoc(collection(db, 'students'), newStudentDoc);
      const studentObj = { id: docRef.id, ...newStudentDoc };
      
      setCreatedStudent(studentObj);
      onStudentAdded(studentObj);
    } catch (err: any) {
      setError('حدث خطأ أثناء حفظ بيانات الطالب: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCredentials = () => {
    if (!createdStudent) return;
    const text = `أهلاً بك يا ${createdStudent.name} في منصة الخيميائي للعلوم والكيمياء 🧪\nبيانات دخولك المعتمدة:\n- كود الطالب: ${createdStudent.code}\n- كلمة المرور: ${createdStudent.password}\n- الصف: ${createdStudent.class_name}\n- المجموعة: ${createdStudent.group_name}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sendWhatsApp = () => {
    if (!createdStudent) return;
    const rawPhone = createdStudent.phone.replace(/\D/g, '');
    const finalPhone = rawPhone.startsWith('2') ? rawPhone : `2${rawPhone}`;
    const text = encodeURIComponent(`أهلاً بك يا ${createdStudent.name} في منصة الخيميائي للعلوم والكيمياء 🧪\nبيانات دخولك المعتمدة:\n- كود الطالب: ${createdStudent.code}\n- كلمة المرور: ${createdStudent.password}\n- الصف: ${createdStudent.class_name}\n- المجموعة: ${createdStudent.group_name}`);
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden text-right">
        
        {/* Header */}
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
                <span>إضافة طالب يدوياً</span>
                <UserPlus className="w-6 h-6 text-emerald-500" />
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                إضافة طالب جديد واعتماده وتفعيل حسابه فوراً بالمنصة
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {createdStudent ? (
            /* Success State */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 border-2 border-emerald-500 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  تمت إضافة واعتماد الطالب بنجاح! 🎉
                </h4>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                  تم تسجيل الحساب وتفعيله فوراً، يمكنك نسخ بيانات الدخول وإرسالها للطالب
                </p>
              </div>

              {/* Student Card Info */}
              <div className="bg-[#fdf6e3] text-stone-900 p-5 rounded-2xl border border-amber-900/20 shadow-inner text-right space-y-3">
                <div className="border-b border-stone-900/10 pb-2 flex items-center justify-between">
                  <span className="text-xs font-black text-amber-900">بيانات دخول الطالب المعتمدة</span>
                  <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">مفعل ومعتمد ✅</span>
                </div>
                <div className="text-base font-black text-stone-900">{createdStudent.name}</div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-white/60 p-2.5 rounded-xl border border-stone-900/10">
                    <span className="text-[10px] font-black text-stone-500 block">كود الطالب:</span>
                    <span className="text-lg font-mono font-black text-amber-700">{createdStudent.code}</span>
                  </div>
                  <div className="bg-white/60 p-2.5 rounded-xl border border-stone-900/10">
                    <span className="text-[10px] font-black text-stone-500 block">كلمة المرور:</span>
                    <span className="text-lg font-mono font-black text-stone-900">{createdStudent.password}</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-stone-600 pt-1">
                  المرحلة: {createdStudent.class_name} • المجموعة: {createdStudent.group_name}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  onClick={copyCredentials}
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 font-black rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'تم النسخ للحافظة!' : 'نسخ بيانات الدخول 📋'}</span>
                </button>
                <button
                  onClick={sendWhatsApp}
                  className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال واتساب 💬</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setCreatedStudent(null);
                    setName('');
                    setPhone('');
                    setParentPhone('');
                    generateUniqueCredentials();
                  }}
                  className="text-xs font-black text-cyan-600 hover:text-cyan-500 underline transition"
                >
                  + إضافة طالب آخر يدوياً
                </button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 font-bold text-xs">
                  {error}
                </div>
              )}

              {/* Student Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  اسم الطالب ثلاثي بالكامل *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف أحمد محمد"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-bold outline-none transition"
                />
              </div>

              {/* Phone numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    رقم هاتف الطالب *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="01012345678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-bold outline-none transition text-left font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    رقم هاتف ولي الأمر (اختياري)
                  </label>
                  <input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-bold outline-none transition text-left font-mono"
                  />
                </div>
              </div>

              {/* Grade & Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    الصف الدراسي *
                  </label>
                  <select
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-bold outline-none transition cursor-pointer"
                  >
                    {CLASS_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                    المجموعة (السنتر / اليوم) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مجموعة السبت والثلثاء"
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    list="groups-list"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-cyan-500 text-slate-900 dark:text-white rounded-xl p-3 text-sm font-bold outline-none transition"
                  />
                  <datalist id="groups-list">
                    {centerGroups.map(g => (
                      <option key={g.id} value={g.group_name} />
                    ))}
                    <option value="مجموعة السبت والثلثاء" />
                    <option value="مجموعة الأحد والأربعاء" />
                    <option value="مجموعة الإثنين والخميس" />
                    <option value="مجموعة الجمعة" />
                  </datalist>
                </div>
              </div>

              {/* Unique Code & Password (Auto-generated) */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={generateUniqueCredentials}
                    className="text-xs font-black text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>توليد كود وباسورد عشوائي جديد 🎲</span>
                  </button>
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300">بيانات تسجيل الدخول:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-1">
                      كود الطالب الفريد (5 أرقام) *
                    </label>
                    <input
                      type="text"
                      required
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-black text-amber-600 rounded-lg p-2 text-center text-base outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 mb-1">
                      كلمة المرور (Password) *
                    </label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono font-black text-slate-900 dark:text-white rounded-lg p-2 text-center text-base outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-base transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>جاري حفظ واعتماد الطالب...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>حفظ واعتماد الطالب فوراً ✅</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
