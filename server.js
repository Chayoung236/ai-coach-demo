const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Expressアプリケーションを作成
const app = express();
const port = process.env.PORT || 3000;

// APIキーを環境変数から安全に読み込む
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// モデル名を最新のものに修正
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

// JSONリクエストのボディを解析するためのミドルウェア
app.use(express.json());

// 【重要】静的ファイルを提供する場所を修正しました
// 'public'フォルダではなく、プロジェクトのルートディレクトリ（index.htmlがある場所）を指定します
app.use(express.static(path.join(__dirname)));

// APIエンドポイント '/api/chat' を設定
app.post('/api/chat', async (req, res) => {
    try {
        const userInput = req.body.prompt;
        const history = req.body.history || [];

        if (!userInput) {
            return res.status(400).json({ error: 'プロンプトがありません。' });
        }

        // AIの役割を定義するシステムプロンプト
        const systemPrompt = `あなたは、中間管理職やスタートアップの経営者を支援する、非常に優秀で共感能力の高いAIコーチです。あなたの目的は、ユーザーが直面している課題や悩みを聞き、彼らのモチベーションを維持・向上させることです。以下の原則に基づいて対話してください。

        1.  **共感と傾聴**: まずは相手の話を深く理解し、共感の姿勢を示します。「大変でしたね」「その気持ち、よくわかります」といった言葉を使いましょう。
        2.  **ポジティブな視点**: 困難な状況の中にも、学びや成長の機会を見出す手助けをします。ネガティブな側面に囚われず、ポジティブなリフレーミングを促してください。
        3.  **具体的な問いかけ**: 抽象的なアドバイスではなく、「具体的に、今一番プレッシャーに感じていることは何ですか？」「その状況を乗り越えるために、明日からできる小さな一歩は何だと思いますか？」といった具体的な質問で、ユーザー自身の内省を深めます。
        4.  **自己肯定感の醸成**: ユーザーがこれまでに達成してきたことや、持っている強みに気づかせ、自信を取り戻せるようにサポートします。「〇〇を成し遂げたあなたの力なら、これもきっと乗り越えられますよ」といった形で勇気づけてください。
        5.  **簡潔で力強い言葉**: 長文ではなく、心に響く短く力強いメッセージを心がけてください。

        それでは、対話を開始します。`;
        
        // 会話の履歴を整形
        const fullHistory = [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "こんにちは。どのようなことでもお聞かせください。あなたの力になります。" }] },
            ...history
        ];

        const chat = model.startChat({
            history: fullHistory,
            generationConfig: {
                maxOutputTokens: 1000,
            },
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

// サーバーを起動
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

