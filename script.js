console.log("スクリプトが読み込まれました！");

// ✅ ページ読み込み時に news.json を取得して表示
document.addEventListener("DOMContentLoaded", function () {
    fetchNewsData();
});

// ✅ GitHub Pages の news.json を取得
function fetchNewsData() {
    fetch("https://your-username.github.io/lecture-site/news.json")  // ← ユーザー名を変更
        .then(response => {
            if (!response.ok) {
                throw new Error("news.json の取得に失敗しました");
            }
            return response.json();
        })
        .then(data => {
            console.log("news.json のデータを取得:", data);
            displayNews(data);
            updateEmergencyNews(data);
        })
        .catch(error => {
            console.error("news.json の取得エラー:", error);
            document.getElementById("newsList").innerHTML = "お知らせを取得できませんでした。";
        });
}

// ✅ お知らせデータをテーブルに表示
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

// ✅ 緊急のお知らせを更新
function updateEmergencyNews(newsData) {
    const emergencyNews = document.getElementById("emergencyNews");

    // 「緊急」のお知らせをフィルタリング
    const urgentNews = newsData.filter(item => item.category === "緊急");

    if (urgentNews.length > 0) {
        emergencyNews.innerHTML = `<strong>${urgentNews[0].title}</strong><br>${urgentNews[0].detail}`;
    } else {
        emergencyNews.innerHTML = "現在、緊急のお知らせはありません。";
    }
}

// ✅ エクセルファイルのアップロード処理
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

        console.log("エクセルデータを取得:", JSON.stringify(jsonData, null, 2));

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

        console.log("新しい news.json データ:", JSON.stringify(newsArray, null, 2));

        // GitHub Pages ではサーバーに直接保存できないため、ユーザーにダウンロードさせる
        downloadNewsJSON(newsArray);
    };
    reader.readAsArrayBuffer(file);
});

// ✅ news.json をダウンロードする関数（GitHub Pages では直接保存不可のため）
function downloadNewsJSON(data) {
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
