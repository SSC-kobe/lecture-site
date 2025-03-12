console.log("スクリプトが読み込まれました！");

// **ページ読み込み時に localStorage からデータを取得**
document.addEventListener("DOMContentLoaded", function() {
    const storedNews = localStorage.getItem("newsData");
    if (storedNews) {
        console.log("localStorage からデータを読み込み:", storedNews);
        displayNews(JSON.parse(storedNews));
    } else {
        console.log("localStorage にデータがありません。");
    }
});

// **エクセルファイルのアップロード処理**
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
            let updateDate = row[0];
            if (typeof updateDate === "number") {
                updateDate = new Date((updateDate - 25569) * 86400 * 1000).toISOString().split('T')[0];
            }

            const newsItem = {
                date: updateDate,
                category: row[1] || "",
                title: row[2] || "",
                details: row[3]
