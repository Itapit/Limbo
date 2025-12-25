import { ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { UserRepository } from '../../../users/domain/interfaces';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { RefreshTokenRepository } from '../interfaces';

@Injectable()
export class TokenSecurityService {
  private readonly logger = new Logger(TokenSecurityService.name);

  constructor(
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly usersRepository: UserRepository
  ) {}

  /**
   * Enforces the Refresh Token Rotation policy:
   * 1. Detects Reuse (Critical Security Event)
   * 2. Validates Ownership
   * 3. Checks Expiration
   * 4. Rotates (Burns) the token
   */
  async validateAndRotate(jti: string, userId: string): Promise<void> {
    const session = await this.refreshTokenRepo.findByJti(jti);

    // REUSE DETECTION (Security Policy)
    if (!session) {
      await this.handleTokenReuse(userId);
      return;
    }

    //VALIDATION (Business Rules)
    await this.validateSession(session, userId);

    // ROTATION (State Mutation)
    // We delete the token immediately to ensure it can never be used again.
    await this.refreshTokenRepo.delete(session.jti);
  }

  // --- Private Policy Implementations ---

  private async handleTokenReuse(userId: string): Promise<never> {
    const user = await this.usersRepository.findById(userId);

    if (user) {
      this.logger.warn(`SECURITY ALERT: Refresh token reuse detected for user ${userId}. Invalidating all sessions.`);
      // "Nuclear Option": Wipe all sessions to force re-login on all devices
      await this.refreshTokenRepo.deleteAllForUser(userId);
    }

    // Obfuscate the specific error to prevent enumeration, but deny access
    throw new RpcException(new ForbiddenException('Refresh token reuse detected').getResponse());
  }

  private async validateSession(session: RefreshTokenEntity, expectedUserId: string): Promise<void> {
    // Ownership Check
    if (session.userId !== expectedUserId) {
      throw new RpcException(new UnauthorizedException('Invalid credentials').getResponse());
    }

    // Expiration Check
    if (new Date() > session.expiresAt) {
      // Cleanup: Delete this specific expired token so it doesn't clutter DB
      await this.refreshTokenRepo.delete(session.jti);
      throw new RpcException(new UnauthorizedException('Session expired').getResponse());
    }
  }
}
