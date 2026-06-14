import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import type { IStorageService, UploadResult } from "@/domain/services/storage-service";
import { getFirebaseStorage } from "@/infrastructure/firebase/config";

export class FirebaseStorageService implements IStorageService {
  async uploadFile(path: string, file: File): Promise<UploadResult> {
    const storageRef = ref(getFirebaseStorage(), path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { url, path: snapshot.ref.fullPath };
  }

  async deleteFile(path: string): Promise<void> {
    await deleteObject(ref(getFirebaseStorage(), path));
  }

  async getDownloadUrl(path: string): Promise<string> {
    return getDownloadURL(ref(getFirebaseStorage(), path));
  }
}
