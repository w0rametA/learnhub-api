import jwt from "jsonwebtoken"
import { IRepositoryBlacklist } from "../repositories";
import { Request, Response, NextFunction } from "express"

const secret = process.env.JWT_SECRET || "my-secreys"


export interface Payload {
    id : string;
    username : string
}

export function newJwt(payload: Payload): string{
    return jwt.sign(payload, secret, {
        algorithm: "HS512",
        expiresIn: "12h",
        issuer: "academy",
        subject: "registration",
        audience: "students"
    })
}

export interface JwtAuthRequest extends Request {
    token : string;
    payload: Payload;
}

export class HandlerMiddleware {
    private repoBlacklist: IRepositoryBlacklist;

    constructor(repo: IRepositoryBlacklist){
        this.repoBlacklist = repo;
    }

    async jwtMiddleware(
        req: JwtAuthRequest,
        res: Response,
        next: NextFunction,
    ){
        const token = req.header("Authorization")?.replace(`Bearer `, "")
        try {
            if(!token){
                return res.status(401).json({ error: "missing JWT token"})
            }
            const isBlacklisted = await this.repoBlacklist.isBlacklisted(token)
            if (isBlacklisted){
                return res.status(401).json({ status : `logged out` }).end()
            }

            const decoded = jwt.verify(token, secret)
            const id = decoded["id"]
            const username = decoded["username"]

            if(!id){
                return res.status(401).json({ error : "missing payload `id` "}).end()
            }
            if(!username) {
                return res
                .status(401)
                .json({error : "missing payload `username` "})
                .end()
            }

            req.token = token
            req.payload = {
                id,
                username
            }
            return next()
        } catch (err) {
            console.error(`Auth failed for token ${token}: ${err}`)
            return res.status(401).json({})
        }
    }
}