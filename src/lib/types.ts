export type ResearchNote = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  created_at: string;
  updated_at: string;
};

export type ResearchDataset = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  source: string;
  source_url: string;
  category: string;
  created_at: string;
  updated_at: string;
};

export type ResearchArticle = {
  id: string;
  user_id: string;
  title: string;
  abstract: string;
  authors: string[];
  source: string;
  source_url: string;
  published_at: string | null;
  saved: boolean;
  created_at: string;
};
