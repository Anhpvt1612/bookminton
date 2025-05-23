import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/auth";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const loginSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập là bắt buộc"),
  password: z.string().min(1, "Mật khẩu là bắt buộc"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setUser } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      const { user, token } = await login(values.username, values.password);
      
      // Store user and token in auth context
      setUser(user, token);
      
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${user.name} quay trở lại!`,
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Đăng nhập thất bại",
        description: error.message || "Tên đăng nhập hoặc mật khẩu không đúng",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
        <CardDescription>
          Đăng nhập vào tài khoản của bạn để đặt sân cầu lông
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
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-indigo-700" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang đăng nhập...
                </>
              ) : "Đăng nhập"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
