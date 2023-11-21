import { userService } from "../services/user.service.js";
import { catchAsync } from "../utils/catch-async.js";
import { CustomError } from "../utils/custom-error.js";

class UserController {
    signUp = catchAsync(async (req, res) => {
        const { body } = req;

        const userInput = {
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            dateOfBirth: body.dateOfBirth,
            password: body.password
        };

        await userService.signUp(userInput);
        res.status(201).json({
            message: "Success"
        });
    });

    login = catchAsync(async (req, res) => {
        const { body } = req;
        const input = {
            email: body.email,
            password: body.password
        };

        const jwt = await userService.login(input);
        res.status(200).json({
            token: jwt
        });
    });

    activate = catchAsync(async (req, res) => {
        const {
            query: { activationToken }
        } = req;

        if (!activationToken) {
            throw new CustomError("Activation Token is missing", 400);
        }

        await userService.activate(activationToken);

        res.status(200).json({
            message: "Success"
        });
    });
}

export const userController = new UserController();
