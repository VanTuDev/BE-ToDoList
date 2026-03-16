import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Log thông tin MongoDB URI để dễ debug (ẩn password)
  const rawUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unitracker';
  let safeUri = rawUri;
  try {
    const atIndex = rawUri.indexOf('@');
    const schemeEnd = rawUri.indexOf('://');
    if (atIndex > -1 && schemeEnd > -1) {
      // mongodb+srv://user:pass@host -> mongodb+srv://user:****@host
      const schemeAndCred = rawUri.substring(0, atIndex); // mongodb+srv://user:pass
      const rest = rawUri.substring(atIndex); // @host...
      const credParts = schemeAndCred.split('://');
      if (credParts.length === 2) {
        const [scheme, cred] = credParts;
        const user = cred.split(':')[0];
        safeUri = `${scheme}://${user}:****${rest}`;
      }
    }
  } catch {
    // Nếu có lỗi parsing, fallback dùng rawUri
    safeUri = rawUri;
  }
  console.log('[BOOTSTRAP] Using MongoDB URI:', safeUri);

  const app = await NestFactory.create(AppModule);
  const corsOrigin = process.env.CORS_ORIGIN;
  const fromEnv = corsOrigin
    ? corsOrigin.split(',').map((o) => o.trim()).filter(Boolean)
    : [];
  const origins = [...new Set([...fromEnv, 'http://localhost:3000', 'http://127.0.0.1:3000'])];
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });
  const port = process.env.PORT || 4000;

  try {
    await app.listen(port);
    console.log(`[BOOTSTRAP] Server running on port ${port}`);
    console.log('[BOOTSTRAP] If no MongoDB errors above, connection is OK.');
  } catch (err) {
    console.error('[BOOTSTRAP] Failed to start NestJS application:', err);
  }
}

bootstrap();
