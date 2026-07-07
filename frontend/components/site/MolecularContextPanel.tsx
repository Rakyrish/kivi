'use client'

import React, { useState } from 'react'
import { Product } from '@/types'
import QuoteRequestModal from './QuoteRequestModal'

interface MolecularContextPanelProps {
  product: Product
}

export default function MolecularContextPanel({ product }: MolecularContextPanelProps) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false)

  const downloadSDS = () => {
    if (product.sds_pdf) {
      window.open(product.sds_pdf, '_blank')
    } else {
      alert('Safety Data Sheet is being processed. Please request via quote form.')
    }
  }

  return (
    <div className="bg-kivi-navy border border-kivi-cyan/15 rounded-kivi p-6 md:p-8 text-[var(--panel-text)] relative overflow-hidden shadow-glow-cyan animate-fade-up">
      {/* Absolute Decorative SVG Crystal Lattice Background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 opacity-10 pointer-events-none select-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-kivi-cyan animate-[spin_40s_linear_infinite]">
          {/* Nodes */}
          <circle cx="20" cy="30" r="3" fill="currentColor" />
          <circle cx="50" cy="15" r="4" fill="currentColor" />
          <circle cx="80" cy="30" r="3" fill="currentColor" />
          <circle cx="80" cy="70" r="4" fill="currentColor" />
          <circle cx="50" cy="85" r="3" fill="currentColor" />
          <circle cx="20" cy="70" r="4" fill="currentColor" />
          <circle cx="50" cy="50" r="5" fill="currentColor" />

          {/* Bonds (Connecting Lines) */}
          <line x1="20" y1="30" x2="50" y2="15" stroke="currentColor" strokeWidth="0.75" />
          <line x1="50" y1="15" x2="80" y2="30" stroke="currentColor" strokeWidth="0.75" />
          <line x1="80" y1="30" x2="80" y2="70" stroke="currentColor" strokeWidth="0.75" />
          <line x1="80" y1="70" x2="50" y2="85" stroke="currentColor" strokeWidth="0.75" />
          <line x1="50" y1="85" x2="20" y2="70" stroke="currentColor" strokeWidth="0.75" />
          <line x1="20" y1="70" x2="20" y2="30" stroke="currentColor" strokeWidth="0.75" />
          
          <line x1="50" y1="50" x2="20" y2="30" stroke="currentColor" strokeWidth="0.75" />
          <line x1="50" y1="50" x2="50" y2="15" stroke="currentColor" strokeWidth="0.75" />
          <line x1="50" y1="50" x2="80" y2="30" stroke="currentColor" strokeWidth="0.75" />
          <line x1="50" y1="50" x2="80" y2="70" stroke="currentColor" strokeWidth="0.75" />
          <line x1="50" y1="50" x2="50" y2="85" stroke="currentColor" strokeWidth="0.75" />
          <line x1="50" y1="50" x2="20" y2="70" stroke="currentColor" strokeWidth="0.75" />
        </svg>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Left Column: Brand Typography Display */}
        <div className="lg:col-span-2 space-y-4">
          <span className="text-xs uppercase tracking-widest text-kivi-cyan font-semibold flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-kivi-cyan animate-pulse-dot" />
            Molecular Context Panel
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-[var(--panel-text)] leading-tight">
            {product.name}
          </h2>
          <p className="text-sm text-[var(--panel-muted)] max-w-xl font-sans">
            {product.short_description || 'High-purity chemical compound mapped dynamically for industrial process, formulation, and commercial distribution.'}
          </p>
        </div>

        {/* Right Column: CTA Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
          <button
            onClick={() => setIsQuoteOpen(true)}
            className="px-6 py-3 bg-kivi-cyan hover:bg-kivi-cyan-hover text-kivi-navy font-semibold text-sm rounded-kivi transition-all shadow-glow-cyan text-center flex items-center justify-center gap-2"
          >
            <span>Request Price Quote</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          
          <button
            onClick={downloadSDS}
            className="px-6 py-3 bg-transparent hover:bg-white/5 border border-white/20 text-[var(--panel-text)] font-semibold text-sm rounded-kivi transition-all text-center flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download SDS (PDF)</span>
          </button>
        </div>
      </div>

      {/* Chemical Data Table in JetBrains Mono */}
      <div className="mt-8 border-t border-kivi-cyan/10 pt-6">
        <h3 className="text-xs uppercase tracking-widest text-[var(--panel-muted)] font-semibold mb-4">Chemical Properties</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-sm">
          <div className="space-y-1 bg-white/5 p-3 rounded border border-kivi-cyan/5">
            <span className="text-xs text-[var(--panel-muted-dim)] block">CAS Registry No</span>
            <span className="text-[var(--panel-text)] font-medium break-all">{product.cas_number || 'N/A'}</span>
          </div>
          <div className="space-y-1 bg-white/5 p-3 rounded border border-kivi-cyan/5">
            <span className="text-xs text-[var(--panel-muted-dim)] block">Chemical Formula</span>
            <span className="text-kivi-cyan font-bold">{product.chemical_formula || 'N/A'}</span>
          </div>
          <div className="space-y-1 bg-white/5 p-3 rounded border border-kivi-cyan/5">
            <span className="text-xs text-[var(--panel-muted-dim)] block">Assay / Purity</span>
            <span className="text-[var(--panel-text)]">{product.purity || 'N/A'}</span>
          </div>
          <div className="space-y-1 bg-white/5 p-3 rounded border border-kivi-cyan/5">
            <span className="text-xs text-[var(--panel-muted-dim)] block">UN Hazard Class</span>
            <span className="text-kivi-hazard font-semibold">{product.un_number || 'Non-Regulated'}</span>
          </div>
        </div>
      </div>

      {/* Quote Request Modal */}
      {isQuoteOpen && (
        <QuoteRequestModal
          product={product}
          onClose={() => setIsQuoteOpen(false)}
        />
      )}
    </div>
  )
}
