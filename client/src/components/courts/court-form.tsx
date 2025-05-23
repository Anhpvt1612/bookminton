import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Court, type InsertCourt } from "@shared/schema";

interface CourtFormProps {
  court?: Court;
  onSuccess?: () => void;
}

const amenitiesOptions = [
  "Máy lạnh",
  "Phòng thay đồ",
  "Nhà vệ sinh",
  "Căn tin",
  "Bãi đỗ xe",
  "Cho thuê vợt",
  "HLV",
  "Giá rẻ",
  "Quốc tế",
];

const courtSchema = z.object({
  name: z.string().min(3, "Tên sân phải có ít nhất 3 ký tự"),
  description: z.string().min(10, "Mô tả sân phải có ít nhất 10 ký tự"),
  location: z.string().min(3, "Địa điểm phải có ít nhất 3 ký tự"),
  imageUrl: z.string().url("URL hình ảnh không hợp lệ"),
  pricePerHour: z.number().min(10000, "Giá thuê phải ít nhất 10.000đ/giờ"),
  amenities: z.array(z.string()).optional(),
});

type CourtFormValues = z.infer<typeof courtSchema>;

export default function CourtForm({ court, onSuccess }: CourtFormProps) {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(court?.amenities || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const defaultValues: Partial<CourtFormValues> = {
    name: court?.name || "",
    description: court?.description || "",
    location: court?.location || "",
    imageUrl: court?.imageUrl || "",
    pricePerHour: court?.pricePerHour || 150000,
    amenities: court?.amenities || [],
  };

  const form = useForm<CourtFormValues>({
    resolver: zodResolver(courtSchema),
    defaultValues,
  });

  const createCourt = useMutation({
    mutationFn: async (newCourt: InsertCourt) => {
      const res = await apiRequest("POST", "/api/courts", newCourt);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courts'] });
      toast({
        title: "Thành công",
        description: "Sân cầu lông đã được tạo thành công!",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể tạo sân cầu lông. Vui lòng thử lại.",
      });
    }
  });

  const updateCourt = useMutation({
    mutationFn: async (updatedCourt: Partial<InsertCourt>) => {
      const res = await apiRequest("PUT", `/api/courts/${court?.id}`, updatedCourt);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/courts'] });
      queryClient.invalidateQueries({ queryKey: [`/api/courts/${court?.id}`] });
      toast({
        title: "Thành công",
        description: "Sân cầu lông đã được cập nhật thành công!",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: error.message || "Không thể cập nhật sân cầu lông. Vui lòng thử lại.",
      });
    }
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
    
    const currentAmenities = form.getValues("amenities") || [];
    if (currentAmenities.includes(amenity)) {
      form.setValue("amenities", currentAmenities.filter(a => a !== amenity));
    } else {
      form.setValue("amenities", [...currentAmenities, amenity]);
    }
  };

  const onSubmit = async (values: CourtFormValues) => {
    if (!user?.isCourtOwner) {
      toast({
        variant: "destructive",
        title: "Không có quyền",
        description: "Bạn cần là chủ sân để thực hiện thao tác này",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const courtData = {
        ...values,
        amenities: selectedAmenities,
      };
      
      if (court) {
        await updateCourt.mutateAsync(courtData);
      } else {
        await createCourt.mutateAsync(courtData as InsertCourt);
        form.reset();
        setSelectedAmenities([]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{court ? "Cập nhật sân cầu lông" : "Thêm sân cầu lông mới"}</CardTitle>
        <CardDescription>
          {court 
            ? "Chỉnh sửa thông tin sân cầu lông của bạn" 
            : "Thêm sân cầu lông mới vào hệ thống"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sân</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên sân cầu lông" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mô tả chi tiết về sân cầu lông"
                      rows={4}
                      {...field} 
                    />
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
                    <Input placeholder="Nhập địa chỉ đầy đủ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL hình ảnh</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập đường dẫn hình ảnh" {...field} />
                  </FormControl>
                  <FormDescription>
                    Nhập URL hình ảnh đại diện cho sân cầu lông của bạn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="pricePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá thuê sân (VNĐ/giờ)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Nhập giá thuê sân theo giờ"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Nhập giá thuê sân theo đơn vị VNĐ/giờ (ví dụ: 150000)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amenities"
              render={() => (
                <FormItem>
                  <FormLabel>Tiện ích</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {amenitiesOptions.map((amenity) => (
                      <Button
                        key={amenity}
                        type="button"
                        variant={selectedAmenities.includes(amenity) ? "default" : "outline"}
                        className={selectedAmenities.includes(amenity) 
                          ? "bg-primary hover:bg-primary-600" 
                          : ""}
                        onClick={() => toggleAmenity(amenity)}
                      >
                        {amenity}
                        {selectedAmenities.includes(amenity) && (
                          <i className="fas fa-check ml-2"></i>
                        )}
                      </Button>
                    ))}
                  </div>
                  <FormDescription>
                    Chọn các tiện ích có sẵn tại sân cầu lông của bạn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => {
            if (onSuccess) onSuccess();
          }}
        >
          Hủy
        </Button>
        <Button 
          className="bg-primary hover:bg-indigo-700"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Đang xử lý...
            </>
          ) : court ? "Cập nhật sân" : "Thêm sân"}
        </Button>
      </CardFooter>
    </Card>
  );
}
