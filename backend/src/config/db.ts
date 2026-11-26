import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

// Convert BigInt to Number/String in JSON automatically
// @ts-expect-error BigInt prototype serialization
BigInt.prototype.toJSON = function () {
  const int = Number.parseInt(this.toString(), 10);
  return int ?? this.toString();
};

export const prisma =
  global.__prismaClient ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prismaClient = prisma;
}
