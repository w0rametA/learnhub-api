import { Request, Response } from "express";
import { IRepositoryContent } from "../repositories";
import { getVideoDetails } from "../services/oembed";
import { JwtAuthRequest } from "../auth/jwt";



export function newHandlerContent(repo: IRepositoryContent){
    return new HandlerContent(repo)
}

class HandlerContent {
    private readonly repo: IRepositoryContent

    constructor(repo: IRepositoryContent){
        this.repo = repo
    }

    async createContent(
        req: JwtAuthRequest, 
        res:Response
        ): Promise<Response>{
        const { videoUrl, comment, rating } = req.body
        if (!videoUrl){
            return res.status(400).json({ error: `missing videoUrl in body`}).end()
        }
        
        try {
            const details = await getVideoDetails(videoUrl)
            const ownerId = req.payload.id
            const createdContent = await this.repo.createContent({
                ...details,
                ownerId,
                comment,
                rating
            })
            return res.status(201).json(createdContent).end()
        }catch(err){
            const errMsg = "failed to create content";
      console.error(`${errMsg} ${err}`);

      return res.status(500).json({ error: errMsg }).end();
        }
    }

    async getContents(
        req: Request,
        res: Response
    ): Promise<Response>{
        try{
        const contents = await this.repo.getContents();

        return res.status(200).json(contents).end()
        } catch (err) {
            const errMsg = `failed to get contens`
            console.error(`${errMsg}: ${err}`)
        return res.status(500).json({error : errMsg}).end()
        }
    }

    async getContent(
        req: JwtAuthRequest,
        res: Response
    ): Promise<Response> {
        if( !req.params.id){
            return res.status(400).json({ error : `missing id in params`}).end()
        }
        const id = Number(req.params.id)
        if(isNaN(id)){
            return res
            .status(400)
            .json({ error: `id ${id} is not number`})
            .end()
        }
        
        try {
            const content = await this.repo.getContentById(id)
            if( !content){
                return res
                .status(404)
                .json({ error: `no such content: ${id}` })
                .end()
            }
            return res.status(200).json(content).end()
        } catch(err) {
            const errMsg = `failed to get content ${id}`
            console.error(`${errMsg}: ${err}`)

            return res.status(500).json({ error: errMsg }).end()
        }
    }

    async updateContent(
        req: JwtAuthRequest,
        res: Response
    ):Promise<Response>{
        if(!req.params.id){
            return res.status(400).json({ error: `missing id in params`}).end()
        }

        const id = Number(req.params.id)
        if(isNaN(id)){
            return res
            .status(400)
            .json({ error: `id ${id} is not number` })
            .end()
        }

        let rating: number | undefined = req.body.rating
        let comment: string | undefined = req.body.comment
        if(!comment || comment === ""){
            comment = undefined
        }
        
        try {
            const updated = await this.repo.updateUserContent(
               {
                id , 
                ownerId: req.payload.id,
                rating,
                comment
               }
            )
            return res.status(200).json(updated).end()
        } catch (err){
            const errMsg = `failed to update content ${id}`
            console.error(`${errMsg}: ${err}`)

            return res.status(500).json({error : errMsg}).end()
        }
    }

    async deleteContent (
        req: JwtAuthRequest,
        res: Response
    ): Promise<Response>{
        if(!req.params.id){
            return res.status(400).json({ error: "missing id in params" }).end();
        }

        const id = Number(req.params.id)
        if (isNaN(id)) {
            return res
              .status(400)
              .json({ error: `id '${id}' is not number` })
              .end();
          }

          try {
            const ownerId = req.payload.id
            const deleted = await this.repo.deleteUserContentById({id, ownerId})

            return res.status(200).json(deleted).end()
          }catch (err) {
            const errMsg = `failed to delete content: ${id}`;
            console.error(`${errMsg}: ${err}`);
      
            return res.status(500).json({ error: errMsg }).end();
          }
    }
}