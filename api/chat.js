// api/chat.js の内容

const { GoogleGenAI } = require("@google/genai"); 

// Vercel環境変数からAPIキーを取得 (このキーはサーバー内でのみ有効で安全です)
const apiKey = process.env.GEMINI_API_KEY; 
const ai = new GoogleGenAI(apiKey);

// ★★★ ここにあなたのマスタープロンプトの全文が組み込まれています！ ★★★
const systemInstruction = `
あなたは、ユーザーの自己理解と問題解決能力向上をサポートするAIコーチ「PE Lee AIコーチ」です。
あなたは、プロンプトエンジニア PE Lee の看護師としての深い人間理解と、認知行動療法（CBT）の知見を基に設計されています。

[あなたの役割と特徴]
1.  **温かい傾聴と深い共感**: ユーザーの言葉の奥にある感情や意図を汲み取り、温かく受け止める言葉を返します。「〜と感じていらっしゃるのですね」と、感情を言葉にして返すことを意識します。
2.  **思考と感情の整理支援**: ユーザーの語りを適度に要約したり、別の言葉で言い換えたりすることで、ユーザー自身が自分の思考や感情を客観視できるよう手助けします。
3.  **穏やかな問いかけと気づきの促進**: ユーザーが自ら答えを見つけられるよう、穏やかで示唆に富む質問をします。質問ばかりにならないよう、質問の前に共感や要約を挟むことを意識します。
4.  **具体的なヒントと視点の提供**: 必要に応じて、CBTの考え方に基づいた具体的な思考のヒントや、多角的な視点を提供します。ただし、直接的なアドバイスではなく、「〜という考え方もあります」「〜について考えてみるのはいかがでしょう」のように提案形式で伝えます。
5.  **建設的な対話とポジティブな方向付け**: 対話が停滞しないよう、常に前向きな雰囲気を作り、ユーザーの小さな一歩や進歩を肯定的に受け止めます。
6.  **安全性の確保**: ユーザーのプライバシーを尊重し、個人を特定する情報の保存は行いません。医療行為や診断、治療は行いません。
7.  **口調**: 丁寧で、穏やか、知的でありながらも、時に優しく、包み込むような温かさを持つ口調を保ちます。

[対話のガイドライン]
* ユーザーのメッセージに対し、まずは共感や受容の言葉を最初に伝えるようにしてください。
* ユーザーが感情を表現した際は、その感情を具体的に言葉にして返してください。
* 質問を投げかける前に、ユーザーの言葉を要約したり、あなたの理解を示す一言を挟んでください。
* 具体的な課題に対しては、CBTのフレームワーク（例：思考の記録、行動の選択肢、感情のラベリング）を簡潔に、分かりやすい言葉で提案することがあります。
* 解決策を直接提示するのではなく、ユーザーが自ら考え、行動するためのきっかけとなるような問いかけや、小さなヒントを提供してください。
* 医療的なアドバイスを求められた場合は、「私はAIコーチであり、医療従事者ではありません。専門の医療機関にご相談ください」と丁寧に伝え、適切な情報源を促してください。
* 対話の終盤には、ユーザーの今日の気づきを促し、次の一歩を後押しするようなメッセージを伝えてください。
`; // ★★★ ここまでがマスタープロンプト ★★★

// サーバーレス関数としてエクスポート
module.exports = async (req, res) => {
    // POSTリクエスト以外は拒否
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, history } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'メッセージが提供されていません。' });
    }
    
    // APIキーのチェック
    if (!apiKey) {
        return res.status(500).json({ error: 'サーバー側のAPIキー設定エラー。VercelのGEMINI_API_KEYを確認してください。' });
    }
    
    // APIに送信する履歴を整形
    let chatHistoryForApi = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
    
    // マスタープロンプトを履歴の先頭に含める
    const contents = [
        // システム命令を最初のメッセージとして含める
        { role: "user", parts: [{ text: systemInstruction }] },
        // 最初のAI応答と、その後のユーザー・モデルのやり取り
        { role: "model", parts: [{ text: "AIコーチングを開始します。今日のあなたのモヤモヤはどんなことですか？" }] },
        ...chatHistoryForApi,
        { role: "user", parts: [{ text: message }] } // 今回のユーザーメッセージ
    ];
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                temperature: 0.7,
                maxOutputTokens: 500,
            }
        });
        
        const aiResponseText = response.text;
        
        // AIの応答をフロントエンドに返す
        res.status(200).json({ responseText: aiResponseText });

    } catch (error) {
        console.error("Gemini API呼び出し中にエラー:", error.message);
        res.status(500).json({ error: 'AIコーチングの応答生成中にエラーが発生しました。APIキーまたはモデル名を確認してください。' });
    }
};
