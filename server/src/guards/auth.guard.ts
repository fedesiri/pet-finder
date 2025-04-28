import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseAuthService } from '../auth/firebase-auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseAuth: FirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Token no proporcionado');

    try {
      const firebaseUser = await this.firebaseAuth.verifyToken(token);
      request.user = { id: firebaseUser.uid }; // <- este cambio es CLAVE
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
