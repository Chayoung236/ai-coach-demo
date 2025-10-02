// server.js
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// api/chat.js のサーバーレス関数を Express のルートとしてインポート
const chatHandler = require('./api/chat');

// JSONリクエストのボディを解析
app.use(express.json());

// 静的ファイル (index.html, CSSなど) を提供
// __dirname は現在のフォルダ
app.use(express.static(path.join(__dirname)));

// APIエンドポイントを /api/chat に設定
app.post('/api/chat', (req, res) => {
    // Vercel の形式に合わせて req と res を渡す
    chatHandler(req, res);
});

app.listen(port, () => {
    console.log(`AI Coaching Demo is running at http://localhost:${port}`);
    console.log(`Press Ctrl+C to stop the server.`);
});
