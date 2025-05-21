import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthService {
  constructor() {
    if (!admin.apps.length) {
      // Evita inicialización múltiple
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
  }

  async verifyToken(token: string) {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      throw new Error('Token inválido: ' + error.message);
    }
  }

  async updateUser(uid: string, updateData: admin.auth.UpdateRequest) {
    try {
      return await admin.auth().updateUser(uid, updateData);
    } catch (error) {
      throw new Error(
        'Error al actualizar usuario en Firebase: ' + error.message,
      );
    }
  }

  public formatPhoneNumber(phone: string): string {
    // Formatea el número al estándar E.164 si es necesario
    return phone.startsWith('+') ? phone : `+${phone}`;
  }
}
