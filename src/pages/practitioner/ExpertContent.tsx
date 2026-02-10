import { useEffect, useMemo, useState } from "react";
import { 
  FileText, 
  Plus, 
  Send,
  Home,
  MessageCircleQuestion,
  User,
  Calendar,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { StatusBadge } from "@/components/StatusBadge";
import { contentAPI } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
  { icon: Home, label: "Home", path: "/practitioner/dashboard" },
  { icon: MessageCircleQuestion, label: "Queries", path: "/practitioner/queries" },
  { icon: FileText, label: "Content", path: "/practitioner/content" },
  { icon: User, label: "Profile", path: "/practitioner/profile" },
];

const ExpertContent = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const loadList = async () => {
    try {
      setLoading(true);
      const data = await contentAPI.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  const openDetail = async (id: string) => {
    try {
      setSelectedId(id);
      const data = await contentAPI.getById(id);
      setSelected(data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load content details");
    }
  };

  const formattedDate = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return "";
    }
  };

  const onPublishNew = async () => {
    try {
      const t = title.trim();
      const d = description.trim();
      const b = content.trim();
      if (!t || !d || !b) {
        toast.error("Please fill title, description, and content");
        return;
      }

      const created = await contentAPI.create({ title: t, description: d, body: b });
      toast.success("Submitted for admin approval");
      setShowForm(false);
      setTitle("");
      setDescription("");
      setContent("");
      await loadList();
      if (created?._id) {
        await openDetail(created._id);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to publish content");
    }
  };

  const publishExisting = async (id: string) => {
    try {
      await contentAPI.publish(id);
      toast.success("Published");
      await loadList();
      if (selectedId === id) {
        const data = await contentAPI.getById(id);
        setSelected(data);
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to publish");
    }
  };

  const listSubtitle = useMemo(() => {
    if (loading) return "Loading...";
    return `${items.length} article${items.length === 1 ? "" : "s"}`;
  }, [items.length, loading]);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
      <DesktopNav items={navItems} />
      
      <div className="px-4 pt-6 max-w-lg mx-auto md:max-w-4xl md:pt-4">
        <PageHeader
          title="Expert Content"
          subtitle={selectedId ? "Full details" : listSubtitle}
          backTo="/practitioner/dashboard"
          actions={
            !showForm && !selectedId && (
              <Button size="sm" className="gap-2" onClick={() => setShowForm(true)}>
                <Plus size={16} />
                New
              </Button>
            )
          }
        />

        {selectedId ? (
          <div className="animate-slide-up md:max-w-2xl md:mx-auto">
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => { setSelectedId(null); setSelected(null); }}>
              ← Back to list
            </Button>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">{selected?.title || "Content"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge status={selected?.status || "pending"} />
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye size={12} />
                    <span>{selected?.views ?? 0} views</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{selected?.description || ""}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  <span>{formattedDate(selected?.approvedAt || selected?.createdAt)}</span>
                </div>
                <div className="bg-muted/40 rounded-xl p-4">
                  <p className="text-sm whitespace-pre-wrap">{selected?.body || ""}</p>
                </div>
                {selected?.status === "pending" && (
                  <p className="text-xs text-muted-foreground">
                    Waiting for admin approval.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : showForm ? (
          // Content Form
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="text-lg">New Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter article title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the content"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content Body</Label>
                <Textarea
                  id="content"
                  placeholder="Write your article content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] rounded-xl resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowForm(false);
                    setTitle("");
                    setDescription("");
                    setContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button className="flex-1 gap-2" onClick={onPublishNew}>
                  <Send size={16} />
                  Publish
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Content List
          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {items.map((item, index) => (
              <Card
                key={item._id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => openDetail(item._id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground pr-2">{item.title}</h3>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formattedDate(item.approvedAt || item.createdAt)}</span>
                    </div>
                    {item.status === "approved" && (
                      <div className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{item.views} views</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!loading && items.length === 0 && (
              <Card className="md:col-span-2">
                <CardContent className="py-6 text-sm text-muted-foreground">
                  No content yet. Click <span className="font-semibold">New</span> to add one.
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <BottomNav items={navItems} />
    </div>
  );
};

export default ExpertContent;
