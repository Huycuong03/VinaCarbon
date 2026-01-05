export interface User {
  email?: string | null | undefined;
  name?: string | null | undefined;
  image?: string | null | undefined;
};

export enum Page {
  HOME = '/',
  SEARCH = '/search',
  ASSISTANT = '/assistant',
  MAP = '/map',
  COMMUNITY = '/community',
  PROFILE = '/profile'
}

export interface NavItem {
  id: Page;
  label: string;
  icon?: any;
  restricted: boolean
};