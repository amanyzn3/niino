import { 
  Trash2, 
  Check, 
  X, 
  User,
  Calendar,
  MessageSquare,
  Home,
  UserCheck,
  FileSearch
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/PageHeader";
import { BottomNav } from "@/components/BottomNav";

const navItems = [
  { icon: Home, label: "Home", path: "/admin/dashboard" },
  { icon: UserCheck, label: "Validate", path: "/admin/validation" },
  { icon: FileSearch, label: "Content", path: "/admin/content-review" },
  { icon: Trash2, label: "Requests", path: "/admin/delete-requests" },
];

const deleteRequests = [
  {
    id: 1,
    userName: "Amanda Brown",
    userType: "Parent",
    email: "amanda.brown@email.com",
    requestDate: "Dec 5, 2024",
    reason: "Moving to a different healthcare platform. No longer using this service.",
    accountCreated: "Mar 15, 2024",
  },
  {
    id: 2,
    userName: "Dr. Robert Lee",
    userType: "Practitioner",
    email: "robert.lee@hospital.com",
    requestDate: "Dec 4, 2024",
    reason: "Retiring from practice. Please delete all my data.",
    accountCreated: "Jan 10, 2023",
  },
  {
    id: 3,
    userName: "Jennifer White",
    userType: "Parent",
    email: "jennifer.white@email.com",
    requestDate: "Dec 3, 2024",
    reason: "Privacy concerns. Want to remove all personal information.",
    accountCreated: "Aug 22, 2024",
  },
];

const DeleteRequests = () => {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          title="Delete Requests"
          subtitle={`${deleteRequests.length} pending requests`}
          backTo="/admin/dashboard"
        />

        <div className="space-y-4">
          {deleteRequests.map((request, index) => (
            <Card
              key={request.id}
              className="border-l-4 border-l-destructive animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <User size={22} className="text-destructive" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{request.userName}</h3>
                    <p className="text-xs text-muted-foreground">{request.userType}</p>
                    <p className="text-xs text-muted-foreground">{request.email}</p>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-foreground">{request.reason}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>Requested: {request.requestDate}</span>
                  </div>
                  <span>Member since: {request.accountCreated}</span>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" className="flex-1 gap-2">
                    <Check size={14} />
                    Approve Delete
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 gap-2">
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

export default DeleteRequests;
