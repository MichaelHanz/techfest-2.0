import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface PDFExportButtonProps {
  tripId: number;
  destination: string;
  variant?: "default" | "outline";
}

export default function PDFExportButton({
  tripId,
  destination,
  variant = "default",
}: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const exportPDF = trpc.trips.exportPDF.useMutation();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportPDF.mutateAsync({ tripId });

      // Decode base64 PDF and create blob
      const binaryString = atob(result.pdf);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/pdf" });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Trip plan exported successfully!");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export trip plan. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  if (variant === "outline") {
    return (
      <Button
        onClick={handleExport}
        disabled={isExporting}
        variant="outline"
        className="bg-transparent border-border text-foreground hover:bg-muted font-semibold uppercase tracking-wider py-2 text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Export PDF
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold uppercase tracking-wider py-2 text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export PDF
        </>
      )}
    </Button>
  );
}
