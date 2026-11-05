import { getAdminClient } from "@/lib/supabase/admin";
import { CategoriesManagerView } from "@/components/admin/categories-manager-view";

export const metadata = {
  title: "Category Manager | Vedanya Owner Platform",
};

export default async function AdminCategoriesPage() {
  const supabase = getAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <div className="p-6 md:p-8">
      <CategoriesManagerView initialCategories={categories || []} />
    </div>
  );
}

