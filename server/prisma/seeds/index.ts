// server/prisma/seeds/index.ts
import { PrismaClient } from '@prisma/client';
import { seedGeoData } from './geo.seed';
import { seedTestData } from './test.seed';

const prisma = new PrismaClient();

type SeedOptions = {
  /** Seed datos geográficos (provincias/localidades) */
  geo?: boolean;
  /** Seed datos de prueba (usuarios, mascotas, etc.) */
  test?: boolean;
  /** Resetear la base de datos primero */
  reset?: boolean;
  /** Mostrar ayuda */
  help?: boolean;
};

export async function runSeeds(options: SeedOptions = {}) {
  // Valores por defecto
  const { geo = false, test = false, reset = false, help = false } = options;

  if (help) {
    showHelp();
    return;
  }

  try {
    if (reset) {
      await resetDatabase();
    }

    // Ejecutar seeds según opciones
    if (geo) {
      console.log('\n=== INICIANDO SEED GEOGRÁFICO ===');
      await seedGeoData();
    }

    if (test) {
      console.log('\n=== INICIANDO SEED DE PRUEBA ===');
      await seedTestData();
    }

    if (!geo && !test) {
      console.log('ℹ️  No se especificaron seeds para ejecutar');
      showHelp();
    }
  } catch (error) {
    console.error('❌ Error durante la ejecución de seeds:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function resetDatabase() {
  console.log('♻️  Reseteando base de datos...');
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" CASCADE;`,
        );
      } catch (error) {
        console.error(`Error al truncar ${tablename}:`, error);
      }
    }
  }
  console.log('✅ Base de datos reseteada');
}

function showHelp() {
  console.log(`
Uso: ts-node prisma/seeds/index.ts [opciones]

Opciones:
  --geo     Ejecutar seed geográfico (provincias/localidades)
  --test    Ejecutar seed de datos de prueba
  --reset   Resetear la DB antes de ejecutar seeds
  --help    Mostrar esta ayuda

Ejemplos:
  # Ejecutar todos los seeds
  ts-node prisma/seeds/index.ts --geo --test

  # Solo datos geográficos
  ts-node prisma/seeds/index.ts --geo

  # Resetear y cargar datos de prueba
  ts-node prisma/seeds/index.ts --test --reset
  `);
}

// Manejo de argumentos de línea de comandos
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    geo: args.includes('--geo'),
    test: args.includes('--test'),
    reset: args.includes('--reset'),
    help: args.includes('--help'),
  };

  runSeeds(options).catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  });
}
