import { Type } from "@google/genai";
import { generateContentWithFallback } from "./_ai.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action, className, difficulty, topic, numQuestions, customText } = req.body || {};

    if (action !== "generate_quiz") {
      return res.status(400).json({ error: "إجراء غير معروف" });
    }

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "موضوع الاختبار مطلوب!" });
    }

    const count = Number(numQuestions) || 5;
    const gradeClass = className || "الصف الأول الثانوي";
    const level = difficulty || "متوسط";

    const systemInstruction = `أنت الخبير التعليمي ومصمم الامتحانات التفاعلية في مادة العلوم والكيمياء والفيزياء للمراحل التعليمية.
يقوم المعلم بطلب توليد أسئلة اختيار من متعدد (MCQ) دقيقة ومناسبة لمنهج المادة.

تعليمات هامة وجوهرية للرموز والقوانين العلمية والفيزيائية والكيميائية:
1. يجب عليك تعريب كافة الرموز والقوانين العلمية والفيزيائية بشكل كامل ومباشر إلى اللغة العربية الرسمية المعتمدة في المناهج الدراسية العربية والمصرية.
2. مثال رئيسي ومباشر: تعريب رمز شدة التيار الكهربائي من (i) إلى (ت)، ورمز فرق الجهد من (v) إلى (جـ)، ورمز المقاومة من (R) إلى (م)، ورمز الزمن من (t) إلى (ز)، وهكذا لجميع الرموز الفيزيائية والكيميائية والقوانين الحسابية دون استثناء في الأسئلة والخيارات (مثال: ت = جـ / م ، ز = ن / ت ...إلخ).
3. اكتب الأسئلة والخيارات باللغة العربية بأسلوب تعليمي متقن ومحدد.
4. يجب إرجاع كائن JSON يحتوي على القائمة "questions" بأسئلة الامتحان والخيارات الأربعة وإجابة صحيحة محددة بـ (أ، ب، ج، د) أو بنص الخيار الصحيح.`;

    const promptText = `قم بتوليد ${count} أسئلة اختيار من متعدد للمرحلة: ${gradeClass}، لموضوع: (${topic})، بمستوى صعوبة: (${level}).
${customText ? `ملاحظات أو نص إضافي من المعلم: ${customText}` : ""}`;

    const result = await generateContentWithFallback({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question_text: { type: Type.STRING, description: "نص السؤال بالعربية مع تعريب كافة الرموز والقوانين" },
                  choice_a: { type: Type.STRING, description: "الخيار الأول (أ)" },
                  choice_b: { type: Type.STRING, description: "الخيار الثاني (ب)" },
                  choice_c: { type: Type.STRING, description: "الخيار الثالث (ج)" },
                  choice_d: { type: Type.STRING, description: "الخيار الرابع (د)" },
                  correct_answer: { type: Type.STRING, description: "الحرف الصحيح للأنسب مثل 'أ' أو 'ب' أو 'ج' أو 'د' أو نص الخيار الصحيح" }
                },
                required: ["question_text", "choice_a", "choice_b", "choice_c", "choice_d", "correct_answer"]
              }
            }
          },
          required: ["questions"]
        }
      }
    });

    let questionsData = [];
    try {
      const parsed = JSON.parse(result.text || "{}");
      questionsData = parsed.questions || [];
    } catch (e) {
      console.error("Failed to parse JSON response from Gemini:", e);
      return res.status(500).json({ error: "فشل في تحويل استجابة الذكاء الاصطناعي إلى أسئلة." });
    }

    return res.json({ questions: questionsData });
  } catch (error: any) {
    console.error("Teacher AI error:", error);
    return res.status(500).json({ 
      error: error?.message || "حدث خطأ أثناء إنشاء الأسئلة بالذكاء الاصطناعي." 
    });
  }
}
