export interface ICreateUser {
    username: string;
    password: string;
    name: string;
  }
  
  export interface IUser extends ICreateUser {
    id: string;
    // registeredAt: Date;
  }
  
  // Remove field password
  export interface IUserDto extends Omit<IUser, "password"> {
  }