import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "..src/generated/prisma";
// import { PrismaClient } from "../src/generated/prisma";
import { PrismaClient } from "@prisma/client";
// import { PrismaClient } from "../../generated/prisma/index.js";
import 'dotenv/config';

const prisma = new PrismaClient({adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })});

async function main() {
    const FLOAT_ID = process.env.FLOAT_ID;

    console.log('Seeding database....');

    const floatOrg = await prisma.organization.upsert({
        where: {
            id: FLOAT_ID,
        },
        update: {},
        create: {
            id: FLOAT_ID,
            name: 'FLOAT',
            city: 'System',
            state: 'Cloud',
            country: 'Global',
        }
    });

    console.log({ floatOrg});
    console.log('seeding finisehd...');
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
})



