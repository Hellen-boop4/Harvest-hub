import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import AddMilk from '../../pages/milk/AddMilk';

export default function AddMilkExample() {
  return (
    <TooltipProvider>
      <div className="p-6">
        <AddMilk />
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
