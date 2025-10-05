const express = require("express");
const app = express();
const prisma = require("./db/prisma");
const cors = require("cors");
const init = require("./db/init");
const postsRouter = require("./routes/postsRouter");
const formatsRouter = require("./routes/formatsRouter");
const genresRouter = require("./routes/genresRouter");
const usersRouter = require("./routes/usersRouter");


if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

// CORS

let whitelist = new Set();

async function buildWhitelist() {
    const envOrigins = (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((str) => str.trim())
        .filter(Boolean);

    let dbOrigins = [];
    try {
        const res = await prisma.origin.findMany();
        if (res.length > 0) {
            dbOrigins = res.map((obj) => obj.url);
            dbOriginsCache = new Set(dbOrigins);
        }


    } catch (err) {
        console.error("Failed to load whitelisted origins from database", err);
    }
    whitelist = new Set([...dbOrigins, ...envOrigins]);
    console.log(`CORS Whitelist: `, Array.from(whitelist));
}

const corsOptions = {
    origin: async (origin, callback) => {
        // Allow server-to-server requests (curl, etc)
        if (!origin){
            callback(null, true);
            return;
        }
            

        if (whitelist.has(origin)) {
            console.log(`Origin ${origin} is granted CORS access`);
            callback(null, true);
            return;
        }

        try {
            const found = await prisma.origin.findFirst({
                where: {
                    url: origin
                }
            })

            if (!found) 
                throw new Error(`Origin: ${origin} not found in database or whitelist`);

            console.log(`Origin: ${origin} found in database. Updating whitelist.`);
            await buildWhitelist();
            callback(null, true);
            return;

        } catch (err) {
            console.error(err);
            callback(err);
            return;
        }

    }
};

async function start() {
    // App Middleware
    await buildWhitelist();
    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }))

    // Routes
    app.use("/posts", postsRouter);
    app.use("/formats", formatsRouter);
    app.use("/genres", genresRouter);
    app.use("/users", usersRouter);

    (async () => {
        await init.populateTables();
    })();


    const port = process.env.PORT || 5000;
    app.listen(port, (err) => {
        if (err)
            throw err;
        console.log(`Server listening on port ${port}`);
    });
};

start().catch((error) => {
    console.error("App failed to run", error);
    prisma.$disconnect();
    process.exit(1);
});
