import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";

interface Props {
  open: boolean;
  onClose: () => void;
}

const SettingsModal = ({ open, onClose }: Props) => {
  const { i18n, t } = useTranslation();
  const theme = useTheme();

  const handleChange = (e: any) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem("lang", e.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "600px",
          minHeight: "400px",
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          borderRadius: 4,
          px: 3,
          py: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          color: theme.palette.text.primary,
          fontWeight: "bold",
          fontSize: "1.5rem",
        }}
      >
        {t("settings1")}
      </DialogTitle>

      <DialogContent>
        <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
          <InputLabel
            id="language-label"
            sx={{
              color: theme.palette.text.primary,
              backgroundColor: theme.palette.background.paper,
              px: 0.5,
            }}
          >
            {t("chooseLanguage")}
          </InputLabel>

          <Select
            labelId="language-label"
            value={i18n.language}
            onChange={handleChange}
            label={t("chooseLanguage")}
            sx={{
              height: "56px",
              display: "flex",
              alignItems: "center",
              backgroundColor:
                theme.palette.mode === "dark"
                  ? "#2a2a2a"
                  : theme.palette.background.paper,
              color: theme.palette.text.primary,
              "& .MuiSelect-icon": {
                color: theme.palette.text.primary,
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#2a2a2a" : "#fff",
                  color: theme.palette.text.primary,
                },
              },
            }}
          >
            <MenuItem value="tr">{t("turkish")}</MenuItem>
            <MenuItem value="en">{t("english")}</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
