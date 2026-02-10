import { 
  FileSearch, 
  Check, 
  X, 
  User,
  Calendar,
  Eye,
  Home,
  UserCheck,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";
import { StatusBadge } from "@/components/StatusBadge";

const navItems = [
  { icon: Home, label: "Home", path: "/admin/dashboard" },
  { icon: UserCheck, label: "Validate", path: "/admin/validation" },
  { icon: FileSearch, label: "Content", path: "/admin/content-review" },
  { icon: Trash2, label: "Requests", path: "/admin/delete-requests" },
];

const pendingContent = [
  {
    id: "CNT-001",
    title: "Common Childhood Vaccinations",
    author: "Dr. Emily Chen",
    authorType: "Pediatrician",
    submittedAt: "Dec 5, 2024",
    preview: "Understanding the importance of childhood vaccinations and the recommended schedule for infants and toddlers...",
  },
  {
    id: "CNT-002",
    title: "Baby Sleep Training Methods",
    author: "Dr. Sarah Miller",
    authorType: "Child Psychologist",
    submittedAt: "Dec 4, 2024",
    preview: "Exploring gentle and effective sleep training techniques for babies aged 4-12 months, including the gradual retreat method...",
  },
  {
    id: "CNT-003",
    title: "Recognizing Allergies in Infants",
    author: "Dr. James Wilson",
    authorType: "Neonatologist",
    submittedAt: "Dec 3, 2024",
    preview: "How to identify common food allergies and environmental sensitivities in babies, and when to seek medical attention...",
  },
  {
    id: "CNT-004",
    title: "Breastfeeding vs Formula Feeding",
    author: "Dr. Maria Garcia",
    authorType: "Pediatric Nutritionist",
    submittedAt: "Dec 2, 2024",
    preview: "A balanced look at both feeding methods, nutritional considerations, and how to make the best choice for your baby...",
  },
];

const ContentReview = () => {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          title="Content Review"
          subtitle={`${pendingContent.length} articles pending review`}
          backTo="/admin/dashboard"
        />

        <div className="space-y-4">
          {pendingContent.map((content, index) => (
            <Card
              key={content.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">{content.id}</span>
                  <StatusBadge status="pending" />
                </div>

                <h3 className="font-bold text-foreground mb-2">{content.title}</h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                    <User size={12} className="text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{content.author}</p>
                    <p className="text-xs text-muted-foreground">{content.authorType}</p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-3 mb-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {content.preview}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <Calendar size={12} />
                  <span>Submitted: {content.submittedAt}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Eye size={14} />
                    Preview
                  </Button>
                  <div className="flex-1" />
                  <Button size="sm" variant="success" className="gap-2">
                    <Check size={14} />
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2 text-destructive">
                    <X size={14} />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav items={navItems} />
    </div>
  );
};

export default ContentReview;
