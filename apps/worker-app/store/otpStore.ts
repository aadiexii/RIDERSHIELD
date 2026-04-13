/**
 * Transient OTP store — holds Firebase confirmation result between
 * phone.tsx (send) and otp.tsx (verify) screens.
 * Uses a module-level variable since router params can't carry objects.
 */
import type { ConfirmationResult } from 'firebase/auth';

let _confirmationResult: ConfirmationResult | null = null;

export function setConfirmationResult(result: ConfirmationResult) {
  _confirmationResult = result;
}

export function getConfirmationResult(): ConfirmationResult | null {
  return _confirmationResult;
}

export function clearConfirmationResult() {
  _confirmationResult = null;
}
