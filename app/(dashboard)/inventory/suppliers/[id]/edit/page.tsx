import { requireRole } from "@/lib/auth/session";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { SupplierForm } from "../../supplier-form";

interface EditSupplierPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({ params }: EditSupplierPageProps) {
  await requireRole(["ADMIN", "INVENTORY"] as const);

  const { id } = await params;

  const supplier = await prisma.supplier.findUnique({
    where: { id },
  });

  if (!supplier) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit: ${supplier.name}`}
        description="Update supplier information"
        backHref={`/inventory/suppliers/${id}`}
      />

      <Card>
        <CardContent className="pt-6">
          <SupplierForm supplier={supplier} />
        </CardContent>
      </Card>
    </div>
  );
}
