import type {
  CreateUserProfileInput,
  UpdateUserProfileInput,
  UserProfile,
} from "@/domain/entities/user";

export interface IUserRepository {
  getById(id: string): Promise<UserProfile | null>;
  create(input: CreateUserProfileInput): Promise<UserProfile>;
  update(id: string, data: UpdateUserProfileInput): Promise<UserProfile>;
}
