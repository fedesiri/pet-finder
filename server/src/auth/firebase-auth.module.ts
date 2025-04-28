import { Module } from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';

@Module({
  providers: [FirebaseAuthService],
  exports: [FirebaseAuthService], // << IMPORTANTE
})
export class FirebaseAuthModule {}
