# Antigravity 對話交接文件（2026-11-21）

## 1. 對話與專案概覽

- **日期**：2026-11-21
- **工具**：Antigravity
- **專案**：伴讀書僮（`studybuddytw`，臺灣國中 108 課綱自編複習教材）
- **網站網址**：`https://studybuddytw.org`
- **本機路徑**：`E:\claude_dev\studybuddytw`
- **部署機制**：透過 GitHub Actions（`.github/workflows/deploy-bluehost.yml`）於推送至 `master` 分支時自動部署至 Bluehost（詳見 `docs/deploy-bluehost.md`）。
- **本次處理核心目標**：
  1. 審查國七上生物南一版 2-3「植物如何製造養分」（`bio/photosynthesis.html`）之 108 課綱內容正確性與考點完整性。
  2. 全面優化生物示意圖互動元件（`B.figure`）的視覺對比、懸停預覽、標記鎖定模式與回合制測驗體驗。

---

## 2. 本次對話完成的 Commit 清單

| Commit | 摘要 | 影響檔案 |
| :--- | :--- | :--- |
| `1113ea3` | 優化 2-3 光合作用教材與測驗：強化段考高頻考點與細節 | `bio/photosynthesis.html` |
| `8e2ca67` | 強化生物示意圖點選反饋：比照葉綠體標示導入 `dim` 聚光燈與高對比發光 | `bio/lib/bio.css`, `bio/lib/common.js`, `bio/photosynthesis.html` |
| `4c79830` | 進一步加強圖表對比：未選部位降低亮度至 55% 營造暗色背景，突出選中部位 | `bio/lib/bio.css`, `bio/photosynthesis.html` |
| `467ceaf` | 優化葉片橫切面互動體驗：懸停聚光預覽、葉綠體鎖定模式與回合制部位測驗 | `bio/lib/bio.css`, `bio/lib/common.js`, `bio/photosynthesis.html` |

---

## 3. 各檔案詳細異動紀錄

### 3.1 `bio/photosynthesis.html`
- **教材內容與小測驗補充**：
  - 水蘊草實驗補充加入**碳酸氫鈉（小蘇打，$\text{NaHCO}_3$）**提供二氧化碳的段考高頻考點。
  - 補充光合作用完整化學反應產物亦包含「水」之備註說明。
  - 加強遮光與澱粉檢驗實驗中「**暗室處理**（消耗葉片原存澱粉，避免干擾實驗）」的說明。
  - 小測驗新增第 6 題（水蘊草加入小蘇打產氣考題），總題數增至 **17 題**。
- **葉片橫切面 SVG 與樣式升級**：
  - 全部 9 個部位標籤（角質層、上表皮、柵狀組織、海綿組織、木質部、韌皮部、下表皮、保衛細胞、氣孔）皆預先產生藥丸底框 `<rect class="lblbg">` 並加上 `data-lbl` 屬性。
  - 獨立區分兩種高亮樣式：
    - 學習模式（`#lfSvg.dim:not(.chl-on)`）：選中標籤顯示**琥珀暖框**（`#fef3c7` 底、`#d97706` 框）。
    - 葉綠體標記模式（`#lfSvg.chl-on`）：三種有葉綠體細胞（柵狀組織、海綿組織、保衛細胞）顯示**綠色藥丸框**（`#dcefd6` 底、`#3f7a4f` 框），且圖面游標設為 `cursor: default`。
  - `#lfChl`（「標出有葉綠體的細胞」）改為**獨立鎖定模式**：
    - `B.figure` 設定啟用 `lockMark: true`。
    - 啟用時自動移除 `#lfMode` 內「學習：點了看說明」與「測驗：找出指定部位」的 `.on` 樣式，達成**三顆模式按鈕高亮互斥**。
    - 進入後點擊圖面或重複點擊自己皆不會退出，必須點選上方「學習：點了看說明」或「測驗：找出指定部位」才切換離開。
    - 同步更新右側說明框提示文字。
  - 靜態資源防快取版本號已推進至 `?v=13`（`lib/bio.css?v=13`、`lib/common.js?v=13`）。

