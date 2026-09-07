
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/shared/ui/toaster";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { queryClient } from "@/shared/lib/queryClient";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { LoginRequired } from "@/features/auth/components/login-required";
import Router from "./Router";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <LoginRequired>
            <Router />
          </LoginRequired>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
