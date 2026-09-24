import DashboardGate from "../DashboardGate";

export const metadata = {
  title: "Dashboard",
  robots: {
    index: false,
    follow: false
  }
};

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <DashboardGate />
    </main>
  );
}
