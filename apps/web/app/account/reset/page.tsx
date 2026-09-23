import ResetPasswordClient from "./ResetPasswordClient";

export const metadata = {
  title: "Reset password · MangaFlux"
};

export default async function ResetPasswordPage({
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
      <ResetPasswordClient token={token} />
    </main>
  );
}
