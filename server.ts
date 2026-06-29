import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { UTApi } from "uploadthing/server";
import dotenv from "dotenv";
import { expressWithSupabase } from "./src/supabaseExpress";


dotenv.config({ override: true });

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
