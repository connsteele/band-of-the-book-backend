const {cacheControl} = require("../middleware/index");
const prisma = require("../db/prisma");

async function genresGet(req, res, next) {
    const [dbRes, count] = await prisma.$transaction([
        prisma.genre.findMany(),
        prisma.genre.count()
    ]);

    const shaped = dbRes.map((genre) => (genre.name));

    res.status(200).json({
        count: count,
        result: shaped
    });
};

module.exports = {
    genresGet,
};