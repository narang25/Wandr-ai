'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordStrength } from './PasswordStrength';
import { User, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setIsSubmitting(true);
    try {
      await registerUser(data.name, data.email, data.password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md mx-auto p-8">
      <div className="bg-card/80 backdrop-blur-xl border border-subtle rounded-2xl p-8 shadow-2xl shadow-black/20">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
            Wandr.ai
          </h1>
          <p className="text-muted mt-2 text-sm">Start your journey today</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Explorer"
            icon={<User size={18} className="text-dim" />}
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail size={18} className="text-dim" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              icon={<Lock size={18} className="text-dim" />}
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordStrength password={password} />
          </div>

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter your password"
            icon={<Lock size={18} className="text-dim" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Create Account
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
