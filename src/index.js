import express from "express";
import dotenv from "dotenv";
import { userRouter } from "./routes/user.route.js";
import { GlobalError } from "./middlewares/global-error.middleware.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
app.use("/users", userRouter);
app.use(GlobalError.handle);

app.listen(PORT, () => {
    console.log("Server is running on ", PORT);
});
