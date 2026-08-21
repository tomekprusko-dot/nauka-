import { requireAdmin } from "@/lib/auth";
import { getUsers, getResults, getSpecialResult } from "@/lib/db";
import { fixtures } from "@/data/fixtures";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  await requireAdmin();
  const [users, results, specialResult] = await Promise.all([
    getUsers(),
    getResults(),
    getSpecialResult(),
  ]);

  return (
    <AdminClient
      initialUsers={users}
      fixtures={fixtures}
      initialResults={results}
      initialSpecialResult={specialResult}
    />
  );
}
