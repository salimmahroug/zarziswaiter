import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Server } from "@/types";
import { DollarSign } from "lucide-react";

interface PaymentFormProps {
  server: Server;
  onSubmit: (amount: number) => void;
}

export function PaymentForm({ server, onSubmit }: PaymentFormProps) {
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalRemaining =
    server.totalEarnings -
    (server.payments || []).reduce((sum, payment) => sum + payment.amount, 0);

  const validateForm = () => {
    const formErrors: Record<string, string> = {};
    if (!amount) {
      formErrors.amount = "Le montant est requis";
    } else if (parseFloat(amount) <= 0) {
      formErrors.amount = "Le montant doit être supérieur à 0";
    } else if (parseFloat(amount) > totalRemaining) {
      formErrors.amount = `Le montant ne peut pas dépasser ${totalRemaining} DT`;
    }

    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(parseFloat(amount));
    setAmount("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Montant du paiement (DT)</Label>
        <div className="relative">
          <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant à payer"
            className="pl-8"
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-destructive">{errors.amount}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Reste à payer: {totalRemaining} DT
        </p>
      </div>

      <Button type="submit" className="w-full">
        Enregistrer le paiement
      </Button>
    </form>
  );
}
