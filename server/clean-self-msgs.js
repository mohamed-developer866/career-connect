var { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

async function run() {
  var r = await p.message.deleteMany({
    where: {
      senderId: '31100162-c853-46d2-a835-fa2804bd6fc2',
      receiverId: '31100162-c853-46d2-a835-fa2804bd6fc2'
    }
  });
  console.log('Deleted ' + r.count + ' self-messages');
  await p.$disconnect();
}

run();