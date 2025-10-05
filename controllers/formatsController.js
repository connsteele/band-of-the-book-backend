const prisma = require("../db/prisma");

async function formatsGet(req, res, next) {

    const [dbRes, count] = await prisma.$transaction([
        prisma.format.findMany(),
        prisma.format.count(),
    ]);


    const shaped = dbRes.map((format) => (format.name));

    res.status(200).json({
        count: count,
        result: shaped
    });
};

module.exports = {
    formatsGet
};