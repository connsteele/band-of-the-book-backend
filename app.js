const express = require("express");
const app = express();
const prisma = require("./db/prisma");
const cors = require("cors");
const init = require("./db/init");
const homeRouter = require("./routes/homeRouter");
const newPostRouter = require("./routes/newPostRouter");


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
        if (res.length > 0)
            dbOrigins = res.map((obj) => obj.url);

    } catch (err) {
        console.error("Failed to load whitelisted origins from database", err);
    }
    whitelist = new Set([...dbOrigins, ...envOrigins]);
    console.log(`CORS Whitelist: `, Array.from(whitelist));
}

const corsOptions = {
    origin: (origin, callback) => {
        // Allow server-to-server requests (curl, etc)
        if (!origin)
            callback(null, true)

        if (whitelist.has(origin)) {
            console.log(`Origin ${origin} is granted CORS access`);
            callback(null, true);
        }
        else {
            callback(new Error(`Origin: ${origin} not whitelisted for CORS`));
        }
    }
};

async function start() {
    await buildWhitelist();
    app.use(cors(corsOptions));

    // Routes
    app.use("/", homeRouter);
    app.use("/new-post", newPostRouter);

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
