import { useState, useEffect } from "react";
import {
    Syringe,
    Plus,
    Trash2,
    Edit,
    Save,
    X,
    Home,
    Users,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { DesktopNav } from "@/components/DesktopNav";
import { BottomNav } from "@/components/BottomNav";
import { globalVaccineAPI } from "@/lib/api";
import { toast } from "sonner";

const navItems = [
    { icon: Home, label: "Admin", path: "/admin/dashboard" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: FileText, label: "Articles", path: "/admin/content" },
    { icon: Syringe, label: "Vaccines", path: "/admin/vaccines" },
];

const AdminVaccines = () => {
    const [vaccines, setVaccines] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isaddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingVaccine, setEditingVaccine] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        ageCategory: "",
        weeks: 0,
        mandatory: true
    });

    useEffect(() => {
        loadVaccines();
    }, []);

    const loadVaccines = async () => {
        try {
            setLoading(true);
            const data = await globalVaccineAPI.getAll();
            setVaccines(data);
        } catch (error) {
            toast.error("Failed to load vaccines");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.ageCategory) {
            toast.error("Name and Age Category are required");
            return;
        }

        try {
            if (editingVaccine) {
                await globalVaccineAPI.update(editingVaccine._id, formData);
                toast.success("Vaccine updated");
            } else {
                await globalVaccineAPI.create(formData);
                toast.success("Vaccine added");
            }
            setIsAddDialogOpen(false);
            setEditingVaccine(null);
            resetForm();
            loadVaccines();
        } catch (error: any) {
            toast.error(error.message || "Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This will remove the vaccine from future schedules.")) return;
        try {
            await globalVaccineAPI.delete(id);
            toast.success("Vaccine deleted");
            loadVaccines();
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const openEdit = (vaccine: any) => {
        setEditingVaccine(vaccine);
        setFormData({
            name: vaccine.name,
            description: vaccine.description || "",
            ageCategory: vaccine.ageCategory,
            weeks: vaccine.weeks,
            mandatory: vaccine.mandatory
        });
        setIsAddDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            ageCategory: "",
            weeks: 0,
            mandatory: true
        });
        setEditingVaccine(null);
    };

    return (
        <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
            <DesktopNav items={navItems} /> {/* Updated nav items will be passed here */}

            <div className="px-4 mt-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Global Vaccine Schedule</h1>
                        <p className="text-muted-foreground">Manage the standard vaccination schedule for all babies</p>
                    </div>

                    <Dialog open={isaddDialogOpen} onOpenChange={(open) => {
                        setIsAddDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button gap-2>
                                <Plus size={16} />
                                Add Vaccine
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingVaccine ? "Edit Vaccine" : "Add New Vaccine"}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Vaccine Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. BCG"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g. Prevents Tuberculosis"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Age Category</Label>
                                        <Input
                                            value={formData.ageCategory}
                                            onChange={e => setFormData({ ...formData, ageCategory: e.target.value })}
                                            placeholder="e.g. At Birth"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Weeks from Birth</Label>
                                        <Input
                                            type="number"
                                            value={formData.weeks}
                                            onChange={e => setFormData({ ...formData, weeks: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="mandatory"
                                        checked={formData.mandatory}
                                        onCheckedChange={(checked) => setFormData({ ...formData, mandatory: checked as boolean })}
                                    />
                                    <Label htmlFor="mandatory">Mandatory / Standard</Label>
                                </div>

                                <Button className="w-full" onClick={handleSubmit}>
                                    {editingVaccine ? "Update Vaccine" : "Add Vaccine"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="grid gap-4">
                        {vaccines.map((vaccine) => (
                            <Card key={vaccine._id} className="overflow-hidden">
                                <CardContent className="p-0 flex items-center">
                                    <div className="w-2 bg-primary self-stretch"></div>
                                    <div className="p-4 flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-lg">{vaccine.name}</h3>
                                                    <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase tracking-wider">
                                                        {vaccine.ageCategory}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">{vaccine.description}</p>
                                                <p className="text-xs text-muted-foreground mt-2">Due {vaccine.weeks} weeks after birth</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(vaccine)}>
                                                    <Edit size={16} className="text-muted-foreground" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(vaccine._id)}>
                                                    <Trash2 size={16} className="text-destructive" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {vaccines.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                                No global vaccines configured.
                            </div>
                        )}
                    </div>
                )}
            </div>

            <BottomNav items={navItems} />
        </div>
    );
};

export default AdminVaccines;
