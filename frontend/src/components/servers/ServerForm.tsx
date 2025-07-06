import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server } from "@/types";
import { Switch } from "@/components/ui/switch";

interface ServerFormProps {
  onSubmit: (server: Omit<Server, "id">) => void;
  initialData?: Partial<Server>;
}

export function ServerForm({ onSubmit, initialData }: ServerFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [available, setAvailable] = useState(initialData?.available !== false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const formErrors: Record<string, string> = {};
    if (!name) formErrors.name = "Le nom est requis";

    // Validate Tunisian phone number format (optional field)
    if (phone && !/^(\+216)?\s?(2|5|9)\d{7}$/.test(phone)) {
      formErrors.phone = "Format de téléphone invalide (2x, 5x ou 9x)";
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const serverData: Omit<Server, "id"> = {
      name,
      phone: phone || undefined,
      totalEvents: initialData?.totalEvents || 0,
      totalEarnings: initialData?.totalEarnings || 0,
      available,
      pricePerEvent: 0, // Prix sera défini lors de la création d'événement
      payments: initialData?.payments || [],
    };

    onSubmit(serverData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom et prénom"
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Numéro de téléphone (optionnel)</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ex: 55123456"
          className={errors.phone ? "border-destructive" : ""}
        />
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Format: 2XXXXXXX, 5XXXXXXX, ou 9XXXXXXX
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={available}
          onCheckedChange={setAvailable}
          id="available"
        />
        <Label htmlFor="available">Disponible</Label>
      </div>

      <Button type="submit" className="w-full">
        {initialData?.id ? "Mettre à jour le serveur" : "Ajouter le serveur"}
      </Button>
    </form>
  );
}
