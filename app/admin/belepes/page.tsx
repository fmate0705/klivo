import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/login-form';
import { Logo } from '@/components/site/logo';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tovabb?: string }>;
}) {
  // Belépett felhasználónak nincs dolga a belépő oldalon.
  if (await getSession()) redirect('/admin');

  const { tovabb } = await searchParams;

  return (
    <div className="flex min-h-svh items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="rounded-panel border border-line bg-sky p-8 shadow-sm">
          <h1 className="text-h5 font-semibold">Belépés az adminba</h1>
          <p className="mt-2 text-body-sm text-muted">
            A blogbejegyzések kezeléséhez és a beérkezett megkeresésekhez jelentkezz be.
          </p>

          <div className="mt-7">
            <LoginForm next={tovabb} />
          </div>
        </div>

        <p className="mt-6 text-center text-body-sm text-muted">
          <Link href="/" className="transition-colors duration-feedback hover:text-ink">
            Vissza az oldalra
          </Link>
        </p>
      </div>
    </div>
  );
}
