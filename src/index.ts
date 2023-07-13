import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import express from "express";
import cors from "cors";

import { newRepositoryContent } from "./repositories/content";
import { newRepositoryUser } from "./repositories/user";

import { newHandlerContent } from "./handlers/content";
import { newHandlerUser } from "./handlers/user";
import { HandlerMiddleware } from "./auth/jwt";
import { newRepositoryBlacklist } from "./repositories/blacklist"


async function main(){
    const db = new PrismaClient();
    const redis = createClient();

    try{
        redis.connect();
        db.$connect();
    } catch (err){
        console.error(err)
        return 
    }

    const repoUser = newRepositoryUser(db)
    const repoBlacklist = newRepositoryBlacklist(redis)
    const handlerUser = newHandlerUser(repoUser, repoBlacklist)
    const repoContent = newRepositoryContent(db)
    const handlerContent = newHandlerContent(repoContent)
    const handlerMiddlerware = new HandlerMiddleware(repoBlacklist)

    const port = process.env.PORT || 8000;
    const server = express();
    server.use(express.json())
    server.use(cors())

    const userRouter = express.Router();
    const contentRouter = express.Router()
    const authRouter = express.Router()

    server.use(express.json());
    server.use("/user", userRouter);
    server.use("/content", contentRouter)
    server.use("/auth", authRouter)

    server.get("/", (_ , res)=> {
        return res.status(200).json({status : "ok"}).end()
    })

    // User API
    userRouter.post("/", handlerUser.register.bind(handlerUser))
    authRouter.post("/login", handlerUser.login.bind(handlerUser))
    authRouter.get("/me", 
        handlerMiddlerware.jwtMiddleware.bind(handlerMiddlerware)
    , handlerUser.getUserByPayloadId.bind(handlerUser))

    // Content API
    contentRouter.post("/",
        handlerMiddlerware.jwtMiddleware.bind(handlerMiddlerware)
    ,handlerContent.createContent.bind(handlerContent))
    contentRouter.get("/", handlerContent.getContents.bind(handlerContent))
    contentRouter.get("/:id", handlerContent.getContent.bind(handlerContent))
    contentRouter.patch("/:id",
        handlerMiddlerware.jwtMiddleware.bind(handlerMiddlerware)
    ,handlerContent.updateContent.bind(handlerContent))
    contentRouter.delete("/:id",
    handlerMiddlerware.jwtMiddleware.bind(handlerMiddlerware)
    ,handlerContent.deleteContent.bind(handlerContent))

    //Guard invalid path for missing `id`
    contentRouter.patch("/", async (_, res) => {
        return res.status(400).json({ error: "missing params id" }).end()
    })

    server.listen(port , ()=> console.log(`server is listening on ${port}`))
}

main();