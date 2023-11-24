import { IsEmail, IsString } from 'class-validator';
export class QueryInputModel {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsEmail()
  email: string;
}
