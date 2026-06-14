import type { IAuthService } from "@/domain/services/auth-service";
import type { UserProfile } from "@/domain/entities/user";

export interface SignInInput {
  email: string;
  password: string;
}

export async function signInUseCase(
  authService: IAuthService,
  input: SignInInput
): Promise<UserProfile> {
  return authService.signIn({ email: input.email, password: input.password });
}
