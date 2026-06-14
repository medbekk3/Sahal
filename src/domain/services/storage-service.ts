export interface UploadResult {
  url: string;
  path: string;
}

export interface IStorageService {
  uploadFile(path: string, file: File): Promise<UploadResult>;
  deleteFile(path: string): Promise<void>;
  getDownloadUrl(path: string): Promise<string>;
}
