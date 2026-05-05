interface Props {
  password: string;
}

function getStrength(pw: string): { score: number; label: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] || '' };
}

export function PasswordStrength({ password }: Props) {
  if (!password) return null;
  const { score, label } = getStrength(password);
  return (
    <div>
      <div className="pw-strength">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`pw-strength__bar ${i <= score ? `pw-strength__bar--${score}` : ''}`} />
        ))}
      </div>
      <div className={`pw-strength__label`}>{label}</div>
    </div>
  );
}
