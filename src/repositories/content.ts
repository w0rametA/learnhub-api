import { PrismaClient } from "@prisma/client";
import { ICreateContent, IContent } from "../entities/content";
import { IRepositoryContent } from ".";

export function newRepositoryContent(db: PrismaClient): IRepositoryContent{
    return new RepositoryContent(db)
}

class RepositoryContent implements IRepositoryContent {
    private db: PrismaClient;

    constructor(db: PrismaClient){
        this.db = db;
    }

    async createContent(arg: ICreateContent): Promise<IContent>{
        return await this.db.content.create({
           include: {
            owner: {
                select : {
                    id : true,
                    username : true,
                    name : true,
                    password : false,
                }
            },
           },
           data : {
                videoTitle : arg.videoTitle,
                videoUrl : arg.videoUrl,
                comment : arg.comment,
                rating : arg.rating,
                thumbnailUrl : arg.thumbnailUrl,
                creatorName : arg.creatorName,
                creatorUrl : arg.creatorUrl,
                ownerId: undefined,
                owner : {
                    connect: {
                        id : arg.ownerId
                    }
                },
           }
        })
    }

    async getContents(): Promise<IContent[]> {
        return await this.db.content.findMany()
    }

    async getContentById( id: number ):Promise<IContent | null>{
        return await this.db.content.findUnique({
            where: {
                id
            }
        })
    }
    async deleteUserContentById(arg: {
        id: number;
        ownerId: string;
     }):Promise<IContent>{
        const content = await this.db.content.findFirst({
            where: { id: arg.id , ownerId: arg.ownerId }
        })

        if(!content) {
            return Promise.reject(`no such content: ${arg.id}`)
        }

        return await this.db.content.delete({where : { id : arg.id }})
        }

    async updateUserContent(arg:{
        id: number;
        ownerId: string;
        comment: string;
        rating : number;

    }): Promise<IContent>{
        const content = await this.db.content.findUnique({
            where: { id : arg.id }
        })

        if(!content){
            return Promise.reject(`no such content ${arg.id}`)
        }

        if(content.ownerId !== arg.ownerId){
            return Promise.reject(`bad ownerId: ${arg.ownerId}`)
        }

        return await this.db.content.update({
            where: { id: arg.id },
            data : {
                comment : arg.comment,
                rating : arg.rating
            }
        })
    }
}


