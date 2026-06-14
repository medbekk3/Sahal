import type { UploadResult, IStorageService } from "@/domain/services/storage-service";

export async function uploadFileUseCase(
  storageService: IStorageService,
  path: string,
  file: File
): Promise<UploadResult> {
  return storageService.uploadFile(path, file);
}
