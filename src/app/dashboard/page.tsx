"use client";

import { PageHero } from "@/components/shared/page-hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapView } from "@/features/maps/components/map-view";
import { DirectionsPanel } from "@/features/maps/components/directions-panel";
import { FileUpload } from "@/features/storage/components/file-upload";
import { NotificationSettings } from "@/features/notifications/components/notification-settings";
import { useAuth } from "@/providers/auth-provider";
import { RideRequestForm } from "@/features/rides/components/ride-request-form";

const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 };

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto space-y-8 px-4 py-10">
      <PageHero
        title={`Hello, ${user?.displayName ?? "there"}`}
        description="Manage maps, routes, storage, and notifications from your SAHAL dashboard."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Map</CardTitle>
            <CardDescription>Powered by Google Maps JavaScript API</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] p-0">
            <MapView
              center={DEFAULT_CENTER}
              markers={[{ id: "center", position: DEFAULT_CENTER, label: "SAHAL" }]}
              className="h-full"
            />
          </CardContent>
        </Card>

        <DirectionsPanel />
        <RideRequestForm />

        <Card>
          <CardHeader>
            <CardTitle>Firebase Storage</CardTitle>
            <CardDescription>Upload files to your cloud bucket</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>Firebase Cloud Messaging integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NotificationSettings />
            <Separator />
            <p className="text-xs text-muted-foreground">
              Store the FCM token in Firestore to send targeted notifications from your backend.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
