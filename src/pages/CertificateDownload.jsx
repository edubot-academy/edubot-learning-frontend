import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '@shared/ui/Loader';
import { downloadCourseCertificatePdf } from '@features/courses/api';

const CertificateDownloadPage = () => {
    const { publicId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        let isActive = true;

        const run = async () => {
            if (!publicId) {
                toast.error('Сертификат табылган жок');
                navigate('/', { replace: true });
                return;
            }

            try {
                await downloadCourseCertificatePdf(
                    `/certificates/${publicId}/download`,
                    `certificate-${publicId}.pdf`,
                );
            } catch {
                if (isActive) {
                    toast.error('Сертификат PDF жүктөө мүмкүн болбоду');
                }
            }

            if (!isActive) return;
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                navigate('/', { replace: true });
            }
        };

        void run();

        return () => {
            isActive = false;
        };
    }, [navigate, publicId]);

    return <Loader fullScreen />;
};

export default CertificateDownloadPage;
