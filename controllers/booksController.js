const { skip } = require("@prisma/client/runtime/library");
const prisma = require("../db/prisma");

const validQueries = new Set([
    "title",
    "author"
]);


async function searchBook(req, res, next) {
    // Collection request
    if (Object.entries(req.query).length === 0) {
        console.log("Send paginated collection as response");
    }

    // Request Validation
    const validP = new Map([
        ["title", false],
        ["author", false]
    ]);
    for (const [key, value] of Object.entries(req.query)) {
        if (!validQueries.has(key)) {
            console.error("Invalid search request");
            return res.status(400).json(`Invalid query ${param}. Only use required queries: title & author`);
        }
    }

    const title = req.query.title.trim() === "" ? undefined : req.query.title.trim();
    const author = req.query.author.trim() === "" ? undefined : req.query.author.trim();


    // Specific book request, search db and API
    // 1 Check Database
    const dbRes = await prisma.book.findFirst({
        where: {
            title: title,
            author: author,
        }
    });
    if (dbRes) {
        const protocol = req.protocol;
        const host = req.get("host");
        const bookUrl = `${protocol}://${host}/books/${dbRes.id}`
        res.status(200).json({
            result: bookUrl
        });
    }

    // 2 Check Open Library and Google Books API
    // Await all here then shape results

    const search = {
        title,
        author
    };
    const googleRes = await searchGoogleBooks(search);
    if (googleRes){
        res.status(200).json({
            result: googleRes,
        });
    }

}

async function readBook(req, res, next) {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id))
        return res.status(400).json({ error: `Invalid book id ${id}` });

    const dbRes = await prisma.book.findUnique({
        where: { id: id },
        include: {
            genres: {
                select: {
                    name: true
                }
            },
        },
    })

    if (dbRes) {
        const entryValue = dbRes.entry.toNumber();

        const result = {
            ...dbRes,
            entry: entryValue,
            genres: dbRes.genres.map((obj) => (obj.name)),
        };
        return res.status(200).json(result);
    }
}

async function searchGoogleBooks(search) {
    if (!search.title) {
        console.error("No title provided for search of Google Books API");
        return;
    }

    const author = search.author ? `+inauthor:${search.author}` : "";

    // const options = `&maxResults=${pageSize}&orderBy=relevance`;

    const base = "https://www.googleapis.com/books/v1/volumes";
    const params = new URLSearchParams({
        q: `intitle:${search.title}` + author,
        maxResults: 5,
        orderBy: "relevance",
        //fields: "items(volumeInfo/title,volumeInfo/authors,volumeInfo/categories,volumeInfo/imageLinks)",
        key: process.env.GOOGLE_BOOKS_API
    });

    const request = `${base}?${params.toString()}`;
    const res = await fetch(request, { method: "GET" });
    if (!res.ok) {
        console.error(`Google Books API could not resolve request`);
        return;
    }
    const data = await res.json();
    const shaped = data.items.map((item) => ({
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        genres: item.volumeInfo.categories,
        images: item.volumeInfo.imageLinks
    }))
    return shaped;
}

module.exports = {
    searchBook,
    readBook
};