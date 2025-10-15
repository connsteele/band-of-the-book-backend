const login = (req, res, next) => {
    res.send("In");
};

const logout = (req, res, next) => {
    res.send("Out");
};

module.exports = {
    login,
    logout
};