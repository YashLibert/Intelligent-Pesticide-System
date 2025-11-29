import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// routes import
import userRouter from './routes/user.routes.js'
import router from "./routes/user.routes.js"
import aiRouter from "./routes/plants.routes.js";
import blockchainRouter from "./routes/blockchian.routes.js"
import plantRouter from "./routes/plants.routes.js"
import sprayRouter from "./routes/spray.routes.js";
import plantsRouter from "./routes/plants.routes.js";
import cameraRoutes from "./routes/camera.routes.js"; // not ready yet
import aiRoutes from "./routes/ai.routes.js"; // not ready yet
// routes declaration
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

app.use("/api/v1/users", userRouter)
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/blockchain", blockchainRouter)
app.use("/api/v1/plants", plantRouter); 
app.use("/api/v1/spray", sprayRouter);
app.use("/api/v1/plants", plantsRouter);
app.use("/api/v1/ai", aiRoutes); // not ready yet

app.use("/api/v1/camera", cameraRoutes); // not ready yet


export { app }
