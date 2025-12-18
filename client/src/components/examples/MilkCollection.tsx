import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import MilkCollection from '../../pages/milk/MilkCollection';

export default function MilkCollectionExample() {
  return (
    <TooltipProvider>
      <div className="p-6">
        <MilkCollection />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
