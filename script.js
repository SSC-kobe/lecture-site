console.log("スクリプトが読み込まれました！");

// ✅ ページ読み込み時に保存した「緊急のお知らせ」を表示
document.addEventListener("DOMContentLoaded", function () {
    const savedEmergency = localStorage.getItem("emergencyNews");
    if (savedEmergency) {
        document.getElementById("emergencyNews").textContent = savedEmergency;
    }
});

// ✅ 緊急のお知らせを保存する関数
function saveEmergency() {
    const emergencyText = document.getElementById("emergencyInput").value;

    // 入力が空白の場合はエラー表示
    if (emergencyText.trim() === "") {
        alert("緊急のお知らせを入力してください。");
        return;
    }

    // localStorage にデータを保存
    localStorage.setItem("emergencyNews", emergencyText);

    // ページに反映
    document.getElementById("emergencyNews").textContent = emergencyText;

    alert("緊急のお知らせを保存しました！");
}
