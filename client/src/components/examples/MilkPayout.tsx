import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import MilkPayout from '../../pages/milk/MilkPayout';

export default function MilkPayoutExample() {
  return (
    <TooltipProvider>
      <div className="p-6">
        <MilkPayout />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
