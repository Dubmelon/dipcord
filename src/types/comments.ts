
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string | null;
  likes_count: number;
  dislikes_count: number;
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  reactions: CommentReaction[];
}

export interface CommentReaction {
  id: string;
  comment_id: string;
  user_id: string;
  type: 'like' | 'dislike';
}

export interface CommentThread extends Comment {
  replies: Comment[];
}

