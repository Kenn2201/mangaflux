import AdminClient from "../AdminClient";

export const metadata = {
  title: "Admin Console",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return <AdminClient />;
}
