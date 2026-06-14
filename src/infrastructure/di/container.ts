import type { IAuthService } from "@/domain/services/auth-service";
import type { INotificationService } from "@/domain/services/notification-service";
import type { IStorageService } from "@/domain/services/storage-service";
import type { IUserRepository } from "@/domain/repositories/user-repository";
import type { IDriverRepository } from "@/domain/repositories/driver-repository";
import type { IPassengerRepository } from "@/domain/repositories/passenger-repository";
import type { IRideRepository } from "@/domain/repositories/ride-repository";
import type { IRouteRepository } from "@/domain/repositories/route-repository";
import type { IPaymentRepository } from "@/domain/repositories/payment-repository";
import type { ICommissionRepository } from "@/domain/repositories/commission-repository";
import type { INotificationRepository } from "@/domain/repositories/notification-repository";
import type { IDirectionsRepository } from "@/domain/repositories/directions-repository";
import { FirestoreUserRepository } from "@/infrastructure/firebase/repositories/firestore-user-repository";
import { FirestoreDriverRepository } from "@/infrastructure/firebase/repositories/firestore-driver-repository";
import { FirestorePassengerRepository } from "@/infrastructure/firebase/repositories/firestore-passenger-repository";
import { FirestoreRideRepository } from "@/infrastructure/firebase/repositories/firestore-ride-repository";
import { FirestoreRouteRepository } from "@/infrastructure/firebase/repositories/firestore-route-repository";
import { FirestorePaymentRepository } from "@/infrastructure/firebase/repositories/firestore-payment-repository";
import { FirestoreCommissionRepository } from "@/infrastructure/firebase/repositories/firestore-commission-repository";
import { FirestoreNotificationRepository } from "@/infrastructure/firebase/repositories/firestore-notification-repository";
import { FirebaseAuthService } from "@/infrastructure/firebase/services/firebase-auth-service";
import { FirebaseStorageService } from "@/infrastructure/firebase/services/firebase-storage-service";
import { FirebaseNotificationService } from "@/infrastructure/firebase/services/firebase-notification-service";
import { GoogleDirectionsRepository } from "@/infrastructure/google-maps/google-directions-repository";

class Container {
  private userRepository?: IUserRepository;
  private driverRepository?: IDriverRepository;
  private passengerRepository?: IPassengerRepository;
  private rideRepository?: IRideRepository;
  private routeRepository?: IRouteRepository;
  private paymentRepository?: IPaymentRepository;
  private commissionRepository?: ICommissionRepository;
  private notificationRepository?: INotificationRepository;
  private authService?: IAuthService;
  private storageService?: IStorageService;
  private notificationService?: INotificationService;
  private directionsRepository?: IDirectionsRepository;

  getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new FirestoreUserRepository();
    }
    return this.userRepository;
  }

  getDriverRepository(): IDriverRepository {
    if (!this.driverRepository) {
      this.driverRepository = new FirestoreDriverRepository();
    }
    return this.driverRepository;
  }

  getPassengerRepository(): IPassengerRepository {
    if (!this.passengerRepository) {
      this.passengerRepository = new FirestorePassengerRepository();
    }
    return this.passengerRepository;
  }

  getRideRepository(): IRideRepository {
    if (!this.rideRepository) {
      this.rideRepository = new FirestoreRideRepository();
    }
    return this.rideRepository;
  }

  getRouteRepository(): IRouteRepository {
    if (!this.routeRepository) {
      this.routeRepository = new FirestoreRouteRepository();
    }
    return this.routeRepository;
  }

  getPaymentRepository(): IPaymentRepository {
    if (!this.paymentRepository) {
      this.paymentRepository = new FirestorePaymentRepository();
    }
    return this.paymentRepository;
  }

  getCommissionRepository(): ICommissionRepository {
    if (!this.commissionRepository) {
      this.commissionRepository = new FirestoreCommissionRepository();
    }
    return this.commissionRepository;
  }

  getNotificationRepository(): INotificationRepository {
    if (!this.notificationRepository) {
      this.notificationRepository = new FirestoreNotificationRepository();
    }
    return this.notificationRepository;
  }

  getAuthService(): IAuthService {
    if (!this.authService) {
      this.authService = new FirebaseAuthService(
        this.getUserRepository(),
        this.getPassengerRepository()
      );
    }
    return this.authService;
  }

  getStorageService(): IStorageService {
    if (!this.storageService) {
      this.storageService = new FirebaseStorageService();
    }
    return this.storageService;
  }

  getNotificationService(): INotificationService {
    if (!this.notificationService) {
      this.notificationService = new FirebaseNotificationService();
    }
    return this.notificationService;
  }

  getDirectionsRepository(): IDirectionsRepository {
    if (!this.directionsRepository) {
      this.directionsRepository = new GoogleDirectionsRepository();
    }
    return this.directionsRepository;
  }
}

export const container = new Container();
