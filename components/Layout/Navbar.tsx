"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Layers, 
  GitBranch, 
  FlaskConical, 
  BarChart3, 
  HelpCircle, 
  SlidersHorizontal,
  ToggleLeft,
  ToggleRight,
  Radio,
  Eye,
  Settings
} from "lucide-react";
import { useViewMode } from "@/lib/context/ViewModeContext";

export function Navbar() {
  const pathname = usePathname();
  const { viewMode, setViewMode, toggleViewMode, openHelp } = useViewMode();

  const navItems = [
    { href: "/", label: "Mission", icon: Layers },
    { href: "/coa", label: "Compare", icon: GitBranch },
    { href: "/scenario", label: "What-If", icon: FlaskConical },
    { href: "/analytics", label: "Insights", icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F14]/95 backdrop-blur border-b border-[#2A3441] px-4 lg:px-6 py-2.5">
      <div className="max-w-[1780px] mx-auto flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="h-8 w-8 rounded-btn bg-tactical-green/10 border border-tactical-green/40 flex items-center justify-center text-tactical-green font-mono font-bold text-sm tracking-tighter group-hover:bg-tactical-green group-hover:text-black transition-all">
              TX
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-wider text-slate-100 uppercase font-mono">
                  TACTIX <span className="text-tactical-green">AI</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-badge bg-tactical-blue/10 text-tactical-blue border border-tactical-blue/30 hidden sm:inline-block">
                  Simulated
                </span>
              </div>
              <p className="text-[10px] text-tactical-muted tracking-tight hidden md:block">
                AI-Assisted Simulation & Risk Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Simplified Navigation Tabs (Section 5) */}
        <nav className="flex items-center space-x-1 bg-[#131A24] p-1 rounded-panel border border-[#2A3441]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-btn text-xs font-medium font-mono transition-all ${
                  isActive
                    ? "bg-tactical-green text-black font-semibold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-[#1A2330]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side Controls: Help & Simple/Advanced Toggle (Section 5) */}
        <div className="flex items-center space-x-2 sm:space-x-3 font-mono text-xs">
          
          {/* Help Button */}
          <button
            onClick={openHelp}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-btn bg-[#131A24] border border-[#2A3441] text-slate-300 hover:text-white hover:border-slate-400 transition-all text-xs"
            title="Help, Tour & About TACTIX"
          >
            <HelpCircle className="w-3.5 h-3.5 text-tactical-blue" />
            <span className="hidden sm:inline">Help</span>
          </button>

          {/* Simple vs Advanced Toggle Switch */}
          <div className="flex items-center bg-[#131A24] p-0.5 rounded-panel border border-[#2A3441]">
            <button
              onClick={() => setViewMode("simple")}
              className={`px-2.5 py-1 rounded-btn text-xs font-medium transition-all ${
                viewMode === "simple"
                  ? "bg-tactical-green text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setViewMode("advanced")}
              className={`px-2.5 py-1 rounded-btn text-xs font-medium transition-all ${
                viewMode === "advanced"
                  ? "bg-tactical-amber text-black font-bold shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Advanced
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
