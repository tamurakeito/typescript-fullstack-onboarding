# 🐋 backend

## Node.js x Hono

```
npm install
npm run dev
```

```
open http://localhost:3000
```

## Prisma ORM 実装

### 参考

[What is Prisma ORM?](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma)
[Prisma ORM in your stack | REST](https://www.prisma.io/docs/orm/overview/prisma-in-your-stack/rest)
[データモデルの定義](https://www.prisma.io/docs/orm/prisma-schema/data-model/models)
[prisma.config.ts](https://www.prisma.io/docs/orm/reference/prisma-config-reference)

### 環境変数

開発時は下記をあらかじめ実行する。

```
// 環境変数ファイルの作成
cp .env.example .env

// Prismaクライアントの生成
pnpm db:generate

// Prisma シード挿入
pnpm db:seed
```