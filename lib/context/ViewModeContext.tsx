"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ViewMode = "simple" | "advanced";

export interface WhyModalData {
  title: string;
  explanation: string;
  factors?: { label: string; value: string | number; color?: string }[];
}

interface ViewModeContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isTourOpen: boolean;
  tourStep: number;
  setTourStep: (step: number) => void;
  startTour: () => void;
  closeTour: () => void;
  isWelcomeOpen: boolean;
  closeWelcome: () => void;
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
  whyModal: WhyModalData | null;
  openWhyModal: (title: string, explanation: string, factors?: { label: string; value: string | number; color?: string }[]) => void;
  closeWhyModal: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>("simple");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(1);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [whyModal, setWhyModal] = useState<WhyModalData | null>(null);

  useEffect(() => {
    // Check if user has seen welcome/tour before
    const hasSeenWelcome = localStorage.getItem("tactix_welcome_seen");
    if (!hasSeenWelcome) {
      setIsWelcomeOpen(true);
    }
    const savedMode = localStorage.getItem("tactix_view_mode") as ViewMode;
    if (savedMode === "advanced" || savedMode === "simple") {
      setViewModeState(savedMode);
    }
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem("tactix_view_mode", mode);
  };

  const toggleViewMode = () => {
    const next = viewMode === "simple" ? "advanced" : "simple";
    setViewMode(next);
  };

  const startTour = () => {
    setIsWelcomeOpen(false);
    setIsHelpOpen(false);
    setTourStep(0);
    setIsTourOpen(true);
  };

  const closeTour = () => {
    setIsTourOpen(false);
    localStorage.setItem("tactix_welcome_seen", "true");
  };

  const closeWelcome = () => {
    setIsWelcomeOpen(false);
    localStorage.setItem("tactix_welcome_seen", "true");
  };

  const openHelp = () => setIsHelpOpen(true);
  const closeHelp = () => setIsHelpOpen(false);

  const openWhyModal = (
    title: string,
    explanation: string,
    factors?: { label: string; value: string | number; color?: string }[]
  ) => {
    setWhyModal({ title, explanation, factors });
  };

  const closeWhyModal = () => setWhyModal(null);

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        toggleViewMode,
        isTourOpen,
        tourStep,
        setTourStep,
        startTour,
        closeTour,
        isWelcomeOpen,
        closeWelcome,
        isHelpOpen,
        openHelp,
        closeHelp,
        whyModal,
        openWhyModal,
        closeWhyModal,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}
