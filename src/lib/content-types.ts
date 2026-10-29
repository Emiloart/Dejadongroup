export type NewsArticle = {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  image: string | null;
  siteName: string;
  kind: "blog" | "news";
  published: boolean;
  createdAt: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  subscribedAt: string;
};

export const maxNewsSlides = 4;
