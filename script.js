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

        if (jsonData.length < 2) {
            alert('データが不足しています');
            return;
        }

        const newsArray = [];
        const reversedData = jsonData.slice(1).reverse();

        reversedData.forEach(row => {
            let updateDate = row[0] || ""; // B列（更新日）
            const target = row[1] || ""; // C列（対象）
            const summary = row[2] || ""; // D列（概要）
            const detail = row[3] || ""; // E列（詳細）

            if (!updateDate && !target && !summary) return;

            // 日付を「12/13(金)」形式に変換
            if (!isNaN(updateDate)) {
                const dateObj = XLSX.SSF.parse_date_code(updateDate);
                updateDate = `${dateObj.m}/${dateObj.d}(${["日", "月", "火", "水", "木", "金", "土"][new Date(dateObj.y, dateObj.m - 1, dateObj.d).getDay()]})`;
            }

            newsArray.push({
                date: updateDate,
                category: target,
                title: summary,
                detail: detail
            });
        });

        // `localStorage` にデータを保存（ページ更新後も保持）
        localStorage.setItem("newsData", JSON.stringify(newsArray));

        // `news.json` を手動で更新
        saveNewsJSON(newsArray);

        alert("お知らせを保存しました！（ページを更新してもデータは保持されます）");
    };
    reader.readAsArrayBuffer(file);
});

// `news.json` を手動で更新する関数
function saveNewsJSON(newsArray) {
    fetch('/news.json', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newsArray)
    })
    .then(response => response.json())
    .then(data => console.log("news.json に保存完了:", data))
    .catch(error => console.error("エラー:", error));
}

// ページ読み込み時に `localStorage` からデータを復元
window.onload = function() {
    const savedNews = localStorage.getItem("newsData");
    if (savedNews) {
        displayNews(JSON.parse(savedNews));
    }
};

// `news.json` のデータを表示
function displayNews(newsArray) {
    const tbody = document.querySelector('#noticeTable tbody');
    tbody.innerHTML = "";

    newsArray.forEach(news => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${news.date}</td>
            <td>${news.category}</td>
            <td class="popup-btn" onclick="showPopup(this)" data-detail="${encodeURIComponent(news.detail)}">${news.title}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ポップアップの表示
function showPopup(element) {
    const detail = decodeURIComponent(element.getAttribute("data-detail"));
    alert(detail.trim() !== "" ? detail : "詳細情報がありません");
}
