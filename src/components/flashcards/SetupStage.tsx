
import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, Plus, FileText, Video, Image, Wand2 } from "lucide-react";
import { useFlashcardStore } from "@/store/flashcardStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SetupStage = () => {
  const { addCard, setStage } = useFlashcardStore();
  const [file, setFile] = useState<File | null>(null);
  const [videoURL, setVideoURL] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [manualCard, setManualCard] = useState({
    question: "",
    answer: "",
    subject: "",
    week: "",
    difficulty: "medium" as const,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Please upload a PDF, image, or text file');
        return;
      }
      
      setFile(selectedFile);
      toast.success(`File "${selectedFile.name}" selected successfully`);
    }
  };

  const handleGenerateFromContent = async () => {
    if (!file && !videoURL) {
      toast.error('Please upload a file or enter a video URL');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('file', file);
      }
      
      if (videoURL) {
        formData.append('videoURL', videoURL);
      }
      
      formData.append('subject', manualCard.subject || 'General');

      console.log('Calling generate-flashcards function...');
      
      const { data, error } = await supabase.functions.invoke('generate-flashcards', {
        body: formData,
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to generate flashcards');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const { flashcards, extractedContent } = data;
      
      if (!flashcards || flashcards.length === 0) {
        throw new Error('No flashcards were generated from the content');
      }

      console.log('Generated flashcards:', flashcards);
      
      // Add each generated flashcard to the store
      flashcards.forEach((card: any) => {
        addCard({
          question: card.question,
          answer: card.answer,
          subject: card.subject,
          difficulty: card.difficulty as 'easy' | 'medium' | 'hard',
        });
      });

      toast.success(`Successfully generated ${flashcards.length} flashcards!`);
      
      // Clear the form
      setFile(null);
      setVideoURL("");
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Move to next stage
      setStage(2);
      
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddManualCard = () => {
    if (manualCard.question.trim() && manualCard.answer.trim()) {
      addCard(manualCard);
      setManualCard({
        question: "",
        answer: "",
        subject: "",
        week: "",
        difficulty: "medium",
      });
      toast.success('Flashcard added successfully!');
    } else {
      toast.error('Please fill in both question and answer fields');
    }
  };

  const handleContinueToOrganize = () => {
    setStage(2);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h2 className="text-4xl font-bold mb-4">Create Your Flashcards</h2>
        <p className="text-[#93A5CF] text-lg">
          Upload content for AI generation or create cards manually
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* AI Generation Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1C2541] p-8 rounded-2xl border border-[#2563EB]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Wand2 className="text-[#2563EB]" size={24} />
            <h3 className="text-2xl font-semibold">AI Generation</h3>
          </div>

          <div className="space-y-6">
            {/* Subject Input for AI Generation */}
            <div>
              <label className="block text-sm font-medium text-[#93A5CF] mb-2">
                Subject (optional)
              </label>
              <Input
                placeholder="e.g., Math, Science, History..."
                value={manualCard.subject}
                onChange={(e) => setManualCard({ ...manualCard, subject: e.target.value })}
                className="bg-[#0A0E27] border-[#2563EB]/30"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-[#93A5CF] mb-2">
                Upload PDF, Image, or Document
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="flex items-center justify-center w-full p-6 border-2 border-dashed border-[#2563EB]/30 rounded-xl hover:border-[#2563EB]/50 cursor-pointer transition-colors"
                >
                  <div className="text-center">
                    <Upload className="mx-auto mb-2 text-[#2563EB]" size={32} />
                    <p className="text-sm text-[#93A5CF]">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-[#93A5CF]/70 mt-1">
                      PDF, PNG, JPG, or TXT (max 10MB)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm font-medium text-[#93A5CF] mb-2">
                Or paste a video URL
              </label>
              <Input
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoURL}
                onChange={(e) => setVideoURL(e.target.value)}
                className="bg-[#0A0E27] border-[#2563EB]/30"
              />
            </div>

            <Button
              onClick={handleGenerateFromContent}
              disabled={(!file && !videoURL) || isGenerating}
              className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] h-12"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Wand2 size={16} />
                  </motion.div>
                  Generating Cards...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2" size={16} />
                  Generate Flashcards
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Manual Creation Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#1C2541] p-8 rounded-2xl border border-[#2563EB]/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <Plus className="text-[#2563EB]" size={24} />
            <h3 className="text-2xl font-semibold">Manual Creation</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#93A5CF] mb-2">
                Question
              </label>
              <Textarea
                placeholder="Enter your question..."
                value={manualCard.question}
                onChange={(e) => setManualCard({ ...manualCard, question: e.target.value })}
                className="bg-[#0A0E27] border-[#2563EB]/30 min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#93A5CF] mb-2">
                Answer
              </label>
              <Textarea
                placeholder="Enter the answer..."
                value={manualCard.answer}
                onChange={(e) => setManualCard({ ...manualCard, answer: e.target.value })}
                className="bg-[#0A0E27] border-[#2563EB]/30 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#93A5CF] mb-2">
                  Subject
                </label>
                <Input
                  placeholder="Math, Science..."
                  value={manualCard.subject}
                  onChange={(e) => setManualCard({ ...manualCard, subject: e.target.value })}
                  className="bg-[#0A0E27] border-[#2563EB]/30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#93A5CF] mb-2">
                  Difficulty
                </label>
                <Select 
                  value={manualCard.difficulty} 
                  onValueChange={(value: any) => setManualCard({ ...manualCard, difficulty: value })}
                >
                  <SelectTrigger className="bg-[#0A0E27] border-[#2563EB]/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1C2541] border-[#2563EB]/30">
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleAddManualCard}
              disabled={!manualCard.question.trim() || !manualCard.answer.trim()}
              className="w-full bg-[#2563EB] hover:bg-[#1E3A8A]"
            >
              <Plus className="mr-2" size={16} />
              Add Card
            </Button>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center mt-12"
      >
        <Button
          onClick={handleContinueToOrganize}
          size="lg"
          className="bg-gradient-to-r from-[#2563EB] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-[#1E40AF] px-8"
        >
          Continue to Organize →
        </Button>
      </motion.div>
    </div>
  );
};

export default SetupStage;
