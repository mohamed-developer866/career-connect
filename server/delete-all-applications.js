const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllApplications() {
  console.log('\n🗑️ DELETING ALL JOB APPLICATIONS\n');
  
  const deleted = await prisma.jobApplication.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} applications`);
  
  console.log('\n📊 All students can now see available jobs!');
  
  await prisma.$disconnect();
}

deleteAllApplications().catch(console.error);