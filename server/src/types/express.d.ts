import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      // Acá mas adelante vamos a tener que ver de agregar si se necesitan otras propiedades y roles tambien
    };
  }
}
