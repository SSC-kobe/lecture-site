console.log("スクリプトが読み込まれました！");

// ✅ エクセルアップロード処理
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        console.log("エクセルデータ:", jsonData);

        // ✅ お知らせデータを変換して表示
        const newsArray = jsonData.slice(1).map(row => ({
            date: row[0] || "",  // B列（更新日）
            category: row[1] || "",  // C列（対象）
            title: row[2] || "",  // D列（概要）
            detail: row[3] || ""  // E列（詳細）
        }));

        // ✅ テーブルに反映
        displayNews(newsArray);

        // ✅ JSONデータとしてダウンロード
        saveNewsJSON(newsArray);
    };
    reader.readAsArrayBuffer(file);
});

// ✅ お知らせデータを表示
function displayNews(newsData) {
    const tbody = document.querySelector('#noticeTable tbody');
    tbody.innerHTML = "";

    newsData.forEach(news => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${news.date}</td>
            <td>${news.category}</td>
            <td class="popup-btn" onclick="showPopup(this)" data-detail="${encodeURIComponent(news.detail)}">${news.title}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ✅ news.json をダウンロードする関数（GitHubには直接保存不可）
function saveNewsJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "news.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// ✅ ポップアップの表示
function showPopup(element) {
    const detail = decodeURIComponent(element.getAttribute("data-detail"));
    alert(detail.trim() !== "" ? detail : "詳細情報がありません");
}
