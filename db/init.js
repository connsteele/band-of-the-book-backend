const prisma = require("./prisma");

async function populateGenreTable() {
    const genres = [
        { name: "Fantasy"},
        { name: "Sci-fi"},
        { name: "Horror"},
        { name: "Non-fiction"},
    ];

    try {
        await prisma.genre.createMany({
            data: genres,
            skipDuplicates: true
        });
    } catch (err) {
        console.log("ERROR: Failed to populate Genre Table", err);
        throw err;
    }
}

async function populateFormatTable() {
    const formats = [
        { name: "Physical" },
        { name: "eBook" },
        { name: "Audiobook" }
    ];

    try {
        await prisma.format.createMany({
            data: formats,
            skipDuplicates: true
        });
    } catch (err) {
        console.log("ERROR: Failed to populate Format Table", err);
        throw err;
    }
}

async function populateTables() {
    await populateGenreTable();
    await populateFormatTable();
}

module.exports = {
    populateTables
}