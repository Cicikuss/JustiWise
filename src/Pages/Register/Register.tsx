import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiCard from "@mui/material/Card";
import { styled } from "@mui/material/styles";
import AppTheme from "../../shared-theme/AppTheme";
//import { SitemarkIcon } from "../../Components/CustomIcon/CustomIcons";
import ColorModeSelect from "../../shared-theme/ColorModeSelect";
import { supabaseClient } from "../../service/supabaseClient";
import { useAuth } from "../../Context/AuthContext";
import { MenuItem, Select, InputLabel } from "@mui/material"; // role için

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(3),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "450px",
  },
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  borderRadius: "12px",
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

const RegisterPage = styled(Stack)(({ theme }) => ({
  minHeight: "100vh",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(4),
  },
  "&::before": {
    content: '""',
    display: "block",
    position: "absolute",
    zIndex: -1,
    inset: 0,
    backgroundImage:
      "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
    backgroundRepeat: "no-repeat",
    ...theme.applyStyles("dark", {
      backgroundImage:
        "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
    }),
  },
}));

export default function Register(props: { disableCustomTheme?: boolean }) {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [confirmPasswordError, setConfirmPasswordError] = React.useState(false);
  const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] =
    React.useState("");
  const [role, setRole] = React.useState("Client"); // NEW: Default rol durumu
  const { signup } = useAuth();

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;
    const confirmPassword = document.getElementById(
      "confirm-password"
    ) as HTMLInputElement;

    let isValid = true;

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage("Please enter a valid email address.");
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage("");
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage("Password must be at least 6 characters long.");
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage("");
    }

    if (password.value !== confirmPassword.value) {
      setConfirmPasswordError(true);
      setConfirmPasswordErrorMessage("Passwords do not match.");
      isValid = false;
    } else {
      setConfirmPasswordError(false);
      setConfirmPasswordErrorMessage("");
    }

    return isValid;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateInputs()) return;

    const data = new FormData(event.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;

    try {
      await signup(email, password, role); // UPDATED: role parametresi eklendi
    } catch (err) {
      alert("Bir hata oluştu!");
      console.error(err);
    }
  };

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <RegisterPage direction="column" justifyContent="center">
        <ColorModeSelect
          sx={{ position: "fixed", top: "1rem", right: "1rem" }}
        />
        <Card variant="outlined">
          <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <img
                src="/jw.png"
                alt="JustiWise Logo"
                style={{
                  width: 110,
                  height: 110,
                  objectFit: "contain",
                  marginBottom: 8,
                  transition: "transform 0.3s ease-in-out",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.1)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1.0)")
                }
              />
              <Typography
                variant="h5"
                fontWeight={700}
                component="a"
                href="/"
                sx={{
                  fontSize: "1.5rem",
                  textDecoration: "none",
                  textAlign: "center",
                  position: "relative",
                  transition: "all 0.3s ease-in-out",
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "#fff" : "#000",
                  textShadow:
                    "0 0 8px rgba(0, 255, 255, 0.5), 0 0 12px rgba(0, 255, 255, 0.4), 0 0 20px rgba(0, 255, 255, 0.3)",
                  animation: "waveContinuous 2.5s ease-in-out infinite",

                  "@keyframes waveContinuous": {
                    "0%": { transform: "scale(1) translateY(0px)" },
                    "25%": { transform: "scale(1.05) translateY(-1px)" },
                    "50%": { transform: "scale(1.08) translateY(-2px)" },
                    "75%": { transform: "scale(1.05) translateY(-1px)" },
                    "100%": { transform: "scale(1) translateY(0px)" },
                  },
                }}
              >
                JustiWise
              </Typography>
            </Box>
          </Box>

          <Typography
            component="h1"
            variant="h4"
            sx={{
              width: "100%",
              fontSize: "clamp(2rem, 10vw, 2.15rem)",
              textAlign: "center",
              fontWeight: 600,
              mb: 2,
            }}
          >
            Create Account
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              mb: 3,
            }}
          >
            Sign up to get started with JustiWise
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email" sx={{ mb: 1, fontWeight: 500 }}>
                Email
              </FormLabel>
              <TextField
                error={emailError}
                helperText={emailErrorMessage}
                id="email"
                type="email"
                name="email"
                placeholder="your@email.com"
                autoComplete="email"
                autoFocus
                required
                fullWidth
                variant="outlined"
                color={emailError ? "error" : "primary"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password" sx={{ mb: 1, fontWeight: 500 }}>
                Password
              </FormLabel>
              <TextField
                error={passwordError}
                helperText={passwordErrorMessage}
                name="password"
                placeholder="••••••"
                type="password"
                id="password"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                color={passwordError ? "error" : "primary"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel
                htmlFor="confirm-password"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                Confirm Password
              </FormLabel>
              <TextField
                error={confirmPasswordError}
                helperText={confirmPasswordErrorMessage}
                name="confirm-password"
                placeholder="••••••"
                type="password"
                id="confirm-password"
                autoComplete="new-password"
                required
                fullWidth
                variant="outlined"
                color={confirmPasswordError ? "error" : "primary"}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              />
            </FormControl>

            {/* NEW: Role seçimi için Select bileşeni */}
            <FormControl>
              <FormLabel htmlFor="role" sx={{ mb: 1, fontWeight: 500 }}>
                Role
              </FormLabel>
              <Select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                fullWidth
                variant="outlined"
                color="primary"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
              >
                <MenuItem value="Client">Client</MenuItem>
                <MenuItem value="Lawyer">Lawyer</MenuItem>
                <MenuItem value="Student">Student</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                py: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              Sign up
            </Button>
          </Box>
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Already have an account?{" "}
              <Link
                href="/login"
                variant="body2"
                sx={{
                  color: "primary.main",
                  fontWeight: 500,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </RegisterPage>
    </AppTheme>
  );
}
