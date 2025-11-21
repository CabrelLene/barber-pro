// prisma/seed.ts
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Lancement du seed...');

  // 1. On nettoie (optionnel, à adapter selon ton besoin)
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.service.deleteMany();
  await prisma.barberProfile.deleteMany();
  await prisma.user.deleteMany();

  // 2. Créer un user barber
  const barberUser = await prisma.user.create({
    data: {
      email: 'barber.montreal@example.com',
      password: 'hashed-password-todo', // ⚠ à remplacer par un vrai hash si tu veux
      fullName: 'Fade Master Montréal',
      phone: '514-555-1234',
      role: UserRole.BARBER,
    },
  });

  // 3. Créer le barberProfile
  const barberProfile = await prisma.barberProfile.create({
    data: {
      userId: barberUser.id,
      shopName: 'Fade Master Studio',
      description:
        'Barbershop spécialisé en fades, contours millimétrés et barbe impeccable. Ambiance chill, musique et vibes de Montréal.',
      phone: '514-555-1234',
      addressLine1: '123 Rue Saint-Urbain',
      city: 'Montréal',
      province: 'QC',
      postalCode: 'H2X 1Y4',
      latitude: 45.509,
      longitude: -73.57,
    },
  });

  // 4. Créer des services AVEC imageUrl
  await prisma.service.createMany({
    data: [
      {
        barberId: barberProfile.id,
        name: 'Coupe dégradé + finition',
        description:
          'Fade propre, lignes nettes et finition aux ciseaux pour un look ultra frais.',
        durationMin: 45,
        priceCents: 3500,
        imageUrl:
          'https://images.pexels.com/photos/3998426/pexels-photo-3998426.jpeg',
      },
      {
        barberId: barberProfile.id,
        name: 'Coupe + barbe complète',
        description:
          'Coupe de cheveux + entretien complet de la barbe, contours, finition rasoir.',
        durationMin: 60,
        priceCents: 5000,
        imageUrl:
          'https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg',
      },
      {
        barberId: barberProfile.id,
        name: 'Rasage traditionnel',
        description:
          'Rasage à l’ancienne avec serviette chaude, pour un confort maximum.',
        durationMin: 30,
        priceCents: 2800,
        imageUrl:
          'https://images.pexels.com/photos/3998405/pexels-photo-3998405.jpeg',
      },
    ],
  });

  console.log('✅ Seed terminé avec succès.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur pendant le seed', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
