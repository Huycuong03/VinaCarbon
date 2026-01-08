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

export const DEFAULT_USER: { name: string, image: string } = {
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
  name: "VinaCarbon",
  subtitle: "Xin chào! Tôi là Trợ lý AI của VinaCarbon.",

  starterPrompts: [
    "Tôi cần bắt đầu một dự án tín chỉ carbon thì phải làm gì?",
    "MRV là gì và tại sao nó quan trọng trong thị trường carbon?",
    "Sự khác nhau giữa thị trường carbon tự nguyện và bắt buộc là gì?",
    "Làm thế nào để ước tính tiềm năng carbon từ rừng hoặc đất nông nghiệp?",
    "Doanh nghiệp nhỏ có thể tham gia thị trường carbon bằng cách nào?"
  ],

  description: "Cùng hiểu rõ hơn về thị trường carbon, các quy trình kỹ thuật và tiềm năng dự án — theo cách dễ hiểu và thực tế."
};