declare global {
	namespace App {
		interface Locals {
			user: {
				id: string;
				email: string;
				name: string | null;
				avatar: string | null;
				orgId: string | null;
				orgSlug: string | null;
				workspaceId: string | null;
			} | null;
			session: { token: string } | null;
		}
		interface PageData {
			user?: App.Locals['user'];
		}
	}
}

export {};
