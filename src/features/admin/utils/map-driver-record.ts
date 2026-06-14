import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export type DriverRecord = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  status: string;
  totalDebt: number;
  carModel: string;
  carPlateNumber: string;
  idCardNumber: string;
  licenseNumber: string;
  updatedAtLabel: string;
  sortTime: number;
};

function toMillis(value: unknown): number {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().getTime();
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  return 0;
}

export function formatFirestoreDate(value: unknown): string {
  const millis = toMillis(value);
  return millis > 0 ? new Date(millis).toLocaleString() : "—";
}

/** Maps a Firestore driver document to a plain-text admin view model. */
export function mapDriverDoc(snapshot: QueryDocumentSnapshot<DocumentData>): DriverRecord {
  const data = snapshot.data();
  const sortSource = data.updatedAt ?? data.createdAt;

  return {
    id: snapshot.id,
    userId: String(data.userId ?? snapshot.id),
    fullName: String(data.fullName ?? data.displayName ?? "Driver"),
    phone: String(data.phone ?? "—"),
    status: String(data.status ?? "pending"),
    totalDebt: Number(data.totalDebt ?? 0),
    carModel: String(data.carModel ?? data.vehicleModel ?? "—"),
    carPlateNumber: String(data.carPlateNumber ?? data.vehiclePlate ?? "—"),
    idCardNumber: String(data.idCardNumber ?? "—"),
    licenseNumber: String(data.licenseNumber ?? "—"),
    updatedAtLabel: formatFirestoreDate(sortSource),
    sortTime: toMillis(sortSource),
  };
}

export function sortDriversNewestFirst(drivers: DriverRecord[]): DriverRecord[] {
  return [...drivers].sort((a, b) => b.sortTime - a.sortTime);
}
