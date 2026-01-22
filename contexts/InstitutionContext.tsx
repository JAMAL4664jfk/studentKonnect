import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Institution = {
  id: string;
  name: string;
  logo?: string;
  type: "university" | "partner" | "service";
};

interface InstitutionContextType {
  selectedInstitution: Institution | null;
  setSelectedInstitution: (institution: Institution | null) => void;
  institutions: Institution[];
  isLoading: boolean;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

const STORAGE_KEY = "@scholar_fin_hub:selected_institution";

// Default institutions (can be expanded)
const DEFAULT_INSTITUTIONS: Institution[] = [
  { id: "unisa", name: "UNISA", type: "university" },
  { id: "vut", name: "VUT", type: "university" },
  { id: "shoprite", name: "Shoprite", type: "partner" },
  { id: "checkers", name: "Checkers", type: "partner" },
  { id: "nsfas", name: "NSFAS", type: "service" },
];

export const InstitutionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedInstitution, setSelectedInstitutionState] = useState<Institution | null>(null);
  const [institutions] = useState<Institution[]>(DEFAULT_INSTITUTIONS);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected institution from AsyncStorage on mount
  useEffect(() => {
    const loadSelectedInstitution = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSelectedInstitutionState(parsed);
        }
      } catch (error) {
        console.error("Error loading selected institution:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSelectedInstitution();
  }, []);

  // Save selected institution to AsyncStorage when it changes
  const setSelectedInstitution = async (institution: Institution | null) => {
    try {
      if (institution) {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(institution));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
      setSelectedInstitutionState(institution);
    } catch (error) {
      console.error("Error saving selected institution:", error);
    }
  };

  return (
    <InstitutionContext.Provider
      value={{
        selectedInstitution,
        setSelectedInstitution,
        institutions,
        isLoading,
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
