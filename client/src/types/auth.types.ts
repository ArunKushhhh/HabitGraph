interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  user: User;
  accessToken: string;
}
interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  name: string;
}

export type { User, AuthResponse, LoginInput, RegisterInput };
