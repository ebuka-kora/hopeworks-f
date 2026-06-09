import React, { useRef } from 'react';
import { X, Award, ShieldAlert, Check, Calendar, HardDriveDownload } from 'lucide-react';
import { Badge } from './BadgeCard';
import { ModalMotion } from './motion/ModalMotion';
import { PillButton } from './PillButton';

interface CertificateDownloadProps {
  badge: Badge;
  onClose: () => void;
}

export function CertificateDownload({ badge, onClose }: CertificateDownloadProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    // Create a temporary hidden iframe or simply print
    const originalContent = document.body.innerHTML;
    
    // We can also let watermarked popups handle this elegantly
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=500,top=500,width=900,height=600');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>HopeWorks - Certificate Authority #${badge.serialNumber}</title>
            <link href="https://api.fontshare.com/v2/css?f[]=uncut-sans@400,500,600,700,800&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              body { font-family: 'Uncut Sans', sans-serif; }
              .font-serif { font-family: 'Uncut Sans', serif; }
            </style>
          </head>
          <body class="bg-white p-8">
            <div class="border-8 border-emerald-900 p-8 rounded-3xl relative">
              <div class="border border-emerald-300 p-12 rounded-2xl flex flex-col items-center text-center space-y-6">
                
                <div class="text-emerald-800 text-[11px] font-mono tracking-widest uppercase">
                  UN SDG Compliance - HopeWorks Certification Authority
                </div>

                <div class="text-3xl font-serif text-emerald-950 font-semibold italic">
                  Certificate of Civic Honor
                </div>

                <div class="text-xs text-slate-400 font-mono">
                  VERIFIED IDENTIFIER: ${badge.serialNumber}
                </div>

                <div class="w-24 h-[1px] bg-emerald-200" />

                <div class="space-y-1.5 text-slate-600 text-sm max-w-lg leading-relaxed">
                  This authentic token certifies that
                  <p class="text-xl font-serif font-bold text-slate-900 my-2">${badge.recipientName}</p>
                  is officially recognized for outstanding sustainable impact contributions as a
                  <span class="font-semibold text-emerald-800"> ${badge.recipientRole} </span>
                  pledging outstanding energy & resources into the civic milestone campaign:
                  <p class="font-serif font-semibold text-slate-800 italic mt-1 font-medium select-all">${badge.projectName}</p>
                </div>

                <div class="w-16 h-[1px] bg-slate-200/50 mt-4" />

                <div class="grid grid-cols-2 gap-24 text-center text-xs mt-6 select-none">
                  <div>
                    <p class="font-mono text-[10px] text-slate-400">DATE ISSUED</p>
                    <p class="font-semibold text-slate-800 font-mono mt-1">${new Date(badge.dateAwarded).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p class="font-mono text-[10px] text-slate-400">CERTIFYING BODY</p>
                    <p class="font-semibold text-emerald-800 font-serif mt-1 italic">Aisha Vance, CEO</p>
                  </div>
                </div>

                <div class="pt-6 font-mono text-[9px] text-slate-400 leading-relaxed max-w-md">
                  This is a ledger-backed, legally binding credential. Any duplication is recorded in verification servers. HopeWorks is a registered public benefits corporation supporting SDG Milestones via high-integrity Escrow routing.
                </div>

              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      // Fallback inside same page
      alert("Popup blocker prevented launching the print window. Please copy or download the serial number: " + badge.serialNumber);
    }
  };

  return (
    <ModalMotion
      open
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 print:bg-white print:p-0"
      contentClassName="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col border border-slate-100 max-h-[95vh] print:shadow-none print:border-none"
    >
        
        {/* Controls chrome */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-700">Digital Wallet Verified Credential</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Certificate Display body */}
        <div className="p-10 overflow-y-auto flex items-center justify-center bg-slate-100/50 print:bg-white print:p-0">
          
          <div 
            ref={printRef}
            className="w-full max-w-xl aspect-[1.414/1] bg-white border-8 border-emerald-950 p-6 rounded-2xl relative shadow-md print:shadow-none print:border-emerald-900 print:rounded-none"
          >
            {/* Subtle backgrounds seal */}
            <div className="absolute right-8 bottom-8 opacity-[0.06] select-none pointer-events-none print:opacity-[0.04]">
              <Award className="h-44 w-44 text-emerald-800" />
            </div>

            <div className="border border-emerald-300 p-8 rounded-xl h-full flex flex-col justify-between text-center">
              
              <div className="space-y-1.5 shrink-0">
                <div className="text-emerald-800 text-[10px] font-mono tracking-widest uppercase">
                  UN SDG Compliance - HopeWorks Certification Authority
                </div>
                <h2 className="text-2xl font-serif text-emerald-950 font-bold italic tracking-wide">
                  Certificate of Civic Honor
                </h2>
                <div className="text-[9px] text-slate-400 font-mono tracking-widest">
                  SECURE ID: #{badge.serialNumber}
                </div>
              </div>

              <div className="w-16 h-[1px] bg-emerald-200 mx-auto" />

              <div className="text-slate-600 text-xs max-w-sm mx-auto leading-relaxed space-y-1.5 grow flex flex-col justify-center">
                <span>By dynamic resolution, this is highly earned by</span>
                <p className="text-lg font-serif font-bold text-slate-900">{badge.recipientName}</p>
                <span>for outstanding ecological volunteer work as a</span>
                <span className="font-semibold text-emerald-800 capitalize select-all"> {badge.recipientRole} </span>
                <span>engaged in the sustainable project target:</span>
                <p className="font-serif font-semibold text-slate-800 italic mt-0.5 line-clamp-2 leading-tight">"{badge.projectName}"</p>
              </div>

              <div className="w-12 h-[1px] bg-slate-100 mx-auto mt-4" />

              <div className="grid grid-cols-2 gap-12 text-center text-[11px] mt-4 shrink-0">
                <div>
                  <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">Date Issued</p>
                  <p className="font-semibold text-slate-700 font-mono mt-0.5">{new Date(badge.dateAwarded).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] text-slate-400 uppercase tracking-widest">Certifying Body</p>
                  <p className="font-semibold text-emerald-800 font-serif mt-0.5 italic text-xs">Aisha Vance, CEO</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Action Tray */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3 print:hidden justify-center shrink-0">
          <PillButton
            type="button"
            variant="muted"
            caps={false}
            onClick={onClose}
            className="px-5 py-2 text-xs font-mono"
          >
            Go Back
          </PillButton>

          <PillButton
            type="button"
            variant="primary"
            caps={false}
            onClick={handlePrint}
            Icon={HardDriveDownload}
            className="px-6 py-2 text-xs font-mono shadow-sm"
          >
            Launch Print / Save (PDF)
          </PillButton>
        </div>

    </ModalMotion>
  );
}
