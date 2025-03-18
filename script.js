console.log("スクリプトが読み込まれました！");

// ✅ エクセルアップロード処理
document.getElementById('fileInput').addEventListener('change', async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        if (jsonData.length < 2) {
            alert('データが不足しています');
            return;
        }

        const newsArray = jsonData.slice(1).map(row => ({
            date: row[0] || "",  
            category: row[1] || "",  
            title: row[2] || "",  
            detail: row[3] || ""  
        }));

        console.log("生成された news.json:", JSON.stringify(newsArray, null, 2));

        // ✅ GitHub に news.json をアップロード
        await uploadToGitHub(newsArray);
    };
    reader.readAsArrayBuffer(file);
});

// ✅ GitHub API を使って news.json をリポジトリにアップロード
async function uploadToGitHub(newsData) {
    const token = "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"; // 🔹 Netlify 環境変数を使う場合は process.env.GITHUB_TOKEN
    const owner = "SSC-kobe"; // 🔹 GitHub ユーザー名
    const repo = "lecture-site"; // 🔹 リポジトリ名
    const path = "news.json"; // 🔹 アップロードするファイルのパス
    const branch = "main"; // 🔹 変更を反映するブランチ

    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

    // 🔹 既存のファイルの SHA を取得（上書きするために必要）
    const response = await fetch(url, { headers: { Authorization: `token ${token}` } });
    const json = await response.json();
    const sha = json.sha;

    // 🔹 新しいファイルデータを作成
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(newsData, null, 2))));

    const payload = {
        message: "Update news.json",
        content: content,
        branch: branch,
        sha: sha // 🔹 既存ファイルがある場合は SHA を指定（上書き保存）
    };

    const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (uploadResponse.ok) {
        console.log("✅ news.json が GitHub にアップロードされました！");
        alert("news.json が更新されました！");
    } else {
        console.error("❌ GitHub へのアップロードに失敗:", await uploadResponse.json());
        alert("GitHub へのアップロードに失敗しました。");
    }
}
