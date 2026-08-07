import { defineConfig, env } from 'prisma/config';

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
    url: env('DATABASE_URL'),
  },
});
