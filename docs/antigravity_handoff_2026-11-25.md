# Antigravity 對話交接文件（2026-11-25）

## 1. 對話與專案概覽

- **日期**：2026-11-24 ～ 2026-11-25（承接 `docs/antigravity_handoff_2026-11-24.md`）
- **工具**：Antigravity
- **專案**：伴讀書僮（`studybuddytw`，臺灣國中 108 課綱自編複習教材）
- **網站網址**：`https://studybuddytw.org`
- **本機路徑**：`E:\claude_dev\studybuddytw`
- **考古題參考路徑**：`E:\私人\李妮\國七上學期\自然\第二次段考`（含 432 份 108～114 學年度試卷與 `重點整理/` 下兩份滿分攻略 PDF）
- **部署機制**：透過 GitHub Actions（`.github/workflows/deploy-bluehost.yml`）於推送至 `master` 分支時自動部署至 Bluehost（詳見 `docs/deploy-bluehost.md`）。
- **目前全站里程碑（`dev` 分支，截至 `c4f40fc`）**：
  1. **生物互動實驗室（`bio/`，南一版 2-1～3-3）**：全部 6 個單元與首頁皆已完成統一規格升級（共 **154 題互動小測驗、含 30 題原生向量 SVG 圖表判讀題**）；11/25 經實圖比對後，決議**保留** 3-1 既有之 `bio/img/stem-to-leaf.jpg`（無字底圖＋SVG 向量標註可隱藏自測、全站橘木質／藍韌皮色系一致且完整含氣孔與南一版「柵狀組織」用語）。
  2. **公民生活館（`civics/`，翰林版 3-1～4-2）**：已於 `c4f40fc` 完成建置並掛上全站首頁入口（4 大單元＋公民首頁、陶土暖橘主題、100 題互動小測驗含 20 題 SVG 圖表判讀）。
  3. **全站 UI 體驗**：全站所有科目單元內頁皆已統一搭載**右側垂直置中「回到最上方」浮動按鈕**（排除全站主首頁及各科首頁，捲動超過 260px 平滑浮現）。

---

## 2. Git 分支、提交與工作區狀態

- **目前分支**：`dev`（最新提交 `c4f40fc`）；`master` 位於 `01e7ae7`（`origin/master`，尚未合併本輪 `dev` 更新）。
- **工作區狀態**：截至本交接文件建立前工作區乾淨；本次僅新增 `docs/antigravity_handoff_2026-11-25.md`（待提交）。

### 近期 Commit 一覽（`dev` 分支，承接 `79d151b` 之後）
| Commit | 日期 | 摘要 | 主要影響檔案 |
| :--- | :---: | :--- | :--- |
| `8822be1` | 11/24 | 加碼升級 2-3 光合作用：光照深度曲線、水蘊草 pH 模擬、斑葉四區實驗與 25 題圖解測驗 | `bio/photosynthesis.html` |
| `5cd061d` | 11/24 | 加碼升級 2-4 人體如何獲得養分：小腸絨毛吸收分流圖、酵素 pH 活性曲線與 25 題圖解測驗 | `bio/digestion.html` |
| `19e3d91` | 11/24 | 全面升級 2-1・2-2 養分與酵素：對齊 `?v=13`、產物總量曲線、雙向溫度恢復與 25 題圖解測驗 | `bio/nutrients.html` |
| `26fd2f8` | 11/24 | 新增全站單元內頁右側垂直置中「回到最上方」浮動按鈕 | `assets/style.css`, `bio/geo/math` `common.js`, 全站 20 個 HTML |
| `10798b7` | 11/24 | 更新生物互動實驗室首頁（`bio/index.html`）方案 A 亮點卡片與 11/24 交接文件 | `bio/index.html`, `docs/antigravity_handoff_2026-11-24.md` |
| `c4f40fc` | 11/25 | 新增「公民生活館」（國七上第二次段考翰林版 3-1～4-2）完整互動複習網站與首頁入口 | `civics/*`, `index.html` |

---

## 3. 全站各科與共用防快取版本總覽

