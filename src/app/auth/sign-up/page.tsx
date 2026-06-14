"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Car, IdCard, Loader2, Mail, Phone, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseAuth, getFirebaseDb } from "@/infrastructure/firebase/config";
import { redirectUserByRole } from "@/features/auth/hooks/use-role-based-redirect";

type SelectedRole = "passenger" | "driver";

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [role, setRole] = useState<SelectedRole>("passenger");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carPlateNumber, setCarPlateNumber] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const isDriver = role === "driver";

  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDb();
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userId = result.user.uid;

      await updateProfile(result.user, { displayName: fullName });

      await setDoc(doc(db, "users", userId), {
        email,
        displayName: fullName,
        phone,
        role: isDriver ? "driver" : "passenger",
        status: isDriver ? "pending" : "active",
        isActive: !isDriver,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (isDriver) {
        await setDoc(doc(db, "drivers", userId), {
          userId,
          fullName,
          phone,
          role: "driver",
          status: "pending",
          carModel,
          carPlateNumber,
          idCardNumber,
          licenseNumber,
          totalDebt: 0,
          coordinates: null,
          geohash: null,
          pendingRideId: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      toast({
        title: isDriver ? "تم إرسال الطلب" : "تم إنشاء الحساب",
        description: isDriver ? "بانتظار موافقة الإدارة." : "مرحباً بك في سهل.",
      });

      await redirectUserByRole(router, userId, "replace");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "فشل إنشاء الحساب",
        description: error instanceof Error ? error.message : "حدث خطأ ما.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#2563eb,_transparent_35%),linear-gradient(135deg,_#111827,_#1e3a8a_50%,_#111827)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center">
        <motion.div className="grid w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-2xl backdrop-blur-2xl lg:grid-cols-[0.85fr_1.15fr]">
          <div className="hidden border-r border-white/10 bg-black/15 p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <h1 className="text-3xl font-semibold">انضم إلى سهل</h1>
            <p className="text-xs text-blue-100">للاستفسار: 0674071063</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-white">الدور</Label>
                  <select value={role} onChange={(e) => setRole(e.target.value as SelectedRole)} className="h-10 w-full rounded-md border border-white/15 bg-white/10 px-3 text-sm text-white">
                    <option className="bg-slate-900" value="passenger">راكب</option>
                    <option className="bg-slate-900" value="driver">سائق</option>
                  </select>
                </div>
                <GlassField id="fullName" label="الاسم الكامل" value={fullName} onChange={setFullName} icon={<User className="h-4 w-4"/>} />
                <GlassField id="phone" label="رقم الهاتف" value={phone} onChange={setPhone} icon={<Phone className="h-4 w-4"/>} />
                <GlassField id="email" label="البريد الإلكتروني" value={email} onChange={setEmail} icon={<Mail className="h-4 w-4"/>} />
                <GlassField id="password" label="كلمة المرور" type="password" value={password} onChange={setPassword} />
              </div>

              {isDriver && (
                <div className="space-y-4 rounded-md border border-white/15 bg-white/5 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <GlassField id="carModel" label="طراز السيارة" value={carModel} onChange={setCarModel} icon={<Car className="h-4 w-4"/>} />
                    <GlassField id="carPlateNumber" label="رقم اللوحة" value={carPlateNumber} onChange={setCarPlateNumber} />
                    <GlassField id="idCardNumber" label="رقم بطاقة الهوية" value={idCardNumber} onChange={setIdCardNumber} icon={<IdCard className="h-4 w-4"/>} />
                    <GlassField id="licenseNumber" label="رقم رخصة السياقة" value={licenseNumber} onChange={setLicenseNumber} icon={<FileText className="h-4 w-4"/>} />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-white text-blue-950">
                {loading ? <><Loader2 className="animate-spin ml-2" /> جارٍ الحفظ...</> : "إنشاء الحساب"}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

type GlassFieldProps = {
  id: string;
  label: string;
  type?: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
};

function GlassField({ id, label, type = "text", icon, value, onChange }: GlassFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2 text-white">{icon} {label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} className="bg-white/10 text-white" required />
    </div>
  );
}
