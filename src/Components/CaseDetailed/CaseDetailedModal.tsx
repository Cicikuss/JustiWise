import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Stack,
    Chip,
    Box,
    Divider,
    Link,
} from '@mui/material';
import { CaseTypeWithURL } from '../../Models/Case';

type Props = {
    open: boolean;
    onClose: () => void;
    caseData: CaseTypeWithURL;
    clientName: string;
    lawyerName: string;
};

const CaseDetailModal = ({ open, onClose, caseData, clientName, lawyerName }: Props) => {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{caseData.title}</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    <Typography variant="body1" color="text.secondary">
                        {caseData.description}
                    </Typography>

                    <Divider />

                    <Stack direction="row" spacing={1}>
                        <Chip label={caseData.status.toUpperCase()} color="primary" />
                        <Chip label={caseData.priority.toUpperCase()} color="secondary" />
                        <Chip label={caseData.category} variant="outlined" />
                    </Stack>

                    <Box>
                        <Typography variant="subtitle2">Müşteri:</Typography>
                        <Typography>{clientName}</Typography>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2">Avukat:</Typography>
                        <Typography>{lawyerName}</Typography>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2">Oluşturulma Tarihi:</Typography>
                        <Typography>
                            {new Date(caseData.created_at).toLocaleString('tr-TR', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </Typography>
                    </Box>

                    {caseData.document_url && (
                        <Box>
                          <Link
  href={"https://jupmdlvbxnaqmaaliblr.supabase.co/storage/v1/object/public/case-files/" + caseData.document_url}
  target="_blank"
  rel="noopener noreferrer"
  underline="hover"
>
  Dosyayı Görüntüle
</Link>

                        </Box>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default CaseDetailModal;