| 模組／科目 | 涵蓋頁面 | 現行共用資源版本 | 現況摘要 |
| :--- | :--- | :--- | :--- |
| **全站共用／首頁** | `index.html` | `assets/style.css?v=4` | 已新增「公民生活館」入口卡片；右側浮動回頂端按鈕不顯示於主首頁 |
| **生物互動實驗室（`bio/`）** | `index` + 6 單元（2-1～3-3） | `style?v=4` / `bio.css?v=13` / `common.js?v=14` | **全數完成升級**（154 題、30 題 SVG 圖表題）；3-1 確認保留原 `stem-to-leaf.jpg` |
| **公民生活館（`civics/`）** | `index` + 4 單元（3-1～4-2） | `style?v=4` / `civics.css?v=3` / `common.js?v=3` | **全新完成**（100 題、20 題 SVG 圖表題、含右側回頂端按鈕與四大互動引擎） |
| **3D 地理探索館（`geo/`）** | `index` + 5 單元 + `quiz` | `style?v=4` / `common.js?v=3` | 已同步掛載右側回頂端浮動按鈕 |
| **數學互動教室（`math/`）** | `index` + 4 單元（2-1～2-4） | `style?v=4` / `math.css?v=2` / `common.js?v=3` | 已同步掛載右側回頂端浮動按鈕 |

### 生物單元（`bio/`）明細備忘
- `bio/nutrients.html`（2-1・2-2）：25 題（5 圖表題：`QF_LABEL`、`QF_TEST_TUBES`、`QF_ENZYME_RATE`、`QF_TEMP_RECOVER`、`QF_SALIVA_TUBES`）
- `bio/photosynthesis.html`（2-3）：25 題（5 圖表題：`QF_LIGHT_CURVE`、`QF_ECO_PH`、`QF_LEAF`、`QF_ALCOHOL`、`QF_VAR4`）
- `bio/digestion.html`（2-4）：25 題（5 圖表題：`QF_ORGANS`、`QF_VILLUS`、`QF_BLOOD_CHANGE`、`QF_UNDIGESTED`、`QF_PH_CURVE`）
- `bio/transport.html`（3-1）：24 題（5 圖表題）；保留 `bio/img/stem-to-leaf.jpg` 與 `partial-girdling.jpg`
- `bio/circulation.html`（3-2）：30 題（5 圖表題）；含 `blood-centrifuge.jpg`、`heart-cutaway.jpg`、心動週期可動瓣膜、快遞貨車與手繪水彩淋巴圖
- `bio/defense.html`（3-3）：25 題（5 圖表題）；含手繪水彩三道防線剖面、15 題分類挑戰、疫苗記憶心智圖與 4 情境曲線

---

## 4. 2026-11-25 本日確認與決策紀錄

- **3-1 莖到葉脈立體剖面圖比對決策**：
  - 使用者提供一張深背景 3D 寫實剖面圖與現行 `bio/img/stem-to-leaf.jpg` 比對。
  - 評估後因新圖文字燒死（無法支援隱藏標註自測）、含「柵欄組織」非南一版用語、缺少氣孔／保衛細胞，且藍木質／紅韌皮配色與同頁芹菜染紅及 2-3／3-1 其他圖相反，使用者明確拍板**保留既有 `bio/img/stem-to-leaf.jpg`、無須修改**。

---

## 5. 協作規範與本機環境備忘

1. **協作規範（詳見根目錄 `AGENTS.md`）**：
   - 全程使用繁體中文溝通。
   - **修改、新增或刪除任何檔案前，必先列出預計變動內容並取得使用者明確同意。**
   - 較大的視覺改動或新插圖，先用 `generative_ui` 製作互動預覽供使用者確認後再套用至專案。
   - 完成修改後提供繁體中文 Git Commit Log；變更共用 CSS/JS 記得同步遞增對應 HTML 的防快取版本號（`?v=N`）。
2. **本機環境備忘**：
   - PowerShell 終端沙箱對 `E:\` 專案目錄僅有唯讀權限，寫入／修改專案檔案請一律使用原生 `edit_file`／`write_file` 工具；驗證 SVG／HTML／JS 可用 PowerShell 搭配 `.NET [xml]` 與正規表達式腳本執行（本機預設 PATH 無 `node`）。

---

## 6. 下一階段建議待辦

1. **提交交接文件並合併部署上線**：
   - 提交本交接文件 `docs/antigravity_handoff_2026-11-25.md`。
   - 確認 `dev` 分支上生物（`bio/`）、公民（`civics/`）與全站右側回頂端按鈕皆檢視無誤後，將 `dev` 合併至 `master` 並推送以觸發 GitHub Actions 自動部署至 `https://studybuddytw.org`。
2. **根目錄首頁（`index.html`）生物卡片文字微調（選配）**：
   - 同步補上「防禦」與「154 題互動圖解測驗」亮點，與最新 `bio/index.html` 一致。
3. **其他科目進階審查（選配）**：
   - 視段考準備需求，檢視 `geo/`、`math/` 或 `civics/` 之考點、互動細節與圖解測驗。
