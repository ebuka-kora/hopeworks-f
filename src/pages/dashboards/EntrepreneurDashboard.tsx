import React, { useState } from 'react';
import { motion } from 'motion/react';
import { springDashboard } from '../../lib/motion';
import { useAuth } from '../../context/AuthContext';
import { useProjectsStore } from '../../hooks/useProjectsStore';
import { useApplicationsStore } from '../../hooks/useApplicationsStore';
import {
  DashboardPageHeader,
  DashboardTabs,
  DashboardToolbar,
  DashboardCardGrid,
  TrackingCard,
  projectStatusToDashboard,
  formatProjectCode,
} from '../../components/dashboard/DashboardUI';
import { PillButton } from '../../components/PillButton';
import { useToast } from '../../context/ToastContext';
import {
  Award,
  ArrowUpRight,
  FileSpreadsheet,
  Users,
  CheckCircle,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string, id?: string) => void;
}

export function EntrepreneurDashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { projects, refresh: refreshProjects } = useProjectsStore();
  const { listByProject, updateApplicationStatus } = useApplicationsStore();
  const [reviewLoading, setReviewLoading] = useState<{ appId: string; action: 'approved' | 'rejected' } | null>(null);

  const myCampaigns = projects.filter(p => p.ownerId === user?.id);

  const pendingApplications = myCampaigns.flatMap(camp =>
    listByProject(camp.id)
      .filter(a => !a.status || a.status === 'pending')
      .map(a => ({ ...a, campaignTitle: camp.title }))
  );

  const handleReviewApplication = async (appId: string, status: 'approved' | 'rejected') => {
    try {
      setReviewLoading({ appId, action: status });
      await updateApplicationStatus(appId, status);
      await refreshProjects();
      toast.success(status === 'approved' ? 'Volunteer application approved.' : 'Volunteer application declined.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to review application.';
      toast.error(message);
    } finally {
      setReviewLoading(null);
    }
  };

  // Campaign Financial Summary Export (Page 4 PDF requirements)
  const handleExportCSV = (camp: any) => {
    const headers = ["Campaign Name", "Project Owner Name", "Sector Category", "Status", "Funding Target ($)", "Funding Raised ($)", "Export Date"];
    const row = [
      `"${camp.title.replace(/"/g, '""')}"`,
      `"${camp.ownerName.replace(/"/g, '""')}"`,
      `"${camp.category}"`,
      `"${camp.status}"`,
      camp.fundingTarget,
      camp.fundingRaised,
      new Date().toLocaleDateString()
    ];
    
    const milestoneHeaders = ["Milestone Title", "Cost ($)", "Status", "Approved At"];
    const milestoneRows = camp.milestones.map((m: any, idx: number) => [
      `"Stage ${idx + 1}: ${m.title.replace(/"/g, '""')}"`,
      m.cost,
      m.status,
      m.approvedAt ? new Date(m.approvedAt).toLocaleDateString() : 'N/A'
    ]);

    const lines = [
      headers.join(","),
      row.join(","),
      "",
      "SEQUENTIAL MILESTONE COMPLIANCE SUMMARY",
      milestoneHeaders.join(","),
      ...milestoneRows.map((r: any) => r.join(","))
    ];

    const csvContent = "data:text/csv;charset=utf-8," + lines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${camp.title.toLowerCase().replace(/\s+/g, "_")}_financials.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = (camp: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Popup blocker active. Please allow popups to view the print/PDF financial summary.");
      return;
    }
    
    const milestoneDocs = camp.milestones.map((m: any, idx: number) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 12px; font-weight: 600; color: #1E293B;">Stage ${idx + 1}: ${m.title}</td>
        <td style="padding: 12px; font-family: monospace; color: #0F172A; text-align: right;">$${m.cost.toLocaleString()} USD</td>
        <td style="padding: 12px; text-align: right;"><span style="padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: bold; background-color: ${m.status === 'approved' ? '#DEF7EC' : m.status === 'submitted' ? '#E1E7FF' : '#F3F4F6'}; color: ${m.status === 'approved' ? '#03543F' : m.status === 'submitted' ? '#3730A3' : '#374151'};">${m.status.toUpperCase()}</span></td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>HopeWorks Financial Audit - ${camp.title}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #334155; }
            .header { border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 25px; }
            .title { font-size: 22px; font-weight: 800; color: #0F172A; margin: 0; text-transform: uppercase; letter-spacing: -0.5px; }
            .meta-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 15px; margin-bottom: 25px; font-size: 13px; }
            .meta-label { font-weight: 700; color: #64748B; text-transform: uppercase; font-size: 10px; tracking: 0.5px; }
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
            <span style="font-weight: 600; color: #92400E;">⚠️ Printable Escrow Statement.</span>
            <button onclick="window.print()" style="padding: 6px 14px; background-color: #0F172A; color: white; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Print to PDF</button>
          </div>
          <div class="header">
            <h1 class="title">Campaign Financial Audit Report</h1>
            <p style="font-size: 11px; color: #64748B; margin-top: 4px; font-family: monospace;">LEDGER CONTRACT REF: ${camp.id.toUpperCase()}</p>
          </div>
          <div class="meta-grid">
            <div>
              <div class="meta-label">Campaign Name</div>
              <div class="meta-value">${camp.title}</div>
            </div>
            <div>
              <div class="meta-label">Project Owner Name</div>
              <div class="meta-value">${camp.ownerName} (Account ID: ${camp.ownerId})</div>
            </div>
            <div>
              <div class="meta-label">Date of Export</div>
              <div class="meta-value">${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</div>
            </div>
            <div>
              <div class="meta-label">Secured Status</div>
              <div class="meta-value" style="color: #10B981; font-weight: 700; text-transform: uppercase;">${camp.status}</div>
            </div>
          </div>
          <div class="card-grid">
            <div class="card">
              <div class="meta-label">Escrow Raised</div>
              <div class="card-num">$${camp.fundingRaised.toLocaleString()} USD</div>
            </div>
            <div class="card">
              <div class="meta-label">Total Funding Target</div>
              <div class="card-num" style="color: #334155;">$${camp.fundingTarget.toLocaleString()} USD</div>
            </div>
          </div>
          <h3>Sequential Milestones Secure Release Schedule</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Compliance Stage Target</th>
                <th style="text-align: right;">Cost Allocation</th>
                <th style="text-align: right;">Auditor Verdict</th>
              </tr>
            </thead>
            <tbody>
              ${milestoneDocs}
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
  const [activeSegment, setActiveSegment] = useState<'all' | 'active' | 'review'>('all');

  // Search filtered campaigns
  const filteredCampaigns = myCampaigns.filter((camp) => {
    const matchesSearch = camp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          camp.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeSegment === 'active') return matchesSearch && camp.status === 'active';
    if (activeSegment === 'review') return matchesSearch && camp.status === 'pending';
    return matchesSearch;
  });

  const statusLabel = (status: string) => {
    if (status === 'active') return 'Live';
    if (status === 'pending') return 'Awaiting review';
    if (status === 'completed') return 'Completed';
    return 'Draft';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={springDashboard} className="select-none relative">
      <DashboardPageHeader
        title="Campaigns"
        count={myCampaigns.length}
        countLabel="campaigns"
        actionLabel="Add new campaign"
        onAction={() => onNavigate('create_campaign')}
      />

      <DashboardTabs
        activeId={activeSegment}
        onChange={(id) => setActiveSegment(id as typeof activeSegment)}
        tabs={[
          { id: 'all', label: 'All', count: myCampaigns.length },
          { id: 'active', label: 'Live', count: myCampaigns.filter((c) => c.status === 'active').length },
          { id: 'review', label: 'Waiting', count: myCampaigns.filter((c) => c.status === 'pending').length },
        ]}
      />

      <DashboardToolbar
        search={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search campaigns..."
      />

      <DashboardCardGrid
        isEmpty={filteredCampaigns.length === 0}
        emptyMessage="No campaigns yet. Start your first campaign to begin fundraising."
      >
        {filteredCampaigns.map((camp) => {
          const progressPct =
            camp.fundingTarget > 0
              ? Math.min(100, Math.round((camp.fundingRaised / camp.fundingTarget) * 100))
              : 0;
          const approvedCount = camp.milestones.filter((m) => m.status === 'approved').length;
          const timeline = camp.milestones.slice(0, 3).map((m) => m.title);
          if (timeline.length === 0) timeline.push('Planning', 'Launch', 'Delivery');

          return (
            <TrackingCard
              key={camp.id}
              status={projectStatusToDashboard(camp.status)}
              statusLabel={statusLabel(camp.status)}
              timeLabel={`${approvedCount}/${camp.milestones.length} milestones`}
              code={formatProjectCode(camp.id)}
              title={camp.title}
              route={`${camp.category} — ${camp.ownerName}`}
              metrics={[
                { label: 'Raised', value: `$${camp.fundingRaised.toLocaleString()}` },
                { label: 'Goal', value: `$${camp.fundingTarget.toLocaleString()}` },
              ]}
              timeline={timeline}
              progress={progressPct}
              onClick={() => onNavigate('project_detail', camp.id)}
              footer={
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <PillButton variant="muted" caps={false} onClick={() => handleExportCSV(camp)} className="flex-1 py-1.5 text-xs min-w-[4.5rem]">
                    <FileSpreadsheet className="h-3 w-3 text-[#B24724]" />
                    CSV
                  </PillButton>
                  <PillButton variant="muted" caps={false} onClick={() => handleExportPDF(camp)} className="flex-1 py-1.5 text-xs min-w-[4.5rem]">
                    <Award className="h-3 w-3 text-[#B24724]" />
                    PDF
                  </PillButton>
                  <PillButton variant="brand" caps={false} onClick={() => onNavigate('project_detail', camp.id)} className="flex-1 py-1.5 text-xs min-w-[4.5rem]">
                    Open
                    <ArrowUpRight className="h-3 w-3" />
                  </PillButton>
                </div>
              }
            />
          );
        })}
      </DashboardCardGrid>

      {pendingApplications.length > 0 && (
        <div className="mt-4">
          <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-[#B24724]" />
            Volunteer applications
            <span className="text-xs font-normal text-slate-500">({pendingApplications.length} waiting)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {pendingApplications.map((app) => (
              <div key={app.id} className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{app.volunteerName}</p>
                    <p className="text-sm text-slate-500">{app.campaignTitle}</p>
                  </div>
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">Waiting</span>
                </div>
                <p className="text-xs text-slate-500">{app.skills?.join(' · ') || 'No skills listed'}</p>
                <div className="flex gap-2">
                  <PillButton
                    variant="brand"
                    caps={false}
                    onClick={() => handleReviewApplication(app.id, 'approved')}
                    loading={reviewLoading?.appId === app.id && reviewLoading.action === 'approved'}
                    loadingMessage="Approving volunteer..."
                    disabled={!!reviewLoading && reviewLoading.appId !== app.id}
                    className="flex-1 py-2 text-xs"
                  >
                    Approve {!(reviewLoading?.appId === app.id) && <CheckCircle className="h-3 w-3" />}
                  </PillButton>
                  <PillButton
                    variant="muted"
                    caps={false}
                    onClick={() => handleReviewApplication(app.id, 'rejected')}
                    loading={reviewLoading?.appId === app.id && reviewLoading.action === 'rejected'}
                    loadingMessage="Declining application..."
                    disabled={!!reviewLoading && reviewLoading.appId !== app.id}
                    className="flex-1 py-2 text-xs"
                  >
                    Reject
                  </PillButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </motion.div>
  );
}
