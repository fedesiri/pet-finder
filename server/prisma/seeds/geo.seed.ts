import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { setTimeout } from 'timers/promises';

const prisma = new PrismaClient();

const API_BASE_URL = 'https://apis.datos.gob.ar/georef/api';
const DELAY_BETWEEN_REQUESTS_MS = 200;

interface ProvinceAPI {
  nombre: string;
}

interface LocalityAPI {
  nombre: string;
}

async function fetchProvinces(): Promise<{ name: string }[]> {
  try {
    const response = await axios.get<{ provincias: ProvinceAPI[] }>(
      `${API_BASE_URL}/provincias`,
    );
    return response.data.provincias.map((p) => ({
      name: p.nombre,
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error.message);
    return [];
  }
}

async function fetchLocalities(
  provinceName: string,
): Promise<{ name: string; provinceName: string }[]> {
  let allLocalities: { name: string; provinceName: string }[] = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const response = await axios.get<{ localidades: LocalityAPI[] }>(
        `${API_BASE_URL}/localidades`,
        {
          params: {
            provincia: provinceName,
            max: perPage,
            campos: 'nombre',
            inicio: (page - 1) * perPage,
          },
        },
      );

      const localities = response.data.localidades;
      if (!localities || localities.length === 0) break;

      allLocalities.push(
        ...localities.map((l) => ({
          name: l.nombre,
          provinceName,
        })),
      );

      if (localities.length < perPage) break;
      page++;
      await setTimeout(DELAY_BETWEEN_REQUESTS_MS);
    }
  } catch (error) {
    console.error(
      `Error fetching localities for ${provinceName}:`,
      error.message,
    );
  }

  return allLocalities;
}

async function main() {
  console.log('🚀 Iniciando seed de provincias y localidades...');

  // 1. Obtener y cargar provincias
  console.log('🔍 Obteniendo provincias de la API...');
  const provinces = await fetchProvinces();
  console.log(`✅ Encontradas ${provinces.length} provincias`);

  console.log('📥 Insertando provincias en la base de datos...');
  const { count: provincesCount } = await prisma.province.createMany({
    data: provinces,
    skipDuplicates: true,
  });
  console.log(`📌 Provincias insertadas: ${provincesCount}`);

  // 2. Obtener y cargar localidades
  console.log('\n🔍 Obteniendo localidades por provincia...');
  let localityCount = 0;
  const batchSize = 100;

  for (const province of provinces) {
    console.log(`\n🌎 Procesando provincia: ${province.name}...`);
    const localities = await fetchLocalities(province.name);
    console.log(`📌 Localidades encontradas: ${localities.length}`);

    // Obtener el ID de la provincia actual
    const provinceRecord = await prisma.province.findUnique({
      where: { name: province.name },
    });

    if (!provinceRecord) {
      console.error(`❌ Provincia no encontrada en DB: ${province.name}`);
      continue;
    }

    // Procesar en lotes para mejor performance
    for (let i = 0; i < localities.length; i += batchSize) {
      const batch = localities.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((locality) =>
          prisma.locality.upsert({
            where: {
              name_province_id: {
                name: locality.name,
                province_id: provinceRecord.id,
              },
            },
            create: {
              name: locality.name,
              province_id: provinceRecord.id,
            },
            update: {},
          }),
        ),
      );

      const successful = batchResults.filter(
        (result) => result.status === 'fulfilled',
      ).length;
      localityCount += successful;

      if (successful < batch.length) {
        console.warn(
          `⚠️ Algunas localidades no se insertaron (${
            batch.length - successful
          } errores)`,
        );
      }
    }

    console.log(
      `✅ ${province.name}: ${localityCount} localidades procesadas hasta ahora`,
    );
  }

  console.log('\n🎉 Seed completado con éxito!');
  console.log('📊 Estadísticas finales:');
  console.log(`- Provincias: ${provincesCount}`);
  console.log(`- Localidades: ${localityCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Conexión a Prisma cerrada');
  });

export { main as seedGeoData };
