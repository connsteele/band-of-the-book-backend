const httpStatus = require("../constants/httpStatus");
const prisma = require("../db/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const SALT = 12; // Salt Length

/**
 * Body is validated by loginValidation middleware before login is called
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const login = async (req, res) => {
    try {
        // Find the User
        const { email, password: inPassword } = req.body;
        const user = await prisma.user.findFirst({
            where: { email: email },
            select: {
                id: true,
                name: true,
                password: true,
            },
        });

        if (!user) {
            return res.status(httpStatus.BAD_REQUEST).json({
                error: {
                    code: httpStatus.BAD_REQUEST,
                    message: `Login failed, user with ${email} does not exist`
                }
            });
        }

        console.log(`Found user "${user.name}" associated with ${email}`);

        // Verify password matches
        const verify = await bcrypt.compare(inPassword, user.password);
        if (!verify) {
            return res.status(httpStatus.BAD_REQUEST).json({
                error: {
                    code: httpStatus.BAD_REQUEST,
                    message: `Login failed, password does not match`
                }
            });
        }

        // Generate Access token & refresh token
        const accessExpires = "15m";
        const issuer = "band-of-the-book";
        const algorithm = "HS256";
        const secret = process.env.JWT_SECRET;

        const accessToken = jwt.sign(
            {
                email: email,
                sub: user.id, // Subject

            },
            secret,
            {
                expiresIn: accessExpires,
                issuer: issuer,
                algorithm: algorithm,
            },
        );

        const refreshToken = uuidv4();
        const offset = {
            day: 30, // Only value to change
            hours: 24, // hours in a day
            minutes: 60, // minutes in a hour
            seconds: 60, // seconds in a minute
            ms: 1000 // ms in a second
        }
        const refreshExpires = new Date(Date.now() +
            offset.day * offset.hours * offset.minutes * offset.seconds * offset.ms);



        return res
            .status(httpStatus.OK)
            .cookie("accessToken", accessToken, {
                httpOnly: true,
            })
            .cookie("refreshToken", refreshToken, {
                httpOnly: true,
            })
            .json({
                message: "Login Successful",
            });


    } catch (e) {
        return res.status(httpStatus.BAD_REQUEST).json({
            error: {
                code: httpStatus.BAD_REQUEST,
                message: "Login failed, credentials could not be found"
            }
        });
    }

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