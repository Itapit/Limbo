import { RefreshTokenDto } from '@LucidRF/users-contracts';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';

export function toRefreshTokenDto(entity: RefreshTokenEntity): RefreshTokenDto {
  return {
    token: entity.jti,
    expiresAt: entity.expiresAt,
  };
}
