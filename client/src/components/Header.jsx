import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import NotificationsDropdown from "@/components/NotificationsDropdown";

export default function Header({ title, subtitle }) {
  const { theme, toggleTheme } = useTheme();

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
          <NotificationsDropdown />
          
          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-lg`}></i>
          </Button>
        </div>
      </div>
    </header>
  );
}
