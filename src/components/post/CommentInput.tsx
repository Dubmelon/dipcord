
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentInputProps {
  currentUser: any;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isReply?: boolean;
}

export const CommentInput = ({
  currentUser,
  value,
  onChange,
  onSubmit,
  onCancel,
  isReply = false
}: CommentInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Avatar className="h-8 w-8">
        <AvatarImage src={currentUser?.user_metadata?.avatar_url} />
        <AvatarFallback>
          {currentUser?.email?.[0]?.toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isReply ? "Write a reply..." : "Write a comment..."}
          className="min-h-[40px] resize-none"
          rows={3}
        />
        <div className="flex justify-between items-center mt-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel {isReply ? 'Reply' : ''}
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!value.trim()}
            className="ml-auto"
          >
            {isReply ? "Reply" : "Comment"}
          </Button>
        </div>
      </div>
    </form>
  );
};
