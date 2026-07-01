import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { UTApi } from "uploadthing/server";
import dotenv from "dotenv";
import { expressWithSupabase } from "./src/supabaseExpress";

dotenv.config({ override: true });

const isValidGeminiKey = (key: string | undefined): boolean => {
  if (!key) return false;
  const trimmed = key.trim();
  return trimmed !== "" && 
         trimmed !== "your_api_key_here" && 
         trimmed !== "MY_GEMINI_API_KEY" && 
         trimmed !== "undefined" && 
         trimmed.startsWith("AIzaSy");
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Initialize UTApi
  let rawToken = (process.env.UPLOADTHING_TOKEN || "").trim();
  if (rawToken.startsWith("UPLOADTHING_TOKEN=")) {
    rawToken = rawToken.substring("UPLOADTHING_TOKEN=".length).trim();
  }
  let cleanToken = rawToken.replace(/^['"]|['"]$/g, "").trim();
  cleanToken = cleanToken.replace(/^['"]|['"]$/g, "").trim();

  if (!cleanToken && process.env.UPLOADTHING_SECRET && process.env.UPLOADTHING_APP_ID) {
    const secret = process.env.UPLOADTHING_SECRET.trim().replace(/^['"]|['"]$/g, "");
    const appId = process.env.UPLOADTHING_APP_ID.trim().replace(/^['"]|['"]$/g, "");
    const tokenObj = {
      apiKey: secret,
      appId: appId,
      regions: ["sea1"]
    };
    cleanToken = Buffer.from(JSON.stringify(tokenObj)).toString("base64");
  }

  // Decode and check token integrity
  let decodedKeys: string[] = [];
  let decodeError = "";
  try {
    if (cleanToken) {
      const decodedStr = Buffer.from(cleanToken, "base64").toString("utf-8");
      const decodedObj = JSON.parse(decodedStr);
      decodedKeys = Object.keys(decodedObj);
      console.log("Decoded UploadThing token keys:", decodedKeys);
    }
  } catch (err: any) {
    decodeError = err.message;
    console.error("Failed to decode token:", err);
  }

  console.log("Initializing UTApi with token length:", cleanToken.length, "keys:", decodedKeys);
  const utapi = new UTApi({ token: cleanToken });

  // Diagnostic Endpoint
  app.get("/api/uploadthing-diagnostic", (req, res) => {
    res.json({
      hasToken: !!cleanToken,
      tokenLength: cleanToken.length,
      firstFive: cleanToken ? cleanToken.substring(0, 10) : "",
      lastFive: cleanToken ? cleanToken.substring(cleanToken.length - 10) : "",
      decodedKeys,
      decodeError,
      envKeys: Object.keys(process.env).filter(k => k.startsWith("UPLOADTHING"))
    });
  });

  // API Route for Uploading via UploadThing
  app.post("/api/upload", async (req: any, res: any) => {
    try {
      const { fileData, fileName, fileType } = req.body;
      if (!fileData) {
        return res.status(400).json({ error: "No file data provided." });
      }

      // Extract raw base64 data
      const base64Clean = fileData.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Clean, "base64");

      // Construct a File object for UploadThing
      // Note: Node 18+ has a global File constructor
      const fileObj = new File([buffer], fileName || "upload.jpg", { type: fileType || "image/jpeg" });

      const uploadResult = await utapi.uploadFiles(fileObj);

      if (uploadResult.error) {
        console.error("UploadThing upload error details:", uploadResult.error);
        return res.status(500).json({ error: uploadResult.error.message || "Upload failed." });
      }

      const fileUrl = uploadResult.data?.url;
      const fileKey = uploadResult.data?.key;

      if (!fileUrl) {
        return res.status(500).json({ error: "Upload succeeded but no URL was returned." });
      }

      return res.json({ url: fileUrl, key: fileKey });
    } catch (error: any) {
      console.error("Server-side upload error:", error);
      return res.status(500).json({ error: error.message || "An unexpected error occurred during upload." });
    }
  });

  // API Route for Deleting via UploadThing
  app.post("/api/delete", async (req: any, res: any) => {
    try {
      const { fileUrl, fileKey } = req.body;
      let keyToDelete = fileKey;

      if (!keyToDelete && fileUrl) {
        // Try to parse the key from url
        const match = fileUrl.match(/\/f\/([^?#]+)/);
        if (match && match[1]) {
          keyToDelete = match[1];
        }
      }

      if (!keyToDelete) {
        return res.status(400).json({ error: "No file key or URL provided." });
      }

      const deleteResult = await utapi.deleteFiles(keyToDelete);
      return res.json({ success: true, result: deleteResult });
    } catch (error: any) {
      console.error("Server-side delete error:", error);
      return res.status(500).json({ error: error.message || "An unexpected error occurred during delete." });
    }
  });


  // ==========================================
  // Supabase SDK with @supabase/server Routes
  // ==========================================

  // 1. Diagnostic Route (auth: "none") - Checks configuration status
  app.get(
    "/api/supabase-diagnostic",
    expressWithSupabase({ auth: "none" }, async (_req, ctx) => {
      return Response.json({
        configured: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_PUBLISHABLE_KEY,
        hasUrl: !!process.env.SUPABASE_URL,
        hasPublishableKey: !!process.env.SUPABASE_PUBLISHABLE_KEY,
        hasSecretKey: !!process.env.SUPABASE_SECRET_KEY,
        hasJwksUrl: !!process.env.SUPABASE_JWKS_URL,
        authMode: ctx.authMode,
        urlMasked: process.env.SUPABASE_URL ? `${process.env.SUPABASE_URL.substring(0, 15)}...` : null,
      });
    })
  );

  // 2. User Authenticated Endpoint (auth: "user")
  // Requires a valid user JWT inside Authorization header.
  app.get(
    "/api/supabase-todos",
    expressWithSupabase({ auth: "user" }, async (_req, ctx) => {
      try {
        const { data, error } = await ctx.supabase.from("todos").select();
        if (error) {
          return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json({
          user: ctx.userClaims,
          data,
        });
      } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    })
  );

  // 3. Admin / Service Endpoint (auth: "secret")
  // Bypasses RLS to query all todos. Requires SUPABASE_SECRET_KEY as the auth header/token.
  app.get(
    "/api/supabase-todos-admin",
    expressWithSupabase({ auth: "secret" }, async (_req, ctx) => {
      try {
        const { data, error } = await ctx.supabaseAdmin.from("todos").select();
        if (error) {
          return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json({
          msg: "Bypassed RLS using admin client",
          data,
        });
      } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    })
  );

  // 4. Public client with API Key (auth: "publishable")
  // Enforces publishable key verification.
  app.get(
    "/api/supabase-todos-public",
    expressWithSupabase({ auth: "publishable" }, async (_req, ctx) => {
      try {
        const { data, error } = await ctx.supabase.from("todos").select();
        if (error) {
          return Response.json({ error: error.message }, { status: 400 });
        }
        return Response.json({
          msg: "Queried with anonymous publishable key client",
          data,
        });
      } catch (err: any) {
        return Response.json({ error: err.message }, { status: 500 });
      }
    })
  );


  // API Route for Gemini
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history, customizations } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!isValidGeminiKey(apiKey)) {
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

      // Build dynamic knowledge base for the AI based on customizations provided by the client
      let storesKnowledge = "Shein الكويت (5,000 د.ع)، Shein الامارات ومستودع دبي (12,000 د.ع)، AliExpress (12,500 د.ع)، Temu (13,000 د.ع)، تركيا (11,000 د.ع)، Taobao/1688 (16,500 د.ع)";
      if (customizations?.supportedStores && Array.isArray(customizations.supportedStores)) {
        storesKnowledge = customizations.supportedStores.map((s: any) => `${s.name} (${s.rate || 'غير محدد'} - ${s.duration || ''})`).join("، ");
      }

      let provincesKnowledge = "بغداد (5,000 د.ع)، بابل (3,000 د.ع)، وباقي المحافظات (5,000 د.ع)";
      if (customizations?.iraqRates && Array.isArray(customizations.iraqRates)) {
        provincesKnowledge = customizations.iraqRates.map((p: any) => `${p.province} (${p.rate || 'غير محدد'})`).join("، ");
      }

      let socialsKnowledge = "Instagram: @iramo.store";
      if (customizations?.socials) {
        const s = customizations.socials;
        socialsKnowledge = `الإنستغرام: ${s.instagram || '@iramo_store'}، الفيسبوك: ${s.facebook || 'غير محدد'}، الواتساب: ${s.whatsapp || 'غير محدد'}، الموقع الإلكتروني: ${s.website || 'غير محدد'}`;
      }

      let mascotName = "هدوشة";
      let mascotQuote = "جمالك يبدأ من اهتمامك بنفسك";
      if (customizations?.homeFooterMascotAuthor) {
        mascotName = customizations.homeFooterMascotAuthor;
      }
      if (customizations?.homeFooterMascotQuote) {
        mascotQuote = customizations.homeFooterMascotQuote;
      }

      const systemInstruction = `أنتِ "${mascotName}"، المساعدة الذكية الأنيقة لمنصة "Luminous Heritage" (إيرامو ستور سابقاً)، وهي منصة شحن وتسوق فاخرة في العراق تتميز بطابع جمالي أنثوي راقٍ وأنيق بالتعاون مع بطوط الكيوت.
مقولتكِ المفضلة هي: "${mascotQuote}".
تحدثي بأسلوب ودود، دافئ، لطيف، وراقٍ جداً باللغة العربية مع لمسة ودية ("عزيزتي"، "جميلتي"، "حبيبتي")، واستخدمي إيموجي لطيفة كالملاك والفراشات والقلوب الوردية 💖✨🌸.
مهمتكِ هي:
1. تتبع الشحنات باللغة الطبيعية (المنصة تدعم الشحن الفوري من الصين والإمارات والكويت وتركيا).
2. حساب أسعار الشحن بدقة بناءً على الوزن والمتجر والمحافظة.
- أسعار شحن المتاجر المعتمدة حالياً: ${storesKnowledge}.
- أسعار توصيل المحافظات العراقية المعتمدة حالياً: ${provincesKnowledge}.
- معلومات التواصل وحسابات الدعم: ${socialsKnowledge}.
- طريقة الحساب: (الوزن × سعر المتجر لكل كغم) + سعر توصيل المحافظة.
3. التوصية بأسرع مسار شحن (الشحن الجوي السريع من دبي أو الكويت يستغرق 7-10 أيام وهو الأسرع).
4. شرح الرسوم الجمركية: الرسوم الجمركية لدينا مجانية ومشمولة بالكامل مع سعر الشحن ولا توجد أي رسوم مخفية أخرى لباب البيت!
5. الإجابة على الأسئلة الشائعة وتوصية المنتجات الفاخرة.
احرصي على صياغة إجابات دقيقة واحترافية وبشكل منسق وجميل جداً وتجنبي ذكر أي معلومات أو أسعار قديمة ومخالفة لما تم ذكره أعلاه.`;

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

  // AI Beauty Consultant Specialized Endpoint
  app.post("/api/gemini/beauty-consultant", async (req, res) => {
    try {
      const { skinType, skinTone, hairType, age, beautyGoals, knowledgeBase, availableProducts } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!isValidGeminiKey(apiKey)) {
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

      const kbText = knowledgeBase || "سيروم اوباجي فيتامين سي يحتاج حماية شمس، ترطيب البشرة الجافة مرتين يومياً";
      const productsText = availableProducts ? JSON.stringify(availableProducts) : "مستحضرات تجميل وبشرة أصلية فاخرة";

      const systemInstruction = `أنتِ مستشارة التجميل والروتين العلاجي الفاخرة لمنصة "إيرامو ستور 🌸" (مستوحاة من رعاية هدوشة للجمال والدلال).
مهمتكِ هي تقديم نصائح جمالية وروتين متكامل فخم وشخصي للغاية للزبونة بناءً على التفاصيل التي تقدمها:
- نوع البشرة: ${skinType}
- لون البشرة: ${skinTone}
- نوع الشعر: ${hairType}
- الفئة العمرية: ${age}
- أهداف الجمال والعناية: ${beautyGoals}

المعرفة التجميلية الإضافية وقاعدة البيانات المعتمدة:
${kbText}

المنتجات المتوفرة حالياً بالمتجر للتسوق الفوري:
${productsText}

🚨 توجيه صارم وإلزامي 🚨:
يجب عليكِ تصميم خطوات الروتين اليومي (الصباحي والمسائي) والترشيحات باستخدام المنتجات الفعلية المتوفرة بالمتجر والواردة في القائمة أعلاه أولاً وقبل كل شيء. 
ادمجّي أسماء هذه المنتجات الفعلية بذكاء بالاسم الصريح والسعر في خطوات الروتين اليومي المخصص لها (مثال: "الخطوة الثانية: وزعي بلطف قطرات من [اسم المنتج الفعلي من المتجر] لترطيب وتغذية البشرة..."). 
لا تكتبي منتجات عامة أو خارجية إلا إذا كانت المنتجات المتوفرة بالمتجر لا تغطي هذه الخطوة أبداً، وذلك لكي نوفر للزبونة روتيناً حقيقياً يمكنها تسوق منتجاته فوراً من الموقع بالأسعار الموضحة.

يرجى صياغة تقرير استشاري ساحر ومنظم جداً ومكتوب بأسلوب دافئ وودود للغاية ("حبيبتي"، "جميلتي"، "ملكة") مع استخدام إيموجي لطيفة كالفراشات والزهور 🌸✨🧴💄.
تأكدي من أن يكون الرد مكتوباً بلغة عربية فصحى مبسطة ولطيفة جداً، ومقسماً بوضوح باستخدام عناوين بارزة (ماركداون) على النحو التالي:
1. تحليل تفصيلي دقيق ومبسط لحالتها واحتياجاتها الجمالية بناءً على نوع بشرتها وأهدافها.
2. الروتين الصباحي الفاخر (خطوة بخطوة بالترتيب، مدمج فيه منتجات المتجر المناسبة بالاسم والسعر).
3. الروتين المسائي الملكي (خطوة بخطوة بالترتيب، مدمج فيه منتجات المتجر المناسبة بالاسم والسعر).
4. ترشيح أفضل المنتجات الملائمة لها من متجرنا لتسوقها فوراً بالاسم والسعر المذكور في القائمة.
5. نصائح جمالية تكميلية دافئة لمظهر متألق وصحي ومشرق دائمًا.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { role: "user", parts: [{ text: systemInstruction }] }
        ],
      });

      return res.json({ reply: response.text });
    } catch (error: any) {
      console.log("Gemini Beauty Consultant status: utilizing fallback reply.");
      return res.json({ 
        reply: null, 
        useFallback: true, 
        error: "Beauty Consultant AI service temporarily unavailable." 
      });
    }
  });

  app.post("/api/gemini/glasses-analysis", async (req, res) => {
    const fallbackResult = {
      faceShape: "بيضاوي متناسق (Oval Elegant)",
      faceProportions: "الجبهة والخدين والفك متناسقين بشكل متوازن تماماً، مما يمنح مرونة عالية في اختيار الإطارات.",
      facialSymmetry: "تناظر ممتاز يتعدى 96% مع ملامح متناسقة",
      widthToLengthRatio: "1:1.35 (النسبة الذهبية المثالية للجمال)",
      jawlineShape: "منحوت بشكل ناعم ودائري رقيق ومحبب",
      foreheadWidth: "متوسطة الارتفاع متوازنة تماماً مع الأنف والذقن",
      cheekboneProminence: "مرتفعة وممتلئة بشكل يضفي حيوية وشباباً دائمين",
      recommendedGlasses: ["إطارات عين القط (Cat-Eye) 🐱", "الإطارات الهندسية (Geometric) 💎", "الإطارات البيضاوية (Oval) 🌸"],
      glassesToAvoid: ["الإطارات الدائرية الصغيرة جداً", "الإطارات الضخمة العريضة التي تخفي الملامح الكاملة"],
      eyesY: 45,
      eyesX: 50,
      foreheadY: 32,
      cheekbonesY: 52,
      jawlineY: 72,
      faceCenterX: 50,
      glassesScale: 100,
      comparison: [
        { style: "الإطارات الدائرية (Round)", rating: 4, suitability: "تضفي نعومة ووداً إضافياً على ملامحكِ الفخمة" },
        { style: "الإطارات المربعة (Square)", rating: 4.5, suitability: "tمنح تحديداً وهيبة كلاسيكية راقية لزوايا الوجه" },
        { style: "إطارات عين القط (Cat-Eye)", rating: 5, suitability: "الخيار الملكي الأبرز لرفع ملامح الخد وإضفاء سحر شرقي" },
        { style: "الإطارات البيضاوية (Oval)", rating: 5, suitability: "تتناغم تماماً مع خط الفك دون إبراز زوايا حادة" },
        { style: "الإطارات الهندسية (Geometric)", rating: 4.5, suitability: "تصميم جريء ومستقبلي يعزز جاذبية ملامحكِ الفريدة" },
        { style: "إطارات أفياتور (Aviator)", rating: 4, suitability: "مظهر رياضي وعملي يناسب الأوقات اليومية الكاجوال" }
      ]
    };

    try {
      const { image } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!isValidGeminiKey(apiKey)) {
        return res.json({ result: fallbackResult, isFallback: true });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a luxury beauty and facial styling consultant.
Analyze the uploaded portrait while preserving the person's facial identity and proportions exactly. We need to detect eye positions and key horizontal facial levels to position try-on glasses and alignment indicators precisely on their specific face.

Return your response ONLY as a JSON object, with no markdown formatting around it (do NOT wrap it in \`\`\`json or \`\`\` code blocks), in this exact format:
{
  "faceShape": "اسم شكل الوجه باللغة العربية والإنجليزية",
  "faceProportions": "وصف دقيق وموجز لنسب الوجه",
  "facialSymmetry": "تحليل تماثل الوجه (مثال: متماثل بنسبة تزيد عن 95%)",
  "widthToLengthRatio": "نسبة العرض إلى الطول (مثال: 1:1.3)",
  "jawlineShape": "شكل خط الفك (مثال: منحوت وناعم)",
  "foreheadWidth": "عرض الجبهة (مثال: جبهة متوسطة ومتوازنة)",
  "cheekboneProminence": "بروز عظام الخد (مثال: عظام خد مرتفعة وجذابة)",
  "recommendedGlasses": ["نوع نظارات 1", "نوع نظارات 2", "نوع نظارات 3"],
  "glassesToAvoid": ["نوع نظارات لتجنبها 1", "نوع نظارات لتجنبها 2"],
  "eyesY": 45, // detect estimated vertical position of the eyes (percentage of image height from 10 to 90, default 45)
  "eyesX": 50, // detect estimated horizontal center between the two eyes (percentage of image width from 10 to 90, default 50)
  "foreheadY": 30, // detect estimated height of forehead line (percentage of image height from 10 to 90, default 30)
  "cheekbonesY": 50, // detect estimated height of cheekbone level (percentage of image height from 10 to 90, default 50)
  "jawlineY": 70, // detect estimated height of jawline level (percentage of image height from 10 to 90, default 70)
  "faceCenterX": 50, // detect estimated horizontal center line of the face (percentage of image width from 10 to 90, default 50)
  "glassesScale": 100, // recommended size scaling of glasses to match face size (percentage, default 100)
  "comparison": [
    { "style": "الإطارات الدائرية (Round)", "rating": 4, "suitability": "وصف ملاءمتها" },
    { "style": "الإطارات المربعة (Square)", "rating": 4, "suitability": "وصف ملاءمتها" },
    { "style": "إطارات عين القط (Cat-Eye)", "rating": 5, "suitability": "وصف ملاءمتها" },
    { "style": "الإطارات البيضاوية (Oval)", "rating": 5, "suitability": "وصف ملاءمتها" },
    { "style": "الإطارات الهندسية (Geometric)", "rating": 4.5, "suitability": "وصف ملاءمتها" },
    { "style": "إطارات أفياتور (Aviator)", "rating": 4, "suitability": "وصف ملاءمتها" }
  ]
}

Ensure all values are in Arabic (using a highly luxurious and elegant phrasing suitable for a high-end beauty magazine).
Ensure the response is perfectly valid JSON.`;

      let contents: any[] = [];
      if (image) {
        const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          contents.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }
      contents.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
      });

      let textResult = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedResult = JSON.parse(textResult);
      return res.json({ result: parsedResult, isFallback: false });

    } catch (err) {
      console.log("Glasses analysis status: utilizing fallback report.");
      return res.json({ result: fallbackResult, isFallback: true });
    }
  });

  app.post("/api/gemini/body-style-analysis", async (req, res) => {
    const fallbackResult = {
      bodyShape: "قوام متناسق يجمع بين الأناقة والجاذبية الطبيعية (Balanced Elegant Curve)",
      proportions: "تناغم رائع بين عرض الكتفين والوركين مع تحديد لطيف لمنطقة الخصر يمنح قواماً مفعماً بالأنوثة.",
      slimmingTips: [
        "اعتماد الملابس ذات الخصر المرتفع لإطالة الساقين وإبراز رشق القوام.",
        "استخدام السترات والجاكيتات الطويلة المفتوحة (Layering) لخلق خطوط طولية تنحف القوام البصري.",
        "تجنب الأقمشة السميكة جداً أو القصات الفضفاضة الخالية من التحديد عند الخصر."
      ],
      outfitRecommendations: [
        { title: "الإطلالة الكلاسيكية الرشيقة ✨", description: "بنطلون عريض عالي الخصر مع بلوزة منسدلة ناعمة محددة بحزام خصر رفيع تمنح قامة ممتدة وقواماً ممشوقاً." },
        { title: "طبقات ملكية منظمة 🧥", description: "سترة رسمية خفيفة مفتوحة تصل لمنتصف الفخذ مع توب بلون موحد مدمج تحتها لتقليل العرض البصري." },
        { title: "فستان ميدي بخصر محدد 👗", description: "فستان ميدي بتصميم لف (Wrap Dress) يحدد أنحف منطقة بالخصر مع قصة هدلة تتدفق بنعومة مع الحركة." }
      ]
    };

    try {
      const { image, height, size, bodyType } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!isValidGeminiKey(apiKey)) {
        return res.json({ result: fallbackResult, isFallback: true });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `You are a luxury fashion stylist and body shape consultant.
Assess the body shape, proportions, and overall features based on the uploaded photo (if any) and the provided details:
- Height: ${height || 'Not specified'}
- Size: ${size || 'Not specified'}
- Stated Body Type: ${bodyType || 'Not specified'}

Generate 3-5 high-end flattering and visually slimming outfit recommendations, styling guidelines (e.g. define waist, elongate legs with high-waist/wide-leg/vertical lines, structured layering, colors that slim/elongate).

Return your response ONLY as a JSON object, with no markdown formatting around it (do NOT wrap it in \`\`\`json or \`\`\` code blocks), in this exact format:
{
  "bodyShape": "شرح شكل وقوام الجسم بشكل فاخر ولبق",
  "proportions": "تحليل النسب والتوازن البصري للقوام",
  "slimmingTips": ["نصيحة تنحيف وتطويل 1", "نصيحة 2", "نصيحة 3"],
  "outfitRecommendations": [
    { "title": "اسم التنسيق المقترح 1", "description": "شرح تفصيلي للقطع وخاماتها والسبب في جعلها تبدو رشيقة ونحيفة وملائمة" },
    { "title": "اسم التنسيق المقترح 2", "description": "شرح تفصيلي للقطع والسبب" },
    { "title": "اسم التنسيق المقترح 3", "description": "شرح تفصيلي للقطع والسبب" }
  ]
}

Ensure all values are in Arabic (using a highly luxurious and elegant phrasing suitable for a high-end beauty magazine).
Ensure the response is perfectly valid JSON.`;

      let contents: any[] = [];
      if (image) {
        const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          contents.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }
      contents.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
      });

      let textResult = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedResult = JSON.parse(textResult);
      return res.json({ result: parsedResult, isFallback: false });

    } catch (err) {
      console.log("Body style analysis status: utilizing fallback report.");
      return res.json({ result: fallbackResult, isFallback: true });
    }
  });

  app.post("/api/gemini/makeup-color-analysis", async (req, res) => {
    const fallbackResult = {
      makeupSuitability: "درجات ألوان دافئة وناعمة تناسب رقة ملامحكِ وتبرز توهجكِ الطبيعي كالأميرات.",
      recommendedMetal: "الذهب الوردي والأصفر الفاخر (Warm & Rose Gold) 🌟",
      recommendedAccessories: ["أقراط لؤلؤية كلاسيكية 🦪", "سلاسل ذهبية رفيعة ✨", "خواتم مرصعة بأحجار دافئة 💍"],
      recommendedNeckline: "قصة الياقة المفتوحة على شكل V أو القصة الهدلة الناعمة لتطويل العنق وإبراز عظام الترقوة الجذابة.",
      hairStyleAnalysis: "قواص وتصفيفات تحيط بالوجه بنعومة لتبرز جمال عظام الوجنتين وترفع ملامح العينين بذكاء.",
      hairstyles: [
        { style: "ويفي ناعم منسدل (Soft Waves) 🌊", rating: 5, suitability: "يمنح حجماً رائعاً وحيوية لملامحكِ المشرقة ويضفي لمسة فخامة" },
        { style: "قصة بوب كلاسيكية (Classic Bob) 💇‍♀️", rating: 4.5, suitability: "مظهر عصري جذاب ومثالي لتأطير خط الفك وتحديد الوجنتين" },
        { style: "غرة أمامية ناعمة (Bangs Style) ✨", rating: 4, suitability: "ممتازة لتقليل مدى الجبهة وإبراز سحر ونظرات العيون الفاتنة" },
        { style: "شعر مستقيم مفرود (Straight Sleek) 👑", rating: 4, suitability: "يضفي حدة وأناقة كلاسيكية كالملكات ويناسب الأوقات الرسمية" }
      ],
      makeupLooks: [
        { look: "المكياج الترابي الفاخر 🤎", suitability: "يتناغم تماماً مع تدرجات البشرة الحنطية والدافئة مع روج نيود مطفي ساحر" },
        { look: "المكياج الوردي المشرق 🌸", suitability: "يضفي لمسة شبابية ونضارة طبيعية للخدود مع قلوس لامع للشفاه مفعم بالحياة" }
      ]
    };

    try {
      const { image } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!isValidGeminiKey(apiKey)) {
        return res.json({ result: fallbackResult, isFallback: true });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `You are a luxury makeup artist, color theory and hair styling consultant.
Analyze the uploaded portrait of the person.
Determine:
1. The most suitable makeup styles, colors and tones that suit their skin tone and face.
2. The recommended metals (e.g. Gold, Silver, Rose Gold) and accessories types.
3. The best neckline/collar shape for them.
4. Comprehensive hairstyle analysis: hairstyle, length, bangs, parting.

Return your response ONLY as a JSON object, with no markdown formatting around it (do NOT wrap it in \`\`\`json or \`\`\` code blocks), in this exact format:
{
  "makeupSuitability": "وصف دقيق بأسلوب فخم للمكياج المناسب",
  "recommendedMetal": "المعدن المناسب (مثال: الذهب الوردي والأصفر الفاخر)",
  "recommendedAccessories": ["إكسسوار 1", "إكسسوار 2", "إكسسوار 3"],
  "recommendedNeckline": "قصة الياقة/خط العنق المثالي",
  "hairStyleAnalysis": "تحليل شامل للشعر وتصفيفه لزيادة الجاذبية",
  "hairstyles": [
    { "style": "اسم التسريحة بالعربية والإنجليزية", "rating": 5, "suitability": "وصف دقة ملاءمتها" },
    { "style": "اسم التسريحة 2", "rating": 4, "suitability": "وصف ملاءمتها" },
    { "style": "اسم التسريحة 3", "rating": 4.5, "suitability": "وصف ملاءمتها" },
    { "style": "اسم التسريحة 4", "rating": 4, "suitability": "وصف ملاءمتها" }
  ],
  "makeupLooks": [
    { "look": "اسم مظهر المكياج 1", "suitability": "وصف المظهر وملائمته لبشرتها" },
    { "look": "اسم مظهر المكياج 2", "suitability": "وصف المظهر وملائمته لبشرتها" }
  ]
}

Ensure all values are in Arabic (using a highly luxurious and elegant phrasing suitable for a high-end beauty magazine).
Ensure the response is perfectly valid JSON.`;

      let contents: any[] = [];
      if (image) {
        const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          contents.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }
      contents.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
      });

      let textResult = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedResult = JSON.parse(textResult);
      return res.json({ result: parsedResult, isFallback: false });

    } catch (err) {
      console.log("Makeup & Color analysis status: utilizing fallback report.");
      return res.json({ result: fallbackResult, isFallback: true });
    }
  });

  // New Endpoint 3: 10 Looks Style Collage Lookbook
  app.post("/api/gemini/style-collage-analysis", async (req, res) => {
    const fallbackResult = {
      title: "10 Looks Full Body Style Guide",
      userPalette: ["#3B5F43", "#C48B9F", "#D9A05B", "#4A6B53", "#8A5A44", "#E6D5C3"],
      paletteName: "Warm Autumn & Earthy Romance 🍂🌸",
      heightProportions: "التركيز على قاعدة الثلثين والثلث لتطويل الساقين وإبراز الخصر مع انسيابية القطع الفخمة.",
      outfits: [
        { name: "Corporate chic (أناقة العمل) 💼", desc: "بنطلون عريض عالي الخصر بلون الموكا مع قميص منسدلة وحقيبة يد أنيقة وحذاء كلاسيكي مريح" },
        { name: "Avid concert goer (حفلات وتجمعات جريئة) 🎸", desc: "جاكيت جلدي بني ناعم منسق مع تيشيرت كاجوال، جينز مستقيم، وحلي معدنية ذهبية ساحرة" },
        { name: "Outgoing mom (الأم الأنيقة والعملية) 👩‍👦", desc: "كارديجان طويل بلون الزعتر الفاتح، توب داخلي ناصع البياض، بنطلون مريح، وحذاء مسطح مريح" },
        { name: "Beach lover (نسيم البحر الملكي) 🏖️", desc: "فستان كتان انسيابي خفيف بلون البيج الدافئ مع قبعة خوص كلاسيكية وصندل جلدي مفتوح" },
        { name: "Boho chic (البوهيمي الفاخر) 🌾", desc: "تنورة بوهيمية طويلة مزينة بنقوشات ناعمة منسدلة مع بلوزة بكتف مكشوف وصندل برباط أنيق" },
        { name: "Weekender (أناقة نهاية الأسبوع) ☕", desc: "طقم قطني مريح وفاخر بلون الموكا الدافئ مع حذاء رياضي ناصع البياض وحقيبة يد قماشية كلاسيكية" },
        { name: "Shopping outfit (تسوق مريح وأنيق) 🛍️", desc: "جينز عريض الخصر مريح مع بلوزة ناعمة مطاطة، وجاكيت جينز خفيف مفتوح وحذاء رياضي مريح" },
        { name: "Social event (المناسبات والجمعات) ✨", desc: "جمبسوت ملكي بلون المستردة الدافئ، يحدده حزام خصر جلدي رفيع، مع حذاء بكعب متوسط وإكسسوارات ذهبية" },
        { name: "Home buddy (أناقة وراحة المنزل) 🏡", desc: "طقم مريح للغاية من الكشمير الناعم بلون البيج أو المشمشي لتستمتعي بالراحة والدلال بالمنزل" },
        { name: "Date night (أمسية دافئة رومانسية) 🕯️", desc: "فستان رقيق مخملي بلون الصدأ أو الموكا يبرز جمال القوام مع فتحة رقبة واسعة وتفاصيل من الذهب الوردي" }
      ]
    };

    try {
      const { image, height, size, season, preferredColors } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!isValidGeminiKey(apiKey)) {
        return res.json({ result: fallbackResult, isFallback: true });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `You are a professional luxury fashion director creating a personalized "10 Looks Full Body Style Guide" collage.
Analyze the user details:
- Height: ${height || 'Not specified'}
- Size: ${size || 'Not specified'}
- Season: ${season || 'Warm Autumn'}
- Preferred colors: ${preferredColors || 'sage, rose pink, warm mustard, green, mocha, beige, rust'}

Design exactly 10 full-body outfits following these 10 distinct vibes:
1. Corporate chic
2. Avid concert goer
3. Outgoing mom
4. Beach lover
5. Boho chic
6. Weekender
7. Shopping outfit
8. Social event
9. Home buddy
10. Date night

Follow styling rules for a ${height || 'proportional'} silhouette: define waist, elongate legs (high-waist, wide-leg, vertical lines), flowy but structured pieces, comfortable but polished. 

Return your response ONLY as a JSON object, with no markdown formatting around it (do NOT wrap it in \`\`\`json or \`\`\` code blocks), in this exact format:
{
  "title": "10 Looks Full Body Style Guide",
  "userPalette": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5", "#hex6"],
  "paletteName": "اسم لوحة الألوان الفاخرة بالعربية",
  "heightProportions": "شرح توازن الطول وتحديد الخصر ونسب القوام المحددة لها",
  "outfits": [
    { "name": "Corporate chic (أناقة العمل) 💼", "desc": "وصف مفصل للقطع، الملمس، والطبقات والإكسسوارات بأسلوب راقٍ وقصير" },
    { "name": "Avid concert goer 🎸", "desc": "وصف مفصل للمظهر" },
    { "name": "Outgoing mom 👩‍👦", "desc": "وصف مفصل للمظهر" },
    { "name": "Beach lover 🏖️", "desc": "وصف مفصل للمظهر" },
    { "name": "Boho chic 🌾", "desc": "وصف مفصل للمظهر" },
    { "name": "Weekender ☕", "desc": "وصف مفصل للمظهر" },
    { "name": "Shopping outfit 🛍️", "desc": "وصف مفصل للمظهر" },
    { "name": "Social event ✨", "desc": "وصف مفصل للمظهر" },
    { "name": "Home buddy 🏡", "desc": "وصف مفصل للمظهر" },
    { "name": "Date night 🕯️", "desc": "وصف مفصل للمظهر" }
  ]
}

Ensure all values are in Arabic (using a highly luxurious and elegant phrasing suitable for a high-end beauty magazine).
Ensure the response is perfectly valid JSON.`;

      let contents: any[] = [];
      if (image) {
        const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          contents.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }
      contents.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
      });

      let textResult = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedResult = JSON.parse(textResult);
      return res.json({ result: parsedResult, isFallback: false });

    } catch (err) {
      console.log("Style collage analysis status: utilizing fallback report.");
      return res.json({ result: fallbackResult, isFallback: true });
    }
  });

  // New Endpoint 4: Facial Aesthetics Report
  app.post("/api/gemini/facial-harmony-analysis", async (req, res) => {
    const fallbackResult = {
      isFaceDetected: true,
      confidenceScore: 95,
      overallScore: 84,
      symmetryScore: 85,
      thirdsScore: 82,
      eyeSpacingScore: 86,
      noseScore: 80,
      lipsScore: 83,
      jawlineScore: 81,
      skinScore: 85,
      harmonyScore: 83,
      photogenicScore: 80,
      
      evaluation: "يُظهر هيكل الوجه العام درجة جيدة ومحايدة من التوازن والنسب الكلاسيكية. توزيع الأبعاد متناسق بشكل طبيعي دون مبالغة بصرية.",
      symmetryAnalysis: "يتسم الوجه بتماثل ثنائي مقبول إحصائياً، مع وجود تفاوت طفيف فسيولوجي طبيعي ومألوف في الوجنتين ومحاذاة الحاجبين الأيمن والأيسر.",
      thirdsAnalysis: "تقسيم أثلاث الوجه الثلاثة متقارب بنسب كافية ومستقرة؛ يمتد الثلث العلوي (من خط الشعر إلى الحاجبين) بطول معتدل، بينما يتساوى الثلث الأوسط والسفلي تقريباً.",
      eyesAnalysis: "تتموضع العيون بتباعد بيني متناغم مع عرض قاعدة الأنف؛ تميل الزاوية الخارجية للعينين باتجاه جانبي محايد وخط كحل طبيعي ناعم.",
      noseAnalysis: "يتوسط الأنف الوجه بعرض مناسب وقاعدة متزنة تتماشى مع خط العينين الداخلي، وجسر مستقيم نسبياً مع خطوط ناعمة للذقن والشفاه.",
      lipsAnalysis: "تمتلك الشفاه حجماً متزناً يعطي انطباعاً كلاسيكياً، مع نسبة متقاربة بين الشفة العليا والشفة السفلى ومحاذاة أفقية متجانسة.",
      jawlineChin: "خط الفك محدد بنعومة مع زوايا طبيعية واضحة، يعلوه بروز متوازن للذقن ومستوى معتدل لبروز عظام الوجنتين لمظهر كلاسيكي.",
      skinQuality: "تتمتع البشرة بملمس ناعم مع صفاء لوني متزن، ويظهر اهتمام واضح بالترتيب اليومي يعزز مظهر الجلد الطبيعي والصحي.",
      hairAnalysis: "خط الشعر مرسوم بشكل طبيعي ومستدير، يعززه اختيار قصة شعر تؤطر تفاصيل الوجه وتمنحه توازناً بصرياً لافتاً.",
      harmonyPotential: "يمتلك الوجه ميزات فوتوجينية هادئة ومتناسقة تتفاعل بشكل ممتاز مع الإضاءة الموجهة والزوايا المرتفعة قليلاً للكاميرا.",
      
      // Detailed landmarks percentages (0-100)
      hairlineY: 18,
      foreheadY: 28,
      eyebrowsY: 36,
      eyesY: 48,
      noseBridgeY: 53,
      noseY: 62,
      mouthY: 74,
      jawlineY: 86,
      cheekbonesY: 52,
      leftEyeX: 38,
      rightEyeX: 62,
      leftEyeInnerX: 43,
      leftEyeOuterX: 33,
      rightEyeInnerX: 57,
      rightEyeOuterX: 67,
      noseLeftX: 46,
      noseRightX: 54,
      mouthLeftX: 42,
      mouthRightX: 58,
      jawLeftX: 32,
      jawRightX: 68,
      cheekLeftX: 26,
      cheekRightX: 74,
      faceCenterX: 50,
      thirdsY1: 33.3,
      thirdsY2: 66.6,
      fifthsX1: 20,
      fifthsX2: 40,
      fifthsX3: 60,
      fifthsX4: 80,
      
      recommendations: {
        hair: "اعتماد قصة شعر بطبقات خفيفة لتنعيم خط الفك وتأطير عظام الوجنتين بشكل ممتاز.",
        skincare: "الحفاظ على حاجز البشرة الطبيعي عبر ترطيب مكثف واستخدام مضادات الأكسدة مثل فيتامين سي لتوحيد اللون.",
        grooming: "ترتيب وتنظيف جوانب الوجه وأطراف الشعر بانتظام لإبقاء الملامح العظمية واضحة ومحددة.",
        eyebrows: "تحديد معتدل للحواجب بشكل منحني قليلاً دون المبالغة في تقريبها لتعزيز سعة نظرة العين.",
        weightManagement: "الحفاظ على روتين تغذية متزن وترطيب مستمر لتفادي احتباس السوائل وتأمين مظهر فك مصقول بطبيعته.",
        styling: "اختيار إطارات نظارات طبية أو شمسية هندسية رقيقة ذات زوايا ناعمة تعاكس الطابع الدائري للوجه لتوليد التباين الجميل.",
        photography: "استخدام زاوية تصوير مرتفعة قليلاً بمقدار 15 درجة مع إضاءة طبيعية دافئة غير مسلطة مباشرة من الأعلى.",
        aesthetics: "ممارسة تمارين الفك البسيطة (Mewing) وتدليك الوجه بواسطة حجر غوا شا الخفيف مرتين أسبوعياً لتخفيف أي انتفاخ عابر."
      }
    };

    try {
      const { image } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!isValidGeminiKey(apiKey)) {
        return res.json({ result: fallbackResult, isFallback: true });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `You are an elite, highly objective facial aesthetics expert and a clinical anthropometry consultant.
Analyze the uploaded portrait of the person objectively. We need to detect key facial landmark coordinates as precise percentages (0 to 100) from top-left (0,0) to bottom-right (100,100) to map out clinical-grade visual guidelines and measurements on their actual face structure.
Provide an honest, highly objective, and realistic evaluation of facial aesthetics potential, avoiding empty exaggerated flattery or artificially inflated scores.

Evaluate the following parameters objectively and thoroughly:
1. Facial symmetry (bilateral alignment, minor asymmetries)
2. Facial thirds (upper/forehead, middle/nose, lower/chin distribution, ideal 1:1:1 ratio)
3. Eye spacing (intercanthal distance, eye-width to interpupillary ratio)
4. Eye shape (canthal tilt, palpebral fissure, symmetry of gaze)
5. Nose harmony (nasofaxial angle, nasal bridge width, nose tip projection)
6. Lip proportions (upper to lower lip ratio, philtrum height, oral commissures)
7. Jawline (definition, angle, symmetry)
8. Chin (projection, height, horizontal alignment)
9. Cheekbones (prominence, cheek volume, support)
10. Skin quality (texture, tone evenness, clarity, grooming)
11. Hairline (hairline height, shape, framing)
12. Hairstyle (facial framing, styling suitability)
13. Grooming (eyebrows, hair grooming, facial hair if applicable)
14. Facial harmony (overall index, feature coordination)
15. Photogenic potential (camera-ready angles, lighting interaction)

If you CANNOT detect a face in the image, or if the photo is blurry, dark, at an extreme angle, or has poor lighting such that you cannot place landmarks with high precision (at least 60% confidence), you must set "isFaceDetected": false in the JSON. Otherwise set "isFaceDetected": true.

Your coordinates must satisfy basic human facial proportions rules to avoid impossible placements:
- eyesY MUST be less than noseY (eyes are above nose)
- noseY MUST be less than mouthY (nose is above mouth)
- mouthY MUST be less than jawlineY (mouth is above jawline/chin)
- foreheadY MUST be less than eyesY (forehead is above eyes)
- thirdsY1 should be around foreheadY or brows (split upper/middle)
- thirdsY2 should be around noseY (split middle/lower)
- leftEyeX MUST be less than faceCenterX (left eye is on left)
- rightEyeX MUST be greater than faceCenterX (right eye is on right)

Return your response ONLY as a JSON object, with no markdown formatting around it (do NOT wrap it in \`\`\`json or \`\`\` code blocks), in this exact format:
{
  "isFaceDetected": true,
  "confidenceScore": 95,
  "overallScore": 82, // Attractiveness Potential Score (be realistic, avoid artificially inflated scores)
  "symmetryScore": 84, // Facial symmetry
  "thirdsScore": 80, // Facial thirds
  "eyeSpacingScore": 85, // Eye spacing & shape
  "noseScore": 79, // Nose harmony
  "lipsScore": 83, // Lip proportions
  "jawlineScore": 81, // Jawline, chin, cheekbones
  "skinScore": 86, // Skin quality & grooming
  "harmonyScore": 83, // Facial harmony
  "photogenicScore": 80, // Photogenic potential
  
  "evaluation": "الملخص التحريري العام لملامح الوجه ونسبه بشكل موضوعي خالٍ من المبالغة والثناء المصطنع",
  "symmetryAnalysis": "تحليل تماثل وتناظر الوجه الأيمن والأيسر وتحديد أي تباين طبيعي طفيف بدقة علمية",
  "thirdsAnalysis": "تحليل نسب الأثلاث الثلاثة (الجبهة، الأنف، الذقن) ومقارنتها بالنسبة الذهبية المثالية 1:1:1",
  "eyesAnalysis": "تحليل تباعد العيون (المسافة البينية) وشكل العين (الزاوية العينية/الإنحدار الكانثلي وجفن العين)",
  "noseAnalysis": "تحليل جسر الأنف وقاعدته وتناسقه الأفقي والرأسي مع ملامح الوجه وعرض العينين",
  "lipsAnalysis": "تحليل حجم الشفاه ونسبة الشفة العليا إلى السفلى وشكل قوس كيوبيد والارتفاع الفيلتري",
  "jawlineChin": "تحليل بروز عظام الفك وحدته، واستقامة الذقن وبروز الخدود ودرجة دعم الوجنتين للملامح",
  "skinQuality": "تحليل صفاء وملمس وتوحد لون البشرة وصحتها الفسيولوجية ومستوى العناية والترتيب العام",
  "hairAnalysis": "تحليل تراجع أو ملاءمة خط الشعر الحالي وتسريحته ومدى ملائمتها وتأطيرها للهيكل العظمي للوجه",
  "harmonyPotential": "تقييم التناغم والانسجام العام للملامح والقدرة الفوتوجينية والتفاعل الكاميري مع زوايا الإضاءة",

  "hairlineY": 18,
  "foreheadY": 28,
  "eyebrowsY": 36,
  "eyesY": 45,
  "noseBridgeY": 50,
  "noseY": 60,
  "mouthY": 74,
  "jawlineY": 85,
  "cheekbonesY": 52,
  "leftEyeX": 38,
  "rightEyeX": 62,
  "leftEyeInnerX": 43,
  "leftEyeOuterX": 33,
  "rightEyeInnerX": 57,
  "rightEyeOuterX": 67,
  "noseLeftX": 46,
  "noseRightX": 54,
  "mouthLeftX": 42,
  "mouthRightX": 58,
  "jawLeftX": 32,
  "jawRightX": 68,
  "cheekLeftX": 26,
  "cheekRightX": 74,
  "faceCenterX": 50,
  "thirdsY1": 33.3,
  "thirdsY2": 66.6,
  "fifthsX1": 20,
  "fifthsX2": 40,
  "fifthsX3": 60,
  "fifthsX4": 80,
  
  "recommendations": {
    "hair": "توصيات عملية ومحددة لتسريحة وطول ولون الشعر لتأطير شكل الوجه وتقليل عيوب الجبهة أو الفك",
    "skincare": "روتين وتوصيات دقيقة للمنتجات والمواد الفعالة المناسبة لحالة ونضارة البشرة",
    "grooming": "توصيات متخصصة للترتيب والنظافة والعناية بالبشرة واللحية (إن وجدت) لتعزيز الأبعاد",
    "eyebrows": "توصيات دقيقة لرسمة الحواجب وارتفاعها وسماكتها الملائمة لمسافة العيون وجسر الأنف",
    "weightManagement": "تقييم وتوصية واقعية حول نسبة دهون الوجه وتأثيرها على حدة الفك وبروز الوجنتين",
    "styling": "توجيهات لاختيار القبعات، النظارات، والإكسسوارات الملائمة لهيكل الوجه العظمي والنسب",
    "photography": "توجيهات احترافية لزوايا التصوير المثالية، الارتفاع، اتجاه الكاميرا، ونوع الإضاءة لتعظيم مظهرك",
    "aesthetics": "توصيات جمالية خالية من الجراحة (تمارين الفك، تدليك غوا شا، كونتور الوجه، تظليل النسبة الذهبية)"
  }
}

Ensure all descriptive values are in Arabic with a refined, highly clinical, precise, and constructive editorial tone (no fake flattery, be honest, realistic, and highly professional). Ensure the response is perfectly valid JSON.`;

      let contents: any[] = [];
      if (image) {
        const match = image.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          contents.push({ inlineData: { mimeType: match[1], data: match[2] } });
        }
      }
      contents.push({ text: prompt });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
      });

      let textResult = (response.text || "").replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedResult = JSON.parse(textResult);
      return res.json({ result: parsedResult, isFallback: false });

    } catch (err) {
      console.log("Facial harmony analysis status: utilizing fallback report.");
      return res.json({ result: fallbackResult, isFallback: true });
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
