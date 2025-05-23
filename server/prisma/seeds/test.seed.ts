// server/prisma/seeds/test.seed.ts
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuración
const NUM_TEST_USERS = 10;
const NUM_TEST_PETS = 20;
const NUM_TEST_MEDICAL_RECORDS = 30;
const NUM_TEST_LOST_REPORTS = 15;
const NUM_TEST_NOTIFICATIONS = 40;
const NUM_ADDRESSES_PER_USER = 1;

// --- Funciones generadoras de datos ---
function generateUser() {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    password: '$2b$10$EXAMPLEHASHEDPASSWORD',
    external_id: faker.string.uuid(),
  };
}

function generateAddress(
  userId: string,
  provinceId: string,
  localityId: string,
  isPrimary: boolean,
) {
  return {
    user_id: userId,
    street: faker.location.street(),
    number: faker.number.int({ min: 100, max: 5000 }).toString(),
    apartment: faker.helpers.arrayElement([
      null,
      `#${faker.number.int({ min: 1, max: 20 })}`,
    ]),
    neighborhood: faker.location.county(),
    zip_code: faker.location.zipCode(),
    is_primary: isPrimary,
    show_address: faker.datatype.boolean({ probability: 0.7 }),
    province_id: provinceId,
    locality_id: localityId,
  };
}

function generatePet(userIds: string[]) {
  const species = faker.helpers.arrayElement(['DOG', 'CAT', 'BIRD', 'OTHER']);

  let breed: string | null = null;
  if (species === 'DOG') breed = faker.animal.dog();
  if (species === 'CAT') breed = faker.animal.cat();

  const petCodeId = faker.string.uuid();

  return {
    name: faker.person.firstName(),
    species,
    breed,
    color: faker.color.human(),
    distinctive_marks: faker.helpers.arrayElement([
      null,
      `Mancha en ${faker.helpers.arrayElement([
        'oreja izquierda',
        'lomo',
        'cola',
      ])}`,
      `Cicatriz en ${faker.helpers.arrayElement([
        'patita delantera',
        'hocico',
      ])}`,
    ]),
    birthdate: faker.date.past({ years: 15 }),
    pet_code: {
      create: {
        id: petCodeId,
        activated_date: faker.date.recent(),
      },
    },
    users: {
      connect: { id: faker.helpers.arrayElement(userIds) },
    },
  };
}

function generateMedicalRecord(petId: string, localityId?: string) {
  return {
    pet_id: petId,
    date: faker.date.recent({ days: 365 }),
    description: faker.lorem.sentences({ min: 1, max: 3 }),
    vet_name: faker.person.fullName(),
    clinic: faker.company.name(),
    locality_id: localityId,
  };
}

function generateMedicalDocument(medicalRecordId: string) {
  const docTypes = ['Vacunación', 'Análisis', 'Radiografía', 'Receta'];
  return {
    medical_record_id: medicalRecordId,
    file_name: `${faker.helpers.arrayElement(docTypes)}_${
      faker.date.recent().toISOString().split('T')[0]
    }.pdf`,
    file_url: faker.internet.url(),
    file_type: 'application/pdf',
  };
}

function generateLostReport(
  petId: string,
  provinceId: string,
  localityId: string,
) {
  return {
    pet_id: petId,
    last_seen_address: `${faker.location.streetAddress()}, ${faker.location.city()}`,
    last_seen_date: faker.date.recent({ days: 30 }),
    province_id: provinceId,
    locality_id: localityId,
    is_active: faker.datatype.boolean({ probability: 0.7 }),
    comments: faker.lorem.paragraph(),
    finder_name: faker.helpers.arrayElement([null, faker.person.fullName()]),
    finder_phone: faker.helpers.arrayElement([null, faker.phone.number()]),
    finder_email: faker.helpers.arrayElement([null, faker.internet.email()]),
  };
}

function generateNotification(userId: string, lostReportId?: string) {
  const types = ['alert', 'reminder', 'update', 'warning'];
  return {
    user_id: userId,
    lost_report_id: lostReportId,
    notification_type: faker.helpers.arrayElement(types),
    message: `Notificación de ${types[0]}: ${faker.lorem.sentence()}`,
    is_read: faker.datatype.boolean(),
  };
}

