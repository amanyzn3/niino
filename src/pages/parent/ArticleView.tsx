import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, User, FileText, Leaf, Star, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contentAPI } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const ArticleView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadArticle(id);
        }
    }, [id]);

    const loadArticle = async (articleId: string) => {
        try {
            setLoading(true);
            const data = await contentAPI.getById(articleId, { view: true });
            setArticle(data);
        } catch (error: any) {
            toast.error("Failed to load article");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading article...</div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <h2 className="text-xl font-bold mb-4">Article Not Found</h2>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Header with Nino Care aesthetics */}
            <header className="relative h-48 rounded-b-[2.5rem] overflow-hidden" style={{
                background: 'linear-gradient(180deg, hsl(120, 18%, 55%) 0%, hsl(170, 30%, 58%) 100%)'
            }}>
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
                <Cloud className="absolute top-24 left-4 w-12 h-12 text-white/20 fill-white/10" />

                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 pt-8 text-center">
                    <h1 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wider line-clamp-2 max-w-sm">
                        Expert Advice
                    </h1>
                    <p className="text-white/80 text-xs mt-1 uppercase tracking-widest font-medium">Article View</p>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 left-4 text-white hover:bg-white/20"
                    onClick={() => navigate(-1)}
                >
                    <ChevronLeft size={24} />
                </Button>
            </header>

            <main className="px-5 -mt-6 max-w-2xl mx-auto">
                <div className="bg-card rounded-3xl p-6 shadow-soft border-0">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border">
                            {article.practitionerId?.avatar ? (
                                <img src={article.practitionerId.avatar} className="w-full h-full object-cover" />
                            ) : (
                                <User size={20} className="text-primary/60" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-sm">{article.practitionerId?.fullName}</h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                                {article.practitionerId?.specialization || "Expert Practitioner"}
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-foreground leading-tight mb-4">{article.title}</h2>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6 pb-6 border-b">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {article.approvedAt ? format(new Date(article.approvedAt), "MMM d, yyyy") : "Recently published"}
                        </span>
                        <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {Math.ceil(article.body.split(" ").length / 200)} min read
                        </span>
                    </div>

                    <div className="prose prose-sm max-w-none text-foreground/80 leading-relaxed space-y-4">
                        {article.body.split('\n').map((para: string, i: number) => (
                            para ? <p key={i}>{para}</p> : <br key={i} />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ArticleView;
