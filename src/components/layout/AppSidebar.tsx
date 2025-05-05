
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Home, 
  AlertTriangle, 
  CloudRain, 
  Calendar, 
  Settings,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
}

export function AppSidebar({ className, isOpen, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex flex-col bg-background border-r p-2 shadow-sm transition-transform duration-300 ease-in-out md:relative",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}
      {...props}
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center">
        <NavItem to="/" icon={Home} label="Dashboard" />
        <NavItem to="/alerts" icon={AlertTriangle} label="Alerts" />
        <NavItem to="/weather" icon={CloudRain} label="Weather" />
        <NavItem to="/planting" icon={Calendar} label="Planting Schedule" />
        <NavItem to="/advisor" icon={MessageSquare} label="AI Advisor" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </nav>
      
      <div className="mt-auto p-4">
        <div className="rounded-md bg-agri-green-light/20 p-3">
          <h4 className="font-medium text-sm text-agri-green-dark mb-1">
            Need Help?
          </h4>
          <p className="text-xs text-gray-600 mb-2">
            Contact our support team for assistance with AgriAlert.
          </p>
          <Button variant="default" size="sm" className="w-full bg-agri-green hover:bg-agri-green-dark">
            Get Support
          </Button>
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
}

function NavItem({ to, icon: Icon, label }: NavItemProps) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
