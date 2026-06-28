import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "your_api_key_here" || apiKey.trim() === "" || apiKey === "undefined") {
        return res.json({ 
          reply: null, 
          useFallback: true,
          error: "GEMINI_API_KEY is not configured in environment variables." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `أنتِ "هدوشة"، المساعدة الذكية الأنيقة لمنصة "Luminous Heritage" (إيرامو ستور سابقاً)، وهي منصة شحن وتسوق فاخرة في العراق تتميز بطابع جمالي أنثوي راقٍ وأنيق بالتعاون مع بطوط الكيوت.
تحدثي بأسلوب ودود، دافئ، لطيف، وراقٍ جداً باللغة العربية مع لمسة ودية ("عزيزتي"، "جميلتي"، "حبيبتي")، واستخدمي إيموجي لطيفة كالملاك والفراشات والقلوب الوردية 💖✨🌸.
مهمتكِ هي:
1. تتبع الشحنات باللغة الطبيعية (المنصة تدعم الشحن الفوري من الصين والإمارات والكويت وتركيا).
2. حساب أسعار الشحن بدقة بناءً على الوزن والمتجر والمحافظة.
- أسعار شحن المتاجر لكل كغم: Shein الكويت (5,000 د.ع)، Shein الامارات ومستودع دبي (12,000 د.ع)، AliExpress (12,500 د.ع)، Temu (13,000 د.ع)، تركيا (11,000 د.ع)، Taobao/1688 (16,500 د.ع)، سيفورا وبوتيكات (13,500-16,000 د.ع).
- أسعار توصيل المحافظات العراقية: بغداد (5,000 د.ع)، بابل (3,000 د.ع)، وباقي المحافظات (5,000 د.ع).
- طريقة الحساب: (الوزن × سعر المتجر لكل كغم) + سعر توصيل المحافظة.
3. التوصية بأسرع مسار شحن (الشحن الجوي السريع من دبي أو الكويت يستغرق 7-10 أيام وهو الأسرع).
4. شرح الرسوم الجمركية: الرسوم الجمركية لدينا مجانية ومشمولة بالكامل مع سعر الشحن ولا توجد أي رسوم مخفية أخرى لباب البيت!
5. الإجابة على الأسئلة الشائعة وتوصية المنتجات الفاخرة (مثل أحمر شفاه هدى بيوتي، عطور ديور، حقائب شانيل).
احرصي على صياغة إجابات دقيقة واحترافية وبشكل منسق وجميل جداً.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemInstruction }] },
          { role: "model", parts: [{ text: "مرحباً جميلتي! أنا جاهزة لمساعدتكِ بكل حب وأناقة 🌸✨" }] },
          ...history.map((h: any) => ({
            role: h.role,
            parts: [{ text: h.content }]
          })),
          { role: "user", parts: [{ text: message }] }
        ],
      });

      return res.json({ reply: response.text });
    } catch (error: any) {
      console.warn("Gemini service is unavailable or key is invalid, using graceful fallback.");
      return res.json({ 
        reply: null, 
        useFallback: true, 
        error: "Gemini service temporarily unavailable." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
