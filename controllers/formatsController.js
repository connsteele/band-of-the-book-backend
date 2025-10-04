const prisma = require("../db/prisma");

async function formatsGet(req, res, next) {
    const dbRes = await prisma.format.findMany();
    const nameArray = dbRes.map((format) => (format.name));
    const shaped = {
        formats: nameArray,
    }
    res.status(200).json(shaped);
};

module.exports = {
    formatsGet
};