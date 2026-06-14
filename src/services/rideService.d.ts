export type RidePointInput = {
  lat?: number;
  lng?: number;
  address?: string; // جعلنا الإحداثيات اختيارية ليدعم العناوين النصية
};

export type RideRequestInput = {
  passengerId: string;
  passengerUserId: string;
  passengerName?: string;
  passengerPhone?: string;
  pickup: RidePointInput | string; // يقبل كائن أو نص
  dropoff: RidePointInput | string; // يقبل كائن أو نص
  destination?: string;
  fare?: number;
  price?: number;
  commissionRate?: number;
  commissionAmount?: number;
  commissionAppliedAt?: Date | null;
  currency?: string;
  distanceMeters?: number;
  durationSeconds?: number;
  routeId?: string | null;
  driverId?: string | null;
  driverUserId?: string | null;
  assignedDriverId?: string | null;
  status?: string;
};

export type RideResult = {
  id: string;
  passengerId: string;
  passengerUserId: string;
  passengerName: string;
  passengerPhone: string;
  driverId: string | null;
  driverUserId: string | null;
  routeId: string | null;
  pickup: RidePointInput; // سيتم حفظه دائماً كـ RidePointInput بعد المعالجة
  dropoff: RidePointInput; // سيتم حفظه دائماً كـ RidePointInput بعد المعالجة
  destination: string;
  status: string;
  fare: number;
  price: number;
  commissionRate: number;
  commissionAmount: number;
  commissionAppliedAt: Date | null;
  currency: string;
  distanceMeters: number;
  durationSeconds: number;
  requestedAt: Date | null;
  acceptedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancelReason: string | null;
  assignedDriverId: string | null;
  assignedDistanceKm: number | null;
  dispatchStatus: string | null;
  dispatchedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

// تعريف الدوال لتعمل بنظام async لضمان معالجة البيانات قبل الحفظ
export declare function createRideRequest(input: RideRequestInput): Promise<RideResult>;

export declare function updateRideStatus(
  rideId: string,
  status: string,
  options?: {
  driverId?: string;
  driverUserId?: string;
  cancelReason?: string;
  fare?: number;
  price?: number;
  assignedDriverId?: string | null;
  dispatchStatus?: string | null;
  }
): Promise<RideResult>;

export declare function getAvailableRides(max?: number): Promise<RideResult[]>; // تم تصحيح النوع من any[] إلى RideResult[]

export declare function getRideById(rideId: string): Promise<RideResult | null>;
