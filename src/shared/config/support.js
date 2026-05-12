export const SUPPORT_CONTACT = {
    brandName: 'EduBot Learning',
    websiteUrl: 'https://learning.edubot.it.com',
    qrImageSrc: '/edubot-learning-qr.png',
    addressShort: 'Бишкек ш., Ахунбаева 129B',
    addressFull: 'Ахунбаева 129B, Бишкек, Кыргызстан',
    phoneDisplay: '+996 (221) 004 976',
    phoneE164: '+996221004976',
    whatsappNumber: '996221004976',
    email: 'jardam.edubot_learning@outlook.com',
    instagramHandle: '@edubot.company',
    instagramUrl: 'https://www.instagram.com/edubot.company/',
    telegramHandle: '@edubot_learning',
    telegramUrl: 'https://t.me/edubot_learning',
    workingHours: 'Дүйшөмбү - Жума, 9:00 - 21:00',
};

export const getWhatsAppUrl = () => `https://wa.me/${SUPPORT_CONTACT.whatsappNumber}`;
export const getMailToUrl = () => `mailto:${SUPPORT_CONTACT.email}`;
