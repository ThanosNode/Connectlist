import { Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { Button } from "@/components/ui/button";
import { useLocation as useWouterLocation } from "wouter";

export default function CreateListingButton() {
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useModal();
  const [_, navigate] = useWouterLocation();

  const handleCreateListing = () => {
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      navigate("/post");
    }
  };

  return (
    <div className="fixed top-4 right-4 z-10">
      <button
        onClick={handleCreateListing}
        className="bg-gray-200 hover:bg-gray-300 text-blue-700 px-3 py-1 text-sm border border-gray-400"
        aria-label="Create new listing"
      >
        post
      </button>
    </div>
  );
}
