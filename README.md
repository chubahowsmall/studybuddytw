# 伴讀書僮（國中複習教材）

「伴讀書僮」是國中各科自編複習教材的入口網站。目前收錄「3D 地理探索館」：國中七年級上學期地理（翰林版第一冊）第 3～4 章的互動 3D 複習網站。純靜態網頁，不需要任何建置步驟，可以直接放上 GitHub Pages。

## 檔案結構

```
index.html      伴讀書僮首頁（banner 圖＋各科教材入口）
geography.html  3D 地理探索館首頁：段考範圍、單元入口、使用說明、考前進度
forces.html     3-1 內營力與外營力（造山、火山、侵蝕堆積互動模型）
contour.html    3-2 等高線與地形剖面圖（3D↔等高線切換、拖曳畫剖面、判讀挑戰）
taiwan.html     3-3 臺灣地形（地形分布圖、可自選位置的 3D 地形剖面）
coast.html      4-1・4-2 海岸（沙岸、岬灣、斷層、珊瑚礁四種 3D 模型與分布圖）
islands.html    4-3 離島成因（大陸島、火山島、珊瑚礁島，含滑桿形成過程）
quiz.html       小測驗 25 題（自編題，作答後即時解析）
assets/
  style.css         共用樣式
  common.js         共用程式（導覽列、3D 視窗、地形、等高線、臺灣地圖）
  three.min.js      three.js r149（MIT 授權，見 three.LICENSE.txt）
  geo.js            臺灣與鄰近海岸輪廓（Natural Earth 1:10m，公有領域）
  taiwan-counties.js  縣市界線
  dem-taiwan.js     臺灣高度資料（NASA SRTM 重新取樣，公有領域；海底為示意）
  img/banner-bandu-*.jpg  首頁 banner（由 resources/ 的原圖縮小）
resources/      原始圖檔
.nojekyll       讓 GitHub Pages 不經 Jekyll 處理，原樣發布
```

所有函式庫都放在 `assets/`，不依賴外部 CDN。

## 本機預覽

直接雙擊 HTML 檔也能開，但建議用本機伺服器，避免瀏覽器限制：

```bash
cd studybuddytw
python3 -m http.server 8000
# 瀏覽器開 http://localhost:8000/
```

## 發布到 GitHub Pages

1. 在 GitHub 建立公開儲存庫，例如 `studybuddytw`（免費帳號的 Pages 必須用公開儲存庫）。
2. 把這個資料夾的內容推上預設分支（`main` 或 `master`；`index.html` 要在根目錄）。
3. 儲存庫 Settings → Pages → Build and deployment：Source 選 **Deploy from a branch**，Branch 選你的預設分支（**main** 或 **master**）、資料夾選 **/(root)**，按 Save。
4. 約 1～2 分鐘後，網站會出現在 `https://<你的帳號>.github.io/studybuddytw/`。

> 儲存庫是公開的，請不要把孩子的成績、錯題紀錄或任何個人資料放進來。

## 嵌入 Blogger

在文章或網頁的編輯器切到「HTML 檢視」，貼上：

```html
<iframe src="https://<你的帳號>.github.io/studybuddytw/contour.html?embed=1"
        style="width:100%;border:0;height:1800px" loading="lazy"
        title="等高線與地形剖面圖"></iframe>
<script>
window.addEventListener('message',function(e){
  if(e.data&&e.data.type==='g3-height'){
    document.querySelectorAll('iframe').forEach(function(f){
      if(f.contentWindow===e.source)f.style.height=(e.data.h+20)+'px';
    });
  }
});
</script>
```

- 網址後面的 `?embed=1` 會隱藏網站本身的導覽列和頁尾，讓教材融入 Blogger 版面；頁面內的連結也會保留嵌入模式。
- 下面那段 `<script>` 會依教材實際高度自動調整 iframe 高度，不會出現捲軸。一篇文章裡有多個 iframe 時，這段只要貼一次。
- 貼好後**留在 HTML 檢視**儲存，不要切回「撰寫檢視」，以免編輯器改寫程式碼。
- 首頁一次列出多篇文章時，建議在 iframe 前面插入「跳頁」分隔，讓 3D 模型只在點進文章後才載入。

把 `contour.html` 換成其他頁面檔名，就能嵌入其他單元。

## 嵌入 Wix

1. 新增元件 →「嵌入程式碼」→「嵌入網站」（Embed a site / Embed HTML 的「網址」模式）。
2. 網址填 `https://<你的帳號>.github.io/studybuddytw/coast.html?embed=1`。
3. 把元件寬度拉滿，高度建議 1,600～2,400 px（Wix 外層無法接收自動高度訊息，需要手動設定）。
4. Wix 的手機版版面要另外到手機版編輯器調整元件大小。

## 內容說明

- 依學校公告的第二次段考範圍（2026/11/30～12/1，第 3～4 章）編寫。
- 3D 模型與地圖都是示意，高度經過垂直誇大，不是實測地形資料。
- 小測驗為自編題，不是學校或出版社的考題。
