import { useState, useEffect } from "react";
import {
  FileBarChart,
  Download,
  Syringe,
  Bell,
  Home,
  HeartPulse,
  MessageCircleQuestion,
  User,
  Thermometer,
  Calendar,
  Star,
  Cloud,
  Leaf,
  ChevronDown,
  Printer,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { alertAPI, reportAPI, babyAPI, vaccinationAPI } from "@/lib/api";
import { toast } from "sonner";
import { calculateSchedule } from "@/lib/vaccineSchedule";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const navItems = [
  { icon: Home, label: "Home", path: "/parent/dashboard" },
  { icon: HeartPulse, label: "Health", path: "/parent/health-log" },
  { icon: Syringe, label: "Vaccines", path: "/parent/vaccination" },
  { icon: MessageCircleQuestion, label: "Ask", path: "/parent/query" },
  { icon: User, label: "Profile", path: "/parent/profile" },
];

const Reports = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [babies, setBabies] = useState<any[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Summary State
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewingReport, setViewingReport] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [alertsData, reportsData, babiesData] = await Promise.all([
        alertAPI.getAll(),
        reportAPI.getAll(),
        babyAPI.getAll()
      ]);

      // Fetch vaccinations for alerts if a baby is selected
      let vaccineAlerts: any[] = [];
      if (Array.isArray(babiesData) && babiesData.length > 0) {
        const currentId = localStorage.getItem("selectedBabyId") || babiesData[0]._id;
        const currentBaby = babiesData.find((b: any) => b._id === currentId);
        if (currentBaby) {
          const vax = await vaccinationAPI.getAll(currentId);
          const allVaccines = calculateSchedule(currentBaby, vax);
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);

          const dueSoon = allVaccines.filter(v => {
            if (v.status === 'completed') return false;
            const due = new Date(v.dueDate);
            return due <= nextWeek;
          });

          vaccineAlerts = dueSoon.map(v => ({
            _id: v._id || v.name,
            type: 'vaccination',
            title: `Vaccine Due: ${v.name}`,
            description: new Date(v.dueDate) < new Date() ? 'This vaccine is overdue.' : 'This vaccine is due soon.',
            time: new Date(v.dueDate).toLocaleDateString()
          }));
        }
      }

      setAlerts(vaccineAlerts);
      setReports(Array.isArray(reportsData) ? reportsData : []);
      setBabies(Array.isArray(babiesData) ? babiesData : []);
      if (Array.isArray(babiesData) && babiesData.length > 0) {
        const storedId = localStorage.getItem("selectedBabyId");
        if (storedId && babiesData.some((b: any) => b._id === storedId)) {
          setSelectedBabyId(storedId);
        } else {
          setSelectedBabyId(babiesData[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'vaccination': return Syringe;
      case 'health': return Thermometer;
      default: return Bell;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'vaccination': return 'bg-yellow-100 text-yellow-700';
      case 'health': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  const generateSummary = async () => {
    if (!selectedBabyId) return;
    setGenerating(true);
    try {
      const data = await reportAPI.getSummary(selectedBabyId);
      setSummaryData(data);
      setSummaryOpen(true);
    } catch (e) {
      toast.error("Failed to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  const saveSummaryAsReport = async () => {
    if (!summaryData || !selectedBabyId) return;
    setSaving(true);
    try {
      const reportPayload = {
        title: `Health Summary - ${new Date().toLocaleDateString()}`,
        description: `Generated health summary for ${summaryData.period}`,
        type: 'health',
        data: summaryData // Save the actual summary data
      };
      await reportAPI.create(reportPayload);
      toast.success("Report saved to history");
      setSummaryOpen(false);
      loadData(); // Reload to see new report
    } catch (e) {
      toast.error("Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  const currentBaby = babies.find(b => b._id === selectedBabyId);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-16">
      <DesktopNav items={navItems} />
      {/* Header */}
      <header
        className="relative h-44 rounded-b-[2.5rem] overflow-hidden"
        style={{
          background: "linear-gradient(180deg, hsl(120, 18%, 55%) 0%, hsl(170, 30%, 58%) 100%)",
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-4 left-2">
          <Leaf className="w-5 h-5 text-white/30 rotate-[-30deg]" />
          <Leaf className="w-4 h-4 text-white/25 rotate-[-60deg] -mt-1 ml-2" />
        </div>
        <div className="absolute top-4 right-2">
          <Leaf className="w-5 h-5 text-white/30 rotate-[30deg] ml-auto" />
          <Leaf className="w-4 h-4 text-white/25 rotate-[60deg] -mt-1 mr-2" />
        </div>
        <Star className="absolute top-12 left-1/4 w-3 h-3 text-white/40 fill-white/40" />
        <Star className="absolute top-20 right-8 w-4 h-4 text-white/50 fill-white/50" />
        <Star className="absolute top-16 right-1/4 w-3 h-3 text-white/30 fill-white/30" />
        <Cloud className="absolute top-24 left-4 w-12 h-12 text-white/20 fill-white/10" />
        <Cloud className="absolute top-28 right-6 w-16 h-16 text-white/25 fill-white/15" />

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          {babies.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white rounded-full px-4 h-auto py-2 flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-white/20 p-1">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-white/80 to-white/60 flex items-center justify-center overflow-hidden">
                      {currentBaby?.avatar ? <img src={currentBaby.avatar} className="w-full h-full object-cover" /> : <FileBarChart className="w-6 h-6 text-primary/60" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{currentBaby?.name || "Reports"}</span>
                    <ChevronDown size={16} className="text-white/80" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {babies.map(b => (
                  <DropdownMenuItem key={b._id} onClick={() => {
                    setSelectedBabyId(b._id);
                    localStorage.setItem("selectedBabyId", b._id);
                  }}>
                    {b.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex flex-col items-center">
              <h1 className="text-xl font-bold text-white">Reports & Alerts</h1>
            </div>
          )}
        </div>
      </header>

      <div className="px-4 mt-4 max-w-lg mx-auto">

        {/* Actions */}
        {selectedBabyId && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-semibold text-primary">Health Summary</h3>
                <p className="text-xs text-muted-foreground">For practitioner visit</p>
              </div>
              <Button onClick={generateSummary} disabled={generating} size="sm" className="gap-2">
                {generating ? "Generating..." : <><Printer size={16} /> Generate</>}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Alerts Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Bell size={16} className="text-destructive" />
            <h3 className="text-sm font-semibold text-muted-foreground">ACTIVE ALERTS</h3>
          </div>
          <div className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading alerts...</p>}
            {!loading && alerts.length === 0 && <p className="text-sm text-muted-foreground italic">No active alerts</p>}
            {alerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <Card
                  key={alert._id || index}
                  className="border-l-4 border-l-destructive animate-slide-up shadow-soft"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl ${getAlertColor(alert.type)} flex items-center justify-center`}>
                        <Icon size={18} className="text-current" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-foreground">{alert.title}</h4>
                          <span className="text-xs text-muted-foreground">{alert.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Reports Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileBarChart size={16} className="text-primary" />
            <h3 className="text-sm font-semibold text-muted-foreground">REPORTS</h3>
          </div>
          <div className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading reports...</p>}
            {!loading && reports.length === 0 && <p className="text-sm text-muted-foreground italic">No reports found. Generate a summary to save one.</p>}

            {/* Real Reports from API */}
            {reports.map((report, index) => (
              <Card
                key={report._id || index}
                className="animate-slide-up"
                style={{ animationDelay: `${(index + alerts.length) * 50}ms` }}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileBarChart size={22} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground">{report.title}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {report.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <Calendar size={12} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Created: {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                    <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => setViewingReport(report)}>
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Health Summary Report</DialogTitle>
          </DialogHeader>
          {summaryData && (
            <div className="space-y-4 font-mono text-sm border p-4 rounded-md bg-muted/20">
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold">Baby:</span>
                <span>{currentBaby?.name}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-bold">Period:</span>
                <span>{summaryData.period}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <p className="text-xs text-muted-foreground">Logs Count</p>
                  <p className="font-bold text-lg">{summaryData.logsCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Sleep</p>
                  <p className="font-bold text-lg">{summaryData.averageSleep} hrs</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Weight</p>
                  <p className="font-bold text-lg">{summaryData.averageWeight} kg</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Max Temp</p>
                  <p className="font-bold text-lg text-rose-500">{summaryData.maxTemperature}°C</p>
                </div>
              </div>
              <div>
                <p className="font-bold mb-2">Recent Logs:</p>
                <div className="space-y-1">
                  {summaryData.recentLogs.map((l: any, i: number) => (
                    <div key={i} className="text-xs flex justify-between border-b border-dashed py-1">
                      <span>{new Date(l.date).toLocaleDateString()}</span>
                      <span>{l.symptoms || l.feeding || "Routine Check"}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <Button className="flex-1" variant="outline" onClick={saveSummaryAsReport} disabled={saving}>
                  {saving ? "Saving..." : <><Save size={16} className="mr-2" /> Save to Reports</>}
                </Button>
                <Button className="flex-1" onClick={() => window.print()}>Print</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Preview Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingReport?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 border p-6 rounded-lg bg-white shadow-sm font-serif">
            {/* Header */}
            <div className="border-b pb-4 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-primary">Nino Care</h2>
                <p className="text-sm text-muted-foreground">Pediatric Health Report</p>
              </div>
              <div className="text-right text-sm">
                <p>Date: {viewingReport?.createdAt ? new Date(viewingReport.createdAt).toLocaleDateString() : viewingReport?.date}</p>
                <p>Ref: {viewingReport?._id}</p>
              </div>
            </div>

            {/* Dynamic Body */}
            <div className="py-4 min-h-[200px]">
              {viewingReport?.data ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
                    <div>
                      <span className="text-xs text-muted-foreground block">Period</span>
                      <span className="font-medium">{viewingReport.data.period || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Total Logs</span>
                      <span className="font-medium">{viewingReport.data.logsCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Average Sleep</span>
                      <span className="font-medium">{viewingReport.data.averageSleep} hrs</span>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Average Weight</span>
                      <span className="font-medium">{viewingReport.data.averageWeight} kg</span>
                    </div>
                  </div>

                  {viewingReport.data.recentLogs && viewingReport.data.recentLogs.length > 0 && (
                    <div>
                      <h4 className="font-bold border-b pb-2 mb-2">Recorded Activity</h4>
                      <div className="space-y-2">
                        {viewingReport.data.recentLogs.map((l: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm py-1 border-b border-dashed">
                            <span>{new Date(l.date).toLocaleDateString()}</span>
                            <span className="text-muted-foreground">{l.symptoms || l.feeding || "Routine Check"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-muted-foreground italic">
                  No detailed data available for this report.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-muted-foreground">
              <p>Generated by Nino Care App. Consult your pediatrician for medical advice.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setViewingReport(null)}>Close</Button>
            <Button onClick={() => window.print()}>Print</Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav items={navItems} />
    </div>
  );
};

export default Reports;
