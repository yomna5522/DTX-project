export type CustomerType = "NEW" | "EXISTING";

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  customerType: CustomerType;
}

export interface Session {
  user: User;
  token: string;
}
