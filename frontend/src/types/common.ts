export interface User {
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