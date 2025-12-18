import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from '../../pages/Login';

export default function LoginExample() {
  return (
    <TooltipProvider>
      <Login />
      <Toaster />
    </TooltipProvider>
  );
}
