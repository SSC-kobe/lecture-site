document.addEventListener("DOMContentLoaded", function () {
    console.log("スクリプトが読み込まれました");

    // LocalStorageからデータを取得
    let newsData = localStorage.getItem("newsData");
    if (newsData) {
        newsData = JSON.parse(newsData);
        console.log("LocalStorage からデータを取得:", newsData);
    } else {
        console.log("LocalStorage にデータがないため、news.json を取得");
        fetchNewsData();
    }

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

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log("エクセルデータ（配列）:", jsonData);

        const extractedData = jsonData.slice(1).map(row => [row[1], row[2], row[3], row[4]]);
        
        console.log("抽出データ:", extractedData);

        // データを localStorage に保存
        localStorage.setItem("newsData", JSON.stringify(extractedData));

        console.log("localStorage にデータを保存:", localStorage.getItem("newsData"));

        updateEmergencyNews();
    };

    reader.readAsArrayBuffer(file);
}
