import { IContent, ICreateContent } from "../entities/content"
import { IUser, ICreateUser, IUserDto } from "../entities/user"

export interface IRepositoryContent{
    createContent(arg: ICreateContent): Promise<IContent>
    getContents(): Promise<IContent[]>
    getContentById( id: number ):Promise<IContent | null>
    deleteUserContentById(arg: {
        id: number;
        ownerId: string;
     }):Promise<IContent>
    updateUserContent(arg:{
        id: number;
        ownerId: string;
        comment: string | undefined;
        rating : number | undefined;

    }): Promise<IContent>
}

export interface IRepositoryUser{
    createUser(user: ICreateUser): Promise<IUser>
    getUser(username: string): Promise<IUser>
    getUserByPayloadId(id: string): Promise<IUserDto | null>
}


export interface IRepositoryBlacklist {
    addToBlacklist(token: string): Promise<void>;
    isBlacklisted(token: string): Promise<boolean>;
  }
  