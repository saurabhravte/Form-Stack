import { createTRPCReact } from '@trpc/react-query';

// Type-only import — keeps backend code out of the web bundle.
import type { AppRouter } from '../../../api/src/routers';

export const trpc = createTRPCReact<AppRouter>();

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
