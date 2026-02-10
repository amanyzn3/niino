import { 
  UserCheck, 
  Check, 
  X, 
  Stethoscope,
  Baby,
  Mail,
  Phone,
  FileCheck,
  Home,
  FileSearch,
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

const pendingProfiles = [
  {
    id: 1,
    name: "Dr. James Wilson",
    type: "practitioner",
    email: "james.wilson@clinic.com",
    phone: "+1 (555) 234-5678",
    specialization: "Neonatologist",
    license: "MD-11223344",
    qualification: "MBBS, MD Neonatology",
    submittedAt: "Dec 5, 2024",
  },
  {
    id: 2,
    name: "Dr. Maria Garcia",
    type: "practitioner",
    email: "maria.garcia@hospital.com",
    phone: "+1 (555) 345-6789",
    specialization: "Pediatric Nutritionist",
    license: "RD-55667788",
    qualification: "MS Nutrition, RD",
    submittedAt: "Dec 4, 2024",
  },
  {
    id: 3,
    name: "John Smith",
    type: "parent",
    email: "john.smith@email.com",
    phone: "+1 (555) 456-7890",
    babyName: "Oliver",
    submittedAt: "Dec 4, 2024",
  },
];

const ProfileValidation = () => {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <PageHeader
          title="Profile Validation"
          subtitle={`${pendingProfiles.length} profiles pending review`}
          backTo="/admin/dashboard"
        />

        <div className="space-y-4">
          {pendingProfiles.map((profile, index) => (
            <Card
              key={profile.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      profile.type === "practitioner" ? "bg-accent" : "gradient-warm"
                    }`}
                  >
                    {profile.type === "practitioner" ? (
                      <Stethoscope size={22} className="text-accent-foreground" />
                    ) : (
                      <Baby size={22} className="text-warning-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">{profile.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {profile.type}
                        </p>
                      </div>
                      <StatusBadge status="pending" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{profile.phone}</span>
                  </div>
                  {profile.type === "practitioner" && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <Stethoscope size={14} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{profile.specialization}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileCheck size={14} className="text-muted-foreground" />
                        <span className="text-muted-foreground">{profile.license}</span>
                      </div>
                    </>
                  )}
                  {profile.type === "parent" && profile.babyName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Baby size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">Baby: {profile.babyName}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  Submitted: {profile.submittedAt}
                </p>

                <div className="flex gap-2">
                  <Button size="sm" variant="success" className="flex-1 gap-2">
                    <Check size={14} />
                    Accept
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1 gap-2 text-destructive">
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

export default ProfileValidation;
