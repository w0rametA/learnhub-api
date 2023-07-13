import { Request, Response } from "express"
import { JwtAuthRequest } from "../auth/jwt"

export interface IHandlerUser {
    register( req: Request, res: Response ):Promise<Response>
    login(req: Request, res:Response): Promise<Response>
    getUserByPayloadId(
        req: JwtAuthRequest,
        res: Response
      ): Promise<Response>
}

export interface IHandlerContent {
    createContent(
        req: JwtAuthRequest, 
        res:Response
        ): Promise<Response>
    getContents(
            req: Request,
            res: Response
        ): Promise<Response>
    getContent(
            req: JwtAuthRequest,
            res: Response
        ): Promise<Response>
    updateContent(
            req: JwtAuthRequest,
            res: Response
        ):Promise<Response>
    deleteContent (
            req: JwtAuthRequest,
            res: Response
        ): Promise<Response>
}