// --- Funciones principales optimizadas ---
async function createUsersWithAddresses() {
  console.log('👥 Creando usuarios con direcciones...');

  // Obtener algunas provincias y localidades existentes
  const provinces = await prisma.province.findMany({ take: 3 });
  const localities = await prisma.locality.findMany({
    where: {
      province_id: { in: provinces.map((p) => p.id) },
    },
    take: 10,
  });

  const users = [];

  for (let i = 0; i < NUM_TEST_USERS; i++) {
    const user = await prisma.user.create({
      data: generateUser(),
    });

    // Crear direcciones para el usuario
    const userLocalities = faker.helpers.arrayElements(
      localities,
      NUM_ADDRESSES_PER_USER,
    );

    await prisma.address.createMany({
      data: userLocalities.map((locality, index) =>
        generateAddress(
          user.id,
          locality.province_id,
          locality.id,
          index === 0, // La primera dirección es primaria
        ),
      ),
    });

    users.push(user);
  }

  return users;
}

async function createPetsWithPhotos(userIds: string[]) {
  console.log('🐶 Creando mascotas...');
  const pets = [];

  for (let i = 0; i < NUM_TEST_PETS; i++) {
    const pet = await prisma.pet.create({
      data: {
        ...generatePet(userIds),
        photos: {
          create: [
            {
              url: faker.image.urlLoremFlickr({ category: 'animals' }),
              is_primary: true,
            },
            ...Array.from(
              { length: faker.number.int({ min: 1, max: 3 }) },
              () => ({
                url: faker.image.urlLoremFlickr({ category: 'animals' }),
                is_primary: false,
              }),
            ),
          ],
        },
      },
      include: {
        photos: true,
      },
    });

    pets.push(pet);
  }

  return pets;
}

async function createMedicalRecords(petIds: string[], localityIds: string[]) {
  console.log('🏥 Creando registros médicos...');
  const records = [];

  for (let i = 0; i < NUM_TEST_MEDICAL_RECORDS; i++) {
    const record = await prisma.medicalRecord.create({
      data: generateMedicalRecord(
        faker.helpers.arrayElement(petIds),
        faker.helpers.arrayElement([...localityIds, undefined]),
      ),
    });

    await prisma.medicalDocument.createMany({
      data: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
        generateMedicalDocument(record.id),
      ),
    });

    records.push(record);
  }

  return records;
}

async function createLostReports(petIds: string[], localityIds: string[]) {
  console.log('🔎 Creando reportes de mascotas perdidas...');
  const reports = [];
  const localities = await prisma.locality.findMany({
    where: { id: { in: localityIds } },
    select: { id: true, province_id: true },
  });

  for (let i = 0; i < NUM_TEST_LOST_REPORTS; i++) {
    const locality = faker.helpers.arrayElement(localities);
    const report = await prisma.lostReport.create({
      data: generateLostReport(
        faker.helpers.arrayElement(petIds),
        locality.province_id,
        locality.id,
      ),
    });
    reports.push(report);
  }

  return reports;
}

async function createNotifications(userIds: string[], lostReportIds: string[]) {
  console.log('🔔 Creando notificaciones...');
  await prisma.notification.createMany({
    data: Array.from({ length: NUM_TEST_NOTIFICATIONS }, () =>
      generateNotification(
        faker.helpers.arrayElement(userIds),
        faker.helpers.arrayElement([...lostReportIds, null]),
      ),
    ),
  });
}

// --- Función principal ---
export async function seedTestData() {
  try {
    console.log('🧪 Comenzando seed de datos de prueba...');

    // Verificar si ya existen datos
    if ((await prisma.user.count()) > 0) {
      console.log(
        'ℹ️  Ya existen datos de prueba. Usa "npx prisma migrate reset --force" si deseas regenerarlos.',
      );
      return;
    }

    // 1. Crear usuarios
    const users = await createUsersWithAddresses();
    const userIds = users.map((u) => u.id);

    // 2. Crear mascotas con fotos
    const pets = await createPetsWithPhotos(userIds);
    const petIds = pets.map((p) => p.id);

    // 3. Obtener localidades disponibles
    const localities = await prisma.locality.findMany({
      take: 10,
      select: { id: true },
    });
    const localityIds = localities.map((l) => l.id);

    // 4. Crear registros médicos
    await createMedicalRecords(petIds, localityIds);

    // 5. Crear reportes de pérdida
    const lostReports = await createLostReports(petIds, localityIds);
    const lostReportIds = lostReports.map((r) => r.id);

    // 6. Crear notificaciones
    await createNotifications(userIds, lostReportIds);

    console.log('🎉 Datos de prueba creados exitosamente!');
    console.log('📊 Estadísticas:');
    console.log(`- Usuarios: ${users.length}`);
    console.log(`- Mascotas: ${pets.length}`);
    console.log(`- Registros médicos: ${NUM_TEST_MEDICAL_RECORDS}`);
    console.log(`- Reportes de pérdida: ${lostReports.length}`);
    console.log(`- Notificaciones: ${NUM_TEST_NOTIFICATIONS}`);
  } catch (error) {
    console.error('❌ Error durante el seed de datos de prueba:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  seedTestData();
}
