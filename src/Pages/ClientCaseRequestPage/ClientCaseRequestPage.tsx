// src/pages/Client/ClientCaseRequestsPage.tsx

import { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import {
    Container,
    Typography,
    CircularProgress,
    Paper,
    Alert,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button
} from "@mui/material";
import { showErrorToast, showSuccessToast } from "../../Helper/ErrorHandler";
import {
    assignLawyerToCase,
    getCaseRequestsForCaseIds,
    getCasesClient, // Bu fonksiyon artık clientId almalı
    getUserById,
    updateCaseRequestStatus,
} from "../../service/supabaseClient";


// Başvuru ve Dava bilgilerini birleştirmek için bir tip
interface MergedCaseRequest {
    id: number; // case_request id (Supabase'den gelen 'id' genellikle int4'tür)
    case_id: string;
    lawyer_id: string;
    request_status: 'pending' | 'approved' | 'rejected';
    created_at: string; // Supabase'den gelen timestamptz string olarak gelir
    lawyerName: string; // Eklenen avukat adı
    caseTitle: string; // Eklenen dava başlığı
}

const ClientCaseRequestsPage = () => {
    const { user } = useAuth();
    const currentUserId = user?.id || null;
    const currentUserType = user?.role || null;

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [caseRequests, setCaseRequests] = useState<MergedCaseRequest[]>([]);
    const [processingRequestId, setProcessingRequestId] = useState<number | null>(null); // İşlemdeki başvuru ID'si

    useEffect(() => {
        // Kullanıcı bilgileri henüz yüklenmediyse veya müvekkil değilse bekle/hata göster
        if (!currentUserId || currentUserType !== 'client') {
            setError("Bu sayfayı görüntülemek için bir müvekkil olarak giriş yapmalısınız.");
            setLoading(false);
            return;
        }

        const fetchRequests = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1. Müvekkilin tüm davalarını getir - currentUserId'yi parametre olarak geçirin
                const clientCases = await getCasesClient(); // DÜZELTME BURADA
                if (!clientCases || clientCases.length === 0) {
                    setCaseRequests([]);
                    setLoading(false);
                    return;
                }

                // Dava ID'leri ve başlıklarını map'le
                const caseIds = clientCases.map(c => c.id);
                const caseTitleMap = new Map<string, string>();
                clientCases.forEach(c => caseTitleMap.set(c.id, c.title || 'Başlıksız Dava'));

                // 2. Bu davalara ait tüm başvuru isteklerini getir
                const requests = await getCaseRequestsForCaseIds(caseIds);

                if (!requests || requests.length === 0) {
                    setCaseRequests([]);
                    setLoading(false);
                    return;
                }

                // 3. Başvuru yapan avukatların ID'lerini topla ve isimlerini getir
                const uniqueLawyerIds = Array.from(new Set(requests.map(r => r.lawyer_id)));
                const lawyerPromises = uniqueLawyerIds.map(id => getUserById(id));
                const lawyers = await Promise.all(lawyerPromises);
                const lawyerMap = new Map<string, string>();
                lawyers.forEach(l => {
                    if (l) {
                        // DİKKAT: Burada 'username' hatası alıyorsanız, getUserById'den dönen objede
                        // kullanıcı adının hangi sütunda olduğunu kontrol edin (örn: full_name, display_name).
                        lawyerMap.set(l.id, l.username || 'Bilinmiyor');
                    }
                });

                // 4. İstekleri avukat adları ve dava başlıkları ile birleştir
                const mergedRequests: MergedCaseRequest[] = requests.map(r => ({
                    // DÜZELTME BURADA: ...r ile tüm orijinal özellikleri kopyalayın
                    ...r,
                    lawyerName: lawyerMap.get(r.lawyer_id) || 'Bilinmiyor',
                    caseTitle: caseTitleMap.get(r.case_id) || 'Bilinmiyor'
                }));

                // En yeni başvuruları üste almak için tarihe göre sırala
                mergedRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                setCaseRequests(mergedRequests);

            } catch (err: any) {
                showErrorToast(err.message || "Başvurular yüklenirken bir hata oluştu.");
                setError("Başvuruları yüklerken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [currentUserId, currentUserType, processingRequestId]); // processingRequestId değiştiğinde yeniden çek

    const getStatusColor = (status: MergedCaseRequest['request_status']): "default" | "success" | "error" | "warning" => {
        switch (status) {
            case 'pending': return 'warning';
            case 'approved': return 'success';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const handleAction = async (
        requestId: number,
        caseId: string,
        lawyerId: string,
        action: 'approve' | 'reject'
    ) => {
        setProcessingRequestId(requestId); // İlgili butonu devre dışı bırak
        try {
            if (action === 'approve') {
                // Başvuru durumunu "approved" yap
                await updateCaseRequestStatus(requestId, 'approved');
                // Davaya avukat ata
                await assignLawyerToCase(caseId, lawyerId);
                showSuccessToast("Başvuru başarıyla onaylandı ve avukat atandı!");

                // Onaylanan diğer bekleyen başvuruları reddet
                // Bu, aynı davaya yapılan diğer "pending" başvuruları "rejected" yapar.
                const otherPendingRequestsForThisCase = caseRequests.filter(
                    req => req.case_id === caseId && req.request_status === 'pending' && req.id !== requestId
                );
                for (const req of otherPendingRequestsForThisCase) {
                    await updateCaseRequestStatus(req.id, 'rejected');
                }

            } else { // 'reject'
                // Başvuru durumunu "rejected" yap
                await updateCaseRequestStatus(requestId, 'rejected');
                showSuccessToast("Başvuru başarıyla reddedildi.");
            }
            // İşlem başarılı olduğunda veriyi yeniden çekmek için
            // processingRequestId'i null yaparak useEffect'i tetikliyoruz.
            setProcessingRequestId(null);

        } catch (err: any) {
            showErrorToast(err.message || `İşlem sırasında bir hata oluştu: ${action}`);
            setProcessingRequestId(null); // İşlemi tamamla
        }
    };

    // Yüklenme durumunda
    if (loading) {
        return (
            <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Dava başvuruları yükleniyor...
                </Typography>
            </Container>
        );
    }

    // Hata durumunda (eğer müvekkil olmayan biri erişmeye çalışırsa veya genel bir hata oluşursa)
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

    // Müvekkil rolünde olmayan kullanıcılar için erişim engelleme
    if (currentUserType !== 'client') {
        return (
            <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', py: 4 }}>
                <Alert severity="warning" sx={{ width: '100%', maxWidth: '600px' }}>
                    <Typography variant="h5" component="h2" gutterBottom>Erişim Engellendi</Typography>
                    <Typography>Bu sayfayı görüntülemek için bir müvekkil olarak giriş yapmalısınız.</Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                <Typography variant="h4" component="h1" gutterBottom mb={3}>
                    Dava Başvurularım
                </Typography>

                {caseRequests.length === 0 ? (
                    <Alert severity="info">
                        Henüz davalarınıza gönderilmiş bir başvuru bulunmamaktadır.
                    </Alert>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Dava Başlığı</TableCell>
                                    <TableCell>Başvuran Avukat</TableCell>
                                    <TableCell>Durum</TableCell>
                                    <TableCell>Başvuru Tarihi</TableCell>
                                    <TableCell align="right">Eylemler</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {caseRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>{request.caseTitle}</TableCell>
                                        <TableCell>{request.lawyerName}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={request.request_status === 'pending' ? 'Beklemede' :
                                                        request.request_status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                                color={getStatusColor(request.request_status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(request.created_at).toLocaleDateString('tr-TR', {
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell align="right">
                                            {/* Sadece beklemede olan başvurular için Onayla/Reddet butonlarını göster */}
                                            {request.request_status === 'pending' && (
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        onClick={() => handleAction(request.id, request.case_id, request.lawyer_id, 'approve')}
                                                        disabled={processingRequestId === request.id} // Sadece bu isteği işlerken devre dışı bırak
                                                    >
                                                        {processingRequestId === request.id ? <CircularProgress size={20} color="inherit" /> : 'Onayla'}
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleAction(request.id, request.case_id, request.lawyer_id, 'reject')}
                                                        disabled={processingRequestId === request.id} // Sadece bu isteği işlerken devre dışı bırak
                                                    >
                                                        {processingRequestId === request.id ? <CircularProgress size={20} color="inherit" /> : 'Reddet'}
                                                    </Button>
                                                </Box>
                                            )}
                                            {/* İşlem tamamlanmış (onaylanmış/reddedilmiş) başvurular için mesaj göster */}
                                            {request.request_status !== 'pending' && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {request.request_status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Container>
    );
};

export default ClientCaseRequestsPage;