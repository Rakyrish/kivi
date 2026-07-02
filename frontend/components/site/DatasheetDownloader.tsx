'use client'

import { useState } from 'react'
import { FileText, Download, ShieldAlert, Check } from 'lucide-react'
import type { Product } from '@/types'
import { SITE } from '@/lib/constants'

interface DatasheetDownloaderProps {
  product: Product
}

export default function DatasheetDownloader({ product }: DatasheetDownloaderProps) {
  const [generating, setGenerating] = useState(false)
  const [downloadedSds, setDownloadedSds] = useState(false)

  const handleDownloadDatasheet = () => {
    setGenerating(true)

    // Construct print-ready window
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      alert('Pop-up blocker is enabled. Please allow pop-ups to generate the datasheet.')
      setGenerating(false)
      return
    }

    const date = new Date().toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const specsTableRows = Object.entries(product.specifications || {})
      .map(([key, val]) => `
        <tr>
          <td>${key}</td>
          <td>${val}</td>
        </tr>
      `).join('')

    const appsList = (product.applications || [])
      .map((app) => `<li>${app}</li>`).join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Technical Datasheet - ${product.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&display=swap');
          
          body {
            font-family: 'Outfit', sans-serif;
            color: #0D1B2A;
            margin: 0;
            padding: 40px;
            background-color: #ffffff;
            position: relative;
            line-height: 1.5;
          }

          /* ── Watermark ── */
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-35deg);
            font-size: 80px;
            font-weight: 900;
            color: rgba(0, 32, 64, 0.05);
            white-space: nowrap;
            pointer-events: none;
            z-index: 1000;
            user-select: none;
            letter-spacing: 0.1em;
          }

          /* ── Header ── */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #002040;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo-area h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            color: #002040;
            letter-spacing: 0.05em;
          }
          .logo-area p {
            margin: 2px 0 0 0;
            font-size: 11px;
            color: #00A0C0;
            font-weight: 600;
            text-transform: uppercase;
          }
          .doc-title {
            text-align: right;
          }
          .doc-title h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #0D1B2A;
            text-transform: uppercase;
          }
          .doc-title p {
            margin: 4px 0 0 0;
            font-size: 11px;
            color: #606060;
          }

          /* ── Product details ── */
          .product-title-section {
            margin-bottom: 25px;
          }
          .product-title {
            font-size: 28px;
            font-weight: 700;
            color: #002040;
            margin: 0 0 5px 0;
          }
          .meta-grid {
            display: grid;
            grid-template-cols: repeat(4, 1fr);
            gap: 15px;
            background-color: #F4F7FA;
            padding: 15px;
            border-radius: 4px;
            margin-bottom: 25px;
          }
          .meta-item {
            font-size: 12px;
          }
          .meta-label {
            color: #606060;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;
            margin-bottom: 2px;
          }
          .meta-value {
            font-weight: 700;
            color: #0D1B2A;
          }
          .meta-value.mono {
            font-family: 'JetBrains Mono', monospace;
            color: #00A0C0;
          }

          /* ── Content Sections ── */
          .section-title {
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            color: #002040;
            border-bottom: 1px solid #E8EEF4;
            padding-bottom: 6px;
            margin: 25px 0 12px 0;
            letter-spacing: 0.05em;
          }
          .description-text {
            font-size: 13px;
            line-height: 1.6;
            color: #334155;
          }

          /* ── Tables ── */
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 20px;
          }
          th {
            background-color: #002040;
            color: #ffffff;
            font-weight: 600;
            padding: 8px 12px;
            text-align: left;
          }
          td {
            padding: 8px 12px;
            border-bottom: 1px solid #E8EEF4;
            font-family: 'JetBrains Mono', monospace;
          }
          tr:nth-child(even) td {
            background-color: #F4F7FA;
          }

          /* ── Lists ── */
          ul {
            margin: 0;
            padding-left: 20px;
            font-size: 13px;
            color: #334155;
          }
          li {
            margin-bottom: 5px;
          }

          /* ── Safety guidelines ── */
          .safety-box {
            border: 1px solid #EF4444;
            background-color: rgba(239, 68, 68, 0.03);
            padding: 15px;
            border-radius: 4px;
            font-size: 12px;
            margin-top: 30px;
          }
          .safety-title {
            color: #EF4444;
            font-weight: 700;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 5px;
          }

          /* ── Footer ── */
          .footer {
            margin-top: 50px;
            border-top: 1px solid #E8EEF4;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #606060;
          }

          /* ── Print config ── */
          @media print {
            body {
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="watermark">KIVI CHEMICALS</div>

        <div class="header">
          <div class="logo-area">
            <h1>KIVI CHEMICALS</h1>
            <p>Quality Assured Supply Chain</p>
          </div>
          <div class="doc-title">
            <h2>Technical Product Datasheet</h2>
            <p>Generated: ${date}</p>
          </div>
        </div>

        <div class="product-title-section">
          <h1 class="product-title">${product.name}</h1>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">CAS Registry</div>
            <div class="meta-value">${product.cas_number || '—'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Chemical Formula</div>
            <div class="meta-value mono">${product.chemical_formula || '—'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Grade Standard</div>
            <div class="meta-value">${product.grade || 'Industrial'}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">UN Hazmat Tag</div>
            <div class="meta-value">${product.un_number || 'Non-regulated'}</div>
          </div>
        </div>

        <div class="section-title">Product Description</div>
        <div class="description-text">
          ${product.description || product.short_description}
        </div>

        ${specsTableRows ? `
          <div class="section-title">Technical Specifications</div>
          <table>
            <thead>
              <tr>
                <th style="width: 50%;">Specification Parameter</th>
                <th style="width: 50%;">Certified Value / Limit</th>
              </tr>
            </thead>
            <tbody>
              ${specsTableRows}
            </tbody>
          </table>
        ` : ''}

        ${appsList ? `
          <div class="section-title">Primary Applications</div>
          <ul>
            ${appsList}
          </ul>
        ` : ''}

        ${product.safety_info ? `
          <div class="safety-box">
            <div class="safety-title">Safety & Handling Guidelines</div>
            <div>${product.safety_info}</div>
          </div>
        ` : ''}

        <div class="footer">
          <div>
            <strong>Kivi Chemicals Ltd</strong><br/>
            ${SITE.address}, ${SITE.city}, ${SITE.country}<br/>
            Phone: ${SITE.phone} | Email: ${SITE.email}
          </div>
          <div style="text-align: right;">
            Document Ref: KIVI-TDS-${product.slug.toUpperCase()}<br/>
            © ${new Date().getFullYear()} Kivi Chemicals. All rights reserved.
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `)
    printWindow.document.close()
    setGenerating(false)
  }

  const handleDownloadSds = () => {
    if (product.sds_pdf) {
      window.open(product.sds_pdf, '_blank')
      setDownloadedSds(true)
      setTimeout(() => setDownloadedSds(false), 3000)
    }
  }

  return (
    <div className="pt-6 border-t flex flex-wrap gap-4" style={{ borderColor: 'var(--border-divider)' }}>
      {/* 1. Client-Side TDS Generator */}
      <button
        onClick={handleDownloadDatasheet}
        disabled={generating}
        className="inline-flex items-center gap-2.5 px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-[2px] transition-all hover:opacity-90"
        style={{ background: 'var(--kivi-navy)', color: 'var(--kivi-white)', border: '1px solid var(--border-default)' }}
      >
        <Download size={14} className={generating ? 'animate-pulse' : ''} />
        {generating ? 'Generating TDS...' : 'Technical Datasheet (TDS)'}
      </button>

      {/* 2. SDS Cloudinary Downloader */}
      {product.sds_pdf ? (
        <button
          onClick={handleDownloadSds}
          className="inline-flex items-center gap-2.5 px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-[2px] transition-all"
          style={{
            background: downloadedSds ? 'var(--kivi-success-bg)' : 'transparent',
            borderColor: downloadedSds ? 'var(--kivi-success)' : 'var(--kivi-error)',
            color: downloadedSds ? 'var(--kivi-success)' : 'var(--kivi-error)',
            borderWidth: '1px'
          }}
        >
          {downloadedSds ? <Check size={14} /> : <ShieldAlert size={14} />}
          {downloadedSds ? 'Opening SDS...' : 'Safety Data Sheet (SDS)'}
        </button>
      ) : (
        <button
          disabled
          className="inline-flex items-center gap-2.5 px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-[2px] opacity-40 cursor-not-allowed border"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
          title="Safety Data Sheet not uploaded for this product"
        >
          <ShieldAlert size={14} />
          SDS Unavailable
        </button>
      )}
    </div>
  )
}
