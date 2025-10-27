import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";
import type { BulkLessonCreate } from "../../apis/lessons/lessonAPI";
import { getAllTopics } from "../../apis/topics/topicAPI";
import type { TopicModel } from "../../services/apiModel";
import BulkLessonCard from "./BulkLessonCard";

interface BulkLessonModalProps {
  open: boolean;
  onClose: () => void;
  bulkLessons: BulkLessonCreate[];
  setBulkLessons: React.Dispatch<React.SetStateAction<BulkLessonCreate[]>>;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
  onError: (message: string) => void;
}

const BulkLessonModal: React.FC<BulkLessonModalProps> = ({
  open,
  onClose,
  bulkLessons,
  setBulkLessons,
  onSubmit,
  isSubmitting,
  onError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [topics, setTopics] = useState<TopicModel[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // Fetch topics when modal opens
  useEffect(() => {
    if (open) {
      const fetchTopics = async () => {
        setLoadingTopics(true);
        try {
          const topicsData = await getAllTopics();
          setTopics(topicsData);
        } catch (error) {
          console.error("Error fetching topics:", error);
          setTopics([]);
        } finally {
          setLoadingTopics(false);
        }
      };
      fetchTopics();
    } else {
      // Reset validation when modal closes
      setShowValidation(false);
    }
  }, [open]);

  const handleAddLesson = () => {
    setBulkLessons([
      ...bulkLessons,
      {
        topic_id: 1,
        title: "",
        content: "",
        video_url: null,
        short_describe: "",
      },
    ]);
  };

  const handleRemoveLesson = (index: number) => {
    const newLessons = bulkLessons.filter((_, i) => i !== index);
    setBulkLessons(newLessons);
  };

  const handleLessonChange = (
    index: number,
    field: keyof BulkLessonCreate,
    value: string | number | null
  ) => {
    const newLessons = [...bulkLessons];
    if (field === "topic_id") {
      newLessons[index][field] = Number(value);
    } else if (field === "video_url") {
      newLessons[index][field] = value as string | null;
    } else {
      newLessons[index][field] = value as string;
    }
    setBulkLessons(newLessons);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const lessons: BulkLessonCreate[] = jsonData.map((row: any) => {
          // Convert topic name to topic_id
          let topicId = 1; // default

          // Check if row has 'topic' (name) or 'topic_id' (legacy support)
          if (row.topic) {
            const topicName = String(row.topic).trim();
            const foundTopic = topics.find(
              (t) => t.name.toLowerCase() === topicName.toLowerCase()
            );
            if (foundTopic) {
              topicId = foundTopic.id;
            } else {
              console.warn(
                `Topic "${topicName}" not found, using default ID 1`
              );
            }
          } else if (row.topic_id) {
            topicId = Number(row.topic_id);
          }

          return {
            topic_id: topicId,
            title: String(row.title || ""),
            content: String(row.content || ""),
            video_url: row.video_url ? String(row.video_url) : null,
            short_describe: String(row.short_describe || ""),
          };
        });

        setBulkLessons(lessons);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        onError("Error parsing Excel file. Please check the format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const validateLessons = () => {
    return bulkLessons.every(
      (lesson) =>
        lesson.title.trim() !== "" &&
        lesson.content.trim() !== "" &&
        lesson.short_describe.trim() !== ""
    );
  };

  const handleSubmit = async () => {
    // Enable validation display
    setShowValidation(true);

    // Check if all lessons are valid
    if (!validateLessons()) {
      return; // Don't submit if validation fails
    }

    // Proceed with submission
    await onSubmit();
  };

  const handleDownloadTemplate = () => {
    // Get sample topic name or use a default
    const sampleTopicName = topics.length > 0 ? topics[0].name : "Sample Topic";

    // Create sample data with topic names (not IDs)
    const templateData = [
      {
        topic: sampleTopicName,
        title: "Sample Lesson Title 1",
        content:
          "This is the lesson content. Provide detailed information here...",
        video_url: "https://res.cloudinary.com/dyhnzac8w/video/upload/v1754558644/System_Of_Linear_Equations_efgzsw.mp4",
        short_describe: "Brief description of the lesson",
      },
      {
        topic: sampleTopicName,
        title: "Sample Lesson Title 2",
        content: "Another lesson content example. Add your lesson details...",
        video_url: "https://res.cloudinary.com/dyhnzac8w/video/upload/v1754558637/Inscribed_Angle_Theorem_fzpckg.mp4",
        short_describe: "Another brief description",
      },
    ];

    // Create a reference sheet with available topics
    const topicReference = topics.map((topic) => ({
      topic_name: topic.name,
      description: topic.description,
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Add template sheet
    const templateSheet = XLSX.utils.json_to_sheet(templateData);
    XLSX.utils.book_append_sheet(workbook, templateSheet, "Lessons Template");

    // Add topic reference sheet
    if (topicReference.length > 0) {
      const topicSheet = XLSX.utils.json_to_sheet(topicReference);
      XLSX.utils.book_append_sheet(workbook, topicSheet, "Available Topics");
    }

    // Generate file and trigger download
    const fileName = `bulk_lessons_template_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: { xs: 20, sm: 24 },
          py: 1.5,
          mb: 1,
          px: { xs: 2, sm: 3 },
          background: "linear-gradient(135deg, #667eea44 0%, #764ba244 100%)",
          color: "black",
          borderRadius: "12px 12px 0 0",
        }}
      >
        Add Bulk Lessons
      </DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Box
          sx={{
            mb: 2,
            display: "flex",
            gap: { xs: 1, sm: 2 },
            mt: 1,
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "flex-start",
            flexShrink: 0,
          }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddLesson}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              flex: { xs: 1, sm: "none" },
            }}
          >
            Add Lesson
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFileIcon />}
            component="label"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              flex: { xs: 1, sm: "none" },
            }}
          >
            Import Excel
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </Button>
          <Button
            variant="text"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
            disabled={loadingTopics}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Download Template
          </Button>
        </Box>

        <Box
          sx={{
            bgcolor: "#e3f2fd",
            border: "1px solid #90caf9",
            borderRadius: 2,
            p: 1.5,
            mb: 2,
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "primary.dark", fontWeight: 600, display: "block" }}
          >
            💡 Excel format: columns should be - <strong>topic</strong> (name),{" "}
            <strong>title</strong>, <strong>content</strong>,{" "}
            <strong>video_url</strong>, <strong>short_describe</strong>
          </Typography>
        </Box>

        <Box
          sx={{
            overflowY: "auto",
            flex: 1,
            pr: 1,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "grey.200",
              borderRadius: 2,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "grey.400",
              borderRadius: 2,
              "&:hover": {
                bgcolor: "grey.500",
              },
            },
          }}
        >
          {loadingTopics ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
              }}
            >
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 2, color: "grey.600" }}>
                Loading topics...
              </Typography>
            </Box>
          ) : bulkLessons.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 8,
                color: "grey.500",
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                No lessons added yet
              </Typography>
              <Typography variant="body2">
                Click "Add Lesson" to create a new lesson or import from Excel
              </Typography>
            </Box>
          ) : (
            bulkLessons.map((lesson, index) => (
              <BulkLessonCard
                key={index}
                lesson={lesson}
                index={index}
                topics={topics}
                showValidation={showValidation}
                loadingTopics={loadingTopics}
                onLessonChange={handleLessonChange}
                onRemove={handleRemoveLesson}
              />
            ))
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting || bulkLessons.length === 0 || loadingTopics}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Submitting...
            </>
          ) : (
            `Submit ${bulkLessons.length} Lesson${
              bulkLessons.length !== 1 ? "s" : ""
            }`
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkLessonModal;
