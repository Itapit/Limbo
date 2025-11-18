import { LoginResponse } from './login.response';
import { PendingLoginResponse } from './pending-login.response';

// It checks if the response is a PendingLoginResponse.
export function isPendingLoginResponse(
  response: LoginResponse | PendingLoginResponse
): response is PendingLoginResponse {
  return (
    (response as PendingLoginResponse).pendingToken !== undefined &&
    typeof (response as PendingLoginResponse).pendingToken === 'string'
  );
}
