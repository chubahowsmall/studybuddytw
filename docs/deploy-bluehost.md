# 自動部署到 Bluehost（GitHub Actions）

推送到 `master` 分支時，GitHub Actions 會用 SSH + rsync，把網站檔案同步到 Bluehost 主機上的指定資料夾。
workflow 檔：`.github/workflows/deploy-bluehost.yml`

```
在 made_by_chatgpt 開發 → 合併到 master → push → Actions 自動部署 → 約 30 秒後 Bluehost 更新
```

## 一、Bluehost：開啟 SSH

1. Bluehost 後台 → **Websites** → 選網站 → **FILES & ACCESS** 分頁 → **SSH** → **Manage**，打開 **Shell Access**。
   （找不到時：cPanel → Security → **SSH Access**。）
2. 抄下這一頁的 **Hostname**、**Username**、**Port**。
   - Username 就是 cPanel 使用者名稱（不是登入後台的 email）。也可在 cPanel 首頁「General Information → Current User」看到。
   - Port 以後台顯示為準（常見為 22，部分舊說明寫 2222）。

## 二、產生部署專用金鑰（在自己電腦上，只做一次）

> ⚠️ **不要在網站資料夾（studybuddytw）裡產生金鑰。** 這個儲存庫是公開的，私鑰一旦被 commit 就等於公開。

Windows PowerShell 或 Git Bash：

```bash
cd ~/.ssh
ssh-keygen -t ed25519 -f bluehost_deploy -C "github-actions-deploy" -N ""
```

會產生兩個檔案：
- `bluehost_deploy`：**私鑰**，只貼到 GitHub Secrets，不要給別人、不要放進儲存庫
- `bluehost_deploy.pub`：公鑰，貼到 Bluehost

## 三、Bluehost：授權公鑰

1. cPanel → Security → **SSH Access** → **Manage SSH Keys** → **Import Key**。
2. Key 名稱填 `bluehost_deploy`，**Public Key** 欄貼上 `bluehost_deploy.pub` 的內容（私鑰欄留空），按 Import。
3. 回到 Manage SSH Keys 列表，在這把公鑰旁按 **Manage** → **Authorize**。

在自己電腦測試（換成你的帳號、主機、port）：

```bash
ssh -i ~/.ssh/bluehost_deploy -p 22 帳號@主機
pwd                 # 會看到家目錄，例如 /home/帳號 或 /home2/帳號
ls public_html      # 確認網站資料夾
which rsync         # 確認主機有 rsync（部署需要）
```

## 四、決定部署位置（BLUEHOST_PATH）

部署會用 `rsync --delete`，**目標資料夾裡多出來的檔案會被刪除**，所以一定要用這個網站**專用**的資料夾：

| 想要的網址 | BLUEHOST_PATH 範例 |
|---|---|
| `https://你的網域/studybuddy/` | `public_html/studybuddy` |
| 子網域 `https://study.你的網域/` | 子網域的文件根目錄，例如 `public_html/study`（在後台 Domains 建立子網域時會顯示） |

- 路徑寫成**相對於家目錄**（如上表），不要用 `~`。
- workflow 有防呆：填 `public_html`、`~`、`/` 或家目錄本身會直接停止，不會部署。
- 資料夾不存在時會自動建立。

## 五、GitHub：設定 Secrets

儲存庫 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**：

| 名稱 | 內容 | 必填 |
|---|---|---|
| `BLUEHOST_SSH_KEY` | 私鑰 `bluehost_deploy` 的**完整內容**（含 `-----BEGIN…` 與 `-----END…` 兩行） | ✔ |
| `BLUEHOST_HOST` | 主機名稱或 IP | ✔ |
| `BLUEHOST_USER` | cPanel 使用者名稱 | ✔ |
| `BLUEHOST_PORT` | SSH port，例如 `22` | ✔ |
| `BLUEHOST_PATH` | 部署資料夾，例如 `public_html/studybuddy` | ✔ |
| `BLUEHOST_KNOWN_HOSTS` | 主機指紋（更安全，可不填）：在自己電腦執行 `ssh-keyscan -p 22 主機`，把輸出整段貼上 | 選填 |

沒填 `BLUEHOST_KNOWN_HOSTS` 時，workflow 會在每次部署時自動抓主機指紋。

## 六、第一次部署：先試跑

1. 把 workflow 檔合併到 `master` 並 push。
   （這次 push 本身就會觸發部署；若想先試跑，可以先設定好 Secrets 但把 `BLUEHOST_PATH` 指向一個新的空資料夾。）
2. 儲存庫 → **Actions** → **Deploy to Bluehost** → **Run workflow**，「試跑」保持勾選 → 執行。
3. 打開執行紀錄的「同步網站檔案」步驟，確認列出的檔案與路徑正確（`*deleting` 開頭的是會被刪除的檔案）。
4. 沒問題後，再按一次 **Run workflow**，取消勾選「試跑」，正式部署。
5. 用瀏覽器開網址確認。

之後每次 push 到 `master` 都會自動正式部署（push 觸發時不是試跑）。只改 `README.md` 或 `docs/` 不會觸發部署。

## 不會上傳的檔案

`.git/`、`.github/`、`.gitignore`、`docs/`、`resources/`（原始大圖）、`README.md`、`LICENSE`、`bluehost_deploy*`。
另外，GitHub 只會取出**已 commit** 的檔案，本機沒有 commit 的檔案不會被部署。

## 常見問題

| 狀況 | 處理 |
|---|---|
| `缺少 secret：BLUEHOST_…` | 回到第五步補上 Secret（名稱大小寫要完全一樣） |
| `Permission denied (publickey)` | 公鑰沒有 Authorize、私鑰貼不完整，或 `BLUEHOST_USER` 填成 email |
| `Connection timed out` / `refused` | port 不對（試 22 或 2222），或 SSH 尚未開啟 |
| `rsync: command not found` | 主機沒有 rsync，請聯絡 Bluehost 客服，或改用 FTPS 部署 |
| 網址顯示 403 / 404 | `BLUEHOST_PATH` 與網址對應的資料夾不一致 |
| 想停用自動部署 | Actions → Deploy to Bluehost → 右上「…」→ **Disable workflow** |

## 更換或撤銷金鑰

金鑰外流或不再使用時：cPanel → SSH Access → Manage SSH Keys → 對該公鑰按 **Deauthorize** 或 **Delete**，再刪除 GitHub 上的 `BLUEHOST_SSH_KEY`。
