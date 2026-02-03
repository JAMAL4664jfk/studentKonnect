import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session with retry logic
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session retrieval error:", error.message);
          // If session retrieval fails, try to refresh
          const { data: { session: refreshedSession }, error: refreshError } = 
            await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("Session refresh failed:", refreshError.message);
          } else if (refreshedSession && mounted) {
            setSession(refreshedSession);
            setUser(refreshedSession.user);
          }
        } else if (session && mounted) {
          setSession(session);
          setUser(session.user);
        }
      } catch (err) {
        console.error("Unexpected auth error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes with enhanced logging
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (!mounted) return;

      // Handle specific auth events
      switch (event) {
        case "SIGNED_IN":
          console.log("✅ User signed in");
          break;
        case "SIGNED_OUT":
          console.log("👋 User signed out");
          break;
        case "TOKEN_REFRESHED":
          console.log("🔄 Token refreshed successfully");
          break;
        case "USER_UPDATED":
          console.log("👤 User updated");
          break;
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, session, loading, isAuthenticated: !!user };
}
