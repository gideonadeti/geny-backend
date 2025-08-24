import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto {
  /**
   * User's name
   * @example "John Doe"
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * User's email
   * @example johndoe@gmail.com
   */
  @IsNotEmpty()
  @IsEmail()
  email: string;

  /**
   * User's password
   * @example strongPassword
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}
