import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    { path: "/", icon: "fas fa-home", label: "Dashboard", roles: ["student", "teacher"] },
    { path: "/essays", icon: "fas fa-edit", label: "Essays", roles: ["student"] },
    { path: "/quizzes", icon: "fas fa-question-circle", label: "Quizzes", roles: ["student"] },
    { path: "/progress", icon: "fas fa-chart-line", label: "Progress", roles: ["student"] },
    { path: "/teacher", icon: "fas fa-chalkboard-teacher", label: "Teacher View", roles: ["teacher"] },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || "student")
  );

  return (
    <aside className="w-64 bg-card border-r border-border flex-shrink-0">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-brain text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">EduAI</h1>
            <p className="text-sm text-muted-foreground">Assistant</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {filteredItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <button 
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  location === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <i className={`${item.icon} w-5`}></i>
                <span className="font-medium">{item.label}</span>
              </button>
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <i className="fas fa-user text-muted-foreground"></i>
              )}
            </div>
            <div>
              <p className="font-medium text-foreground" data-testid="text-username">
                {user?.firstName || user?.email || "User"}
              </p>
              <p className="text-sm text-muted-foreground" data-testid="text-role">
                {user?.role === "teacher" ? "Teacher" : "Student"}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full mt-4 justify-start text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <i className="fas fa-sign-out-alt mr-2"></i>
            Sign Out
          </Button>
        </div>
      </div>
    </aside>
  );
}
