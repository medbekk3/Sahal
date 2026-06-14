"use client";

import { useEffect, useMemo, useState } from "react";
import { addDoc, collection, deleteDoc, doc, getDocs, serverTimestamp, updateDoc } from "firebase/firestore";
import { Loader2, PencilLine, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseDb } from "@/infrastructure/firebase/config";

type FareRateRecord = {
  id: string;
  from: string;
  to: string;
  price: number;
};

type FormState = {
  id: string;
  from: string;
  to: string;
  price: string;
};

const emptyFormState: FormState = {
  id: "",
  from: "",
  to: "",
  price: "",
};

export function FareRateManager() {
  const { toast } = useToast();
  const [records, setRecords] = useState<FareRateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyFormState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRates() {
      try {
        const snapshot = await getDocs(collection(getFirebaseDb(), "fare_rates"));
        if (!mounted) return;

        setRecords(
          snapshot.docs.map((document) => {
            const data = document.data();

            return {
              id: document.id,
              from: String(data.from ?? ""),
              to: String(data.to ?? ""),
              price: Number(data.price ?? 0),
            };
          })
        );
        setError(null);
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load fare rates.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadRates();

    return () => {
      mounted = false;
    };
  }, []);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => a.from.localeCompare(b.from) || a.to.localeCompare(b.to)),
    [records]
  );

  function startEdit(record: FareRateRecord) {
    setForm({
      id: record.id,
      from: record.from,
      to: record.to,
      price: String(record.price),
    });
  }

  function resetForm() {
    setForm(emptyFormState);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const from = form.from.trim();
    const to = form.to.trim();
    const price = Number(form.price);

    if (!from || !to || !Number.isFinite(price) || price <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid fare rate",
        description: "Please enter valid from, to, and price values.",
      });
      return;
    }

    setSaving(true);
    try {
      const db = getFirebaseDb();
      const payload = {
        from,
        to,
        price,
        currency: "DZD",
        updatedAt: serverTimestamp(),
      };

      if (form.id) {
        // Update existing document: doc(db, collection, documentId) → 2 segments ✓
        await updateDoc(doc(db, "fare_rates", form.id), payload);
        const nextRecord: FareRateRecord = { id: form.id, from, to, price };
        setRecords((current) =>
          current.map((record) => (record.id === form.id ? nextRecord : record))
        );
        toast({
          title: "Fare rate updated",
          description: `${from} to ${to} - ${price.toLocaleString()} DZD`,
        });
      } else {
        // Create new document: addDoc(collection(...)) — Firestore auto-generates the ID ✓
        const docRef = await addDoc(collection(db, "fare_rates"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        const nextRecord: FareRateRecord = { id: docRef.id, from, to, price };
        setRecords((current) => [...current, nextRecord]);
        toast({
          title: "Fare rate created",
          description: `${from} to ${to} - ${price.toLocaleString()} DZD`,
        });
      }

      resetForm();
    } catch (saveError) {
      toast({
        variant: "destructive",
        title: "Unable to save fare rate",
        description: saveError instanceof Error ? saveError.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "fare_rates", id));
      setRecords((current) => current.filter((record) => record.id !== id));
      if (form.id === id) resetForm();
      toast({
        title: "Fare rate deleted",
        description: "The route is no longer available to passengers.",
      });
    } catch (deleteError) {
      toast({
        variant: "destructive",
        title: "Unable to delete fare rate",
        description: deleteError instanceof Error ? deleteError.message : "Please try again.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card className="overflow-hidden border-border/70 shadow-sm">
      <CardHeader className="bg-muted/30">
        <CardTitle>Fixed Fares</CardTitle>
        <CardDescription>Create, edit, or remove routes in `fare_rates`.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1fr_1fr_120px_auto]">
          <div className="space-y-2">
            <Label htmlFor="fareFrom">From</Label>
            <Input
              id="fareFrom"
              value={form.from}
              onChange={(event) => setForm((current) => ({ ...current, from: event.target.value }))}
              placeholder="Algiers"
              disabled={saving}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fareTo">To</Label>
            <Input
              id="fareTo"
              value={form.to}
              onChange={(event) => setForm((current) => ({ ...current, to: event.target.value }))}
              placeholder="Oran"
              disabled={saving}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="farePrice">Price</Label>
            <Input
              id="farePrice"
              type="number"
              min="1"
              step="1"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
              placeholder="250"
              disabled={saving}
              required
            />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Saving
                </>
              ) : form.id ? (
                <>
                  <Save aria-hidden="true" />
                  Update
                </>
              ) : (
                <>
                  <Plus aria-hidden="true" />
                  Add
                </>
              )}
            </Button>
          </div>
        </form>

        {form.id ? (
          <div className="flex items-center justify-between rounded-md border bg-muted/40 px-4 py-3 text-sm">
            <span>
              Editing route: {form.from || "Untitled"} {"->"} {form.to || "Untitled"}
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={resetForm} disabled={saving}>
              Clear
            </Button>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : loading ? (
          <p className="text-sm text-muted-foreground">Loading fare rates...</p>
        ) : sortedRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground">No fare rates configured yet.</p>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <div className="grid grid-cols-[1fr_1fr_120px_140px] bg-muted px-3 py-2 text-sm font-medium">
              <span>From</span>
              <span>To</span>
              <span className="text-end">السعر</span>
              <span className="text-end">الإجراءات</span>
            </div>
            {sortedRecords.map((record) => (
              <div
                key={record.id}
                className="grid grid-cols-[1fr_1fr_120px_140px] items-center border-t px-3 py-2 text-sm"
              >
                <span>{record.from}</span>
                <span>{record.to}</span>
                <span className="text-end">{record.price.toLocaleString()} دج</span>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(record)}>
                    <PencilLine className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    disabled={deletingId === record.id}
                  >
                    {deletingId === record.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
