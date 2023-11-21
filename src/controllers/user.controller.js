import { userService } from "../services/user.service.js";
import { catchAsync } from "../utils/catch-async.js";

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
}

export const userController = new UserController();
