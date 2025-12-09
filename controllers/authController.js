const httpStatus = require("../constants/httpStatus");
const prisma = require("../db/prisma");
const bcrypt = require("bcryptjs");
const SALT = 12; // Salt Length

const login = (req, res, next) => {
    res.send("In");
};

const logout = (req, res, next) => {
    res.send("Out");
};

const signup = async (req, res, next) => {
    const formData = req.body;
    console.log(formData);
    const {
        token,
        email,
        username,
        password
    } = formData;

    // Validate Token
    if (!token || token !== process.env.AUTH_TOKEN) {
        console.log(`User provided invalid sign up token: "${token}"`);
        return res.status(httpStatus.UNAUTHORIZED).json("Token missing or invalid");
    }
    console.log(`User provided valid sign up token`);

    // Validate data


    // check for collisions
    const normalizedEmail = email.toLocaleLowerCase();
    const exists = await prisma.user.findFirst({
        where: {
            OR: [
                { name: username },
                { email: normalizedEmail }
            ]
        },
        select: {
            id: true,
            email: true,
            name: true
        }
    });

    if (exists) {
        // alert user to conflict
        const conflict = (exists.email === normalizedEmail) ? "Email" : "Username";
        const info = (exists.email === normalizedEmail) ? normalizedEmail : usernames;
        console.log(`A user with ${conflict}: "${info}" already exists.`);
        return res.status(httpStatus.CONFLICT).json({
            error: {
                code: httpStatus.CONFLICT,
                message: `The ${conflict}: "${info}" is already in use. Please use a different ${conflict}.`,
            }
        });
    }

    // Add the user to the db
    try {
        const hashed = await bcrypt.hash(password, SALT);
        const user = await prisma.user.create({
            data: {
                name: username,
                email: normalizedEmail,
                password: hashed, // only store salted and hashed

            },
        });
    } catch (err) {
        console.error(err);
        next(err); // pass the error along to the next middleware
    }


    // pass json back and let frontend redirect
    console.log(`User succesfully created`);
    res.status(httpStatus.ACCEPTED).json();
};

module.exports = {
    login,
    logout,
    signup
};