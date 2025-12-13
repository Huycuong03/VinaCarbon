export interface DocumentMetaData {
    title: string;
    url: string;
    content_type: string;
    last_modified: string;
    storage_size: number;
}

export interface SearchHit {
    id: string;
    score: number;
    bm25: number;
    cosine: number;
    meta: DocumentMetaData
}

export interface SearchResult {
  query: string;
  page: number;
  page_size: number;
  total_results: number;
  total_pages: number;
  results: SearchHit[];
}