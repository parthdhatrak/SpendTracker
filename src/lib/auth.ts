import { auth, currentUser } from '@clerk/nextjs/server';

export interface AuthPayload {
    userId: string;
    email?: string;
    name?: string;
}

export async function getUserFromRequest(request?: any): Promise<AuthPayload | null> {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    // Optional: Fetch user details if needed (slower)
    // const user = await currentUser();

    return {
        userId: userId,
        // email: user?.emailAddresses[0]?.emailAddress,
        // name: user?.firstName + ' ' + user?.lastName
    };
}
