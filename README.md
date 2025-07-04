# TypeScript Fullstack Onboarding | 組織向けTodo管理アプリ

## プロジェクト概要

認証・管理機能付きの組織単位でのTodoリスト管理を行うウェブアプリケーション

### 主要機能

- **認証・認可システム**
  - ユーザーログイン機能
  - 組織ベースのアクセス制御
  - 管理者と一般ユーザーの権限分離
    - SuperAdmin
    - Manager
    - Operator

- **Todo管理**
  - Todoの作成・編集・削除
  - （ステータス管理（未着手・進行中・完了））
  - （担当者割り当て）

- **ユーザー管理（Manager以上）**:
  - ユーザーの追加・削除

- **組織管理（SuperAdmin）**:
  - 組織の作成・削除

## 技術スタック

### 共通ツール
- **パッケージマネージャー**: pnpm
- **Node.js/バージョン管理**: Volta
- **リンター/フォーマッター**: Biome
- **テストフレームワーク**: Vitest

## 開発・テスト

### セットアップ
```bash
# 依存関係のインストール
pnpm install

# または下記をルートで実行
pnpm install -r

# 開発サーバーの起動
pnpm dev

# テストの実行
pnpm test

# テストUIの起動 # frontendのみ
pnpm test:ui

# カバレッジレポートの生成 # frontend, backend
pnpm test:coverage
```


### フロントエンド（React + TypeScript + Vite）
- **フレームワーク**: React 18
- **言語**: TypeScript
- **ビルドツール**: Vite
- **ルーティング**: TanStack Router
- **状態管理**: TanStack Query
- **UIコンポーネント**: shadcn/ui
- **フォーム処理**: React Hook Form
- **スキーマバリデーション**: Zod
- **スタイリング**: Tailwind CSS

### バックエンド（Node.js + TypeScript + Hono）
- **言語**: TypeScript
- **Webフレームワーク**: Hono
- **ORM**: Prisma
- **データベース**: PostgreSQL (Docker)
- **認証**: JWT
- **アーキテクチャ**: Clean Architecture

### API設計
- **スキーマ定義**: TypeSpec
- **OpenAPI生成**: TypeSpec → OpenAPI
- **クライアント生成**: @hey-api/openapi-ts（フロントエンド）openapi-zod-client（バックエンド）

### インフラ・デプロイ
- **管理ツール**: Terraform
- **クラウドプロバイダ**: Google Cloud Platform (GCP)
- **コンテナ化**: Docker
- **コンテナ実行環境**: Cloud Run
- **データベース**: Cloud SQL (PostgreSQL)

## プロジェクト構造

```
typescript-fullstack-onboarding/
├── frontend/                   # フロントエンドアプリケーション
│   ├── src/
│   │   ├── features/           # 機能別モジュール
│   │   │   ├── auth/           # 認証機能
│   │   │   ├── todos/          # Todo管理
│   │   │   ├── users/          # ユーザー管理
│   │   │   └── organizations/  # 組織管理
│   │   ├── components/         # UIコンポーネント
│   │   ├── hooks/              # カスタムフック
│   │   ├── routes/             # ルーティング
│   │   └── api/                # APIクライアント
│   ├── package.json
│   └── vite.config.ts
├── backend/                    # バックエンドアプリケーション
│   ├── src/
│   │   ├── domain/             # ドメイン層
│   │   ├── usecase/            # ユースケース層
│   │   │   ├── query/          # 読み取り操作
│   │   │   └── command/        # 書き込み操作
│   │   ├── presentation/       # プレゼンテーション層
│   │   ├── infrastructure/     # インフラ層
│   │   └── utils/              # 共通ユーティリティ
│   ├── prisma/                 # データベーススキーマ
│   ├── package.json
│   └── docker-compose.yml
├── schema/                     # APIスキーマ定義
│   ├── src/
│   │   ├── auth.tsp            # 認証関連API
│   │   ├── todos.tsp           # Todo関連API
│   │   ├── users.tsp           # ユーザー関連API
│   │   └── organizations.tsp   # 組織関連API
│   └── package.json
├── infra/                      # インフラストラクチャ定義
│   ├── terraform/              # Terraform設定
│   ├── docker/                 # Docker設定
│   │   ├── frontend/           # フロントエンド用Dockerfile
│   │   └── backend/            # バックエンド用Dockerfile
│   └── scripts/                # デプロイスクリプト
├── package.json                # ルートパッケージ設定
└── README.md
```

## アーキテクチャ設計

### フロントエンドアーキテクチャ
- 機能別にモジュールを分割するFeature型をベースに、再利用可能なコンポーネントについては共通化する設計とする。
- フォーム、通信状態管理についてはTanStack Queryを使用する。

### バックエンドアーキテクチャ
- クリーンアーキテクチャにて依存関係の逆転と関心事の分離を行う。
- CQRSパターンを取り入れて、usecase層レベルでquery/commandの分離を行う。commandでのみリポジトリパターンを採用し、データアクセスを抽象化する。
- `utils`に`Result`型を定義を置き、関数型エラーハンドリングを行う。

### データベース・テーブル設計
- **users**: ユーザー情報
- **organizations**: 組織情報
- **todos**: Todoアイテム

## 認証・認可設計

### 認証フロー
1. ユーザーがメールアドレスとパスワードでログイン
2. JWTトークンを発行
3. 以降のリクエストでJWTトークンを使用

### 権限設計
- **SuperAdmin**: 組織の作成・削除、全組織のメンバーの追加・削除、全組織のTodoの管理
- **Manager**: 自組織のメンバーの追加・削除、自組織のTodoの管理
- **Operator**: 自組織のTodoの管理
