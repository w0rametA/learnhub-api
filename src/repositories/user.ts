import { PrismaClient } from "@prisma/client";
import { IUser, ICreateUser , IUserDto} from "../entities/user";
import { IRepositoryUser } from ".";

export function newRepositoryUser(db: PrismaClient): IRepositoryUser{
    return new RepositoryUser(db)
}

class RepositoryUser {
    private db:PrismaClient;

    constructor(db: PrismaClient){
        this.db = db
    }

    async createUser(user: ICreateUser): Promise<IUser>{
        return await this.db.user
        .create({ data: user })
        .catch((err) => 
        Promise.reject(`failed to create user ${user.username}: ${err}`))
    }
    async getUser(username: string): Promise<IUser>{
        return await this.db.user
        .findUnique({where : { username }})
        .then((user) => {
            if(!user){
                return Promise.reject(`no such user ${username}`)
            }
            return Promise.resolve(user)
        })
    }

    async getUserByPayloadId(id: string): Promise<IUserDto | null> {
        return await this.db.user.findUnique({
          where: { id },
          select: {
            id: true,
            username: true,
            name: true,
          },
        });
      }
}

