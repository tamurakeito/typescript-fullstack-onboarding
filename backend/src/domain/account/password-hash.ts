export interface PasswordHash {
  hash(password: string): Promise<string>;
}
