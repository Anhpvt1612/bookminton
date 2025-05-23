import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Helmet } from "react-helmet";
import CourtDetails from "@/components/courts/court-details";
import { type Court } from "@shared/schema";

export default function CourtDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const courtId = parseInt(id);

  // Validate ID
  useEffect(() => {
    if (isNaN(courtId)) {
      navigate("/courts");
    }
  }, [courtId, navigate]);

  // Get court details for meta tags
  const { data: court } = useQuery<Court>({
    queryKey: [`/api/courts/${courtId}`],
  });

  if (isNaN(courtId)) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>
          {court
            ? `${court.name} | BadmintonHub`
            : "Chi tiết sân cầu lông | BadmintonHub"}
        </title>
        <meta
          name="description"
          content={
            court
              ? `Đặt sân cầu lông ${court.name} tại ${court.location}. Giá: ${court.pricePerHour}đ/giờ. ${court.description}`
              : "Xem chi tiết và đặt sân cầu lông ngay hôm nay với BadmintonHub."
          }
        />
      </Helmet>

      <main>
        <CourtDetails />
      </main>
    </>
  );
}
