import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CaseTypeWithURL } from "../../Models/Case";
import { getCaseById, getUserById } from "../../service/supabaseClient";

import {
    Container,
    Typography,
    CircularProgress,
    Paper,
    Grid,
    Chip,
    Link as MuiLink,
    Divider,
    Box,
    Alert
} from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { showErrorToast } from "../../Helper/ErrorHandler";

const SingleCasePage = () => {
    const { caseId } = useParams<{ caseId: string }>();
    const [caseData, setCaseData] = useState<CaseTypeWithURL | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [clientName, setClientName] = useState<string>('Yükleniyor...');
    const [lawyerName, setLawyerName] = useState<string>('Yükleniyor...');

    useEffect(() => {
        if (!caseId) {
            setError("Dava ID'si URL'de eksik.");
            setLoading(false);
            return;
        }

        const fetchAllCaseDetails = async () => {
            setLoading(true);
            setError(null);
            setClientName('Yükleniyor...'); // Reset names on new fetch
            setLawyerName('Yükleniyor...'); // Reset names on new fetch

            try {
                // 1. Dava verisini getir
                const response = await getCaseById(caseId);

                if (response) {
                    setCaseData(response);

                    // 2. Dava verisi geldikten sonra, müvekkil ve avukat ID'lerini kullanarak isimlerini getir
                    // client ve lawyer ID'lerinin null/undefined olma ihtimaline karşı kontrol eklendi
                    const [clientRes, lawyerRes] = await Promise.all([
                        response.client ? getUserById(response.client) : Promise.resolve(null),
                        response.lawyer ? getUserById(response.lawyer) : Promise.resolve(null)
                    ]);

                    setClientName(clientRes?.username || 'Bilinmiyor');
                    setLawyerName(lawyerRes?.username || 'Bilinmiyor');

                } else {
                    setError(`ID: ${caseId} için dava bulunamadı.`);
                    setCaseData(null);
                    setClientName('Bilinmiyor'); // Eğer dava bulunamazsa isimleri sıfırla
                    setLawyerName('Bilinmiyor');
                }
            } catch (err) {
                console.error("Dava veya kullanıcı bilgileri yüklenirken hata:", err); // Hata ayıklama için konsola yaz
                showErrorToast(err);
                setError("Dava detayları yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllCaseDetails();
    }, [caseId]); // Bağımlılık olarak sadece caseId'yi tutuyoruz

    const capitalizeFirstLetter = (string: string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const getStatusColor = (status: CaseTypeWithURL['status']): "success" | "warning" | "default" | "info" | "error" => {
        switch (status) {
            case 'active': return 'success';
            case 'pending': return 'warning';
            case 'closed': return 'default';
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
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
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
                        <Typography variant="body1">{clientName || "Belirtilmemiş"}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Avukat:</Typography>
                        <Typography variant="body1">{lawyerName || "Belirtilmemiş"}</Typography>
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