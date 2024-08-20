import { redirect } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'types';

const unProtectedRoutes = ['/', '/sign-in', '/sign-up'];
const JWT_SECRET = import.meta.env.VITE_JWT_SECRET;

console.log(JWT_SECRET)

export const handle = async ({ event, resolve }) => {
    const token = event.cookies.get('token');
    let currentUser = null;

    if (token) {
        try {
            currentUser = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            console.error('Invalid JWT:', err);
            if (!unProtectedRoutes.includes(event.url.pathname)) {
                throw redirect(303, '/');
            }
        }
    } else {
        if (!unProtectedRoutes.includes(event.url.pathname)) {
            throw redirect(303, '/');
        }
    }

    if (currentUser) {
        event.locals.user = {
            isAuthenticated: true,
            username: currentUser.username,
            userId: currentUser.userId
        };
    } else {
        event.locals.user = {
            isAuthenticated: false
        };
    }

    const query = event.url.searchParams.get('signout');
    if (Boolean(query) === true) {
        event.cookies.delete('token', { path: '/' });
    }

    return resolve(event);
};