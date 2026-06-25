export const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,10}$/;
export const NAME_RE = /^[a-zA-Z\s'.-]{3,50}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_IN_RE = /^[6-9]\d{9}$/;
export const GST_RE =
  /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function validatePasswordClient(p) {
  if (!p || p.length < 6 || p.length > 10) return "Password must be 6–10 characters";
  if (!PASSWORD_RE.test(p)) {
    return "Include upper, lower, number, and special character";
  }
  return null;
}
