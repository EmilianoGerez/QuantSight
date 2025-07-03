import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a Market Analytics</h1>
      <Link href="/dashboard" className="text-primary underline">
        Ir al Dashboard
      </Link>
    </main>
  );
}
