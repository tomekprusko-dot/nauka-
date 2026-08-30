import { requireAdmin } from "@/lib/auth";
import { getUsers, getResults, getSpecialResult, getAutomationLog } from "@/lib/db";
import { fixtures } from "@/data/fixtures";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  await requireAdmin();
  const [users, results, specialResult, automationLog] = await Promise.all([
    getUsers(),
    getResults(),
    getSpecialResult(),
    getAutomationLog(),
  ]);

  return (
    <AdminClient
      initialUsers={users}
      fixtures={fixtures}
      initialResults={results}
      initialSpecialResult={specialResult}
      automationLog={automationLog}
    />
  );
}
