import { Page, NavItem, User } from '@/types/common';
import { Article } from '@/types/community';

export const APP_NAME = "VinaCarbon";

export const FEATURED_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'From Rice Fields to Revenue',
    excerpt: 'How sustainable farming practices in the Mekong Delta are generating new income streams through carbon credits.',
    category: 'Success Story',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    readTime: '5 min read'
  },
  {
    id: '2',
    title: 'Understanding Forest Canopies',
    excerpt: 'A deep dive into how LiDAR technology helps measure the carbon potential of your woodland property.',
    category: 'Technology',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    readTime: '8 min read'
  },
  {
    id: '3',
    title: 'Government Policy Update 2024',
    excerpt: 'New regulations simplify the process for smallholder farmers to register for national carbon programs.',
    category: 'Policy',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    readTime: '4 min read'
  }
];

export const NAV_ITEMS: NavItem[] = [
    { id: Page.HOME, label: 'Trang Chủ', restricted: false },
    { id: Page.SEARCH, label: 'Tài Liệu', restricted: false },
    { id: Page.ASSISTANT, label: 'Trợ Lý AI', restricted: true },
    { id: Page.MAP, label: 'Bản Đồ', restricted: false },
    { id: Page.COMMUNITY, label: 'Cộng Đồng', restricted: false },
];

export const DEFAULT_USER: {name: string, image: string} = {
  name: "default-user",
  image: "https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg"
}

export const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
})


export function timeFormatter(timestamp: string): string {
  const date = new Date(timestamp)

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}


export function numberFormatter(n: number) {
  const formatted = String(n).padStart(3, "0");
  return formatted;
}

export const MAP_IMAGE_LAYER_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
export const MAP_REFERENCE_LAYER_URL = "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"

export const ASSISTANT = {
    welcomeMessage: "Hello, its me, VinaCarbon",
    starterPrompts: [
    `Summarize the project requirements`,
    `What are the key technical risks?`,
    `Review the available documents`,
    `What is the timeline for completion?`
  ],
    description: "Dont mind me, just dowing my job",
}