import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const categories = ['Food', 'Rent', 'Transport', 'Entertainment', 'Misc'];

async function main() {
  await prisma.user.deleteMany({ where: { email: 'test@fintrackr.dev' } });

  const user = await prisma.user.create({
    data: {
      email: 'test@fintrackr.dev',
      passwordHash: await bcrypt.hash('Test1234!', 12),
      tier: 'FREE',
      emailVerified: true,
    },
  });

  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const category = categories[i % categories.length];
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: i % 5 === 0 ? 'INCOME' : 'EXPENSE',
        category,
        amount: (Math.random() * 200 + 10).toFixed(2) as any,
        date,
        notes: `Sample ${category} transaction`,
      },
    });
  }

  for (const category of categories) {
    await prisma.budget.create({
      data: {
        userId: user.id,
        category,
        limitAmount: (Math.random() * 500 + 200).toFixed(2) as any,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });
  }

  console.log('Seed complete. Test user: test@fintrackr.dev / Test1234!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
