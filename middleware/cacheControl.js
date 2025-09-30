/**
 * Factory function that returns middleware
 * @param {*} options 
 * @returns Middleware function that defines cache control options on responses to GET requests
 */
function cacheControl(options = {}) {
    const {
        maxAge = 300, // Seconds
        scope = "public" // "private" for auth responses
    } = options;

    return (req, res, next) => {
        if (req.method !== "GET")
            return next();

        console.log("GET request");

        const header = "Cache-Control"
        const headerOptions = `${scope}, max-age=${maxAge}`;
        res.setHeader(header, headerOptions);
        return next();
    }

}

module.exports = cacheControl