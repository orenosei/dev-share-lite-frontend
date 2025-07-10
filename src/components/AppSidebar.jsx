'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { 
  Home, 
  FileText, 
  PlusCircle, 
  Users, 
  TrendingUp, 
  Search, 
  Settings, 
  User,
  Heart,
  MessageCircle,
  Tag,
  Calendar
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks";
import { statsService } from "@/services";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

export function AppSidebar() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalUsers: 0,
    totalComments: 0,
    totalLikes: 0
  });

  useEffect(() => {
    // Fetch basic stats for sidebar
    const fetchStats = async () => {
      try {
        const result = await statsService.getGlobalStats();
        if (result.success) {
          setStats(result.data);
        } else {
          console.error('Error fetching stats:', result.error);
          setStats(result.data); // Use fallback data
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          totalPosts: 0,
          totalUsers: 0,
          totalComments: 0,
          totalLikes: 0
        });
      }
    };

    fetchStats();
  }, []);

  // Main navigation items
  const mainNavItems = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "All Posts",
      url: "/posts",
      icon: FileText,
      badge: stats.totalPosts > 0 ? stats.totalPosts.toLocaleString() : undefined,
    },
    {
      title: "Trending",
      url: "/posts?sortBy=popular",
      icon: TrendingUp,
    },
    {
      title: "Community",
      url: "/users",
      icon: Users,
      badge: stats.totalUsers > 0 ? stats.totalUsers.toLocaleString() : undefined,
    },
  ];

  // User-specific items (when authenticated)
  const userNavItems = [
    {
      title: "Create Post",
      url: "/posts/new",
      icon: PlusCircle,
    },
    {
      title: "My Profile",
      url: `/user/${user?.id}`,
      icon: User,
    },
    {
      title: "My Posts",
      url: `/posts?author=${user?.id}`,
      icon: FileText,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-3">
            <FileText className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-sidebar-foreground">DevShare Lite</h2>
            <p className="text-sm text-sidebar-foreground/60">Developer Community</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg">
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span className="text-base font-medium">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Section - Only show when authenticated */}
        {isAuthenticated && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-semibold">My Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild size="lg">
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="text-base font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User Stats */}
        {isAuthenticated && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sm font-semibold">Your Stats</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-4 px-3">
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div className="flex-1">
                    <div className="text-lg font-bold text-sidebar-foreground">0</div>
                    <div className="text-sm text-sidebar-foreground/60">Your Posts</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Heart className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <div className="text-lg font-bold text-sidebar-foreground">0</div>
                    <div className="text-sm text-sidebar-foreground/60">Likes Received</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <div className="flex-1">
                    <div className="text-lg font-bold text-sidebar-foreground">0</div>
                    <div className="text-sm text-sidebar-foreground/60">Comments Made</div>
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        {isAuthenticated ? (
          <div className="flex items-center gap-3 px-3 py-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/50 rounded-full p-3">
              <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold text-sidebar-foreground truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username || user?.email || 'User'
                }
              </div>
              <div className="text-sm text-sidebar-foreground/60">
                {user?.email}
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 py-4 space-y-3">
            <Link href="/login">
              <SidebarMenuButton className="w-full justify-center text-base font-medium" size="lg">
                Sign In
              </SidebarMenuButton>
            </Link>
            <Link href="/register">
              <SidebarMenuButton variant="outline" className="w-full justify-center text-base font-medium" size="lg">
                Sign Up
              </SidebarMenuButton>
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
