import { DefaultUser } from 'next-auth';

export type LockedInterface<T> = { readonly [K in keyof T]: string };

export interface SessionUser extends Omit<DefaultUser, 'id'> {
}