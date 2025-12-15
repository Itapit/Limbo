import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GroupsModule } from './groups/groups.module';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [HealthModule, UsersModule, AuthModule, GroupsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
