var { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

async function run() {
  await p.message.deleteMany();
  console.log('✅ All messages deleted');
  await p.$disconnect();
}
run();