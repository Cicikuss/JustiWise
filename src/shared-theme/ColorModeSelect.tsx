import * as React from "react";
import { useColorScheme } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectProps } from "@mui/material/Select";
import { useTheme } from "@mui/material/styles";

export default function ColorModeSelect(props: SelectProps) {
  const { mode, setMode } = useColorScheme();
  const theme = useTheme();
  if (!mode) {
    return null;
  }
  return (
    <Select
      value={mode}
      onChange={(event) =>
        setMode(event.target.value as "system" | "light" | "dark")
      }
      SelectDisplayProps={{
        // @ts-ignore
        "data-screenshot": "toggle-mode",
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
            color: theme.palette.mode === "dark" ? "#fff" : "#000",
          },
        },
      }}
      sx={{
        backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#fff",
        color: theme.palette.mode === "dark" ? "#fff" : "#000",
        borderRadius: 1,
      }}
      {...props}
    >
      <MenuItem value="system">System</MenuItem>
      <MenuItem value="light">Light</MenuItem>
      <MenuItem value="dark">Dark</MenuItem>
    </Select>
  );
}
