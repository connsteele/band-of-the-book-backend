const express = require("express");
const app = express();
const cors = require("cors");
const init = require("./db/init");
const homeRouter = require("./routes/homeRouter");
const newPostRouter = require("./routes/newPostRouter");


if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

// CORS
const envOrigins = process.env.ALLOWED_ORIGINS;
const whitelist = envOrigins.split(",");
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.includes(origin)) {
            console.log(`Origin ${origin} is granted CORS access`);
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    }
};
app.use(cors(corsOptions));

// Routes
app.use("/", homeRouter);
app.use("/new-post", newPostRouter);

(async() => {
    await init.populateTables();
})();


const port = 5000;
app.listen(port, (err) => {
    if (err)
        throw err;
    console.log(`Server listening on port ${port}`);
});