import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, useTheme, Grid, CircularProgress } from '@mui/material'; // Paper ve Stack kaldırıldı
// import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // Kaldırıldı
import { useSearch } from '../../Context/SearchContext';
import { Case } from '../../Components/Case/Case';
import { CaseType } from '../../Models/Case';
import { deleteCase, searchCases } from '../../service/supabaseClient';
// Supabase fonksiyonlarını import edin, artık sadece searchCases var


export const SearchResults = () => {
    const theme = useTheme();
    const { searchQuery } = useSearch();

    // Arama sonuçları için state, sadece cases içeriyor
    const [searchResults, setSearchResults] = useState<{ cases: CaseType[] }>({ cases: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Arama fonksiyonu: searchQuery değiştiğinde veya component yüklendiğinde çalışır
    useEffect(() => {
        const fetchResults = async () => {
            if (!searchQuery.trim()) {
                setSearchResults({ cases: [] }); // Boş sorgu ise sonuçları temizle
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Sadece case'leri çekiyoruz
                const casesData = await searchCases(searchQuery);

                setSearchResults({
                    cases: casesData,
                });
            } catch (err: any) {
                console.error("Failed to fetch search results:", err);
                setError(err.message || "Failed to load search results. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        // Debounce mekanizması
        const handler = setTimeout(() => {
            fetchResults();
        }, 300); // 300ms gecikme

        return () => {
            clearTimeout(handler); // Component temizlendiğinde veya searchQuery değiştiğinde önceki zamanlayıcıyı temizle
        };

    }, [searchQuery]); // searchQuery değiştiğinde bu effect tekrar çalışır

    // Case bileşeni için placeholder fonksiyonlar
    const handleEditCase = useCallback((caseData: CaseType) => {
        console.log('Edit Case:', caseData);
        alert(`Editing case: ${caseData.title}`);
        // Burada bir düzenleme modalı açabilir veya bir düzenleme sayfasına yönlendirebilirsiniz.
        // Düzenleme başarılı olursa, searchResults'u yeniden çekmek için fetchResults() çağırabilirsiniz.
    }, []);

    const handleDeleteCase = useCallback(async (caseId: string) => {
        console.log('Delete Case:', caseId);
        if (window.confirm(`Are you sure you want to delete case: ${caseId}?`)) {
            try {
                await deleteCase(caseId); // Supabase'deki deleteCase fonksiyonunu çağırın
                alert(`Case ${caseId} deleted successfully.`);
                // Başarılı silme işleminden sonra yerel durumu güncellemek için:
                setSearchResults(prev => ({
                    ...prev,
                    cases: prev.cases.filter(c => c.id !== caseId)
                }));
            } catch (err: any) {
                console.error('Error deleting case:', err);
                alert(`Failed to delete case: ${err.message}`);
            }
        }
    }, []);

    // Sonuçların olup olmadığını kontrol etmek için yardımcı değişken
    const hasResults = searchResults.cases.length > 0; // Sadece case'leri kontrol et
    // Hiçbir sonuç bulunamadı durumu
    const showNoResults = !loading && searchQuery.trim() && !hasResults;
    // Başlangıçta arama terimi girilmesi gerektiğini gösteren durum
    const showInitialPrompt = !searchQuery.trim() && !loading;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
                Search Results for "{searchQuery}"
            </Typography>

            {/* Hata mesajı gösterimi */}
            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            {/* Yüklenme durumu gösterimi */}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <CircularProgress />
                    <Typography variant="h6" sx={{ ml: 2 }}>Loading results...</Typography>
                </Box>
            ) : showInitialPrompt ? (
                // Başlangıçta arama terimi girilmesi gerektiği durumu
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    Please enter a search term to see results.
                </Typography>
            ) : showNoResults ? (
                // Arama yapıldı ama sonuç bulunamadı durumu
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    No results found for "{searchQuery}".
                </Typography>
            ) : (
                // Sonuçlar bulunduğunda gösterilecek kısım (Sadece Cases)
                <>
                    {/* Cases Section */}
                    {searchResults.cases.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                                Cases ({searchResults.cases.length})
                            </Typography>
                            <Grid container spacing={3}>
                                {searchResults.cases.map((caseData) => (
                                    <Grid item xs={12} sm={6} md={4} key={caseData.id}>
                                        <Case
                                            caseData={caseData}
                                            onEdit={handleEditCase}
                                            onDelete={handleDeleteCase}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* Chat Messages Section tamamen kaldırıldı */}
                </>
            )}
        </Box>
    );
};