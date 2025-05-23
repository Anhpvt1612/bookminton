import { Helmet } from "react-helmet";
import CourtSearch from "@/components/courts/court-search";

export default function Courts() {
  return (
    <>
      <Helmet>
        <title>Tìm sân cầu lông | BadmintonHub</title>
        <meta name="description" content="Tìm kiếm và đặt sân cầu lông dễ dàng theo địa điểm, thời gian và giá cả. Khám phá hàng trăm sân cầu lông gần bạn và đặt sân ngay hôm nay." />
      </Helmet>
      
      <main>
        <CourtSearch />
      </main>
    </>
  );
}
