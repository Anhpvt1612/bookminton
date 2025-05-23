import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { timeSlots, formatDate, formatPrice } from "@/lib/utils";
import { InsertBooking } from "@shared/schema";

interface BookingFormProps {
  courtId: number;
  pricePerHour: number;
}

const bookingSchema = z.object({
  date: z.date({
    required_error: "Vui lòng chọn ngày",
  }),
  startTime: z.string({
    required_error: "Vui lòng chọn giờ bắt đầu",
  }),
  duration: z.number().min(1).max(3),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingForm({ courtId, pricePerHour }: BookingFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate min and max dates for booking (today to 30 days in future)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: today,
      startTime: "",
      duration: 1,
    },
  });

  const booking = useMutation({
    mutationFn: async (newBooking: InsertBooking) => {
      const res = await apiRequest("POST", "/api/bookings", newBooking);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Đặt sân thành công",
        description: "Đơn đặt sân của bạn đã được tạo!",
      });
      navigate("/my-bookings");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Đặt sân thất bại",
        description: error.message || "Không thể đặt sân. Vui lòng thử lại sau.",
      });
    },
  });

  const onSubmit = async (values: BookingFormValues) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Chưa đăng nhập",
        description: "Vui lòng đăng nhập để đặt sân.",
      });
      navigate("/login");
      return;
    }

    try {
      setIsSubmitting(true);

      // Parse start time
      const [startHour, startMinute] = values.startTime.split(':').map(Number);
      
      // Create date objects for start and end times
      const startTime = new Date(values.date);
      startTime.setHours(startHour, startMinute, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + values.duration);
      
      // Calculate total price
      const totalPrice = pricePerHour * values.duration;
      
      // Create booking
      const bookingData: InsertBooking = {
        courtId,
        date: values.date,
        startTime,
        endTime,
        status: "pending",
        totalPrice,
      };
      
      await booking.mutateAsync(bookingData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Extract values from form
  const selectedDate = form.watch("date");
  const selectedStartTime = form.watch("startTime");
  const selectedDuration = form.watch("duration");

  // Calculate total price
  const totalPrice = pricePerHour * (selectedDuration || 1);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Ngày đặt sân</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className="w-full pl-3 text-left font-normal flex justify-between items-center"
                    >
                      {field.value ? (
                        formatDate(field.value)
                      ) : (
                        <span>Chọn ngày</span>
                      )}
                      <i className="far fa-calendar-alt ml-2"></i>
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < today || date > maxDate
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="startTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Giờ bắt đầu</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giờ bắt đầu" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot} value={slot.split(' - ')[0]}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời gian thuê</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                defaultValue={field.value.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thời gian thuê" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">1 giờ</SelectItem>
                  <SelectItem value="2">2 giờ</SelectItem>
                  <SelectItem value="3">3 giờ</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Giá: {formatPrice(pricePerHour)} x {field.value} = {formatPrice(totalPrice)}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Tổng tiền:</span>
            <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-indigo-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Đang xử lý...
              </>
            ) : "Đặt sân ngay"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
