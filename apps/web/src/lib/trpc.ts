import { createTRPCReact, type CreateTRPCReact } from '@trpc/react-query';


import type { AppRouter } from '../../../api/src/routers';

export const trpc: CreateTRPCReact<AppRouter, unknown> = createTRPCReact<AppRouter>();

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';