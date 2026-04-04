
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { NOT: { foto: null } }
  });
  if (user) {
    console.log('User Found:', user.nombre);
    console.log('Foto Type:', user.foto.startsWith('data:') ? 'BASE64' : 'URL');
    console.log('Foto Prefix:', user.foto.slice(0, 100));
  } else {
    console.log('No members with photos found.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
