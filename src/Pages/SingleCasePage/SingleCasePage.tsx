import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CaseTypeWithURL } from "../../Models/Case";

import { applyForCase, getCaseById, getUserById, getCaseRequestByLawyerAndCase } from "../../service/supabaseClient";

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
    Alert,
    Button
} from "@mui/material";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { showErrorToast, showSuccessToast } from "../../Helper/ErrorHandler"; 

import { useAuth } from "../../Context/AuthContext";

const SingleCasePage = () => {
    const { caseId } = useParams<{ caseId: string }>();
    const [caseData, setCaseData] = useState<CaseTypeWithURL | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [clientName, setClientName] = useState<string>('Yükleniyor...');
    const [lawyerName, setLawyerName] = useState<string>('Yükleniyor...');
    const [applyingForCase, setApplyingForCase] = useState<boolean>(false); // Başvuru gönderme işlemi için
    const [hasAppliedForCase, setHasAppliedForCase] = useState<boolean>(false); // Mevcut kullanıcının zaten başvurup başvurmadığını belirtir


    const { user } = useAuth(); // AuthContext'ten kullanıcı objesini al

    // currentUserId ve currentUserType'ı user objesi yüklendiğinde ayarla
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserType, setCurrentUserType] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setCurrentUserId(user.id);
            setCurrentUserType(user.role);
        } else {
            setCurrentUserId(null);
            setCurrentUserType(null);
        }
    }, [user]); // 'user' objesi değiştiğinde bu efekti yeniden çalıştır

    useEffect(() => {
        if (!caseId) {
            setError("Dava ID'si URL'de eksik.");
            setLoading(false);
            return;
        }

        const fetchAllCaseDetails = async () => {
            setLoading(true);
            setError(null);
            setClientName('Yükleniyor...');
            setLawyerName('Yükleniyor...');
            setHasAppliedForCase(false); // Her yeni yüklemede başvuru durumunu sıfırla

            try {
                const response = await getCaseById(caseId);

                if (response) {
                    setCaseData(response);

                    const [clientRes, lawyerRes] = await Promise.all([
                        response.client ? getUserById(response.client) : Promise.resolve(null),
                        response.lawyer ? getUserById(response.lawyer) : Promise.resolve(null)
                    ]);

                 
                    setClientName(clientRes?.username || 'Bilinmiyor');
                    setLawyerName(lawyerRes?.username || 'Bilinmiyor');

                    // Eğer bir avukat oturum açmışsa ve davanın henüz bir avukatı yoksa
                    // Mevcut kullanıcının bu dava için daha önce başvuru yapıp yapmadığını kontrol et
                    if (currentUserType === 'lawyer' && currentUserId && !response.lawyer) {
                        const existingRequest = await getCaseRequestByLawyerAndCase(caseId, currentUserId);
                        if (existingRequest) {
                            setHasAppliedForCase(true);
                        }
                    }

                } else {
                    setError(`ID: ${caseId} için dava bulunamadı.`);
                    setCaseData(null);
                    setClientName('Bilinmiyor');
                    setLawyerName('Bilinmiyor');
                }
            } catch (err: any) {
                showErrorToast(err.message || "Dava detayları yüklenirken bir hata oluştu.");
                setError("Dava detayları yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

       
        fetchAllCaseDetails();
    }, [caseId, currentUserId, currentUserType]);

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


    const handleApplyForCase = async () => {
        
        if (!caseId || !currentUserId) {
            showErrorToast("Dava ID'si veya avukat bilgisi eksik.");
            return;
        }
        setApplyingForCase(true); 
        try {
            await applyForCase(caseId);
            setHasAppliedForCase(true); 
            showSuccessToast("Başvurunuz başarıyla gönderildi! Onay bekleniyor.");
            
        } catch (err: any) {
            showErrorToast(err.message || "Davaya başvurmaya çalışırken bir hata oluştu.");
        } finally {
            setApplyingForCase(false);
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

    // Hata durumunda
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

    // Dava bulunamadığında
    if (!caseData) {
        return (
            <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
                 <Alert severity="info" sx={{ width: '100%', maxWidth: '600px' }}>
                    Dava bulunamadı.
                 </Alert>
            </Container>
        );
    }

    // Butonun gösterilme koşulları
    const showApplyButton = currentUserType === 'lawyer' && !caseData.lawyer && !hasAppliedForCase && currentUserId !== null; // Avukat olmalı, dava boş olmalı, daha önce başvurmamış olmalı ve currentUserId boş olmamalı
    const showAppliedMessage = currentUserType === 'lawyer' && !caseData.lawyer && hasAppliedForCase && currentUserId !== null; // Avukat olmalı, dava boş olmalı, daha önce başvurmuş olmalı ve currentUserId boş olmamalı

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

               
                {(showApplyButton || showAppliedMessage) && (
                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        {showApplyButton && (
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={handleApplyForCase} 
                                disabled={applyingForCase} 
                            >
                                {applyingForCase ? <CircularProgress size={24} color="inherit" /> : 'Bu Davaya Başvur'} 
                            </Button>
                        )}
                        {showAppliedMessage && (
                            <Alert severity="info" sx={{ width: 'auto' }}>
                                Bu davaya zaten başvurdunuz. Onay bekleniyor.
                            </Alert>
                        )}
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default SingleCasePage;