### 3.2 `bio/lib/bio.css`
- 強化 `svg.dim` 聚光燈對比：未選中部位與 `.vein-bg` 降為 `opacity: .32; filter: brightness(0.55) grayscale(70%)`。
- 移除 `.sel` 閃爍動畫，改為穩定高對比發光：
  - `.sel`（選中／正確答案提示）：琥珀金雙層光暈 + `brightness(1.28)`。
  - `.good`（答對）：翠綠雙層光暈 + `brightness(1.22)`。
  - `.bad`（答錯）：警示紅雙層光暈 + `brightness(1.15)`。
  - `.hl`（標記模式，如葉綠體）：深綠雙層光暈 + `brightness(1.2)`。
- 文字標籤 `.lbl` 與 `[data-lbl]` 開放互動（`pointer-events: all; cursor: pointer`）。

### 3.3 `bio/lib/common.js`
- **懸停聚光預覽（`hlPart`、`pointerover`、`pointerleave`）**：
  - 抽出純視覺高亮函式 `hlPart(k)`（只變更視覺高亮，不更動右側文字）。
  - **學習模式**：滑鼠移到部位或文字標籤即高亮並顯示說明；移出圖表平滑還原成全彩與初始提示（不因點擊而卡死）。
  - **測驗作答中（`mode === 'test' && target`）**：滑鼠移到部位即觸發聚光預覽（不顯示標籤、不改題目），移出還原；**點擊確認後才判分**，答完進入解說或結算畫面時（`target === null`），移動滑鼠不會干擾對錯結果。
- **標記模式保護（`isMarked`、`lockMark`）**：
  - `isMarked()` 檢查 `cfg.markBtns` 是否有按鈕處於 `.on`，於 `pointerover` / `pointerleave` 中保護標記不被誤清。
  - 當 `cfg.lockMark` 為 `true` 且處於標記模式時，忽略圖面點擊事件。
  - `clear()` 執行時自動將 `cfg.modeBar` 內的模式按鈕（`.btn[data-m]`）同步恢復為目前 `mode` 的 `.on` 狀態。
- **回合制部位測驗（`startRound`、`showSummary`）**：
  - 每回合將 `Object.keys(parts).filter(k => !parts[k].skip)` 全部隨機洗牌測驗一輪（不重複）。
  - 題目與解說區顯示 `第 X 回合・第 Y / N 題` 與答對數；最後一題按鈕顯示 `查看本回合結果 →`。
  - 回合結束進入 `showSummary()`，顯示本回合答對數、正確率與**本回合需再複習清單**，提供 `開始第 X+1 回合 →` 按鈕重洗展開新回合。
  - 答錯解說文字由「閃爍的地方才是」更新為「亮起的地方才是」。

---

## 4. 協作規範（已同步寫入根目錄 `AGENTS.md`）

1. 全程使用**繁體中文**溝通。
2. **修改、新增或刪除任何檔案前，必須先列出預計修改內容並取得使用者明確同意。**
3. 修改完成後提供繁體中文 Git Commit Log。
4. 變更共用 CSS/JS 後記得推進對應 HTML 頁面的 `?v=N` 參數，避免瀏覽器快取舊檔。

---

## 5. 後續建議與待辦事項

目前僅針對 `bio/photosynthesis.html` 完成完整內容審查與新版互動適配；其餘使用 `B.figure` 的生物頁面已自動受惠於 `bio/lib/common.js` 的回合制測驗與懸停聚光，但尚未逐一檢查細節與套用獨立鎖定模式：

1. **`bio/digestion.html`（2-4 消化）**：
   - 使用了 `markBtns: ['dgTube', 'dgGland', 'dgTrip']`，且頁面內有獨立的 `$('#dgSvg').addEventListener('click', ...)` 來停止「食物的旅程」計時器。
   - 若要比照 `photosynthesis.html` 導入 `lockMark: true` 與按鈕互斥高亮，需一併調整 `dgToggle`、`dgTrip` 與上述 `click` 監聽器，並加上 `?v=N` 防快取版本號。
2. **`bio/transport.html`（3-1 植物的運輸）**：
   - 檢視 `B.figure` 與莖橫切面互動（`B.mark` / `hl2`）與新版懸停聚光的相容性，並視需要更新 `?v=N`。
3. **`bio/circulation.html`（3-2 循環）**：
   - 檢視 4 張互動圖表（`blSvg`、`fiSvg`、`htSvg`、`lyGv`）的懸停聚光與回合制測驗體驗，以及 108 課綱南一版內容正確性。
4. **`bio/nutrients.html`（2-1・2-2 養分與酵素）、`bio/defense.html`（3-3 防禦）**：
   - 可依需求進行 108 課綱南一版內容審查與測驗題目校對。
