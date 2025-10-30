export class CreateUserRepoDto {
  email: string;
  username: string;
  password; // This should be the HASHED password
  role: string;
  status: string;
}
