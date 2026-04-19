import { AwilixContainer } from 'awilix';

declare module 'express-serve-static-core' {
  interface Request {
    container: AwilixContainer;
    user?: { uid: string; email: string };
    globalRole?: string;
    clubRole?: string;
  }
}

export { };
