const express = require("express");
const app = express();
const init = require("./db/init");

(async() => {
    await init.populateTables();
})();


const port = 3000;
app.listen(port, (err) => {
    if (err)
        throw err;
    console.log(`Server listening on port ${port}`);
});