import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { skillLevels } from "@/lib/utils";
import { type User } from "@shared/schema";

interface PlayerFormProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

const playerSchema = z.object({
  name: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  location: z.string().min(1, "Vui lòng nhập địa điểm"),
  bio: z.string().optional(),
  skillLevel: z.string().optional(),
  avatarUrl: z.string().url("URL ảnh đại diện không hợp lệ").optional().or(z.literal('')),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

export default function PlayerForm({ user, onSuccess, onCancel }: PlayerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      location: user.location || "",
      bio: user.bio || "",
      skillLevel: user.skillLevel || "beginner",
      avatarUrl: user.avatarUrl || "",
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      const res = await apiRequest("PUT", `/api/users/${user.id}`, userData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Thông tin cá nhân đã được cập nhật!",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: error.message || "Không thể cập nhật thông tin. Vui lòng thử lại.",
      });
    },
  });

  const onSubmit = async (values: PlayerFormValues) => {
    try {
      setIsSubmitting(true);
      await updateProfile.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ tên</FormLabel>
              <FormControl>
                <Input placeholder="Nhập họ tên đầy đủ" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Nhập email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa điểm</FormLabel>
              <FormControl>
                <Input placeholder="Nhập địa điểm của bạn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giới thiệu bản thân</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Viết đôi điều về bản thân"
                  rows={4}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Giới thiệu về bản thân và kinh nghiệm chơi cầu lông của bạn
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {!user.isCourtOwner && (
          <FormField
            control={form.control}
            name="skillLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trình độ chơi cầu lông</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trình độ" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {skillLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL ảnh đại diện</FormLabel>
              <FormControl>
                <Input placeholder="Nhập URL ảnh đại diện" {...field} />
              </FormControl>
              <FormDescription>
                Nhập URL hình ảnh đại diện của bạn (để trống nếu không có)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            className="bg-primary hover:bg-indigo-700" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Đang cập nhật...
              </>
            ) : "Cập nhật thông tin"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
