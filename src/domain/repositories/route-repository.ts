import type { CreateRouteInput, Route, UpdateRouteInput } from "@/domain/entities/route";

export interface IRouteRepository {
  getById(id: string): Promise<Route | null>;
  create(input: CreateRouteInput): Promise<Route>;
  update(id: string, data: UpdateRouteInput): Promise<Route>;
  listActive(limit?: number): Promise<Route[]>;
}
