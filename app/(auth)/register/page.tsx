import { RegisterForm } from '@/components/features/auth/RegisterForm';
import { ParticleBackground } from '@/components/features/auth/ParticleBackground';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />
      <RegisterForm />
    </main>
  );
}
