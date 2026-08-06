import WingoGameScreen from "@/components/wingo/WingoGameScreen";
import BottomNav from "@/components/home/BottomNav";
import "../wingo/wingo.css";

export const dynamic = "force-dynamic";

export default function WinPage() {
  return (
    <>
      <WingoGameScreen />
      <BottomNav />
    </>
  );
}


