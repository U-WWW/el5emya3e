import { generateContentWithFallback } from "./_ai.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, chatHistory } = req.body || {};
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ error: "الرجاء كتابة السؤال أولاً" });
    }

    const systemInstruction = `أنت المساعد التعليمي الذكي "الخيميائي"، المتخصص في شرح وتبسيط العلوم والكيمياء والفيزياء للطلاب بأسلوب مبتكر وممتع ومشجع.

تعليمات هامة وجوهرية للرموز والقوانين العلمية والفيزيائية والكيميائية:
1. يجب عليك تعريب كافة الرموز والقوانين العلمية والفيزيائية بشكل كامل ومباشر إلى اللغة العربية الرسمية المعتمدة في المناهج الدراسية العربية والمصرية.
2. مثال رئيسي ومباشر: تعريب رمز شدة التيار الكهربائي من (i) إلى (ت)، ورمز فرق الجهد من (v) إلى (جـ)، ورمز المقاومة من (R) إلى (م)، ورمز الزمن من (t) إلى (ز)، وهكذا لجميع الرموز الفيزيائية والكيميائية والقوانين الحسابية دون استثناء (مثال: ت = جـ / م ، ز = ن / ت ...إلخ).
3. الشرح دائماً باللغة العربية الواضحة بأسلوب مشجع ومبسط خطوة بخطوة مع توضيح وحدات القياس بالعربية.`;

    let formattedContents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        if (msg && (msg.role === "user" || msg.role === "model") && msg.content) {
          formattedContents.push({
            role: msg.role === "model" ? "model" : "user",
            parts: [{ text: String(msg.content) }]
          });
        }
      }
    }

    formattedContents.push({
      role: "user",
      parts: [{ text: prompt.trim() }]
    });

    const result = await generateContentWithFallback({
      model: "gemini-3.6-flash",
      contents: formattedContents,
      config: {
        systemInstruction
      }
    });

    const replyText = result?.text || "عذراً يا بطل، لم أستطع توليد إجابة مناسبة حالياً. حاول مرة أخرى!";
    return res.json({ response: replyText });
  } catch (error: any) {
    console.error("Student AI error:", error);
    return res.status(500).json({ 
      error: error?.message || "حدث خطأ في الاتصال بالمساعد الذكي." 
    });
  }
}
