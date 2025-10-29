export class CreateUserRepoDto {
  email: string;
  name: string;
  password; // This should be the HASHED password
  role: string;
  status: string;
}
