"use client";

import { useEffect, useState } from "react";
import { translateText } from "@/lib/translate";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { Languages, Download, Copy, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface TranslateButtonProps {
  content: string;
  documentId: Id<"documents">;
}

interface Translation {
  _id: string;
  targetLang: string;
  content: string;
  createdAt: number;
}

// Component to display language selector, translate button, and translated content
export function TranslateButton({ content, documentId }: TranslateButtonProps) {
  const [translated, setTranslated] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState("Hindi");
  const [showTranslations, setShowTranslations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  // Convex mutations and queries
  const saveTranslation = useMutation(api.documents.saveTranslation);
  const savedTranslations = useQuery(api.documents.getTranslations, { documentId });

  // Language options
  const languages = [
    { value: "Hindi", label: "Hindi" },
    { value: "Spanish", label: "Spanish" },
    { value: "French", label: "French" },
    { value: "German", label: "German" },
    { value: "Italian", label: "Italian" },
    { value: "Portuguese", label: "Portuguese" },
    { value: "Russian", label: "Russian" },
    { value: "Japanese", label: "Japanese" },
    { value: "Korean", label: "Korean" },
    { value: "Chinese", label: "Chinese" },
    { value: "Arabic", label: "Arabic" },
    { value: "Dutch", label: "Dutch" },
    { value: "Swedish", label: "Swedish" },
    { value: "Norwegian", label: "Norwegian" },
    { value: "Danish", label: "Danish" },
    { value: "Finnish", label: "Finnish" },
    { value: "Polish", label: "Polish" },
    { value: "Turkish", label: "Turkish" },
    { value: "Greek", label: "Greek" },
    { value: "Hebrew", label: "Hebrew" },
  ];

  // Handle translation process and save result to DB
  const handleTranslate = async () => {
    if (!content.trim()) {
      toast.error("No content to translate");
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    setStatusMessage("Initializing translation...");
    
    try {
      // Show progress for documents that need chunking
      const needsChunking = content.length > 400;
      if (needsChunking) {
        setProgress(5);
        setStatusMessage("Preparing document for translation...");
        toast.info("Processing document in small chunks for optimal translation quality.");
      }

      const translatedText = await translateText(content, selectedLang);
      setTranslated(translatedText);
      setRetryCount(0);
      setProgress(100);
      setStatusMessage("Translation completed!");

      // Check if this is advanced translation or fallback
      if (translatedText.includes("[Advanced translation")) {
        setIsAdvancedMode(false);
        toast.warning("Using basic translation mode. Try common phrases like 'Hello', 'Thank you', 'How are you', 'I love you', 'Yes', 'No', or 'Goodbye'.");
      } else {
        setIsAdvancedMode(true);
        const message = needsChunking 
          ? `Document translated to ${selectedLang} using advanced AI translation (processed in chunks)`
          : `Document translated to ${selectedLang} using advanced AI translation`;
        toast.success(message);
      }

      await saveTranslation({
        documentId,
        targetLang: selectedLang,
        content: translatedText,
      });
    } catch (err: any) {
      console.error("Translation error:", err);
      const errorMessage = err.message || "Translation failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      setRetryCount(prev => prev + 1);
      setProgress(0);
      setStatusMessage("Translation failed");
    } finally {
      setLoading(false);
    }
  };

  // Retry translation
  const handleRetry = () => {
    setError(null);
    setProgress(0);
    setStatusMessage("");
    handleTranslate();
  };

  // Copy translated text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  // Download translated text as file
  const downloadTranslation = (text: string, lang: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translation-${lang}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Translation downloaded");
  };

  return (
    <div className="mt-8 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Advanced Document Translation
          </CardTitle>
          <CardDescription>
            Translate your document content to different languages using multiple AI-powered translation services. 
            Documents are automatically processed in small chunks (400 characters) to ensure reliable translation without length limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                {retryCount < 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="ml-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert for Advanced Translation */}
          {isAdvancedMode && translated && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Translation completed using advanced AI-powered services for high-quality results.
                {content.length > 400 && " Document processed in small chunks to avoid length limits."}
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Bar for Translation */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Language selection and translate button */}
          <div className="flex items-center gap-2">
            <Select value={selectedLang} onValueChange={setSelectedLang}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleTranslate} 
              disabled={loading || !content.trim() || retryCount >= 3}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {content.length > 400 ? "Processing..." : "Translating..."}
                </>
              ) : (
                "Translate"
              )}
            </Button>
          </div>

          {/* Document processing info */}
          {content.length > 400 && (
            <p className="text-sm text-muted-foreground">
              📄 Document length: {content.length} characters. Will be processed in small chunks (400 chars each) to avoid translation limits.
            </p>
          )}

          {/* Show translation mode indicator */}
          {translated && (
            <p className="text-sm text-muted-foreground">
              {isAdvancedMode ? (
                <span className="text-green-600">✓ Advanced AI translation mode</span>
              ) : (
                <span className="text-orange-600">⚠ Basic translation mode - limited to common phrases</span>
              )}
            </p>
          )}

          {/* Show current translation */}
          {translated && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Translation ({selectedLang})</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(translated)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTranslation(translated, selectedLang)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                value={translated}
                readOnly
                rows={8}
                className="w-full resize-none"
                placeholder="Translation will appear here..."
              />
            </div>
          )}

          {/* Show saved translations */}
          {savedTranslations && savedTranslations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Saved Translations</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTranslations(!showTranslations)}
                >
                  {showTranslations ? "Hide" : "Show"}
                </Button>
              </div>
              
              {showTranslations && (
                <div className="space-y-3">
                  {savedTranslations.map((translation: Translation) => (
                    <Card key={translation._id} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {translation.targetLang}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(translation.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTranslation(translation.content, translation.targetLang)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={translation.content}
                        readOnly
                        rows={4}
                        className="w-full resize-none text-sm"
                      />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
