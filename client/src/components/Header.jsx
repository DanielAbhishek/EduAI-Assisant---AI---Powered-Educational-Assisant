import { Button } from "@/components/ui/button";

export default function Header({ title, subtitle }) {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground" data-testid="text-page-title">
            {title}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <Button 
            variant="ghost" 
            size="icon"
            className="relative"
            data-testid="button-notifications"
          >
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </Button>
          
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            data-testid="button-theme-toggle"
          >
            <i className="fas fa-moon text-lg"></i>
          </Button>
        </div>
      </div>
    </header>
  );
}
