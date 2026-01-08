import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      avatarUrl: string;
    };
  }

  interface User {
    id: string;
    name: string;
    avatarUrl: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    avatarUrl: string;
  }
}
