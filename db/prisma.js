const {PrismaClient} = require("../generated/prisma");

const prisma = new PrismaClient();


// PrismaClient singleton
module.exports = prisma;