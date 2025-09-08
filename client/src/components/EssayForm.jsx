import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { isUnauthorizedError } from "@/lib/authUtils";

const essaySchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  topic: z.string().min(1, "Please select a topic"),
  content: z.string().min(50, "Essay must be at least 50 words").max(5000, "Essay must be less than 5000 words"),
});

export default function EssayForm({ onSuccess }) {
  const [wordCount, setWordCount] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(essaySchema),
    defaultValues: {
      title: "",
      topic: "",
      content: "",
    },
  });

  const mutation = useMutation({
    mutationFn: api.submitEssay,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/essays"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      toast({
        title: "Essay Submitted Successfully!",
        description: `Your essay has been analyzed. Overall score: ${data.overallScore}/100`,
      });
      form.reset();
      setWordCount(0);
      if (onSuccess) onSuccess(data);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your essay. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const handleContentChange = (value) => {
    const words = value.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    form.setValue("content", value);
  };

  const saveDraft = () => {
    const data = form.getValues();
    localStorage.setItem("essay_draft", JSON.stringify(data));
    toast({
      title: "Draft Saved",
      description: "Your essay has been saved locally.",
    });
  };

  const loadDraft = () => {
    const draft = localStorage.getItem("essay_draft");
    if (draft) {
      const data = JSON.parse(draft);
      form.reset(data);
      handleContentChange(data.content || "");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Submit New Essay</h3>
          <Button variant="outline" onClick={loadDraft} data-testid="button-load-draft">
            Load Draft
          </Button>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Essay Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your essay title..."
                      data-testid="input-essay-title"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic/Subject</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-essay-topic">
                        <SelectValue placeholder="Select a topic..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="literature">Literature Analysis</SelectItem>
                      <SelectItem value="science">Scientific Writing</SelectItem>
                      <SelectItem value="history">Historical Essay</SelectItem>
                      <SelectItem value="creative">Creative Writing</SelectItem>
                      <SelectItem value="argumentative">Argumentative Essay</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Essay Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Start writing your essay here..."
                      className="min-h-[300px] resize-none"
                      data-testid="textarea-essay-content"
                      {...field}
                      onChange={(e) => handleContentChange(e.target.value)}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Word count: <span data-testid="text-word-count">{wordCount}</span> | Recommended: 500-1000 words
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={saveDraft}
                data-testid="button-save-draft"
              >
                Save Draft
              </Button>
              <Button 
                type="submit"
                disabled={mutation.isPending}
                data-testid="button-submit-essay"
              >
                {mutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Analyzing...
                  </>
                ) : (
                  "Submit for Analysis"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
