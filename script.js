document.addEventListener("DOMContentLoaded", function () {
    console.log("スクリプトが読み込まれました");

    // LocalStorageからデータを取得
    let newsData = localStorage.getItem("newsData");
    if (newsData) {
        newsData = JSON.parse(newsData);
        console.log("LocalStorage からデータを取得:", newsData);
    } else {
        console.log("LocalStorage にデータがありません。news.json を取得します。");
        fetchNewsData();
    }

    // 緊急のお知らせ欄を更新
    updateEmergencyNews();

    // エクセルアップロード処理
    const fileInput = document.getElementById("fileUpload");
    if (fileInput) {
        fileInput.addEventListener("change", handleFileUpload);
    }
});

// JSONファイルからデータを取得
function fetchNewsData() {
    fetch("news.json")
        .then(response => response.json())
        .then(data => {
            console.log("news.json のデータを取得:", data);
            localStorage.setItem("newsData", JSON.stringify(data));
            updateEmergencyNews();
        })
        .catch(error => console.error("news.json の取得エラー:", error));
}

// 緊急のお知らせ欄を更新
function updateEmergencyNews() {
    let newsData = localStorage.getItem("newsData");
    if (newsData) {
        newsData = JSON.parse(newsData);
        const emergencyNews = document.getElementById("emergencyNews");

        // 「緊急」のお知らせをフィルタリング
        const urgentNews = newsData.filter(item => item[1] === "緊急");

        if (urgentNews.length > 0) {
            emergencyNews.innerHTML = `<strong>${urgentNews[0][2]}</strong><br>${urgentNews[0][3]}`;
        } else {
            emergencyNews.innerHTML = "現在、緊急のお知らせはありません。";
        }
    }
}

// エクセルアップロード処理
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // シート名を取得（最初のシートを使う）
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // シートのデータをJSONに変換
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log("エクセルデータ（配列）:", jsonData);

        // 必要な範囲（B列～E列）を抽出
        const extractedData = jsonData.slice(1).map(row => [row[1], row[2], row[3], row[4]]);
        
        console.log("抽出データ:", extractedData);

        // データを localStorage に保存
        localStorage.setItem("newsData", JSON.stringify(extractedData));

        // news.json に保存（仮想的に）
        saveNewsData(extractedData);

        // ページを更新
        updateEmergencyNews();
    };

    reader.readAsArrayBuffer(file);
}

// news.json にデータを保存する関数（仮想的な処理）
function saveNewsData(data) {
    fetch("news.json", {
        method: "POST", 
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => console.log("news.json に保存:", response))
    .catch(error => console.error("news.json の保存エラー:", error));
}
