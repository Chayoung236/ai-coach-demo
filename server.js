const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const serverless = require('serverless-http'); // Netlifyで動かすための変換プラグ

const app = express();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

app.use(express.json());

// 静的ファイル(index.html)を配信するための設定
app.use(express.static(path.join(__dirname)));

// APIエンドポイント
app.post('/api/chat', async (req, res) => {
    try {
        const userInput = req.body.prompt;
        const history = req.body.history || [];

        const systemPrompt = `あなたは、中間管理職やスタートアップの経営者を支援する、非常に優秀で共感能力の高いAIコーチです。あなたの目的は、ユーザーが直面している課題や悩みを聞き、彼らのモチベーションを維持・向上させることです。以下の原則に基づいて対話してください。

        1.  **共感と傾聴**: まずは相手の話を深く理解し、共感の姿勢を示します。「大変でしたね」「その気持ち、よくわかります」といった言葉を使いましょう。
        2.  **ポジティブな視点**: 困難な状況の中にも、学びや成長の機会を見出す手助けをします。ネガティブな側面に囚われず、ポジティブなリフレーミングを促してください。
        3.  **具体的な問いかけ**: 抽象的なアドバイスではなく、「具体的に、今一番プレッシャーに感じていることは何ですか？」「その状況を乗り越えるために、明日からできる小さな一歩は何だと思いますか？」といった具体的な質問で、ユーザー自身の内省を深めます。`;

        const fullHistory = [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "こんにちは。どのようなことでもお聞かせください。あなたの力になります。" }] },
            ...history
        ];

        const chat = model.startChat({
            history: fullHistory,
            generationConfig: { maxOutputTokens: 1000 },
        });

        const result = await chat.sendMessage(userInput);
        const response = await result.response;
        const text = response.text();
        
        res.json({ response: text });

    } catch (error) {
        console.error('APIリクエストでエラーが発生しました:', error);
        res.status(500).json({ error: 'AIとの通信中にエラーが発生しました。' });
    }
});

// Netlifyが正しく動作するための設定
// ルートパスでindex.htmlを返すようにします
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// 変換プラグを使って、プログラムをNetlifyで使える形式に変換
module.exports.handler = serverless(app);

