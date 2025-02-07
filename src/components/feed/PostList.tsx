
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { PostCard } from "./PostCard";
import { PostSkeleton } from "./PostSkeleton";

interface PostListProps {
  posts: any[];
  isLoading: boolean;
  currentUser: any;
  onLike: (postId: string) => void;
  onUnlike: (postId: string) => void;
}

export const PostList = ({ posts, isLoading, currentUser, onLike, onUnlike }: PostListProps) => {
  if (isLoading) {
    return (
      <LazyMotion features={domAnimation}>
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <PostSkeleton />
            </motion.div>
          ))}
        </motion.div>
      </LazyMotion>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {posts?.map((post: any, index: number) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              ease: "easeOut"
            }}
            style={{ 
              willChange: 'transform, opacity',
              transform: 'translateZ(0)'
            }}
          >
            <PostCard
              post={post}
              currentUser={currentUser}
              onLike={() => onLike(post.id)}
              onUnlike={() => onUnlike(post.id)}
              onShare={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/posts/${post.id}`
                );
                toast.success("Link copied to clipboard!");
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </LazyMotion>
  );
};
