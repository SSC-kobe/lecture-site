document.getElementById('fileInput').addEventListener('change', function(evt) {
    let file = evt.target.files[0];
    let reader = new FileReader();
    
    reader.onload = function(e) {
        let data = new Uint8Array(e.target.result);
        let workbook = XLSX.read(data, { type: 'array' });
        let sheet = workbook.Sheets[workbook.SheetNames[0]];
        let jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        let headers = jsonData[1]; // B2~E2
        let entries = jsonData.slice(2).reverse(); // 上に追加するために逆順
        
        let container = document.getElementById('newsContainer');
        container.innerHTML = '';
        
        entries.forEach(row => {
            let title = row[1]; // B列
            let date = row[2]; // C列
            let category = row[3]; // D列
            let details = row[4]; // E列
            
            let newsItem = document.createElement('div');
            newsItem.classList.add('news-item');
            newsItem.innerHTML = `<strong>${title}</strong> (${date}) [${category}]`;
            
            newsItem.addEventListener('click', function() {
                alert(details); // ポップアップ表示
            });
            
            container.appendChild(newsItem);
        });
    };
    
    reader.readAsArrayBuffer(file);
});
