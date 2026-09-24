import AccountClient from "./AccountClient";

export const metadata = {
  title: "Account · MangaFlux",
  robots: {
    index: false,
    follow: false
  }
};

export default function AccountPage() {
  return (
    <main>
      <AccountClient />
    </main>
  );
}
