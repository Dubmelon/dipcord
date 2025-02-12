
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Send, Loader2 } from "lucide-react";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useFileUpload } from "@/components/message/useFileUpload";
import { FilePreview } from "@/components/message/FilePreview";

interface MessageInputProps {
  channelId: string;
}

export const MessageInput = ({ channelId }: MessageInputProps) => {
  const [content, setContent] = useState("");
  const {
    selectedFiles,
    fileInputRef,
    handleFileSelect,
    removeFile,
    uploadFiles,
    setSelectedFiles
  } = useFileUpload();

  const sendMessage = useSendMessage();

  const handleSubmit = async () => {
    if (!content.trim() && selectedFiles.length === 0) return;

    let mediaUrls: string[] = [];
    if (selectedFiles.length > 0) {
      mediaUrls = await uploadFiles(selectedFiles);
    }

    await sendMessage.mutateAsync({
      channel_id: channelId,
      content: content.trim(),
      media_urls: mediaUrls.length > 0 ? mediaUrls : null
    });

    setContent("");
    setSelectedFiles([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="pt-3 pb-4 px-4 bg-background/80 backdrop-blur-sm border-t border-white/10">
      <FilePreview files={selectedFiles} onRemove={removeFile} />
      <div className="flex gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*"
          multiple
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="shrink-0"
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className="min-h-[2.5rem] max-h-32 bg-white/5 border-white/10 resize-none"
        />
        <Button
          onClick={handleSubmit}
          disabled={(!content.trim() && selectedFiles.length === 0) || sendMessage.isPending}
          className="shrink-0"
        >
          {sendMessage.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
