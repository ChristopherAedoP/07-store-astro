import { Session } from './node_modules/@auth/core/types.d';
/** @format */

import { DefaultSession, DefaultUser } from '@auth/core/types';

declare module '@auth/core/types' {
	interface User extends DefaultUser {
		role?: string;
	}

    interface Session extends DefaultSession {
        user: User;
    }
}
