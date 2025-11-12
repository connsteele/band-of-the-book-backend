const httpStatus = require("../constants/httpStatus");

const login = (req, res, next) => {
    res.send("In");
};

const logout = (req, res, next) => {
    res.send("Out");
};

const signup = (req, res, next) => {
    const formData = req.body;
    console.log(formData);
    const {
        token,
        email,
        username,
        password
    } = formData;

    if (!token || token !== process.env.AUTH_TOKEN) {
        res.status(httpStatus.UNAUTHORIZED).json("Token missing or invalid");
    }

    // pass json back and let front end redirect
    res.status(httpStatus.ACCEPTED).json();
};

module.exports = {
    login,
    logout,
    signup
};