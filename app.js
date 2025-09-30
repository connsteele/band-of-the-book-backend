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
    try {
        const res = await prisma.origin.findMany();
        const dbOrigins = res.map((obj) => obj.url);
        const envOrigins = process.env.ALLOWED_ORIGINS.split(",");
        whitelist = new Set([...dbOrigins, ...envOrigins]);
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.has(origin)) {
            console.log(`Origin ${origin} is granted CORS access`);
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
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
