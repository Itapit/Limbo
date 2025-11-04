import { UserDto } from '../base';

export interface LoginResponse {
  accessToken: string;
  user: UserDto;
  // refreshToken will be in an httpOnly cookie
}
