import React, { useState } from 'react';
import { motion } from 'motion/react';
import { springDashboard } from '../../lib/motion';
import { useAuth } from '../../context/AuthContext';
import { useDonationsStore } from '../../hooks/useDonationsStore';
import {
  DashboardPageHeader,
  DashboardTabs,
  DashboardToolbar,
  DashboardCardGrid,
  TrackingCard,
  formatProjectCode,
} from '../../components/dashboard/DashboardUI';
import { PillButton } from '../../components/PillButton';
import {
  Download,
  FileSpreadsheet,
  Award,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, id?: string) => void;
}

export function DonorDashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { listByDonor } = useDonationsStore();

  const myDonations = user ? listByDonor(user.id) : [];

  // Total contributions metrics
  const totalContributed = myDonations.reduce((sum, d) => sum + d.amount, 0);

  // Donor History Exporters (Page 5 PDF requirements: project name, amount, date, transaction ref, escrow status)
  const handleExportCSV = (donationsToExport = myDonations) => {
    const headers = ["Transaction Reference (ID)", "Project Name", "Amount Donated ($)", "Date of Pledge (Local format)", "Escrow Status"];
    const rows = donationsToExport.map(d => [
      `"${d.id}"`,
      `"${d.projectName.replace(/"/g, '""')}"`,
      d.amount,
      new Date(d.createdAt).toLocaleDateString(),
      d.amount >= 1000 ? "Disbursed" : "Locked in Escrow"
    ]);

    const lines = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ];

    const csvContent = "data:text/csv;charset=utf-8," + lines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().substring(0, 10);
    link.setAttribute("download", `hopeworks_contributions_history_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = (donationsToExport = myDonations) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocker active. Please allow popups to save/download your PDF tax statement.");
      return;
    }

    const listHTML = donationsToExport.map((d, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 12px; font-weight: bold; color: #0F172A; font-family: monospace; font-size: 11px;">${d.id}</td>
        <td style="padding: 12px; font-weight: 600; color: #1E293B;">${d.projectName}</td>
        <td style="padding: 12px; font-family: monospace; color: #0F172A; text-align: right; font-weight: bold;">$${d.amount.toLocaleString()} USD</td>
        <td style="padding: 12px; text-align: right; font-family: monospace; font-size: 12px; color: #475569;">${new Date(d.createdAt).toLocaleDateString()}</td>
        <td style="padding: 12px; text-align: right;"><span style="padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: bold; background-color: ${d.amount >= 1000 ? '#DEF7EC' : '#FEE2E2'}; color: ${d.amount >= 1000 ? '#03543F' : '#991B1B'};">${d.amount >= 1000 ? 'DISBURSED' : 'LOCKED ESCROW'}</span></td>
      </tr>
    `).join('');

    const totalExported = donationsToExport.reduce((sum, d) => sum + d.amount, 0);

    printWindow.document.write(`
      <html>
        <head>
          <title>Donor Escrow Statement - HopeWorks</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #334155; }
            .header { border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 25px; }
            .title { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0; text-transform: uppercase; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 25px; font-size: 13px; }
            .meta-label { font-weight: 700; color: #64748B; text-transform: uppercase; font-size: 10px; }
            .meta-value { color: #1E293B; font-weight: 500; font-size: 14px; margin-top: 3px; }
            .card-grid { display: flex; gap: 20px; margin-bottom: 30px; }
            .card { flex: 1; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 16px; }
            .card-num { font-size: 20px; font-weight: 800; color: #B24724; margin-top: 5px; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th { background-color: #F1F5F9; padding: 10px; text-align: left; font-size: 11px; font-weight: 700; color: #475569; border-bottom: 2px solid #E2E8F0; text-transform: uppercase; }
            .footer { margin-top: 50px; font-size: 11px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 15px; display: flex; justify-content: space-between; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body onload="window.print()">
          <div class="no-print" style="margin-bottom: 25px; padding: 12px; background-color: #FEF3C7; border: 1px solid #FCD34D; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
            <span style="font-weight: 600; color: #92400E;">⚠️ Official Tax Statement Log.</span>
            <button onclick="window.print()" style="padding: 6px 14px; background-color: #0F172A; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Save report as PDF</button>
          </div>
          <div class="header">
            <h1 class="title">Donor Escrow Ledger Statement</h1>
            <p style="font-size: 11px; color: #64748B; margin-top: 4px; font-family: monospace;">STABLE BACKER LEDGER REPORT : ${user?.name.toUpperCase()}</p>
          </div>
          <div class="meta-grid">
            <div>
              <div class="meta-label">Backer Name</div>
              <div class="meta-value">${user?.name}</div>
            </div>
            <div>
              <div class="meta-label">Backer Account Email</div>
              <div class="meta-value">${user?.email}</div>
            </div>
            <div>
              <div class="meta-label">Statement Date of Export</div>
              <div class="meta-value">${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
            </div>
            <div>
              <div class="meta-label">Diligence Classification</div>
              <div class="meta-value" style="color: #10B981; font-weight: 700;">Verified Sandbox Contributor Profile</div>
            </div>
          </div>
          <div class="card-grid">
            <div class="card">
              <div class="meta-label">Total Escrow Deployed</div>
              <div class="card-num">$${totalExported.toLocaleString()} USD</div>
            </div>
            <div class="card">
              <div class="meta-label">Statement Items Logged</div>
              <div class="card-num" style="color: #334155;">${donationsToExport.length} Pledges</div>
            </div>
          </div>
          <h3>Detailed Escrow History Records</h3>
          <table class="table">
            <thead>
              <tr>
                <th>TRANSACTION ID REFERENCE</th>
                <th>CAMPAIGN / TARGET GOAL</th>
                <th style="text-align: right;">ESCROW AMOUNT</th>
                <th style="text-align: right;">MATCH DATE</th>
                <th style="text-align: right;">ESCROW STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${listHTML}
            </tbody>
          </table>
          <div class="footer">
            <span>Seal Authenticated under HopeWorks Governance Sandbox.</span>
            <span>Secured Session Export</span>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSegment, setActiveSegment] = useState<'all' | 'locked' | 'disbursed'>('all');

  // Filter donations
  const filteredDonations = myDonations.filter((don) => {
    const matchesSearch = don.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (don.message && don.message.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          don.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeSegment === 'locked') {
      return matchesSearch && don.amount < 1000; // Mock segment separation
    }
    if (activeSegment === 'disbursed') {
      return matchesSearch && don.amount >= 1000;
    }
    return matchesSearch;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springDashboard} className="select-none">
      <DashboardPageHeader
        title="Pledges"
        count={myDonations.length}
        countLabel={`pledges · $${totalContributed.toLocaleString()} total`}
        actionLabel="Make a donation"
        onAction={() => onNavigate('explore')}
      />

      <DashboardTabs
        activeId={activeSegment}
        onChange={(id) => setActiveSegment(id as typeof activeSegment)}
        tabs={[
          { id: 'all', label: 'All', count: myDonations.length },
          { id: 'locked', label: 'Locked', count: myDonations.filter((d) => d.amount < 1000).length },
          { id: 'disbursed', label: 'Disbursed', count: myDonations.filter((d) => d.amount >= 1000).length },
        ]}
      />

      <DashboardToolbar search={searchTerm} onSearchChange={setSearchTerm} placeholder="Search pledges...">
        {myDonations.length > 0 && (
          <>
            <PillButton variant="muted" caps={false} onClick={() => handleExportCSV()} className="px-3 py-2 text-xs">
              <FileSpreadsheet className="h-4 w-4 text-[#B24724]" />
              CSV
            </PillButton>
            <PillButton variant="muted" caps={false} onClick={() => handleExportPDF()} className="px-3 py-2 text-xs">
              <Download className="h-4 w-4 text-[#B24724]" />
              PDF
            </PillButton>
          </>
        )}
      </DashboardToolbar>

      <DashboardCardGrid
        isEmpty={filteredDonations.length === 0}
        emptyMessage="No pledges yet. Explore projects and make your first contribution."
      >
        {filteredDonations.map((don) => {
          const isDisbursed = don.amount >= 1000;
          const progress = Math.min(100, Math.round((don.amount / 5000) * 100));

          return (
            <TrackingCard
              key={don.id}
              status={isDisbursed ? 'completed' : 'pending'}
              statusLabel={isDisbursed ? 'Disbursed' : 'Locked escrow'}
              timeLabel={new Date(don.createdAt).toLocaleDateString()}
              code={formatProjectCode(don.id)}
              title={don.projectName}
              route={`Pledge — $${don.amount.toLocaleString()}`}
              metrics={[
                { label: 'Amount', value: `$${don.amount.toLocaleString()}` },
                { label: 'Impact score', value: `${Math.min(10, 7 + Math.floor(don.amount / 1000))}/10` },
              ]}
              timeline={['Pledged', 'Escrow locked', isDisbursed ? 'Released' : 'Awaiting milestone']}
              progress={isDisbursed ? 100 : progress}
              onClick={() => onNavigate('project_detail', don.projectId)}
            />
          );
        })}
      </DashboardCardGrid>
    </motion.div>
  );
}
