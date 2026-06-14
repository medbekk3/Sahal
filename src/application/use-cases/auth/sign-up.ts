import type { IAuthService } from "@/domain/services/auth-service";
import type { UserProfile } from "@/domain/entities/user";

export interface SignUpInput {
  email: string;
  password: string;
  displayName: string;
}

export async function signUpUseCase(
  authService: IAuthService,
  input: SignUpInput
): Promise<UserProfile> {
  return authService.signUp({
    email: input.email,
    password: input.password,
    displayName: input.displayName,
  });
}
