# 伴讀書僮（studybuddytw）專案協作規範

## 溝通與修改流程（必須嚴格遵守）
- 全程使用**繁體中文**回覆與溝通。
- **修改、新增或刪除任何檔案之前，必須先清楚列出預計修改的檔案與內容，並得到使用者明確同意後，才可以執行寫入或修改。**
- 完成修改後，提供符合專案風格的繁體中文 Git Commit Log。

## 生物單元（`bio/`）互動設計標準
- 互動圖表與樣式比照 `bio/photosynthesis.html`、`bio/lib/common.js` 與 `bio/lib/bio.css`：
  - **懸停聚光預覽**：學習模式與測驗作答中，滑鼠移上部位即高亮並淡化其餘部位，移開平滑還原；測驗模式僅於點擊時判分，答題後結果畫面不受懸停干擾。
  - **標記模式**：採用獨立鎖定模式（`lockMark: true`），與「學習」「測驗」按鈕高亮互斥，展示態游標改為 `default` 且不因點擊圖面跳出，僅由上方模式按鈕切換離開。
  - **回合制測驗**：每回合隨機不重複測驗所有部位，結束顯示回合結算、正確率與需再複習清單，並可點擊開始下一回合。
  - **標籤互動**：文字標籤預先建立底框（`.lblbg`）並支援懸停／點擊連動（`data-lbl`）。
- 修改 `bio/lib/bio.css` 或 `bio/lib/common.js` 後，對應 HTML 頁面的防快取版本號（`?v=N`）需同步遞增。

## 部署備忘
- 專案部署至 `https://studybuddytw.org`（Bluehost），透過 GitHub Actions（`.github/workflows/deploy-bluehost.yml`）於推送至 `master` 分支時自動觸發部署。詳細說明見 `docs/deploy-bluehost.md`。
