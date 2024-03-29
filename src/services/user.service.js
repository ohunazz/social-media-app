import { prisma } from "../prisma/index.js";
import { crypto } from "../utils/crypto.js";
import { bcrypt } from "../utils/bcrypt.js";
import { date } from "../utils/date.js";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";
import { mailer } from "../utils/mailer.js";
import { CustomError } from "../utils/custom-error.js";

class UserService {
    signUp = async (userInput) => {
        const hashedPassword = await bcrypt.hash(userInput.password);
        const activationToken = crypto.createToken();
        const hashedActivationToken = crypto.hash(activationToken);
        const user = await prisma.user.create({
            data: {
                ...userInput,
                password: hashedPassword,
                activationToken: hashedActivationToken
            },
            select: {
                id: true
            }
        });

        await mailer.sendActivationMail(userInput.email, activationToken);
    };

    login = async (input) => {
        const user = await prisma.user.findFirst({
            where: {
                email: input.email
            },
            select: {
                id: true,
                status: true,
                password: true
            }
        });
        if (!user) throw new CustomError("User does not exist", 404);
        if (user.status === "INACTIVE") {
            const activationToken = crypto.createToken();
            const hashedActivationToken = crypto.hash(activationToken);

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    activationToken: hashedActivationToken
                }
            });

            await mailer.sendActivationMail(input.email, activationToken);

            throw new CustomError(
                "We just sent you activation email. Follow instructions",
                400
            );
        }

        const isPasswordMatches = await bcrypt.compare(
            input.password,
            user.password
        );
        if (!isPasswordMatches) {
            throw new CustomError("Invalid Credentials", 401);
        }

        const token = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2 days"
            }
        );

        return token;
    };

    activate = async (token) => {
        const hashedActivationToken = crypto.hash(token);
        const user = await prisma.user.findFirst({
            where: {
                activationToken: hashedActivationToken
            },
            select: {
                id: true,
                activationToken: true
            }
        });

        if (!user) {
            throw new CustomError(
                "User does not exist with with provided Activation Token",
                404
            );
        }

        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                status: "ACTIVE",
                activationToken: null
            }
        });
    };
}

export const userService = new UserService();
