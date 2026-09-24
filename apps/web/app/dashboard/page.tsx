import DashboardGate from "../DashboardGate";

export const metadata = {
  title: "Dashboard"
};

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <DashboardGate />
    </main>
  );
}
