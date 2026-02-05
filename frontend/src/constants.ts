import { NavItem } from "@/types/common";

// System
export const APP_NAME = "VinaCarbon";
export enum BACKEND_API_ENDPOINT {
  DOCUMENTS = "/api/documents",
  ASSISTANT = "/api/assistant",
  POSTS = "/api/posts",
  BIOMASS = "/api/biomass",
  USERS = "/api/users"
}


// Navigation
export enum Page {
  HOME = "/",
  DOCUMENTS = "/documents",
  ASSISTANT = "/assistant",
  MAP = "/map",
  COMMUNITY = "/community",
  PROFILE = "/profile"
}

export const NAV_ITEMS: NavItem[] = [
  { id: Page.HOME, label: "Trang Chủ", restricted: false },
  { id: Page.DOCUMENTS, label: "Tài Liệu", restricted: false },
  { id: Page.ASSISTANT, label: "Trợ Lý AI", restricted: false },
  { id: Page.MAP, label: "Bản Đồ", restricted: false },
  { id: Page.COMMUNITY, label: "Cộng Đồng", restricted: false },
];


// AI Assistant Profile
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


// UI
export const DEFAULT_USER_IMAGE_URL = "https://static.vecteezy.com/system/resources/previews/036/280/651/original/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-illustration-vector.jpg";
export const MAP_IMAGE_LAYER_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
export const MAP_REFERENCE_LAYER_URL = "https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";
