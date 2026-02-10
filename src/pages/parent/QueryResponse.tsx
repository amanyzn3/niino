import { useRef, useState, useEffect } from "react";
import {
  MessageCircleQuestion,
  Send,
  Search,
  Filter,
  Plus,
  Home,
  HeartPulse,
  Syringe,
  User,
  Star,
  Cloud,
  Leaf,
  ChevronDown,
  Paperclip,
  X,
  FileText,
  Clock,
  Bot,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BottomNav } from "@/components/BottomNav";
import { DesktopNav } from "@/components/DesktopNav";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { queryAPI, babyAPI } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const navItems = [
  { icon: Home, label: "Home", path: "/parent/dashboard" },
  { icon: HeartPulse, label: "Health", path: "/parent/health-log" },
  { icon: Syringe, label: "Vaccines", path: "/parent/vaccination" },
  { icon: MessageCircleQuestion, label: "Ask", path: "/parent/query" },
  { icon: User, label: "Profile", path: "/parent/profile" },
];

const QueryResponse = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [filter, setFilter] = useState("all");
  const [babies, setBabies] = useState<any[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);

  // Attachments
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // AI Chat State
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant', content: string, timestamp: Date }[]>([
    { role: 'assistant', content: "Hello! I'm Nino AI. How can I help you with your baby's health today?", timestamp: new Date() }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedBabyId) loadQueries(selectedBabyId);
  }, [selectedBabyId]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, isAiTyping]);

  const loadData = async () => {
    try {
      const babiesData = await babyAPI.getAll();
      setBabies(Array.isArray(babiesData) ? babiesData : []);
      if (Array.isArray(babiesData) && babiesData.length > 0) {
        const storedId = localStorage.getItem("selectedBabyId");
        if (storedId && babiesData.some((b: any) => b._id === storedId)) {
          setSelectedBabyId(storedId);
        } else {
          setSelectedBabyId(babiesData[0]._id);
        }
      }
    } catch (e) { console.error(e); }
  };

  const loadQueries = async (babyId: string) => {
    try {
      const data = await queryAPI.getAll(undefined, babyId);
      setQueries(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic size check (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File details too large (max 5MB)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setAttachments(prev => [...prev, reader.result as string]);
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!question.trim()) return;
    if (!selectedBabyId) {
      toast.error("Please select a baby first");
      return;
    }

    setLoading(true);
    try {
      await queryAPI.create({
        babyId: selectedBabyId,
        question: question,
        attachments: attachments
      });
      toast.success("Query sent successfully");
      setQuestion("");
      setAttachments([]);
      loadQueries(selectedBabyId);
    } catch (e: any) {
      toast.error(e.message || "Failed to send query");
    } finally {
      setLoading(false);
    }
  };

  const handleAiSend = () => {
    if (!aiInput.trim()) return;

    const userMsg = { role: 'user' as const, content: aiInput, timestamp: new Date() };
    setAiMessages(prev => [...prev, userMsg]);
    setAiInput("");
    setIsAiTyping(true);

    // Simulate AI processing
    setTimeout(() => {
      let responseText = "I see. Could you tell me more about that?";
      const lowerInput = userMsg.content.toLowerCase();

      if (lowerInput.includes("fever") || lowerInput.includes("temp")) {
        responseText = "A fever can be worrying. For babies under 3 months, a temperature of 38°C (100.4°F) or higher needs immediate medical attention. For older babies, keep them hydrated and monitor their behavior. If they seem lethargic or the fever persists, please consult a doctor.";
      } else if (lowerInput.includes("feed") || lowerInput.includes("milk")) {
        responseText = "Feeding frequency depends on your baby's age. Newborns usually feed every 2-3 hours. If you're concerned about their intake or weight gain, tracking their feeds in the Health Log can help discussed with your pediatrician.";
      } else if (lowerInput.includes("sleep")) {
        responseText = "Sleep patterns change rapidly. Establish a consistent bedtime routine. If your baby is waking up frequently, check if they are hungry, uncomfortable, or just need soothing.";
      } else if (lowerInput.includes("vaccin")) {
        responseText = "Vaccinations are crucial for your baby's health. You can check the upcoming schedule in the Vaccination tab. Always consult your doctor if your baby is unwell before a scheduled vaccine.";
      }

      setAiMessages(prev => [...prev, { role: 'assistant', content: responseText, timestamp: new Date() }]);
      setIsAiTyping(false);
    }, 1500);
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

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          {babies.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white rounded-full px-4 h-auto py-2 flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-white/20 p-1">
                    <div className="w-full h-full rounded-full bg-gradient-to-b from-white/80 to-white/60 flex items-center justify-center overflow-hidden">
                      {currentBaby?.avatar ? <img src={currentBaby.avatar} className="w-full h-full object-cover" /> : <MessageCircleQuestion className="w-6 h-6 text-primary/60" />}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold">{currentBaby?.name || "Consultation"}</span>
                    <ChevronDown size={16} className="text-white/80" />
                  </div>
                  <span className="text-white/80 text-xs font-normal">Ask for Help</span>
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
              <h1 className="text-xl font-bold text-white">Ask Expert</h1>
              <p className="text-white/80 text-sm">Please add a baby profile</p>
            </div>
          )}
        </div>
      </header>

      <div className="px-4 mt-6 max-w-lg mx-auto md:max-w-4xl">
        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12 rounded-xl bg-muted/50 p-1">
            <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              Nino AI Assistant
            </TabsTrigger>
            <TabsTrigger value="expert" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
              <User size={16} className="text-primary" />
              Ask an Expert
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="animate-slide-up">
            <Card className="border-0 shadow-lg h-[60vh] flex flex-col overflow-hidden bg-white/80 backdrop-blur-sm">
              <CardContent className="flex-1 p-0 flex flex-col h-full">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {aiMessages.map((msg, i) => (
                      <div key={i} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[80%] rounded-2xl p-3 px-4 text-sm shadow-sm",
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-none"
                            : "bg-white border border-border text-foreground rounded-tl-none"
                        )}>
                          <p>{msg.content}</p>
                          <p className={cn("text-[10px] mt-1 opacity-70", msg.role === 'user' ? "text-primary-foreground" : "text-muted-foreground")}>
                            {format(msg.timestamp, "h:mm a")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isAiTyping && (
                      <div className="flex w-full justify-start">
                        <div className="bg-white border border-border rounded-2xl rounded-tl-none p-3 px-4 shadow-sm flex items-center gap-1">
                          <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                <div className="p-3 bg-white border-t flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    className="rounded-full bg-muted/50 border-0 focus-visible:ring-1"
                    value={aiInput}
                    onChange={e => setAiInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAiSend()}
                  />
                  <Button size="icon" className="rounded-full flex-shrink-0" onClick={handleAiSend} disabled={!aiInput.trim() || isAiTyping}>
                    <Send size={18} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expert" className="animate-slide-up">
            {/* New Query Input */}
            {selectedBabyId && (
              <Card className="mb-6 bg-background shadow-md border-primary/20">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                      {currentBaby?.avatar ? <img src={currentBaby.avatar} className="w-full h-full object-cover" /> : <User className="w-6 h-6 m-2 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <Textarea
                        placeholder={`Ask a question about ${currentBaby?.name}...`}
                        className="resize-none border-0 focus-visible:ring-0 p-0 shadow-none min-h-[60px]"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {attachments.map((att, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-md bg-muted overflow-hidden border">
                          <img src={att} className="w-full h-full object-cover" />
                          <button
                            onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl-md"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t mt-2">
                    <div className="flex gap-2">
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                      <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                        <Paperclip size={18} className="text-muted-foreground" />
                      </Button>
                    </div>
                    <Button size="sm" onClick={handleSend} disabled={!question.trim() || loading || isUploading} className="gap-2">
                      {loading ? "Sending..." : <><Send size={16} /> Send Request</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">RECENT CONSULTATIONS</h3>
            </div>

            <div className="space-y-4 pb-8">
              {queries.length === 0 && <p className="text-center text-muted-foreground py-8">No queries found for {currentBaby?.name}.</p>}
              {queries.map((q, i) => (
                <Card key={q._id} className="animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-muted-foreground">{format(new Date(q.createdAt), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="font-medium text-base">{q.question}</p>
                    {q.attachments && q.attachments.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {q.attachments.map((att: string, idx: number) => (
                          <div key={idx} className="w-12 h-12 rounded bg-muted overflow-hidden border">
                            <img src={att} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {q.response && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-3 border-l-2 border-primary">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                            <User size={12} className="text-primary" />
                          </div>
                          <span className="text-xs font-semibold text-primary">{q.practitionerId?.fullName || "Dr. Expert"}</span>
                        </div>
                        <p className="text-sm text-foreground/90">{q.response}</p>
                      </div>
                    )}

                    {!q.response && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <Clock size={12} /> Awaiting response...
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav items={navItems} />
    </div>
  );
};

export default QueryResponse;
