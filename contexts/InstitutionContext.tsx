import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";
import { SA_INSTITUTIONS } from "@/constants/sa-institutions-with-logos";

export type Institution = {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  type: "university" | "tvet";
};

interface InstitutionContextType {
  userInstitution: Institution | null;
  isLoading: boolean;
  refreshInstitution: () => Promise<void>;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

const STORAGE_KEY = "@student_konnect:user_institution";

export const InstitutionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userInstitution, setUserInstitution] = useState<Institution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's institution from database
  const fetchUserInstitution = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserInstitution(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Fetch user's profile with institution_id
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("institution_id")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        // Only log non-"column not found" errors to avoid noise during migration
        if (!error.message?.includes('institution_id') && !error.message?.includes('column')) {
          console.error("Error fetching profile:", error);
        }
        setUserInstitution(null);
        return;
      }

      if (profile?.institution_id) {
        // Find institution in SA_INSTITUTIONS
        const institution = SA_INSTITUTIONS.find(
          (inst) => inst.id === profile.institution_id
        );

        if (institution) {
          setUserInstitution(institution as Institution);
          // Cache in AsyncStorage
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(institution));
        } else {
          setUserInstitution(null);
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } else {
        setUserInstitution(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Error fetching user institution:", error);
      setUserInstitution(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cached institution on mount, then fetch from database
  useEffect(() => {
    const loadCachedAndFetch = async () => {
      try {
        // Load from cache first for instant display
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached) {
          setUserInstitution(JSON.parse(cached));
        }
      } catch (error) {
        console.error("Error loading cached institution:", error);
      }
      
      // Then fetch fresh data from database
      await fetchUserInstitution();
    };

    loadCachedAndFetch();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          await fetchUserInstitution();
        } else if (event === "SIGNED_OUT") {
          setUserInstitution(null);
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const refreshInstitution = async () => {
    await fetchUserInstitution();
  };

  return (
    <InstitutionContext.Provider
      value={{
        userInstitution,
        isLoading,
        refreshInstitution,
      }}
    >
      {children}
    </InstitutionContext.Provider>
  );
};

export const useInstitution = () => {
  const context = useContext(InstitutionContext);
  if (context === undefined) {
    throw new Error("useInstitution must be used within an InstitutionProvider");
  }
  return context;
};
