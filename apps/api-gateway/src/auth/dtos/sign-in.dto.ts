import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDto {
  /**
   * User's email
   * @example "johndoe@gmail.com"
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * User's password
   * @example "strongPassword"
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}
