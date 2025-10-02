<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIコーチングデモ</title>
    <!-- Tailwind CSS CDNを読み込み -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Interフォントのインポート */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            background-color: #0B1430; /* 指定された背景色に同化 */
            color: #c9d1d9; /* 明るいテキスト色 */
        }

        /* カスタムスクロールバー */
        .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: #1a202c; /* ダークなトラック */
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #4a5462;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #606b7a;
        }

        /* アイコンの基本的なスタイル */
        .icon-svg {
            display: inline-block;
            vertical-align: middle;
            width: 20px; /* デフォルトサイズ */
            height: 20px; /* デフォルトサイズ */
            stroke-width: 2;
            stroke: currentColor;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .icon-svg.animate-spin {
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">
    <!-- AIコーチングデモのメインコンテナ -->
    <div class="flex flex-col h-[70vh] max-h-[800px] w-full max-w-4xl mx-auto p-4 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
        <!-- ヘッダー -->
        <div class="flex justify-between items-center pb-3 mb-4 border-b border-gray-700">
            <h2 class="text-2xl font-bold text-blue-400 flex items-center">
                <!-- MessageSquare icon -->
                <svg class="icon-svg mr-2" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                AIコーチングデモ
            </h2>
            <button id="newSessionBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                <!-- RefreshCcw icon -->
                <svg class="icon-svg mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                    <path d="M21 3v5h-5"></path>
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                    <path d="M3 21v-5h5"></path>
                </svg>
                新規セッション
            </button>
        </div>

        <!-- チャット履歴表示エリア -->
        <div id="messagesContainer" class="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 mb-4">
            <!-- メッセージはJavaScriptでここに動的に追加されます -->
            <div id="initialMessage" class="text-center text-gray-500 py-10">
                <p>AIコーチングを開始します。最初のメッセージを入力してください。</p>
                <p class="text-sm mt-2">（例: 「最近、仕事でモヤモヤしています。」）</p>
            </div>
        </div>

        <!-- メッセージ入力エリア -->
        <div class="flex mt-auto">
            <input
                type="text"
                id="messageInput"
                placeholder="メッセージを入力してください..."
                class="flex-1 p-3 rounded-l-lg bg-gray-800 text-gray-100 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 disabled:opacity-50"
            />
            <button id="sendMessageBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-r-lg transition-all duration-300 ease-in-out shadow-md hover:shadow-lg flex items-center disabled:opacity-50 disabled:cursor-not-allowed">
                <!-- SendHorizonal icon (初期状態) -->
                <svg id="sendIcon" class="icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 2L11 13"></path>
                    <path d="M22 2l-7 19-3-7L2 22z"></path>
                </svg>
                <!-- Loader2 icon (送信中) -->
                <svg id="loadingIcon" class="icon-svg animate-spin hidden" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                </svg>
            </button>
        </div>
    </div>

    <script>
        // ==============================================================================
        // JavaScriptロジック
        // ==============================================================================

        // 各HTML要素への参照を取得
        const messagesContainer = document.getElementById('messagesContainer');
        const messageInput = document.getElementById('messageInput');
        const sendMessageBtn = document.getElementById('sendMessageBtn');
        const newSessionBtn = document.getElementById('newSessionBtn');
        const sendIcon = document.getElementById('sendIcon');
        const loadingIcon = document.getElementById('loadingIcon');
        const initialMessageDiv = document.getElementById('initialMessage');

        let chatHistory = []; // チャット履歴を保持
        let isLoading = false; // AIが応答を生成中かどうかのフラグ

        // ==============================================================================
        // メッセージをDOMに追加する関数
        // ==============================================================================
        function addMessage(msg) {
            // 初期メッセージを非表示にする
            if (!initialMessageDiv.classList.contains('hidden')) {
                initialMessageDiv.classList.add('hidden');
            }

            const messageDiv = document.createElement('div');
            messageDiv.className = `flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`;

            const contentDiv = document.createElement('div');
            contentDiv.className = `flex items-start max-w-[80%] p-3 rounded-lg shadow-md ${
                msg.sender === 'user'
                    ? 'bg-blue-700 text-white rounded-br-none'
                    : 'bg-gray-800 text-gray-100 rounded-bl-none'
            }`;

            if (msg.sender === 'ai') {
                // Bot icon
                const botIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                botIcon.classList.add('icon-svg', 'flex-shrink-0', 'mr-2', 'text-blue-400');
                botIcon.setAttribute('width', '20');
                botIcon.setAttribute('height', '20');
                botIcon.setAttribute('viewBox', '0 0 24 24');
                botIcon.innerHTML = `<path d="M12 11V14"></path><path d="M17.4 18.4V10.2a2.33 2.33 0 0 0-2.33-2.33H8.93a2.33 2.33 0 0 0-2.33 2.33v8.2"></path><path d="M6.6 15.8H17.4"></path><path d="M12 22a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"></path>`;
                contentDiv.appendChild(botIcon);
            }

            const p = document.createElement('p');
            p.className = 'break-words';
            p.textContent = msg.text;
            contentDiv.appendChild(p);

            if (msg.sender === 'user') {
                // User icon
                const userIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                userIcon.classList.add('icon-svg', 'flex-shrink-0', 'ml-2', 'text-blue-200');
                userIcon.setAttribute('width', '20');
                userIcon.setAttribute('height', '20');
                userIcon.setAttribute('viewBox', '0 0 24 24');
                userIcon.innerHTML = `<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>`;
                contentDiv.appendChild(userIcon);
            }

            messageDiv.appendChild(contentDiv);
            messagesContainer.appendChild(messageDiv);

            // 自動スクロール
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // ロード中のインジケーター表示を切り替える関数
        function setLoadingState(loading) {
            isLoading = loading;
            messageInput.disabled = loading;
            sendMessageBtn.disabled = loading;
            newSessionBtn.disabled = loading;

            if (loading) {
                sendIcon.classList.add('hidden');
                loadingIcon.classList.remove('hidden');
                messageInput.placeholder = "AIコーチが応答を生成中です...";
            } else {
                sendIcon.classList.remove('hidden');
                loadingIcon.classList.add('hidden');
                messageInput.placeholder = "メッセージを入力してください...";
            }
        }

        // ==============================================================================
        // 【最重要】バックエンド（サーバー）と通信する関数
        // ==============================================================================
        async function generateContent(userMessage) {
            setLoadingState(true);

            // サーバーに送信する履歴を整形
            const historyForApi = chatHistory.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));

            try {
                // GoogleのAPIではなく、私たちのサーバー(/api/chat)を呼び出します
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: userMessage,
                        history: historyForApi
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("サーバーエラー:", errorData);
                    return `エラーが発生しました: ${errorData.error || response.statusText}`;
                }

                const result = await response.json();
                return result.response;

            } catch (error) {
                console.error("サーバーとの通信中にエラーが発生しました:", error);
                return `サーバーとの通信中にエラーが発生しました。ネットワーク接続を確認してください。`;
            } finally {
                setLoadingState(false);
            }
        }

        // ==============================================================================
        // UIからのメッセージ送信ハンドラ
        // ==============================================================================
        async function handleSendMessage() {
            const userMessageText = messageInput.value.trim();
            if (userMessageText === '' || isLoading) {
                return;
            }

            const newUserMessage = { sender: 'user', text: userMessageText };
            addMessage(newUserMessage); // 自分のメッセージをUIに追加
            chatHistory.push(newUserMessage); // 履歴に追加
            messageInput.value = ''; // 入力フィールドをクリア

            // AIの応答をサーバーから取得
            const aiResponseText = await generateContent(userMessageText);

            const aiResponseMessage = { sender: 'ai', text: aiResponseText };
            addMessage(aiResponseMessage); // AIのメッセージをUIに追加
            chatHistory.push(aiResponseMessage); // 履歴に追加
        }

        // ==============================================================================
        // イベントリスナーの設定
        // ==============================================================================
        sendMessageBtn.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });

        // 新しいセッションを開始（チャット履歴をクリア）
        newSessionBtn.addEventListener('click', () => {
            if (isLoading) return;
            messagesContainer.innerHTML = ''; // 全てのメッセージをクリア
            chatHistory = []; // 履歴もクリア
            // 初期メッセージを再表示
            initialMessageDiv.classList.remove('hidden');
            // 最初のAIからのウェルカムメッセージを再表示
            setTimeout(() => {
                addMessage({ sender: 'ai', text: "こんにちは。どのようなことでもお聞かせください。あなたの力になります。" });
            }, 100);
        });
        
        // ==============================================================================
        // 初期化
        // ==============================================================================
        // ページロード時に最初のAIメッセージを表示
        window.onload = () => {
             setTimeout(() => {
                addMessage({ sender: 'ai', text: "こんにちは。どのようなことでもお聞かせください。あなたの力になります。" });
            }, 500); // 少し遅延させて表示
        };

    </script>
</body>
</html>

