import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('cenpod2024', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@cenpod.mx' },
    update: {
      name: 'Admin CENPOD',
      password: hashedPassword,
      role: 'admin',
      provider: 'credentials',
    },
    create: {
      email: 'admin@cenpod.mx',
      name: 'Admin CENPOD',
      password: hashedPassword,
      role: 'admin',
      provider: 'credentials',
    },
    select: { id: true, email: true, name: true, role: true },
  });
  
  console.log('Admin user created/found:', JSON.stringify(user));
  
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log('All users:', JSON.stringify(users));
  
  await prisma.$disconnect();
}

main().catch(console.error);
