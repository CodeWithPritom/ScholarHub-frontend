/**
 * Shared Password Policy aligned with Supabase Auth requirements:
 * - Minimum 6 characters
 * - At least one lowercase letter (a-z)
 * - At least one uppercase letter (A-Z)
 * - At least one digit (0-9)
 * - At least one special character (!@#$%^&*()_+-=[]{};':"|,.<>/?`~)
 */

export const PASSWORD_MIN_LENGTH = 6

export const checkPasswordCriteria = (password = '') => {
  const pwd = String(password || '')
  return {
    length: pwd.length >= PASSWORD_MIN_LENGTH,
    lowercase: /[a-z]/.test(pwd),
    uppercase: /[A-Z]/.test(pwd),
    number: /[0-9]/.test(pwd),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pwd)
  }
}

export const validatePassword = (password = '') => {
  const criteria = checkPasswordCriteria(password)
  const errors = []

  if (!criteria.length) {
    errors.push(`At least ${PASSWORD_MIN_LENGTH} characters`)
  }
  if (!criteria.lowercase) {
    errors.push('One lowercase letter (a-z)')
  }
  if (!criteria.uppercase) {
    errors.push('One uppercase letter (A-Z)')
  }
  if (!criteria.number) {
    errors.push('One number (0-9)')
  }
  if (!criteria.special) {
    errors.push('One special character (!@#$%...)')
  }

  const isValid = errors.length === 0

  return {
    isValid,
    criteria,
    errors,
    errorMessage: isValid ? '' : `Password must contain: ${errors.join(', ')}.`
  }
}
