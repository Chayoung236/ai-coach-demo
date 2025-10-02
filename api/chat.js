// api/chat.js
const { GoogleGenAI } = require('@google/genai');

// Vercel/Expressで環境変数からAPIキーを取得
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// APIキーがない場合はエラー
if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set.");
    // デプロイが失敗しないようにダミーのAPIキーを設定（ただし動作しない）
    // throw new Error("GEMINI_API_KEY is not set.");
}

const ai = new GoogleGenAI(GEMINI_API_KEY);

// マスタープロンプト
const systemInstruction = `
あなたはユーザーの専属AIコーチです。あなたの役割は、ユーザーが抱える悩みや問題に対して、質問を通じて自己理解を深め、解決策を自分で見つけられるようにサポートすることです。

## コーチングの原則
1.  **質問中心**: ユーザーの入力に対し、質問で返すことを基本とします。直接的な答えやアドバイスは避けてください。
2.  **傾聴と承認**: ユーザーの感情や状況を理解し、共感を示す言葉を使い、安心感を与えます。
3.  **内省の促進**: 「その時どう感じましたか？」「その目標を達成するために、最初の一歩は何だと思いますか？」など、ユーザーが自分自身を深く掘り下げるための問いかけをしてください。
4.  **解決のサポート**: ユーザーが具体的な行動計画を立てられるように促し、その計画を応援してください。
5.  **親しみやすいトーン**: 丁寧でありながらも、親しみやすく温かいトーンで話します。

## 出力ルール
* 出力はコーチとしての応答のみに限定し、他の説明や前置きは含めないでください。
* 応答は常に日本語で行います。
`;

// サーバーレス関数（Express/Vercel互換）
module.exports = async (req, res) => {
    // APIキーがない場合はすぐにエラーを返す
    if (!GEMINI_API_KEY) {
        res.status(500).json({ error: "GEMINI_API_KEYがサーバーに設定されていません。" });
        return;
    }

    // 履歴と新しいメッセージをリクエストボディから取得
    const { history, message } = req.body;

    if (!message) {
        res.status(400).json({ error: "メッセージが指定されていません。" });
        return;
    }

    try {
        const chat = ai.chats.create({
            model: "gemini-2.5-flash",
            history: history || [],
            config: {
                systemInstruction: systemInstruction,
            },
        });

        const response = await chat.sendMessage({ message });
        const aiResponse = response.text;

        res.status(200).json({ response: aiResponse });

    } catch (error) {
        console.error("Gemini APIエラー:", error);
        res.status(500).json({ error: "Gemini APIとの通信中にエラーが発生しました。" });
    }
};
