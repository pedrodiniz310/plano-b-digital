import { defineConfig } from 'prisma/config';

try {
  // Opcional pra `prisma generate` (não conecta no banco); obrigatório pra
  // `prisma migrate dev`/`db push`. Node 22 carrega .env nativamente.
  process.loadEnvFile();
} catch {
  // Sem .env local ainda — tudo bem pra generate.
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Leitura direta em vez de `env('DATABASE_URL')` do prisma/config: o helper
    // resolve na hora de carregar este arquivo e derruba até `prisma generate`,
    // que não conecta no banco. Como o generate roda no `postinstall`, isso
    // quebraria `npm ci` em qualquer ambiente sem DATABASE_URL — CI e clone limpo.
    url: process.env.DATABASE_URL,
  },
});
