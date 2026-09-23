import VerifyEmailClient from "./VerifyEmailClient";

export const metadata = {
  title: "Verify email · MangaFlux"
};

export default async function VerifyEmailPage({
  searchParams
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = Array.isArray(params.token)
    ? params.token[0] ?? ""
    : params.token ?? "";

  return (
    <main>
      <VerifyEmailClient token={token} />
    </main>
  );
}
