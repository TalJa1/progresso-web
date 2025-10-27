import React from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { BulkLessonCreate } from "../../apis/lessons/lessonAPI";
import type { TopicModel } from "../../services/apiModel";

interface BulkLessonCardProps {
  lesson: BulkLessonCreate;
  index: number;
  topics: TopicModel[];
  showValidation: boolean;
  loadingTopics: boolean;
  onLessonChange: (
    index: number,
    field: keyof BulkLessonCreate,
    value: string | number | null
  ) => void;
  onRemove: (index: number) => void;
}

const BulkLessonCard: React.FC<BulkLessonCardProps> = ({
  lesson,
  index,
  topics,
  showValidation,
  loadingTopics,
  onLessonChange,
  onRemove,
}) => {
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 2,
        borderRadius: 2,
        border: "2px solid",
        borderColor:
          showValidation &&
          (lesson.title.trim() === "" ||
            lesson.content.trim() === "" ||
            lesson.short_describe.trim() === "")
            ? "error.light"
            : "grey.300",
        position: "relative",
        background: "white",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: { xs: 8, sm: 12 },
          right: { xs: 8, sm: 12 },
          display: "flex",
          gap: 1,
          alignItems: "center",
        }}
      >
        <IconButton
          onClick={() => onRemove(index)}
          sx={{
            color: "black",
          }}
          size="small"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          mb: 2,
          pr: 8,
        }}
      >
        Lesson #{index + 1}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id={`topic-label-${index}`}>Topic</InputLabel>
            <Select
              labelId={`topic-label-${index}`}
              id={`topic-select-${index}`}
              value={lesson.topic_id}
              label="Topic"
              onChange={(e) =>
                onLessonChange(index, "topic_id", e.target.value)
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
            onChange={(e) => onLessonChange(index, "title", e.target.value)}
            size="small"
            required
            error={showValidation && lesson.title.trim() === ""}
            helperText={
              showValidation && lesson.title.trim() === "" ? "Required" : ""
            }
          />
        </Box>

        <TextField
          fullWidth
          label="Short Description"
          value={lesson.short_describe}
          onChange={(e) =>
            onLessonChange(index, "short_describe", e.target.value)
          }
          size="small"
          required
          error={showValidation && lesson.short_describe.trim() === ""}
          helperText={
            showValidation && lesson.short_describe.trim() === ""
              ? "Required"
              : ""
          }
        />

        <TextField
          fullWidth
          label="Content"
          value={lesson.content}
          onChange={(e) => onLessonChange(index, "content", e.target.value)}
          multiline
          rows={3}
          size="small"
          required
          error={showValidation && lesson.content.trim() === ""}
          helperText={
            showValidation && lesson.content.trim() === "" ? "Required" : ""
          }
        />

        <TextField
          fullWidth
          label="Video URL (optional)"
          value={lesson.video_url || ""}
          onChange={(e) =>
            onLessonChange(index, "video_url", e.target.value || null)
          }
          size="small"
        />
      </Box>
    </Box>
  );
};

export default BulkLessonCard;
