'use client';

interface PasswordStrengthProps {
  password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];

  const strength = checks.filter(Boolean).length;

  const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981'];
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < strength ? colors[strength - 1] : '#1A2744',
            }}
          />
        ))}
      </div>
      <p
        className="text-xs transition-colors duration-300"
        style={{ color: colors[strength - 1] || '#6B84A3' }}
      >
        {strength > 0 ? labels[strength - 1] : ''}
      </p>
    </div>
  );
}
