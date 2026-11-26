import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/db.js';

const app = createApp();

const primaryPort = env.PORT || 5000;

const server = app.listen(primaryPort, () => {
  console.log(`🚀 [Bolajon ERP Backend] Server http://localhost:${primaryPort} da ishga tushdi`);
  console.log(`📦 Muhit: ${env.NODE_ENV}`);
});

// Also bind port 4000 as fallback so any requests targeting :4000 never fail with ERR_CONNECTION_REFUSED
let fallbackServer: any = null;
if (primaryPort !== 4000) {
  try {
    fallbackServer = app.listen(4000, () => {
      console.log(`🚀 [Bolajon ERP Backend] Qo‘shimcha port 4000 ham http://localhost:4000 da ishga tushdi`);
    });
    fallbackServer.on('error', () => {
      // Ignore if port 4000 is used by another service
    });
  } catch {
    // Ignore
  }
}

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 [${signal}] Signali qabul qilindi. Server to‘xtatilmoqda...`);
  server.close(async () => {
    if (fallbackServer) fallbackServer.close();
    console.log('🔒 HTTP server yopildi.');
    await prisma.$disconnect();
    console.log('💾 Ma’lumotlar bazasi ulanishi uzildi.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
