export interface Passenger {
  /** Document ID — same as `userId` */
  id: string;
  userId: string;
  defaultPickupAddress: string | null;
  totalRides: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePassengerInput {
  userId: string;
  defaultPickupAddress?: string | null;
}

export interface UpdatePassengerInput {
  defaultPickupAddress?: string | null;
  totalRides?: number;
}
