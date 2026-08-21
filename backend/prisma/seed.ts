import { importAllSqlData } from '../src/scripts/importAllSqlData';

async function main() {
  await importAllSqlData();
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  });
