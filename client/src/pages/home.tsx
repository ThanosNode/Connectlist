import { Helmet } from "react-helmet-async";
import CategoryGrid from "@/components/home/CategoryGrid";
import FeaturedListings from "@/components/home/FeaturedListings";
import RecentListings from "@/components/home/RecentListings";
import CreateListingButton from "@/components/ui/CreateListingButton";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>ConnectList - Web3-focused Classifieds</title>
        <meta name="description" content="Connect with the Web3 community - find jobs, business opportunities, services, and more on ConnectList, the Web3-focused classifieds platform." />
        <meta property="og:title" content="ConnectList - Web3-focused Classifieds" />
        <meta property="og:description" content="Connect with the Web3 community - find jobs, business opportunities, services, and more on ConnectList, the Web3-focused classifieds platform." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <CategoryGrid />
      <FeaturedListings />
      <RecentListings />
      <CreateListingButton />
    </>
  );
}
