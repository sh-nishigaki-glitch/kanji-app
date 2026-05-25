# 幹事AI - Tokyo Party Planner

## Vercelへのデプロイ手順

### 1. GitHubにアップロード
1. https://github.com にログイン
2. 右上の「+」→「New repository」をクリック
3. Repository name: `kanji-app`
4. 「Create repository」をクリック
5. 「uploading an existing file」をクリック
6. このフォルダの中身を全部ドラッグ＆ドロップ
7. 「Commit changes」をクリック

### 2. Vercelにデプロイ
1. https://vercel.com にログイン
2. 「Add New Project」をクリック
3. GitHubの `kanji-app` を選択
4. 「Deploy」をクリック

### 3. APIキーの設定
1. デプロイ完了後、プロジェクトの「Settings」をクリック
2. 左メニューの「Environment Variables」をクリック
3. 以下を追加:
   - Name: `ANTHROPIC_API_KEY`
   - Value: `sk-ant-...`（AnthropicのAPIキー）
4. 「Save」をクリック
5. 「Deployments」から「Redeploy」をクリック

これで完成です！
