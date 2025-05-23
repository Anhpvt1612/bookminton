import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { register } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { skillLevels } from "@/lib/utils";

const registerSchema = z.object({
  username: z.string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(20, "Tên đăng nhập không được quá 20 ký tự")
    .regex(/^[a-zA-Z0-9_]+$/, "Tên đăng nhập chỉ được phép chứa chữ cái, số và dấu gạch dưới"),
  email: z.string()
    .email("Email không hợp lệ"),
  name: z.string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự"),
  password: z.string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  location: z.string()
    .min(1, "Vui lòng nhập địa điểm của bạn"),
  skillLevel: z.string().optional(),
  isCourtOwner: z.boolean().default(false)
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      password: "",
      location: "",
      skillLevel: "beginner",
      isCourtOwner: false,
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsLoading(true);
      const { user, token } = await register(values);
      
      // Store user and token in auth context
      setUser(user, token);
      
      toast({
        title: "Đăng ký thành công",
        description: "Tài khoản của bạn đã được tạo thành công!",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Đăng ký thất bại",
        description: error.message || "Không thể tạo tài khoản. Vui lòng thử lại.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isCourtOwner = form.watch("isCourtOwner");

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Đăng ký tài khoản</CardTitle>
        <CardDescription>
          Tạo tài khoản để bắt đầu đặt sân cầu lông
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên đăng nhập" {...field} />
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Nhập mật khẩu" {...field} />
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
            {!isCourtOwner && (
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
              name="isCourtOwner"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Tôi là chủ sân cầu lông</FormLabel>
                    <p className="text-sm text-gray-500">
                      Đăng ký với tư cách chủ sân để đăng sân cầu lông lên nền tảng
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-indigo-700" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang đăng ký...
                </>
              ) : "Đăng ký"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
