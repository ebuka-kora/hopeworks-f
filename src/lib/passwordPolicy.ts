export type PasswordRuleId = 'length' | 'upper' | 'lower' | 'digit' | 'special';

export type PasswordRule = {
  id: PasswordRuleId;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'One uppercase letter (A–Z)', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter (a–z)', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', label: 'One number (0–9)', test: (p) => /[0-9]/.test(p) },
  {
    id: 'special',
    label: 'One special character (!@#$%^&*…)',
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

export function getPasswordChecklist(password: string) {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(password),
  }));
}

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

export function getPasswordValidationError(password: string): string | null {
  const failed = PASSWORD_RULES.filter((rule) => !rule.test(password));
  if (failed.length === 0) return null;
  return `Password must meet all requirements: ${failed.map((r) => r.label.toLowerCase()).join(', ')}.`;
}
