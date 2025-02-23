export type Role = "admin" | "contestant" | "problem_setter";

export interface TokenData {
  handle: string;
  roles: Role[];
};

declare global {
  namespace Express {
    export interface Request {
      user?: TokenData | null;
    }
  }
}
