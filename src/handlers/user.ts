import { Request, Response } from "express";
import { IRepositoryBlacklist, IRepositoryUser } from "../repositories";
import { hashPassword, compareHash } from "../auth/bcrypt";
import { IHandlerUser } from ".";
import { JwtAuthRequest, Payload, newJwt } from "../auth/jwt";

export function newHandlerUser(
    repo: IRepositoryUser,
    repoBlacklist: IRepositoryBlacklist,
):IHandlerUser {
    return new HandlerUser(repo, repoBlacklist)
}

class HandlerUser implements IHandlerUser{
    private readonly repo: IRepositoryUser;
    private repoBlacklist: IRepositoryBlacklist;

    constructor(repo: IRepositoryUser, repoBlacklist: IRepositoryBlacklist){
        this.repo = repo
        this.repoBlacklist = repoBlacklist
    }


    async register( req: Request, res: Response ):Promise<Response>{
        const { username, name , password } = req.body
        if(!username || !name || !password){
            return res.status(400)
            .json({ error: `missing username or name , or password in body`})
            .end()
        }
        try {
            const user = await this.repo.createUser({
                username,
                name,
                password: await hashPassword(password)
            })
            return res.status(201)
            .json({...user, password:undefined})
            .end()
        }
        catch(err){
            const errMsg = `failed to create user: ${username}`
            console.log()
            return res.status(500).json({error : errMsg}).end()
        }        
        
    }

    async login(req: Request
        , res:Response): Promise<Response>{
        const { username, password } = req.body
        if(!username || !password){
            return res
            .status(400)
            .json({ error: `missing username or password in body`})
            .end()
        }
        try {
            const user = await this.repo.getUser(username)
            if(!user){
                return res
                .status(404)
                .json({error : `no such user : ${username}`})
                .end()
            }
            if(! await compareHash(password, user.password)){
                return res
                .status(400)
                .json({error: `invalid username or password`})
                .end()
            }

            const payload: Payload = { id: user.id, username : user.username }
            const token = newJwt(payload)

            return res
            .status(200)
            .json({ 
                status: "logged in",
                id: user.id,
                username,
                token
            })
            .end()
        } catch (err) {
            console.error({ error: `failed to get user ${err}`})
            return res.status(500).json({error: `failed to login`}).end()
        }
    }

      //get auth/me
  async getUserByPayloadId(
    req: JwtAuthRequest,
    res: Response
  ): Promise<Response> {
    const userId = req.payload.id;

    return this.repo
      .getUserByPayloadId(userId)
      .then((user) => {
        if (!user) {
          return res
            .status(404)
            .json({ error: `user ${userId} not found` })
            .end();
        }

        return res.status(200).json(user).end();
      })
      .catch((err) => {
        const errMsg = `failed to get user: ${userId}`;
        console.error(`${errMsg}: ${err}`);

        return res.status(500).json({ error: errMsg }).end();
      });
  }


    async logout(
        req: JwtAuthRequest,
        res: Response,
    ):Promise<Response>{
        return await this.repoBlacklist
        .addToBlacklist(req.token)
        .then(() =>
        res.status(200).json({ status: `logged out`, token: req.token }).end())
        .catch((err) => {
            console.error(err)
            return res
            .status(500)
            .json({error : `could not log out with token ${req.token}`})
            .end()
        })
    }
}

