export interface User {
  id?: string | null | undefined;
  email?: string | null | undefined;
  name?: string | null | undefined;
  image?: string | null | undefined;
};

export interface NavItem {
  id: string;
  label: string;
  icon?: any;
  restricted: boolean
};

export interface Profile {
  id: string
  email: string
  name: string
  image: string
  bio: string | null
  address: string | null
  followers: string[]
  followings: string[]
}

export interface Update {
  op: "add" | "set" | "replace" | "remove" | "incr" | "move"
  path: string
  value: any
}