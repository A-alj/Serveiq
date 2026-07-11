# ServeIQ Starter v0.1

نواة مشروع ServeIQ لإدارة مطعم حمسة مجالس.

## يحتوي على
- واجهة Next.js عربية.
- API باستخدام NestJS.
- PostgreSQL + Prisma.
- Docker Compose.
- منيو حمسة مجالس.
- أساس الحضور والانصراف لإضافة البصمة لاحقًا.

## التشغيل
```bash
cp .env.example .env
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:push
pnpm dev
```

Web: http://localhost:3000  
API: http://localhost:3001/api/health
