import { PageHeader } from "@/components/layout/page-header";
import { CustomerForm } from "../customer-form";

export default function NewCustomerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Customer"
        description="Add a new customer to the system"
        backHref="/crm/customers"
      />

      <CustomerForm />
    </div>
  );
}
