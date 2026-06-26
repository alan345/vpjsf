import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="text-6xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-2xl font-bold">Oups, page introuvable</h1>
      <p className="mt-2 text-muted">
        Le cadeau que vous cherchez s&apos;est volatilisé… ou n&apos;a jamais
        existé.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
