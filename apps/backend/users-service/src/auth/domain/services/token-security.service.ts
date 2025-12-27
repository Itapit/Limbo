import { Injectable } from '@nestjs/common';
import { RefreshTokenEntity } from '../entities';
import { InvalidTokenException, TokenReuseException } from '../exceptions';
import { RefreshTokenRepository } from '../interfaces';

@Injectable()
export class TokenSecurityService {
  constructor(private readonly refreshTokenRepo: RefreshTokenRepository) {}

  /**
   * Enforces the Refresh Token Rotation policy:
   * 1. Detects Reuse (Critical Security Event)
   * 2. Validates Ownership
   * 3. Checks Expiration
   * 4. Rotates (Burns) the token
   */
  async validateAndRotate(jti: string, userId: string): Promise<void> {
    const session = await this.refreshTokenRepo.findByJti(jti);

    if (!session) {
      throw new InvalidTokenException('Refresh token not found');
    }

    // REUSE DETECTION -> The Token exists, but was already used
    if (session.isRevoked) {
      await this.handleTokenReuse(userId);
      return;
    }

    await this.validateSession(session, userId);

    // ROTATION (stamp the token as used)
    await this.refreshTokenRepo.revokeToken(session.jti);
  }

  // --- Private Policy Implementations ---

  private async handleTokenReuse(userId: string): Promise<never> {
    // "Nuclear Option": Wipe all sessions to force re-login on all devices
    await this.refreshTokenRepo.deleteAllForUser(userId);
    throw new TokenReuseException('Refresh token reuse detected');
  }

  private async validateSession(session: RefreshTokenEntity, expectedUserId: string): Promise<void> {
    // Ownership Check
    if (session.userId !== expectedUserId) {
      throw new InvalidTokenException('Token ownership mismatch');
    }

    // Expiration Check
    if (new Date() > session.expiresAt) {
      // Cleanup: Delete this specific expired token so it doesn't clutter DB
      await this.refreshTokenRepo.delete(session.jti);
      throw new InvalidTokenException('Session expired');
    }
  }
}
