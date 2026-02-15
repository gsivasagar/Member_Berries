
export type Bookmark = {
    id: string;
    title: string;
    url: string;
    user_id: string;
    category: string | null;
    ogImage?: string;
    ogTitle?: string;
    ogDescription?: string;
}
