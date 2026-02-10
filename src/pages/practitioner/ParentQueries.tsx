import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  MessageCircleQuestion,
  Send,
  Baby,
  User,
  Home,
  FileText,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { StatusBadge } from "@/components/StatusBadge";
import { queryAPI } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { icon: Home, label: "Home", path: "/practitioner/dashboard" },
  { icon: MessageCircleQuestion, label: "Queries", path: "/practitioner/queries" },
  { icon: FileText, label: "Content", path: "/practitioner/content" },
  { icon: User, label: "Profile", path: "/practitioner/profile" },
];

const ParentQueries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate(); // Still useful if we need imperative navigation, but useSearchParams handles most

  // Derive state from URL
  const statusFilter = (searchParams.get("status") as "pending" | "answered" | "all") || "pending";
  const selectedQuery = searchParams.get("id");

  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");

  const selectedQueryData = useMemo(
    () => queries.find((q) => q._id === selectedQuery),
    [queries, selectedQuery]
  );

  const formatRelative = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const min = Math.floor(diffMs / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min} min ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr} hr${hr === 1 ? "" : "s"} ago`;
    const days = Math.floor(hr / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  const loadQueries = async (status: string) => {
    try {
      setLoading(true);
      const data = await queryAPI.getAll(status);
      setQueries(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load queries");
    } finally {
      setLoading(false);
    }
  };

  // Load queries when status filter changes
  useEffect(() => {
    loadQueries(statusFilter);
  }, [statusFilter]);

  // Update response input when selected query changes
  useEffect(() => {
    if (selectedQueryData?.response) setResponse(selectedQueryData.response);
    else setResponse("");
  }, [selectedQueryData]);

  const updateStatus = (newStatus: "pending" | "answered" | "all") => {
    setSearchParams({ status: newStatus });
    // ID is automatically removed when switching status as we replace the whole search params
  };

  const selectQuery = (id: string | null) => {
    if (id) {
      setSearchParams({ status: statusFilter, id });
    } else {
      setSearchParams({ status: statusFilter });
    }
  };

  const submitResponse = async () => {
    try {
      if (!selectedQueryData?._id) return;
      if (selectedQueryData.status !== "pending") return;
      const trimmed = response.trim();
      if (!trimmed) {
        toast.error("Please enter a response");
        return;
      }
      const updated = await queryAPI.respond(selectedQueryData._id, trimmed);
      toast.success("Response submitted");
      setResponse("");

      // Update local state immediately to reflect change
      setQueries(prev => prev.map(q =>
        q._id === selectedQueryData._id ? { ...q, status: 'answered', response: trimmed, practitionerId: updated.practitionerId } : q
      ));

      // If filtering by pending, remove it from list
      if (statusFilter === 'pending') {
        setQueries(prev => prev.filter(q => q._id !== selectedQueryData._id));
        selectQuery(null);
      } else {
        // for 'all' or 'answered', keep it selected but updated
        // force reload to be sure
        await loadQueries(statusFilter);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit response");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
      <DesktopNav items={navItems} />

      <div className="px-4 pt-6 max-w-lg mx-auto md:max-w-4xl md:pt-4">
        <PageHeader
          title="Parent Queries"
          subtitle={loading ? "Loading..." : `${queries.length} ${statusFilter === "all" ? "" : statusFilter} question${queries.length === 1 ? "" : "s"}`}
          backTo="/practitioner/dashboard"
        />

        <div className="flex gap-2 mb-4">
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            size="sm"
            onClick={() => updateStatus("pending")}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === "answered" ? "default" : "outline"}
            size="sm"
            onClick={() => updateStatus("answered")}
          >
            Answered
          </Button>
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => updateStatus("all")}
          >
            All
          </Button>
        </div>

        {selectedQuery === null ? (
          // Query List
          // Query List
          <div className="space-y-2">
            {queries.map((query, index) => (
              <div
                key={query._id}
                className="group flex items-center justify-between p-4 bg-card hover:bg-muted/50 border rounded-xl cursor-pointer transition-all animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => selectQuery(query._id)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Baby size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-sm truncate">{query?.parentId?.fullName || "Parent"}</p>
                      <span className="text-muted-foreground hidden md:inline">•</span>
                      <p className="text-xs text-muted-foreground hidden md:block">
                        {query?.parentId?.babyName ? `Baby: ${query.parentId.babyName}` : "Baby: —"}
                      </p>
                    </div>
                    <p className="text-sm text-foreground/90 truncate pr-4">{query.question}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                  <StatusBadge status={query.status} />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock size={10} />
                    <span>{formatRelative(query.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
            {!loading && queries.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="py-6 text-sm text-muted-foreground">
                  No queries found.
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // Query Detail
          <div className="animate-slide-up md:max-w-2xl md:mx-auto">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4"
              onClick={() => {
                selectQuery(null);
                setResponse("");
              }}
            >
              ← Back to list
            </Button>

            {selectedQueryData && (
              <>
                {/* Parent & Baby Info */}
                <Card className="mb-4">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl gradient-warm flex items-center justify-center">
                        <Baby size={24} className="text-warning-foreground" />
                      </div>
                      <div>
                        <p className="font-bold">{selectedQueryData?.parentId?.fullName || "Parent"}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedQueryData?.parentId?.babyName ? `Baby: ${selectedQueryData.parentId.babyName}` : "Baby: —"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Query */}
                <Card className="mb-4">
                  <CardContent className="py-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">QUERY</h4>
                    <p className="text-foreground">{selectedQueryData.question}</p>

                    {/* Attachments */}
                    {selectedQueryData.attachments && selectedQueryData.attachments.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                        {selectedQueryData.attachments.map((att: string, idx: number) => (
                          <div
                            key={idx}
                            className="aspect-square rounded-xl bg-muted overflow-hidden border cursor-pointer hover:opacity-90 relative group"
                            onClick={() => window.open(att, '_blank')}
                          >
                            <img src={att} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={`Attachment ${idx + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2">
                      {formatRelative(selectedQueryData.createdAt)}
                    </p>
                  </CardContent>
                </Card>

                {selectedQueryData.category && (
                  <Card className="mb-4 bg-muted/50">
                    <CardContent className="py-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3">CATEGORY</h4>
                      <p className="text-sm font-medium">{selectedQueryData.category}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Response */}
                <Card className="mb-4">
                  <CardContent className="py-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">YOUR RESPONSE</h4>
                    <Textarea
                      placeholder="Type your professional response here..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      readOnly={selectedQueryData.status !== "pending"}
                      className="min-h-[120px] rounded-xl resize-none"
                    />
                    {selectedQueryData.status === "pending" ? (
                      <Button className="w-full mt-3 gap-2" onClick={submitResponse}>
                        <Send size={16} />
                        Submit Response
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">
                        This query is already answered.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>

      <BottomNav items={navItems} />
    </div>
  );
};

export default ParentQueries;
