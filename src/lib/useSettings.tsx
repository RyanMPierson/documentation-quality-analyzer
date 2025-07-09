"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Settings as SettingsType } from "@/types";

const DEFAULT_SETTINGS: SettingsType = {
  styleGuide: {
    enabledChecks: [],
    customRules: [],
    ignoredPatterns: []
  },
  readabilityTargets: {
    targetFleschKincaid: 10,
    maxSentenceLength: 25,
    preferredReadingLevel: "High School"
  },
  linkCheckSettings: {
    checkExternalLinks: true,
    timeout: 10,
    retryCount: 2,
    ignoredDomains: []
  },
  expectedSections: {
    enabled: true,
    sections: [],
    allowCustomSections: true
  },
  qualityTargets: {
    overallScoreTarget: 80,
    structureScoreTarget: 85,
    readabilityScoreTarget: 75,
    linkValidationTarget: 95,
    styleComplianceTarget: 80,
    terminologyConsistencyTarget: 90
  },
  terminologyGlossary: []
};

interface SettingsContextType {
  settings: SettingsType;
  setSettings: (settings: SettingsType) => void;
  updateSettings: (updates: Partial<SettingsType>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SettingsType>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dqa_settings");
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem("dqa_settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (updates: Partial<SettingsType>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
