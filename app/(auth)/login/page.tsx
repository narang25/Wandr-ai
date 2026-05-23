import { LoginForm } from '@/components/features/auth/LoginForm';
import { ParticleBackground } from '@/components/features/auth/ParticleBackground';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />
      <LoginForm />
    </main>
  );
}
