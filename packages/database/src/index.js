var _a;
import { PrismaClient } from '../generated/client';
var globalForPrisma = globalThis;
export var prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
export * from '../generated/client';
export { prisma as db };
//# sourceMappingURL=index.js.map