import { Login } from "react-admin";
import { Box, Card, CardContent, Typography } from "@mui/material";

const LoginPage = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }}
  >
    <Card
      sx={{
        minWidth: 350,
        maxWidth: 450,
        borderRadius: 3,
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
      }}
    >
      <Box
        sx={{
          padding: 3,
          paddingBottom: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          管理後台
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          歡迎回來，請登錄您的帳戶
        </Typography>
      </Box>
      <CardContent sx={{ padding: 4, paddingTop: 3 }}>
        <Login
          sx={{
            "& .MuiCard-root": {
              boxShadow: "none",
              padding: 0,
            },
            "& .MuiCardContent-root": {
              padding: 0,
            },
            "& .RaLogin-avatar": {
              display: "none",
            },
            "& .MuiButton-root": {
              marginTop: 2,
              padding: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
              },
            },
          }}
        />
      </CardContent>
    </Card>
    <Box sx={{ marginTop: 3, color: "white", opacity: 0.9 }}>
      <Typography variant="body2">
        提示：輸入任意用戶名和密碼即可登錄
      </Typography>
    </Box>
  </Box>
);

export default LoginPage;
