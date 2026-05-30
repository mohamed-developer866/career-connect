var { PrismaClient } = require('@prisma/client');
var p = new PrismaClient();

async function clear() {
  var msg = await p.message.deleteMany({});
  console.log('Deleted ' + msg.count + ' messages');
  var bc = await p.broadcast.deleteMany({});
  console.log('Deleted ' + bc.count + ' broadcasts');
  await p.$disconnect();
}

clear();