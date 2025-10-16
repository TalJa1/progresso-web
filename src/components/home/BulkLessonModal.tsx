import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";
import type { BulkLessonCreate } from "../../apis/lessons/lessonAPI";
import { getAllTopics } from "../../apis/topics/topicAPI";
import type { TopicModel } from "../../services/apiModel";

interface BulkLessonModalProps {
  open: boolean;
  onClose: () => void;
  bulkLessons: BulkLessonCreate[];
  setBulkLessons: React.Dispatch<React.SetStateAction<BulkLessonCreate[]>>;
  onSubmit: () => Promise<void>;
  isSubmitting: boolean;
}

const BulkLessonModal: React.FC<BulkLessonModalProps> = ({
  open,
  onClose,
  bulkLessons,
  setBulkLessons,
  onSubmit,
  isSubmitting,
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
              console.warn(`Topic "${topicName}" not found, using default ID 1`);
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
        alert("Error parsing Excel file. Please check the format.");
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
        content: "This is the lesson content. Provide detailed information here...",
        video_url: "https://youtube.com/watch?v=example1",
        short_describe: "Brief description of the lesson",
      },
      {
        topic: sampleTopicName,
        title: "Sample Lesson Title 2",
        content: "Another lesson content example. Add your lesson details...",
        video_url: "",
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
    const fileName = `bulk_lessons_template_${new Date().toISOString().split("T")[0]}.xlsx`;
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
      <DialogTitle sx={{ fontWeight: 700, fontSize: 24, pb: 1 }}>
        Add Bulk Lessons
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, display: "flex", gap: 2, mt: 1, justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              component="label"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Import from Excel
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddLesson}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Add Lesson Row
            </Button>
          </Box>
          <Button
            variant="outlined"
            color="success"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadTemplate}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Download Template
          </Button>
        </Box>

        <Typography
          variant="caption"
          sx={{ color: "grey.600", mb: 2, display: "block" }}
        >
          Excel format: columns should be - topic (name), title, content,
          video_url, short_describe
        </Typography>

        <Box sx={{ maxHeight: "50vh", overflowY: "auto", mt: 2 }}>
          {bulkLessons.map((lesson, index) => (
            <Paper
              key={index}
              elevation={2}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                border: "1px solid #ccc",
                position: "relative",
              }}
            >
              <IconButton
                onClick={() => handleRemoveLesson(index)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  color: "error.main",
                }}
                size="small"
              >
                <DeleteIcon />
              </IconButton>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Lesson {index + 1}
              </Typography>

              <FormControl fullWidth sx={{ mb: 1.5 }} size="small">
                <InputLabel id={`topic-label-${index}`}>Topic</InputLabel>
                <Select
                  labelId={`topic-label-${index}`}
                  id={`topic-select-${index}`}
                  value={lesson.topic_id}
                  label="Topic"
                  onChange={(e) =>
                    handleLessonChange(index, "topic_id", e.target.value)
                  }
                  disabled={loadingTopics}
                >
                  {topics.length === 0 && !loadingTopics ? (
                    <MenuItem value="">
                      <em>No topics available</em>
                    </MenuItem>
                  ) : (
                    topics.map((topic) => (
                      <MenuItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Title"
                value={lesson.title}
                onChange={(e) =>
                  handleLessonChange(index, "title", e.target.value)
                }
                sx={{ mb: 1.5 }}
                size="small"
                required
                error={showValidation && lesson.title.trim() === ""}
                helperText={showValidation && lesson.title.trim() === "" ? "Title is required" : ""}
              />

              <TextField
                fullWidth
                label="Short Description"
                value={lesson.short_describe}
                onChange={(e) =>
                  handleLessonChange(index, "short_describe", e.target.value)
                }
                sx={{ mb: 1.5 }}
                size="small"
                required
                error={showValidation && lesson.short_describe.trim() === ""}
                helperText={showValidation && lesson.short_describe.trim() === "" ? "Short description is required" : ""}
              />

              <TextField
                fullWidth
                label="Content"
                value={lesson.content}
                onChange={(e) =>
                  handleLessonChange(index, "content", e.target.value)
                }
                multiline
                rows={3}
                sx={{ mb: 1.5 }}
                size="small"
                required
                error={showValidation && lesson.content.trim() === ""}
                helperText={showValidation && lesson.content.trim() === "" ? "Content is required" : ""}
              />

              <TextField
                fullWidth
                label="Video URL (optional)"
                value={lesson.video_url || ""}
                onChange={(e) =>
                  handleLessonChange(
                    index,
                    "video_url",
                    e.target.value || null
                  )
                }
                sx={{ mb: 1 }}
                size="small"
              />
            </Paper>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={onClose}
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
          disabled={isSubmitting}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Submit All Lessons"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BulkLessonModal;
