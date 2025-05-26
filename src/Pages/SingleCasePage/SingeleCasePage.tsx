import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CaseTypeWithURL } from "../../Models/Case"; // Modelinizin yolu
import { getCaseById } from "../../service/supabaseClient"; // Servisinizin yolu

// MUI Bileşenleri
import {
    Container,
    Typography,
    CircularProgress,
    Paper,
    Grid,
    Chip,
    Link as MuiLink, // Link çakışmasını önlemek için yeniden adlandırma
    Divider,
    Box,
    Alert
} from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew'; // Doküman linki için ikon

const SingleCasePage = () => {
    const { caseId } = useParams<{ caseId: string }>();
    const [caseData, setCaseData] = useState<CaseTypeWithURL | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!caseId) {
            setError("Dava ID'si URL'de eksik.");
            setLoading(false);
            return;
        }

        const fetchCaseData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getCaseById(caseId);
                if (response) {
                    setCaseData(response);
                } else {
                    setError(`ID: ${caseId} için dava bulunamadı.`);
                    setCaseData(null);
                }
            } catch (err) {
                console.error("Dava verileri getirilirken hata:", err);
                setError(err instanceof Error ? err.message : "Dava verileri getirilirken bilinmeyen bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchCaseData();
    }, [caseId]);

    const capitalizeFirstLetter = (string: string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const getStatusColor = (status: CaseTypeWithURL['status']): "success" | "warning" | "default" | "info" | "error" => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'closed': return 'default'; // veya 'info'
            default: return 'default';
        }
    };

    const getPriorityColor = (priority: CaseTypeWithURL['priority']): "error" | "warning" | "info" | "default" => {
        switch (priority) {
            case 'high': return 'error';
            case 'medium': return 'warning';
            case 'low': return 'info';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Dava detayları yükleniyor...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
                <Alert severity="error" sx={{ width: '100%', maxWidth: '600px' }}>
                    <Typography variant="h5" component="h2" gutterBottom>Hata</Typography>
                    <Typography>{error}</Typography>
                </Alert>
            </Container>
        );
    }

    if (!caseData) {
        return (
            <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
                 <Alert severity="info" sx={{ width: '100%', maxWidth: '600px' }}>
                    Dava bulunamadı.
                 </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}> {/* Üst ve alt padding */}
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}> {/* İç padding */}
                <Box mb={3}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{ wordBreak: 'break-word' }}>
                        {caseData.title || "Başlıksız Dava"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        Dava ID: {caseData.id}
                    </Typography>
                </Box>

                <Grid container spacing={3} mb={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Durum:</Typography>
                        <Chip
                            label={capitalizeFirstLetter(caseData.status)}
                            color={getStatusColor(caseData.status)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Öncelik:</Typography>
                        <Chip
                            label={capitalizeFirstLetter(caseData.priority)}
                            color={getPriorityColor(caseData.priority)}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Müvekkil:</Typography>
                        <Typography variant="body1">{caseData.client || "Belirtilmemiş"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Avukat:</Typography>
                        <Typography variant="body1">{caseData.lawyer || "Belirtilmemiş"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Kategori:</Typography>
                        <Typography variant="body1">{caseData.category || "Belirtilmemiş"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Oluşturulma Tarihi:</Typography>
                        <Typography variant="body1">
                            {new Date(caseData.created_at).toLocaleDateString('tr-TR', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                            })}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box mb={3}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Açıklama
                    </Typography>
                    {caseData.description ? (
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {caseData.description}
                        </Typography>
                    ) : (
                        <Typography variant="body1" color="text.secondary" fontStyle="italic">
                            Bu dava için açıklama girilmemiş.
                        </Typography>
                    )}
                </Box>

                {caseData.document_url && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Box>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Ekli Doküman
                            </Typography>
                            <MuiLink
                                href={caseData.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="body1"
                                sx={{ display: 'inline-flex', alignItems: 'center' }}
                            >
                                Dokümanı Görüntüle
                                <OpenInNewIcon fontSize="small" sx={{ ml: 0.5 }} />
                            </MuiLink>
                        </Box>
                    </>
                )}
            </Paper>
        </Container>
    );
};

export default SingleCasePage;