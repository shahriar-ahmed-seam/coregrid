import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SupplierForm } from "../supplier-form";

export default async function NewSupplierPage() {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Supplier"
        description="Add a new supplier to your inventory"
        backHref="/inventory/suppliers"
      />

      <Card>
        <CardContent className="pt-6">
          <SupplierForm />
        </CardContent>
      </Card>
    </div>
  );
}
