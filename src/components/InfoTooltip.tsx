/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * BoutiqueSûre - Composant InfoTooltip : Infobulle informative accessible
 * Utilise Lucide-React pour expliquer les critères de sécurité (version PHP, plugins, en-têtes, etc.)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Info, HelpCircle } from 'lucide-react';

export interface InfoTooltipProps {
  content: string;
  title?: string;
  impact?: string;
  icon?: 'info' | 'help';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  testId?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InfoTooltip({
  content,
  title,
  impact,
  icon = 'info',
  position = 'top',
  className = '',
  testId = 'info-tooltip',
  isOpen,
  onOpenChange
}: InfoTooltipProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const isVisible = isOpen !== undefined ? (isOpen || internalVisible) : internalVisible;
  const tooltipRef = useRef<HTMLDivElement>(null);

  const setVisibility = (visible: boolean) => {
    setInternalVisible(visible);
    onOpenChange?.(visible);
  };

  // Fermeture automatique au clic en dehors ou à la touche Échap
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setVisibility(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setVisibility(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible]);

  const IconComponent = icon === 'help' ? HelpCircle : Info;

  return (
    <div 
      ref={tooltipRef}
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setVisibility(true)}
      onMouseLeave={() => setVisibility(false)}
      data-testid={testId}
    >
      <button
        type="button"
        aria-label={title ? `Information sur : ${title}` : "Information de sécurité"}
        aria-expanded={isVisible}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setVisibility(!isVisible);
        }}
        className="p-1 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer inline-flex items-center justify-center shrink-0"
      >
        <IconComponent className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-400" />
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 sm:w-80 p-3.5 bg-[#0B1523]/98 text-slate-100 border border-slate-700/90 rounded-xl shadow-2xl text-left pointer-events-auto backdrop-blur-md transition-all duration-150 animate-in fade-in ring-1 ring-emerald-500/25"
        >
          {title && (
            <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-800">
              <span className="font-extrabold text-xs text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {title}
              </span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Audit passif
              </span>
            </div>
          )}

          <p className="text-xs text-slate-300 leading-relaxed font-normal">
            {content}
          </p>

          {impact && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/95 flex items-start gap-1.5 font-medium bg-amber-500/5 p-2 rounded-lg border border-amber-500/15">
              <span className="font-extrabold text-amber-400 shrink-0">Impact e-commerce :</span>
              <span>{impact}</span>
            </div>
          )}

          {/* Petite flèche en bas */}
          <div 
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0 border-solid border-t-[#0B1523] border-t-8 border-x-transparent border-x-6 border-b-0"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

export default InfoTooltip;
