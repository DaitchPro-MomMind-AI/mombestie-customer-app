import { useState, useEffect, useRef, createContext, useContext } from 'react'
import type { JSX } from 'react'
import { AI_SELF_DISCLOSURE, DEMO_CHILD_ID, HEALTH_DISCLAIMER, PLANNER_CATEGORY_TO_LOG_TYPE, buildTimeline, detectCountry, formatPrice, needsHealthDisclaimer, planPrice, reconcilePlanner, useBookings, useTrackingLogs } from './services'
import type { NewTrackingLog } from './services'

// ─── Types ───────────────────────────────────────────────────────────────────
type AppState = 'login' | 'app'
type Screen = 'home' | 'baby' | 'ai' | 'planner' | 'more'
type AIScreen = 'chat' | 'voice'

// ─── i18n ────────────────────────────────────────────────────────────────────
type TKey =
  'nav_home'|'nav_baby'|'nav_ai'|'nav_planner'|'nav_more'|
  'good_morning'|'good_afternoon'|'good_evening'|
  'todays_schedule'|'quick_actions'|'ai_insight'|'view_all'|
  'btn_save'|'btn_cancel'|'btn_done'|'btn_add'|'btn_delete'|'btn_send'|'btn_back'|'btn_close'|
  'settings'|'security'|'privacy_center'|'family_caregivers'|'notifications'|
  'dark_mode'|'dark_mode_sub'|'measurement_units'|'language'|
  'rate_mommind'|'send_feedback'|'help_support'|'terms_privacy'|
  'sign_out'|'sign_out_all'|'logged_in_devices'|
  'face_id'|'face_id_sub'|'two_step'|'two_step_sub'|
  'profile'|'subscription'|'marketplace'|'toddler_meals'|'development_screen'|
  'baby_supplies'|'memory_journal'|'caregiver_handoff'|
  'family_access'|'voice_data'|'connected_services'|'download_data'|'delete_data'|
  'biometric_unlock'|'extra_security'|
  'section_family'|'section_baby_care'|'section_services'|'section_account'|
  'upgrade_plan'|'manage_alerts'|'your_family_your_data'|'only_device'

type LangDict = Record<TKey, string>

const TRANSLATIONS: Record<string, LangDict> = {
  'English': {
    nav_home:'Home', nav_baby:'Baby', nav_ai:'AI', nav_planner:'Planner', nav_more:'More',
    good_morning:'Good morning', good_afternoon:'Good afternoon', good_evening:'Good evening',
    todays_schedule:"Today's Schedule", quick_actions:'Quick Actions', ai_insight:'AI Insight', view_all:'View all',
    btn_save:'Save', btn_cancel:'Cancel', btn_done:'Done', btn_add:'Add', btn_delete:'Delete', btn_send:'Send', btn_back:'Back', btn_close:'Close',
    settings:'Settings', security:'Security', privacy_center:'Privacy Center', family_caregivers:'Family & Caregivers', notifications:'Notifications',
    dark_mode:'Dark Mode', dark_mode_sub:'Easier on the eyes at night', measurement_units:'Measurement Units', language:'Language',
    rate_mommind:'Rate MomMind', send_feedback:'Send Feedback', help_support:'Help & Support', terms_privacy:'Terms & Privacy',
    sign_out:'Sign Out', sign_out_all:'Sign Out All Other Devices', logged_in_devices:'Logged-in Devices',
    face_id:'Face ID / Fingerprint', face_id_sub:'Biometric unlock', two_step:'Two-Step Verification', two_step_sub:'Extra login security',
    profile:'Profile', subscription:'Subscription', marketplace:'Marketplace', toddler_meals:'Toddler Meals', development_screen:'Development',
    baby_supplies:'Baby Supplies', memory_journal:'Memory Journal', caregiver_handoff:'Caregiver Handoff',
    family_access:'Family Access', voice_data:'Voice Data', connected_services:'Connected Services', download_data:'Download My Data', delete_data:'Delete My Data',
    biometric_unlock:'Biometric unlock', extra_security:'Extra login security',
    section_family:'Family', section_baby_care:'Baby Care', section_services:'Services', section_account:'Account',
    upgrade_plan:'Upgrade plan', manage_alerts:'Manage alerts', your_family_your_data:'Your Family. Your Data.', only_device:'Only this device is signed in',
  },
  'Bangla (বাংলা)': {
    nav_home:'হোম', nav_baby:'শিশু', nav_ai:'এআই', nav_planner:'পরিকল্পনা', nav_more:'আরো',
    good_morning:'শুভ সকাল', good_afternoon:'শুভ দুপুর', good_evening:'শুভ সন্ধ্যা',
    todays_schedule:'আজকের সময়সূচি', quick_actions:'দ্রুত কাজ', ai_insight:'এআই পরামর্শ', view_all:'সব দেখুন',
    btn_save:'সংরক্ষণ', btn_cancel:'বাতিল', btn_done:'সম্পন্ন', btn_add:'যোগ করুন', btn_delete:'মুছুন', btn_send:'পাঠান', btn_back:'পেছনে', btn_close:'বন্ধ',
    settings:'সেটিংস', security:'নিরাপত্তা', privacy_center:'গোপনীয়তা কেন্দ্র', family_caregivers:'পরিবার ও যত্নকারী', notifications:'বিজ্ঞপ্তি',
    dark_mode:'ডার্ক মোড', dark_mode_sub:'রাতে চোখের জন্য সহজ', measurement_units:'পরিমাপ একক', language:'ভাষা',
    rate_mommind:'মমমাইন্ড রেট করুন', send_feedback:'প্রতিক্রিয়া পাঠান', help_support:'সাহায্য ও সহায়তা', terms_privacy:'শর্তাবলী ও গোপনীয়তা',
    sign_out:'সাইন আউট', sign_out_all:'সব ডিভাইস থেকে সাইন আউট', logged_in_devices:'লগইন করা ডিভাইস',
    face_id:'ফেস আইডি / ফিঙ্গারপ্রিন্ট', face_id_sub:'বায়োমেট্রিক আনলক', two_step:'দুই-ধাপ যাচাই', two_step_sub:'অতিরিক্ত নিরাপত্তা',
    profile:'প্রোফাইল', subscription:'সাবস্ক্রিপশন', marketplace:'মার্কেটপ্লেস', toddler_meals:'শিশুর খাবার', development_screen:'বিকাশ',
    baby_supplies:'শিশু সামগ্রী', memory_journal:'স্মৃতি ডায়েরি', caregiver_handoff:'যত্নকারী হ্যান্ডঅফ',
    family_access:'পারিবারিক অ্যাক্সেস', voice_data:'ভয়েস ডেটা', connected_services:'সংযুক্ত পরিষেবা', download_data:'ডেটা ডাউনলোড', delete_data:'ডেটা মুছুন',
    biometric_unlock:'বায়োমেট্রিক আনলক', extra_security:'অতিরিক্ত লগইন নিরাপত্তা',
    section_family:'পরিবার', section_baby_care:'শিশু যত্ন', section_services:'সেবা', section_account:'অ্যাকাউন্ট',
    upgrade_plan:'পরিকল্পনা আপগ্রেড', manage_alerts:'সতর্কতা পরিচালনা', your_family_your_data:'আপনার পরিবার। আপনার ডেটা।', only_device:'শুধু এই ডিভাইস সাইন ইন',
  },
  'Urdu (اردو)': {
    nav_home:'ہوم', nav_baby:'بچہ', nav_ai:'اے آئی', nav_planner:'منصوبہ ساز', nav_more:'مزید',
    good_morning:'صبح بخیر', good_afternoon:'دوپہر بخیر', good_evening:'شام بخیر',
    todays_schedule:'آج کا شیڈول', quick_actions:'فوری کام', ai_insight:'اے آئی مشورہ', view_all:'سب دیکھیں',
    btn_save:'محفوظ کریں', btn_cancel:'منسوخ', btn_done:'مکمل', btn_add:'شامل کریں', btn_delete:'حذف کریں', btn_send:'بھیجیں', btn_back:'واپس', btn_close:'بند',
    settings:'ترتیبات', security:'سیکیورٹی', privacy_center:'پرائیویسی سینٹر', family_caregivers:'خاندان اور نگہداشت کار', notifications:'اطلاعات',
    dark_mode:'ڈارک موڈ', dark_mode_sub:'رات میں آنکھوں کے لیے آسان', measurement_units:'پیمائش کی اکائیاں', language:'زبان',
    rate_mommind:'مم مائنڈ کو ریٹ کریں', send_feedback:'رائے بھیجیں', help_support:'مدد اور سہارا', terms_privacy:'شرائط اور رازداری',
    sign_out:'سائن آؤٹ', sign_out_all:'تمام آلات سے سائن آؤٹ', logged_in_devices:'لاگ ان آلات',
    face_id:'فیس آئی ڈی / فنگر پرنٹ', face_id_sub:'بایومیٹرک انلاک', two_step:'دو مرحلہ تصدیق', two_step_sub:'اضافی لاگ ان سیکیورٹی',
    profile:'پروفائل', subscription:'سبسکرپشن', marketplace:'مارکیٹ پلیس', toddler_meals:'بچے کا کھانا', development_screen:'نشوونما',
    baby_supplies:'بچے کی ضروریات', memory_journal:'یادوں کی ڈائری', caregiver_handoff:'نگہداشت کار کو سونپنا',
    family_access:'خاندانی رسائی', voice_data:'آواز کا ڈیٹا', connected_services:'منسلک خدمات', download_data:'ڈیٹا ڈاؤن لوڈ', delete_data:'ڈیٹا حذف کریں',
    biometric_unlock:'بایومیٹرک انلاک', extra_security:'اضافی لاگ ان سیکیورٹی',
    section_family:'خاندان', section_baby_care:'بچے کی دیکھ بھال', section_services:'خدمات', section_account:'اکاؤنٹ',
    upgrade_plan:'پلان اپ گریڈ', manage_alerts:'الرٹ منظم کریں', your_family_your_data:'آپ کا خاندان۔ آپ کا ڈیٹا۔', only_device:'صرف یہ آلہ سائن ان ہے',
  },
  'Hindi (हिन्दी)': {
    nav_home:'होम', nav_baby:'शिशु', nav_ai:'एआई', nav_planner:'योजनाकार', nav_more:'अधिक',
    good_morning:'सुप्रभात', good_afternoon:'नमस्कार', good_evening:'शुभ संध्या',
    todays_schedule:'आज का कार्यक्रम', quick_actions:'त्वरित क्रियाएं', ai_insight:'एआई सुझाव', view_all:'सब देखें',
    btn_save:'सहेजें', btn_cancel:'रद्द करें', btn_done:'हो गया', btn_add:'जोड़ें', btn_delete:'हटाएं', btn_send:'भेजें', btn_back:'वापस', btn_close:'बंद करें',
    settings:'सेटिंग्स', security:'सुरक्षा', privacy_center:'गोपनीयता केंद्र', family_caregivers:'परिवार और देखभालकर्ता', notifications:'सूचनाएं',
    dark_mode:'डार्क मोड', dark_mode_sub:'रात में आंखों के लिए आसान', measurement_units:'माप इकाइयां', language:'भाषा',
    rate_mommind:'मॉममाइंड रेट करें', send_feedback:'प्रतिक्रिया भेजें', help_support:'सहायता और समर्थन', terms_privacy:'शर्तें और गोपनीयता',
    sign_out:'साइन आउट', sign_out_all:'सभी डिवाइस से साइन आउट', logged_in_devices:'लॉग इन डिवाइस',
    face_id:'फेस आईडी / फिंगरप्रिंट', face_id_sub:'बायोमेट्रिक अनलॉक', two_step:'दो-चरण सत्यापन', two_step_sub:'अतिरिक्त लॉगिन सुरक्षा',
    profile:'प्रोफ़ाइल', subscription:'सदस्यता', marketplace:'मार्केटप्लेस', toddler_meals:'बच्चे का भोजन', development_screen:'विकास',
    baby_supplies:'शिशु सामग्री', memory_journal:'स्मृति डायरी', caregiver_handoff:'देखभालकर्ता हस्तांतरण',
    family_access:'पारिवारिक पहुंच', voice_data:'वॉयस डेटा', connected_services:'जुड़ी सेवाएं', download_data:'डेटा डाउनलोड', delete_data:'डेटा हटाएं',
    biometric_unlock:'बायोमेट्रिक अनलॉक', extra_security:'अतिरिक्त लॉगिन सुरक्षा',
    section_family:'परिवार', section_baby_care:'शिशु देखभाल', section_services:'सेवाएं', section_account:'खाता',
    upgrade_plan:'योजना अपग्रेड', manage_alerts:'अलर्ट प्रबंधित करें', your_family_your_data:'आपका परिवार। आपका डेटा।', only_device:'केवल यह डिवाइस साइन इन है',
  },
  'Arabic': {
    nav_home:'الرئيسية', nav_baby:'الطفل', nav_ai:'الذكاء', nav_planner:'المخطط', nav_more:'المزيد',
    good_morning:'صباح الخير', good_afternoon:'مساء الخير', good_evening:'مساء النور',
    todays_schedule:'جدول اليوم', quick_actions:'الإجراءات السريعة', ai_insight:'رؤية الذكاء', view_all:'عرض الكل',
    btn_save:'حفظ', btn_cancel:'إلغاء', btn_done:'تم', btn_add:'إضافة', btn_delete:'حذف', btn_send:'إرسال', btn_back:'رجوع', btn_close:'إغلاق',
    settings:'الإعدادات', security:'الأمان', privacy_center:'مركز الخصوصية', family_caregivers:'العائلة والمقدمون', notifications:'الإشعارات',
    dark_mode:'الوضع المظلم', dark_mode_sub:'مريح للعيون في الليل', measurement_units:'وحدات القياس', language:'اللغة',
    rate_mommind:'قيّم مام مايند', send_feedback:'إرسال ملاحظات', help_support:'المساعدة والدعم', terms_privacy:'الشروط والخصوصية',
    sign_out:'تسجيل الخروج', sign_out_all:'تسجيل الخروج من جميع الأجهزة', logged_in_devices:'الأجهزة المسجلة',
    face_id:'معرف الوجه / بصمة الإصبع', face_id_sub:'فتح بالبيانات الحيوية', two_step:'التحقق بخطوتين', two_step_sub:'أمان إضافي لتسجيل الدخول',
    profile:'الملف الشخصي', subscription:'الاشتراك', marketplace:'السوق', toddler_meals:'وجبات الطفل', development_screen:'التطور',
    baby_supplies:'مستلزمات الطفل', memory_journal:'مذكرات الذكريات', caregiver_handoff:'تسليم المقدم',
    family_access:'وصول العائلة', voice_data:'بيانات الصوت', connected_services:'الخدمات المتصلة', download_data:'تنزيل البيانات', delete_data:'حذف البيانات',
    biometric_unlock:'فتح بالبيانات الحيوية', extra_security:'أمان إضافي',
    section_family:'العائلة', section_baby_care:'رعاية الطفل', section_services:'الخدمات', section_account:'الحساب',
    upgrade_plan:'ترقية الخطة', manage_alerts:'إدارة التنبيهات', your_family_your_data:'عائلتك. بياناتك.', only_device:'هذا الجهاز فقط مسجل الدخول',
  },
  'Spanish': {
    nav_home:'Inicio', nav_baby:'Bebé', nav_ai:'IA', nav_planner:'Agenda', nav_more:'Más',
    good_morning:'Buenos días', good_afternoon:'Buenas tardes', good_evening:'Buenas noches',
    todays_schedule:'Programa de hoy', quick_actions:'Acciones rápidas', ai_insight:'Consejo IA', view_all:'Ver todo',
    btn_save:'Guardar', btn_cancel:'Cancelar', btn_done:'Listo', btn_add:'Agregar', btn_delete:'Eliminar', btn_send:'Enviar', btn_back:'Atrás', btn_close:'Cerrar',
    settings:'Configuración', security:'Seguridad', privacy_center:'Centro de privacidad', family_caregivers:'Familia y cuidadores', notifications:'Notificaciones',
    dark_mode:'Modo oscuro', dark_mode_sub:'Más cómodo para los ojos de noche', measurement_units:'Unidades de medida', language:'Idioma',
    rate_mommind:'Calificar MomMind', send_feedback:'Enviar comentarios', help_support:'Ayuda y soporte', terms_privacy:'Términos y privacidad',
    sign_out:'Cerrar sesión', sign_out_all:'Cerrar sesión en todos los dispositivos', logged_in_devices:'Dispositivos activos',
    face_id:'Face ID / Huella dactilar', face_id_sub:'Desbloqueo biométrico', two_step:'Verificación en dos pasos', two_step_sub:'Seguridad adicional',
    profile:'Perfil', subscription:'Suscripción', marketplace:'Mercado', toddler_meals:'Comidas del bebé', development_screen:'Desarrollo',
    baby_supplies:'Artículos de bebé', memory_journal:'Diario de recuerdos', caregiver_handoff:'Traspaso al cuidador',
    family_access:'Acceso familiar', voice_data:'Datos de voz', connected_services:'Servicios conectados', download_data:'Descargar datos', delete_data:'Eliminar datos',
    biometric_unlock:'Desbloqueo biométrico', extra_security:'Seguridad adicional',
    section_family:'Familia', section_baby_care:'Cuidado del bebé', section_services:'Servicios', section_account:'Cuenta',
    upgrade_plan:'Actualizar plan', manage_alerts:'Gestionar alertas', your_family_your_data:'Tu familia. Tus datos.', only_device:'Solo este dispositivo tiene sesión activa',
  },
  'Français': {
    nav_home:'Accueil', nav_baby:'Bébé', nav_ai:'IA', nav_planner:'Planning', nav_more:'Plus',
    good_morning:'Bonjour', good_afternoon:'Bon après-midi', good_evening:'Bonsoir',
    todays_schedule:"Programme d'aujourd'hui", quick_actions:'Actions rapides', ai_insight:'Conseil IA', view_all:'Voir tout',
    btn_save:'Enregistrer', btn_cancel:'Annuler', btn_done:'Terminé', btn_add:'Ajouter', btn_delete:'Supprimer', btn_send:'Envoyer', btn_back:'Retour', btn_close:'Fermer',
    settings:'Paramètres', security:'Sécurité', privacy_center:'Centre de confidentialité', family_caregivers:'Famille et aidants', notifications:'Notifications',
    dark_mode:'Mode sombre', dark_mode_sub:'Reposant pour les yeux la nuit', measurement_units:'Unités de mesure', language:'Langue',
    rate_mommind:'Évaluer MomMind', send_feedback:'Envoyer des commentaires', help_support:'Aide et assistance', terms_privacy:'Conditions et confidentialité',
    sign_out:'Se déconnecter', sign_out_all:'Déconnecter tous les appareils', logged_in_devices:'Appareils connectés',
    face_id:'Face ID / Empreinte', face_id_sub:'Déverrouillage biométrique', two_step:'Vérification en deux étapes', two_step_sub:'Sécurité supplémentaire',
    profile:'Profil', subscription:'Abonnement', marketplace:'Marché', toddler_meals:'Repas bébé', development_screen:'Développement',
    baby_supplies:'Fournitures bébé', memory_journal:'Journal des souvenirs', caregiver_handoff:'Transfert aidant',
    family_access:'Accès famille', voice_data:'Données vocales', connected_services:'Services connectés', download_data:'Télécharger données', delete_data:'Supprimer données',
    biometric_unlock:'Déverrouillage biométrique', extra_security:'Sécurité supplémentaire',
    section_family:'Famille', section_baby_care:'Soin bébé', section_services:'Services', section_account:'Compte',
    upgrade_plan:'Mettre à niveau', manage_alerts:'Gérer les alertes', your_family_your_data:'Votre famille. Vos données.', only_device:'Seul cet appareil est connecté',
  },
  'Deutsch': {
    nav_home:'Start', nav_baby:'Baby', nav_ai:'KI', nav_planner:'Planer', nav_more:'Mehr',
    good_morning:'Guten Morgen', good_afternoon:'Guten Tag', good_evening:'Guten Abend',
    todays_schedule:'Heutiger Zeitplan', quick_actions:'Schnellaktionen', ai_insight:'KI-Tipp', view_all:'Alle anzeigen',
    btn_save:'Speichern', btn_cancel:'Abbrechen', btn_done:'Fertig', btn_add:'Hinzufügen', btn_delete:'Löschen', btn_send:'Senden', btn_back:'Zurück', btn_close:'Schließen',
    settings:'Einstellungen', security:'Sicherheit', privacy_center:'Datenschutzcenter', family_caregivers:'Familie & Betreuer', notifications:'Benachrichtigungen',
    dark_mode:'Dunkelmodus', dark_mode_sub:'Augenschonend bei Nacht', measurement_units:'Maßeinheiten', language:'Sprache',
    rate_mommind:'MomMind bewerten', send_feedback:'Feedback senden', help_support:'Hilfe & Support', terms_privacy:'AGB & Datenschutz',
    sign_out:'Abmelden', sign_out_all:'Alle Geräte abmelden', logged_in_devices:'Angemeldete Geräte',
    face_id:'Face ID / Fingerabdruck', face_id_sub:'Biometrische Entsperrung', two_step:'Zwei-Faktor-Authentifizierung', two_step_sub:'Zusätzliche Sicherheit',
    profile:'Profil', subscription:'Abonnement', marketplace:'Marktplatz', toddler_meals:'Babymahlzeiten', development_screen:'Entwicklung',
    baby_supplies:'Babyausstattung', memory_journal:'Erinnerungstagebuch', caregiver_handoff:'Betreuerübergabe',
    family_access:'Familienzugang', voice_data:'Sprachdaten', connected_services:'Verbundene Dienste', download_data:'Daten herunterladen', delete_data:'Daten löschen',
    biometric_unlock:'Biometrische Entsperrung', extra_security:'Zusätzliche Sicherheit',
    section_family:'Familie', section_baby_care:'Babypflege', section_services:'Dienste', section_account:'Konto',
    upgrade_plan:'Plan upgraden', manage_alerts:'Benachrichtigungen verwalten', your_family_your_data:'Ihre Familie. Ihre Daten.', only_device:'Nur dieses Gerät ist angemeldet',
  },
  'Português': {
    nav_home:'Início', nav_baby:'Bebê', nav_ai:'IA', nav_planner:'Agenda', nav_more:'Mais',
    good_morning:'Bom dia', good_afternoon:'Boa tarde', good_evening:'Boa noite',
    todays_schedule:'Programa de hoje', quick_actions:'Ações rápidas', ai_insight:'Dica IA', view_all:'Ver tudo',
    btn_save:'Salvar', btn_cancel:'Cancelar', btn_done:'Concluído', btn_add:'Adicionar', btn_delete:'Excluir', btn_send:'Enviar', btn_back:'Voltar', btn_close:'Fechar',
    settings:'Configurações', security:'Segurança', privacy_center:'Central de privacidade', family_caregivers:'Família e cuidadores', notifications:'Notificações',
    dark_mode:'Modo escuro', dark_mode_sub:'Mais suave para os olhos à noite', measurement_units:'Unidades de medida', language:'Idioma',
    rate_mommind:'Avaliar MomMind', send_feedback:'Enviar feedback', help_support:'Ajuda e suporte', terms_privacy:'Termos e privacidade',
    sign_out:'Sair', sign_out_all:'Sair de todos os dispositivos', logged_in_devices:'Dispositivos conectados',
    face_id:'Face ID / Impressão digital', face_id_sub:'Desbloqueio biométrico', two_step:'Verificação em duas etapas', two_step_sub:'Segurança extra',
    profile:'Perfil', subscription:'Assinatura', marketplace:'Mercado', toddler_meals:'Refeições do bebê', development_screen:'Desenvolvimento',
    baby_supplies:'Suprimentos bebê', memory_journal:'Diário de memórias', caregiver_handoff:'Transferência cuidador',
    family_access:'Acesso familiar', voice_data:'Dados de voz', connected_services:'Serviços conectados', download_data:'Baixar dados', delete_data:'Excluir dados',
    biometric_unlock:'Desbloqueio biométrico', extra_security:'Segurança extra',
    section_family:'Família', section_baby_care:'Cuidados bebê', section_services:'Serviços', section_account:'Conta',
    upgrade_plan:'Atualizar plano', manage_alerts:'Gerenciar alertas', your_family_your_data:'Sua família. Seus dados.', only_device:'Somente este dispositivo está conectado',
  },
  'Chinese (Simplified)': {
    nav_home:'首页', nav_baby:'宝宝', nav_ai:'智能', nav_planner:'计划', nav_more:'更多',
    good_morning:'早上好', good_afternoon:'下午好', good_evening:'晚上好',
    todays_schedule:'今日日程', quick_actions:'快捷操作', ai_insight:'AI建议', view_all:'查看全部',
    btn_save:'保存', btn_cancel:'取消', btn_done:'完成', btn_add:'添加', btn_delete:'删除', btn_send:'发送', btn_back:'返回', btn_close:'关闭',
    settings:'设置', security:'安全', privacy_center:'隐私中心', family_caregivers:'家人与护理者', notifications:'通知',
    dark_mode:'深色模式', dark_mode_sub:'夜间护眼', measurement_units:'计量单位', language:'语言',
    rate_mommind:'评价MomMind', send_feedback:'发送反馈', help_support:'帮助与支持', terms_privacy:'条款与隐私',
    sign_out:'退出登录', sign_out_all:'退出所有设备', logged_in_devices:'已登录设备',
    face_id:'面容ID / 指纹', face_id_sub:'生物识别解锁', two_step:'两步验证', two_step_sub:'额外登录安全',
    profile:'个人资料', subscription:'订阅', marketplace:'市场', toddler_meals:'宝宝饮食', development_screen:'发育',
    baby_supplies:'婴儿用品', memory_journal:'记忆日记', caregiver_handoff:'护理者交接',
    family_access:'家庭访问', voice_data:'语音数据', connected_services:'已连接服务', download_data:'下载数据', delete_data:'删除数据',
    biometric_unlock:'生物识别解锁', extra_security:'额外安全',
    section_family:'家庭', section_baby_care:'婴儿护理', section_services:'服务', section_account:'账户',
    upgrade_plan:'升级计划', manage_alerts:'管理提醒', your_family_your_data:'您的家庭。您的数据。', only_device:'仅此设备已登录',
  },
  '日本語': {
    nav_home:'ホーム', nav_baby:'ベビー', nav_ai:'AI', nav_planner:'プランナー', nav_more:'その他',
    good_morning:'おはようございます', good_afternoon:'こんにちは', good_evening:'こんばんは',
    todays_schedule:'今日のスケジュール', quick_actions:'クイックアクション', ai_insight:'AIアドバイス', view_all:'すべて見る',
    btn_save:'保存', btn_cancel:'キャンセル', btn_done:'完了', btn_add:'追加', btn_delete:'削除', btn_send:'送信', btn_back:'戻る', btn_close:'閉じる',
    settings:'設定', security:'セキュリティ', privacy_center:'プライバシーセンター', family_caregivers:'家族とケアギバー', notifications:'通知',
    dark_mode:'ダークモード', dark_mode_sub:'夜間、目に優しい', measurement_units:'計量単位', language:'言語',
    rate_mommind:'MomMindを評価', send_feedback:'フィードバックを送る', help_support:'ヘルプ＆サポート', terms_privacy:'利用規約とプライバシー',
    sign_out:'サインアウト', sign_out_all:'すべてのデバイスからサインアウト', logged_in_devices:'ログイン中のデバイス',
    face_id:'Face ID / 指紋', face_id_sub:'生体認証ロック解除', two_step:'二段階認証', two_step_sub:'追加のセキュリティ',
    profile:'プロフィール', subscription:'サブスクリプション', marketplace:'マーケットプレイス', toddler_meals:'離乳食', development_screen:'発達',
    baby_supplies:'育児用品', memory_journal:'思い出ノート', caregiver_handoff:'ケアギバー引き継ぎ',
    family_access:'ファミリーアクセス', voice_data:'音声データ', connected_services:'連携サービス', download_data:'データをダウンロード', delete_data:'データを削除',
    biometric_unlock:'生体認証ロック解除', extra_security:'追加のセキュリティ',
    section_family:'家族', section_baby_care:'ベビーケア', section_services:'サービス', section_account:'アカウント',
    upgrade_plan:'プランをアップグレード', manage_alerts:'通知を管理', your_family_your_data:'あなたの家族。あなたのデータ。', only_device:'このデバイスのみサインイン中',
  },
  'Korean': {
    nav_home:'홈', nav_baby:'아기', nav_ai:'AI', nav_planner:'플래너', nav_more:'더보기',
    good_morning:'좋은 아침', good_afternoon:'안녕하세요', good_evening:'좋은 저녁',
    todays_schedule:'오늘 일정', quick_actions:'빠른 작업', ai_insight:'AI 조언', view_all:'모두 보기',
    btn_save:'저장', btn_cancel:'취소', btn_done:'완료', btn_add:'추가', btn_delete:'삭제', btn_send:'보내기', btn_back:'뒤로', btn_close:'닫기',
    settings:'설정', security:'보안', privacy_center:'개인정보 보호', family_caregivers:'가족 및 케어기버', notifications:'알림',
    dark_mode:'다크 모드', dark_mode_sub:'밤에 눈에 편한', measurement_units:'측정 단위', language:'언어',
    rate_mommind:'MomMind 평가', send_feedback:'의견 보내기', help_support:'도움말 및 지원', terms_privacy:'약관 및 개인정보',
    sign_out:'로그아웃', sign_out_all:'모든 기기에서 로그아웃', logged_in_devices:'로그인된 기기',
    face_id:'Face ID / 지문', face_id_sub:'생체 인식 잠금 해제', two_step:'2단계 인증', two_step_sub:'추가 보안',
    profile:'프로필', subscription:'구독', marketplace:'마켓플레이스', toddler_meals:'이유식', development_screen:'성장',
    baby_supplies:'육아 용품', memory_journal:'추억 일기', caregiver_handoff:'케어기버 인계',
    family_access:'가족 접근', voice_data:'음성 데이터', connected_services:'연결된 서비스', download_data:'데이터 다운로드', delete_data:'데이터 삭제',
    biometric_unlock:'생체 인식 잠금 해제', extra_security:'추가 보안',
    section_family:'가족', section_baby_care:'아기 케어', section_services:'서비스', section_account:'계정',
    upgrade_plan:'플랜 업그레이드', manage_alerts:'알림 관리', your_family_your_data:'내 가족. 내 데이터.', only_device:'이 기기만 로그인됨',
  },
  'Russian': {
    nav_home:'Главная', nav_baby:'Малыш', nav_ai:'ИИ', nav_planner:'Планер', nav_more:'Ещё',
    good_morning:'Доброе утро', good_afternoon:'Добрый день', good_evening:'Добрый вечер',
    todays_schedule:'Расписание на сегодня', quick_actions:'Быстрые действия', ai_insight:'Совет ИИ', view_all:'Смотреть все',
    btn_save:'Сохранить', btn_cancel:'Отмена', btn_done:'Готово', btn_add:'Добавить', btn_delete:'Удалить', btn_send:'Отправить', btn_back:'Назад', btn_close:'Закрыть',
    settings:'Настройки', security:'Безопасность', privacy_center:'Центр конфиденциальности', family_caregivers:'Семья и опекуны', notifications:'Уведомления',
    dark_mode:'Тёмный режим', dark_mode_sub:'Меньше нагрузки на глаза ночью', measurement_units:'Единицы измерения', language:'Язык',
    rate_mommind:'Оценить MomMind', send_feedback:'Отправить отзыв', help_support:'Помощь и поддержка', terms_privacy:'Условия и конфиденциальность',
    sign_out:'Выйти', sign_out_all:'Выйти на всех устройствах', logged_in_devices:'Авторизованные устройства',
    face_id:'Face ID / Отпечаток', face_id_sub:'Биометрическая разблокировка', two_step:'Двухэтапная проверка', two_step_sub:'Дополнительная защита',
    profile:'Профиль', subscription:'Подписка', marketplace:'Маркетплейс', toddler_meals:'Питание малыша', development_screen:'Развитие',
    baby_supplies:'Товары для малыша', memory_journal:'Дневник воспоминаний', caregiver_handoff:'Передача опекуну',
    family_access:'Доступ семьи', voice_data:'Голосовые данные', connected_services:'Подключённые сервисы', download_data:'Скачать данные', delete_data:'Удалить данные',
    biometric_unlock:'Биометрическая разблокировка', extra_security:'Дополнительная защита',
    section_family:'Семья', section_baby_care:'Уход за малышом', section_services:'Сервисы', section_account:'Аккаунт',
    upgrade_plan:'Улучшить план', manage_alerts:'Управлять уведомлениями', your_family_your_data:'Ваша семья. Ваши данные.', only_device:'Только это устройство авторизовано',
  },
  'Turkish': {
    nav_home:'Ana Sayfa', nav_baby:'Bebek', nav_ai:'AI', nav_planner:'Planlayıcı', nav_more:'Daha Fazla',
    good_morning:'Günaydın', good_afternoon:'İyi günler', good_evening:'İyi akşamlar',
    todays_schedule:'Bugünün programı', quick_actions:'Hızlı işlemler', ai_insight:'AI tavsiyesi', view_all:'Tümünü gör',
    btn_save:'Kaydet', btn_cancel:'İptal', btn_done:'Tamamlandı', btn_add:'Ekle', btn_delete:'Sil', btn_send:'Gönder', btn_back:'Geri', btn_close:'Kapat',
    settings:'Ayarlar', security:'Güvenlik', privacy_center:'Gizlilik Merkezi', family_caregivers:'Aile ve Bakıcılar', notifications:'Bildirimler',
    dark_mode:'Karanlık Mod', dark_mode_sub:'Gece gözler için rahat', measurement_units:'Ölçü birimleri', language:'Dil',
    rate_mommind:"MomMind'ı değerlendir", send_feedback:'Geri bildirim gönder', help_support:'Yardım ve Destek', terms_privacy:'Şartlar ve Gizlilik',
    sign_out:'Çıkış yap', sign_out_all:'Tüm cihazlardan çıkış yap', logged_in_devices:'Oturum açık cihazlar',
    face_id:'Face ID / Parmak izi', face_id_sub:'Biyometrik kilit açma', two_step:'İki adımlı doğrulama', two_step_sub:'Ek giriş güvenliği',
    profile:'Profil', subscription:'Abonelik', marketplace:'Pazar yeri', toddler_meals:'Bebek yemekleri', development_screen:'Gelişim',
    baby_supplies:'Bebek malzemeleri', memory_journal:'Anı defteri', caregiver_handoff:'Bakıcı devri',
    family_access:'Aile erişimi', voice_data:'Ses verileri', connected_services:'Bağlı hizmetler', download_data:'Verileri indir', delete_data:'Verileri sil',
    biometric_unlock:'Biyometrik kilit açma', extra_security:'Ek güvenlik',
    section_family:'Aile', section_baby_care:'Bebek bakımı', section_services:'Hizmetler', section_account:'Hesap',
    upgrade_plan:'Planı yükselt', manage_alerts:'Uyarıları yönet', your_family_your_data:'Aileniz. Verileriniz.', only_device:'Yalnızca bu cihazda oturum açık',
  },
  'Italian': {
    nav_home:'Home', nav_baby:'Bambino', nav_ai:'IA', nav_planner:'Pianificatore', nav_more:'Altro',
    good_morning:'Buongiorno', good_afternoon:'Buon pomeriggio', good_evening:'Buonasera',
    todays_schedule:'Programma di oggi', quick_actions:'Azioni rapide', ai_insight:'Consiglio IA', view_all:'Vedi tutto',
    btn_save:'Salva', btn_cancel:'Annulla', btn_done:'Fatto', btn_add:'Aggiungi', btn_delete:'Elimina', btn_send:'Invia', btn_back:'Indietro', btn_close:'Chiudi',
    settings:'Impostazioni', security:'Sicurezza', privacy_center:'Centro privacy', family_caregivers:'Famiglia e assistenti', notifications:'Notifiche',
    dark_mode:'Modalità scura', dark_mode_sub:'Più comodo per gli occhi di notte', measurement_units:'Unità di misura', language:'Lingua',
    rate_mommind:'Valuta MomMind', send_feedback:'Invia feedback', help_support:'Aiuto e supporto', terms_privacy:'Termini e privacy',
    sign_out:'Esci', sign_out_all:'Esci da tutti i dispositivi', logged_in_devices:'Dispositivi connessi',
    face_id:'Face ID / Impronta', face_id_sub:'Sblocco biometrico', two_step:'Verifica in due passaggi', two_step_sub:'Sicurezza aggiuntiva',
    profile:'Profilo', subscription:'Abbonamento', marketplace:'Mercato', toddler_meals:'Pasti del bambino', development_screen:'Sviluppo',
    baby_supplies:'Articoli per bambini', memory_journal:'Diario dei ricordi', caregiver_handoff:'Passaggio assistente',
    family_access:'Accesso famiglia', voice_data:'Dati vocali', connected_services:'Servizi collegati', download_data:'Scarica dati', delete_data:'Elimina dati',
    biometric_unlock:'Sblocco biometrico', extra_security:'Sicurezza aggiuntiva',
    section_family:'Famiglia', section_baby_care:'Cura del bambino', section_services:'Servizi', section_account:'Account',
    upgrade_plan:'Aggiorna piano', manage_alerts:'Gestisci avvisi', your_family_your_data:'La tua famiglia. I tuoi dati.', only_device:'Solo questo dispositivo è connesso',
  },
}

const RTL_LANGS = new Set(['Arabic','Urdu (اردو)','Hebrew','Persian (Farsi)','Pashto','Kurdish','Divehi'])

const EN_DICT = TRANSLATIONS['English']
function makeT(lang: string) {
  const d = TRANSLATIONS[lang] || {}
  return (k: TKey): string => (d as Partial<LangDict>)[k] ?? EN_DICT[k]
}

const LangContext = createContext<{ lang: string; setLang: (l: string) => void; t: (k: TKey) => string }>({
  lang: 'English', setLang: () => {}, t: (k) => EN_DICT[k],
})
function useLang() { return useContext(LangContext) }

// ─── Data ────────────────────────────────────────────────────────────────────
// NOTE: `timeline` used to live here as a hardcoded array. It's now derived
// from real persisted TrackingLogs via useTrackingLogs()/buildTimeline() —
// see src/services. Kept only the demo constants below that aren't wired to
// a service yet (chat, planner, suggestions).

// The AI identifies itself once at the start of a session rather than aiming to
// pass as human — see docs/ARCHITECTURE.md §4.1.
const chatHistory: { role: 'ai' | 'user'; text: string; disclaimer?: boolean }[] = [
  { role: 'ai', text: AI_SELF_DISCLOSURE },
]

const suggestions = [
  'How was last night?',
  'Plan our day',
  'When should Maya nap?',
  'What to cook today?',
  'Create caregiver handoff',
]

const plannerItems = [
  { time: '7:25 AM', label: 'Bottle feed', icon: '🍼', cat: 'Feeding', color: '#6299D5', done: true, section: 'Morning' },
  { time: '8:15 AM', label: 'Breakfast', icon: '🥣', cat: 'Meal', color: '#55A67A', done: true, section: 'Morning' },
  { time: '9:00 AM', label: 'Tummy-time', icon: '🧸', cat: 'Activity', color: '#EE674E', done: false, section: 'Morning' },
  { time: '9:45 AM', label: 'Nap (predicted)', icon: '🌙', cat: 'Sleep', color: '#B0A0F0', done: false, section: 'Morning', predicted: true },
  { time: '12:00 PM', label: 'Lunch', icon: '🥣', cat: 'Meal', color: '#55A67A', done: false, section: 'Afternoon' },
  { time: '1:30 PM', label: 'Bottle feed', icon: '🍼', cat: 'Feeding', color: '#6299D5', done: false, section: 'Afternoon' },
  { time: '2:00 PM', label: 'Pediatric appointment', icon: '🏥', cat: 'Appointment', color: '#6299D5', done: false, section: 'Afternoon' },
  { time: '5:00 PM', label: 'Bottle feed', icon: '🍼', cat: 'Feeding', color: '#6299D5', done: false, section: 'Evening' },
  { time: '7:00 PM', label: 'Bath time', icon: '🛁', cat: 'Routine', color: '#F47B66', done: false, section: 'Evening' },
  { time: '7:45 PM', label: 'Bedtime (predicted)', icon: '🌙', cat: 'Sleep', color: '#B0A0F0', done: false, section: 'Evening', predicted: true },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function BlobBackground() {
  return (
    <>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </>
  )
}

function Avatar({ size = 44, initials = 'M', bg = '#F6B6A5' }: { size?: number; initials?: string; bg?: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-semibold text-white text-sm flex-shrink-0"
      style={{ width: size, height: size, background: `linear-gradient(135deg, ${bg}, #EE674E)`, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  )
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub?: string }) {
  return (
    <div className="glass-card rounded-2xl p-3 flex flex-col gap-0.5 min-w-0">
      <span className="text-base">{icon}</span>
      <span className="text-xs text-[#6E6E73] leading-none">{label}</span>
      <span className="text-sm font-semibold text-[#242424] leading-tight">{value}</span>
      {sub && <span className="text-[10px] text-[#6E6E73]">{sub}</span>}
    </div>
  )
}

function QuickAction({ icon, label, onTap }: { icon: string; label: string; onTap?: () => void }) {
  return (
    <button
      onClick={onTap}
      className="action-btn flex flex-col items-center gap-1.5"
    >
      <div className="glass-card rounded-2xl flex items-center justify-center text-xl"
        style={{ width: 52, height: 52 }}>
        {icon}
      </div>
      <span className="text-[11px] font-medium text-[#6E6E73]">{label}</span>
    </button>
  )
}

// ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'landing' | 'signin' | 'signup' | 'payment'>('landing')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  // Country-config-driven pricing — see docs/ARCHITECTURE.md §7.1/§7.2. Same
  // mechanism and same reference numbers as apps/website/src/i18n.ts.
  const [country] = useState(() => detectCountry())
  const plusPrice = formatPrice(country, country.plusMonthly)

  const formatCard = (v: string) =>
    v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  }

  const submit = () => {
    if (loading) return
    if (mode === 'signup') { setMode('payment'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); onLogin() }, 1600)
  }

  // ── Floating decorations ──────────────────────────────────────────────────
  const Decorations = () => (
    <>
      {/* Stars */}
      {[
        { x: 28, y: 90, s: 1.0, d: 0 },
        { x: 340, y: 110, s: 0.7, d: 0.4 },
        { x: 60, y: 200, s: 0.5, d: 0.9 },
        { x: 350, y: 260, s: 0.8, d: 1.2 },
        { x: 20, y: 310, s: 0.6, d: 0.6 },
        { x: 360, y: 380, s: 0.55, d: 1.8 },
      ].map((s, i) => (
        <svg key={i} className="star-twinkle absolute pointer-events-none"
          style={{ left: s.x, top: s.y, animationDelay: `${s.d}s`, transform: `scale(${s.s})` }}
          width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1l1.5 4h4.2l-3.4 2.5 1.3 4L7 9.2 3.4 11.5l1.3-4L1.3 5H5.5z" fill="#F8C85E" stroke="#F4A800" strokeWidth="0.5"/>
        </svg>
      ))}

      {/* Floating hearts */}
      <div className="float-a absolute pointer-events-none" style={{ left: 18, top: 160 }}>
        <svg width="28" height="26" viewBox="0 0 28 26" fill="none">
          <path d="M14 23S3 15.5 3 8.5A5.5 5.5 0 0114 5.2 5.5 5.5 0 0125 8.5C25 15.5 14 23 14 23z" fill="#F47B66" stroke="#C94930" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="float-c absolute pointer-events-none" style={{ right: 22, top: 200 }}>
        <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
          <path d="M10 16S2 10.5 2 5.8A4 4 0 0110 3.4 4 4 0 0118 5.8C18 10.5 10 16 10 16z" fill="#FFD6C9" stroke="#F47B66" strokeWidth="1.2"/>
        </svg>
      </div>

      {/* Cloud */}
      <div className="cloud-drift absolute pointer-events-none" style={{ right: 10, top: 130 }}>
        <svg width="64" height="36" viewBox="0 0 64 36" fill="none">
          <ellipse cx="32" cy="26" rx="28" ry="10" fill="white" fillOpacity="0.9"/>
          <ellipse cx="22" cy="22" rx="14" ry="12" fill="white" fillOpacity="0.9"/>
          <ellipse cx="38" cy="20" rx="16" ry="13" fill="white" fillOpacity="0.9"/>
          <ellipse cx="32" cy="26" rx="28" ry="10" stroke="#F6B6A5" strokeWidth="1"/>
          <ellipse cx="22" cy="22" rx="14" ry="12" stroke="#F6B6A5" strokeWidth="1"/>
          <ellipse cx="38" cy="20" rx="16" ry="13" stroke="#F6B6A5" strokeWidth="1"/>
        </svg>
      </div>
      <div className="cloud-drift absolute pointer-events-none" style={{ left: 5, top: 280, animationDelay: '2s', opacity: 0.7 }}>
        <svg width="48" height="28" viewBox="0 0 48 28" fill="none">
          <ellipse cx="24" cy="20" rx="20" ry="8" fill="white" fillOpacity="0.85"/>
          <ellipse cx="16" cy="16" rx="10" ry="9" fill="white" fillOpacity="0.85"/>
          <ellipse cx="28" cy="14" rx="12" ry="10" fill="white" fillOpacity="0.85"/>
        </svg>
      </div>

      {/* Baby bottle */}
      <div className="float-b absolute pointer-events-none" style={{ right: 26, top: 320 }}>
        <svg width="32" height="44" viewBox="0 0 32 44" fill="none">
          <rect x="10" y="0" width="12" height="6" rx="3" fill="#F6B6A5" stroke="#EE674E" strokeWidth="1.5"/>
          <rect x="8" y="6" width="16" height="34" rx="8" fill="#FFF8F4" stroke="#F6B6A5" strokeWidth="2"/>
          <rect x="10" y="10" width="6" height="2" rx="1" fill="#6299D5" opacity="0.4"/>
          <rect x="10" y="14" width="6" height="2" rx="1" fill="#6299D5" opacity="0.4"/>
          <rect x="10" y="18" width="6" height="2" rx="1" fill="#6299D5" opacity="0.4"/>
          <ellipse cx="16" cy="32" rx="4" ry="5" fill="#FFD6C9" opacity="0.6"/>
        </svg>
      </div>

      {/* Spinning ring */}
      <div className="spin-slow absolute pointer-events-none" style={{ left: 12, top: 380, opacity: 0.35 }}>
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="18" stroke="#EE674E" strokeWidth="2.5" strokeDasharray="6 5"/>
        </svg>
      </div>
    </>
  )

  // ── Illustration (mama + baby) ─────────────────────────────────────────────
  const Illustration = () => (
    <div className="pop-in relative flex justify-center flex-shrink-0" style={{ height: 190, width: '100%' }}>
      {/* Background circle */}
      <div className="absolute rounded-full"
        style={{ width: 148, height: 148, background: 'linear-gradient(135deg, #FFD6C9 0%, #FFF8F4 100%)', border: '3px dashed #F6B6A5', top: 14, left: '50%', transform: 'translateX(-50%)' }} />

      {/* Mama body */}
      <svg width="180" height="185" viewBox="0 0 180 170" fill="none" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}>
        {/* Dress */}
        <path d="M70 95 Q60 130 55 155 Q90 165 125 155 Q120 130 110 95 Q100 88 90 88 Q80 88 70 95z" fill="#EE674E"/>
        <path d="M70 95 Q60 130 55 155 Q90 165 125 155 Q120 130 110 95z" fill="#EE674E"/>
        {/* Dress pattern dots */}
        <circle cx="78" cy="115" r="3" fill="#FFD6C9" opacity="0.6"/>
        <circle cx="95" cy="125" r="3" fill="#FFD6C9" opacity="0.6"/>
        <circle cx="108" cy="112" r="3" fill="#FFD6C9" opacity="0.6"/>
        <circle cx="85" cy="138" r="3" fill="#FFD6C9" opacity="0.6"/>
        {/* Arms */}
        <path d="M70 98 Q48 108 44 125 Q50 128 56 118 Q62 108 72 104z" fill="#F6B6A5"/>
        <path d="M110 98 Q132 108 136 125 Q130 128 124 118 Q118 108 108 104z" fill="#F6B6A5"/>
        {/* Neck */}
        <rect x="85" y="76" width="10" height="14" rx="5" fill="#F6B6A5"/>
        {/* Head */}
        <ellipse cx="90" cy="62" rx="26" ry="28" fill="#F6B6A5"/>
        {/* Hair */}
        <path d="M64 52 Q66 28 90 26 Q114 28 116 52 Q112 36 90 35 Q68 36 64 52z" fill="#C97B4B"/>
        <path d="M64 52 Q58 70 66 80 Q62 60 67 50z" fill="#C97B4B"/>
        <path d="M116 52 Q122 70 114 80 Q118 60 113 50z" fill="#C97B4B"/>
        {/* Hair bun */}
        <circle cx="90" cy="32" r="10" fill="#C97B4B"/>
        <circle cx="84" cy="29" r="4" fill="#B56A3A"/>
        {/* Eyes */}
        <ellipse cx="81" cy="62" rx="5" ry="6" fill="white"/>
        <ellipse cx="99" cy="62" rx="5" ry="6" fill="white"/>
        <circle cx="82" cy="63" r="3" fill="#3D2A1E"/>
        <circle cx="100" cy="63" r="3" fill="#3D2A1E"/>
        <circle cx="83" cy="61" r="1" fill="white"/>
        <circle cx="101" cy="61" r="1" fill="white"/>
        {/* Smile */}
        <path d="M83 74 Q90 80 97 74" stroke="#C94930" strokeWidth="2" strokeLinecap="round" fill="none"/>
        {/* Cheeks */}
        <ellipse cx="74" cy="71" rx="6" ry="4" fill="#F47B66" opacity="0.4"/>
        <ellipse cx="106" cy="71" rx="6" ry="4" fill="#F47B66" opacity="0.4"/>
        {/* Baby held in arms */}
        <ellipse cx="50" cy="118" rx="14" ry="12" fill="#FFD6C9" stroke="#F6B6A5" strokeWidth="1.5"/>
        <ellipse cx="50" cy="113" rx="9" ry="9" fill="#F6B6A5"/>
        {/* Baby eyes */}
        <circle cx="47" cy="112" r="2" fill="#3D2A1E"/>
        <circle cx="53" cy="112" r="2" fill="#3D2A1E"/>
        <circle cx="47.8" cy="111.2" r="0.6" fill="white"/>
        <circle cx="53.8" cy="111.2" r="0.6" fill="white"/>
        {/* Baby smile */}
        <path d="M46 116 Q50 119 54 116" stroke="#C94930" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
        {/* Baby blanket */}
        <path d="M36 122 Q50 130 66 122 Q62 134 50 136 Q38 134 36 122z" fill="#6299D5" opacity="0.7"/>
      </svg>
    </div>
  )

  // ── Landing view ──────────────────────────────────────────────────────────
  if (mode === 'landing') return (
    <div className="relative flex flex-col" style={{ width: '100%', height: '100%', background: 'linear-gradient(175deg, #FFF3EE 0%, #FFD6C9 45%, #FFF8F4 100%)', overflow: 'hidden' }}>
      <Decorations />

      {/* Full-height flex column — illustration gets top half, content gets bottom half */}
      <div className="relative z-10 flex flex-col" style={{ height: '100%' }}>

        {/* ── TOP HALF: logo + illustration ── */}
        <div className="flex flex-col items-center justify-end" style={{ height: 340, paddingBottom: 16 }}>
          {/* Logo badge */}
          <div className="pop-in flex items-center gap-2 px-5 py-2 rounded-full mb-5"
            style={{ background: 'rgba(255,255,255,0.88)', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>
            <span className="text-base">✨</span>
            <span className="font-display text-[#EE674E] text-sm tracking-wide">MomMind AI</span>
          </div>

          {/* Illustration — big, centred in top half */}
          <div className="pop-in relative flex justify-center" style={{ width: 220, height: 210 }}>
            <div className="absolute rounded-full"
              style={{ width: 170, height: 170, background: 'linear-gradient(135deg,#FFD6C9,#FFF8F4)', border: '2.5px dashed #F6B6A5', top: 16, left: '50%', transform: 'translateX(-50%)' }} />
            <svg width="220" height="210" viewBox="0 0 180 170" fill="none" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}>
              <path d="M70 95 Q60 130 55 155 Q90 165 125 155 Q120 130 110 95 Q100 88 90 88 Q80 88 70 95z" fill="#EE674E"/>
              <circle cx="78" cy="115" r="3" fill="#FFD6C9" opacity="0.6"/>
              <circle cx="95" cy="125" r="3" fill="#FFD6C9" opacity="0.6"/>
              <circle cx="108" cy="112" r="3" fill="#FFD6C9" opacity="0.6"/>
              <path d="M70 98 Q48 108 44 125 Q50 128 56 118 Q62 108 72 104z" fill="#F6B6A5"/>
              <path d="M110 98 Q132 108 136 125 Q130 128 124 118 Q118 108 108 104z" fill="#F6B6A5"/>
              <rect x="85" y="76" width="10" height="14" rx="5" fill="#F6B6A5"/>
              <ellipse cx="90" cy="62" rx="26" ry="28" fill="#F6B6A5"/>
              <path d="M64 52 Q66 28 90 26 Q114 28 116 52 Q112 36 90 35 Q68 36 64 52z" fill="#C97B4B"/>
              <path d="M64 52 Q58 70 66 80 Q62 60 67 50z" fill="#C97B4B"/>
              <path d="M116 52 Q122 70 114 80 Q118 60 113 50z" fill="#C97B4B"/>
              <circle cx="90" cy="32" r="10" fill="#C97B4B"/>
              <circle cx="84" cy="29" r="4" fill="#B56A3A"/>
              <ellipse cx="81" cy="62" rx="5" ry="6" fill="white"/>
              <ellipse cx="99" cy="62" rx="5" ry="6" fill="white"/>
              <circle cx="82" cy="63" r="3" fill="#3D2A1E"/>
              <circle cx="100" cy="63" r="3" fill="#3D2A1E"/>
              <circle cx="83" cy="61" r="1" fill="white"/>
              <circle cx="101" cy="61" r="1" fill="white"/>
              <path d="M83 74 Q90 80 97 74" stroke="#C94930" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <ellipse cx="74" cy="71" rx="6" ry="4" fill="#F47B66" opacity="0.4"/>
              <ellipse cx="106" cy="71" rx="6" ry="4" fill="#F47B66" opacity="0.4"/>
              <ellipse cx="50" cy="118" rx="14" ry="12" fill="#FFD6C9" stroke="#F6B6A5" strokeWidth="1.5"/>
              <ellipse cx="50" cy="113" rx="9" ry="9" fill="#F6B6A5"/>
              <circle cx="47" cy="112" r="2" fill="#3D2A1E"/>
              <circle cx="53" cy="112" r="2" fill="#3D2A1E"/>
              <path d="M46 116 Q50 119 54 116" stroke="#C94930" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <path d="M36 122 Q50 130 66 122 Q62 134 50 136 Q38 134 36 122z" fill="#6299D5" opacity="0.7"/>
            </svg>
          </div>
        </div>

        {/* ── BOTTOM HALF: all text + buttons — justified to fill remaining space ── */}
        <div className="flex flex-col justify-between px-5" style={{ flex: 1, paddingBottom: 24, paddingTop: 4 }}>

          {/* Headline */}
          <div className="bounce-in text-center" style={{ animationDelay: '0.15s' }}>
            <h1 className="font-display text-[27px] text-[#242424] leading-snug">
              Your baby's{' '}
              <span style={{ color: '#EE674E', WebkitTextStroke: '0.5px #C94930' }}>best friend</span>
              {' '}is waiting! 🌟
            </h1>
            <p className="text-[13px] text-[#6E6E73] mt-1.5 leading-relaxed">
              Track, predict, and enjoy every precious moment.
            </p>
          </div>

          {/* Trial badge */}
          <div className="bounce-in flex justify-center" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
              style={{ background: '#FEF3CD', border: '2px solid #F8C85E' }}>
              <span className="text-xs">⏰</span>
              <span className="text-xs font-bold text-[#B8860B]">7-Day Free Trial · Then {plusPrice}/mo</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="bounce-in space-y-2.5" style={{ animationDelay: '0.28s' }}>
            <button onClick={() => setMode('signup')}
              className="cartoon-btn w-full py-3.5 rounded-2xl text-white font-bold text-[15px]"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2.5px solid #C94930', boxShadow: '0 5px 0 #C94930' }}>
              Start My Free Trial 🍼
            </button>
            <button onClick={() => setMode('signin')}
              className="cartoon-btn w-full py-3.5 rounded-2xl font-bold text-[15px]"
              style={{ background: '#FFF8F4', border: '2.5px solid #F6B6A5', boxShadow: '0 5px 0 #F6B6A5', color: '#EE674E' }}>
              I already have an account
            </button>
          </div>

          {/* Credit card note */}
          <div className="bounce-in" style={{ animationDelay: '0.34s' }}>
            <div className="rounded-2xl px-4 py-2.5 text-center"
              style={{ background: 'rgba(255,255,255,0.78)', border: '1.5px dashed #F6B6A5' }}>
              <p className="text-[11.5px] text-[#555] leading-relaxed">
                💳 <span className="font-semibold text-[#242424]">Credit card required.</span>{' '}
                No charge today — auto-renews at{' '}
                <span className="font-semibold text-[#EE674E]">{plusPrice}/mo</span> after 7 days unless cancelled.
              </p>
            </div>
          </div>

          {/* Social login */}
          <div className="bounce-in" style={{ animationDelay: '0.38s' }}>
            <div className="flex items-center gap-3 mb-2.5">
              <div className="flex-1 h-px bg-[#F6B6A5]" />
              <span className="text-xs text-[#6E6E73] font-medium">or continue with</span>
              <div className="flex-1 h-px bg-[#F6B6A5]" />
            </div>
            <div className="flex gap-2.5">
              {[
                { label: 'Google', icon: <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/><path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/><path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/><path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/></svg> },
                { label: 'Apple', icon: <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><path d="M14.5 9.5c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.8-3.1.8-.7 0-1.7-.7-2.8-.7C5.8 4.8 4 6 3 7.8c-2 3.4-.5 8.5 1.4 11.2.9 1.4 2 2.9 3.5 2.8 1.4-.1 1.9-.9 3.6-.9 1.7 0 2.1.9 3.6.8 1.5 0 2.5-1.4 3.4-2.7.5-.8.9-1.6 1.1-2.4-2.8-1-4.7-3.8-4.1-7z" fill="#242424"/><path d="M12.4 3c.8-1 1.3-2.3 1.1-3.7-1.1.1-2.4.8-3.2 1.7-.7.8-1.3 2.1-1.1 3.4 1.2.1 2.4-.6 3.2-1.4z" fill="#242424"/></svg> },
                { label: 'Facebook', icon: <svg width="16" height="16" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="9" fill="#1877F2"/><path d="M11.8 9H10v6H7.5V9H6V6.9h1.5V5.6c0-1.8.8-2.6 2.5-2.6H11.5v2.1H10.5c-.6 0-.5.3-.5.7V6.9h2l-.2 2.1z" fill="white"/></svg> },
              ].map(s => (
                <button key={s.label} className="cartoon-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-medium text-[13px] text-[#242424]"
                  style={{ background: '#FFF8F4', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>
                  {s.icon}{s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Terms — pinned at very bottom, always fully visible */}
          <div className="rounded-2xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(246,182,165,0.7)' }}>
            <p className="text-[11.5px] text-[#3A3A3A] text-center leading-relaxed">
              By continuing you agree to our{' '}
              <span className="text-[#EE674E] font-bold underline underline-offset-2">Terms</span>,{' '}
              <span className="text-[#EE674E] font-bold underline underline-offset-2">Privacy Policy</span> &{' '}
              <span className="text-[#EE674E] font-bold underline underline-offset-2">Subscription Terms</span>.
              {' '}Cancel before day 7 to avoid charges.
            </p>
          </div>

        </div>
      </div>
    </div>
  )

  // ── Sign In / Sign Up view ────────────────────────────────────────────────
  if (mode === 'signin' || mode === 'signup') {
  const isSignup = mode === 'signup'
  return (
    <div className="relative flex flex-col overflow-hidden" style={{ width: '100%', height: '100%', background: 'linear-gradient(175deg, #FFF3EE 0%, #FFD6C9 30%, #FFF8F4 100%)' }}>
      <Decorations />

      <div className="relative z-10 flex flex-col h-full px-6">
        {/* Back */}
        <button onClick={() => setMode('landing')} className="mt-14 w-10 h-10 rounded-2xl flex items-center justify-center self-start"
          style={{ background: '#FFF8F4', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Mini illustration */}
        <div className="flex justify-center mt-4">
          <div className="pop-in relative">
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #FFD6C9, #FFF8F4)', border: '2.5px dashed #F6B6A5' }}>
              <span className="text-5xl">{isSignup ? '🍼' : '👋'}</span>
            </div>
            {/* Sparkles */}
            <div className="star-twinkle absolute -top-2 -right-2">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1l1.8 5h5.2l-4.2 3 1.6 5L9 11.2 4.6 14l1.6-5L2 6h5.2z" fill="#F8C85E" stroke="#F4A800" strokeWidth="0.6"/>
              </svg>
            </div>
            <div className="star-twinkle absolute -bottom-1 -left-2" style={{ animationDelay: '0.7s' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1l1.4 3.8h4l-3.2 2.3 1.2 3.8L7 8.8l-3.4 2.1 1.2-3.8L1.6 4.8h4z" fill="#F47B66" stroke="#C94930" strokeWidth="0.5"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="bounce-in text-center mt-4" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-display text-2xl text-[#242424]">
            {isSignup ? 'Create your account! 🌸' : 'Welcome back! 🌟'}
          </h2>
          <p className="text-sm text-[#6E6E73] mt-1">
            {isSignup ? 'Step 1 of 2 — your details' : 'Maya is waiting for you'}
          </p>
          {isSignup && (
            <div className="flex justify-center gap-2 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full coral-gradient flex items-center justify-center text-white text-[10px] font-bold">1</div>
                <span className="text-[11px] font-semibold text-[#EE674E]">Account</span>
              </div>
              <div className="w-8 h-px bg-[#F6B6A5] self-center" />
              <div className="flex items-center gap-1.5 opacity-40">
                <div className="w-6 h-6 rounded-full border-2 border-[#F6B6A5] flex items-center justify-center text-[#6E6E73] text-[10px] font-bold">2</div>
                <span className="text-[11px] font-semibold text-[#6E6E73]">Payment</span>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="bounce-in mt-6 space-y-3.5" style={{ animationDelay: '0.2s' }}>
          {isSignup && (
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">👤</span>
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="cartoon-input w-full pl-11 pr-4 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4]"
              />
            </div>
          )}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">📧</span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="cartoon-input w-full pl-11 pr-4 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔒</span>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder={isSignup ? 'Create a password' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="cartoon-input w-full pl-11 pr-12 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4]"
            />
            <button onClick={() => setShowPass(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-base">
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>

          {!isSignup && (
            <div className="text-right">
              <button className="text-xs font-semibold text-[#EE674E] underline underline-offset-2">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={submit}
            disabled={loading}
            className="cartoon-btn w-full py-4 rounded-2xl text-white font-bold text-base mt-2 flex items-center justify-center gap-2"
            style={{
              background: loading ? '#F6B6A5' : 'linear-gradient(135deg, #EE674E, #F47B66)',
              border: `2.5px solid ${loading ? '#E8A090' : '#C94930'}`,
              boxShadow: loading ? '0 2px 0 #E8A090' : '0 6px 0 #C94930',
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white spin-slow" />
                Setting up your account…
              </>
            ) : (
              isSignup ? 'Next — Add Payment 💳' : 'Sign In ✨'
            )}
          </button>
        </div>

        {/* Switch mode */}
        <div className="bounce-in text-center mt-5" style={{ animationDelay: '0.3s' }}>
          <p className="text-sm text-[#6E6E73]">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setMode(isSignup ? 'signin' : 'signup')}
              className="font-bold text-[#EE674E] underline underline-offset-2">
              {isSignup ? 'Sign In' : 'Sign Up Free'}
            </button>
          </p>
        </div>

        {/* Bottom decoration strip */}
        <div className="mt-auto pb-10 flex justify-center gap-3 opacity-50">
          {['🍼', '🌙', '⭐', '🧸', '💕', '🌸'].map((e, i) => (
            <span key={i} className="text-xl" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
          ))}
        </div>
      </div>
    </div>
  )

  } // end signin/signup

  // ── Payment / Trial confirmation view ─────────────────────────────────────
  if (mode === 'payment') return (
    <div className="relative flex flex-col overflow-hidden" style={{ width: '100%', height: '100%', background: 'linear-gradient(175deg, #FFF3EE 0%, #FFD6C9 30%, #FFF8F4 100%)' }}>
      <Decorations />
      <div className="relative z-10 flex flex-col h-full px-6">
        {/* Back */}
        <button onClick={() => setMode('signup')} className="mt-14 w-10 h-10 rounded-2xl flex items-center justify-center self-start"
          style={{ background: '#FFF8F4', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>

        {/* Step indicator */}
        <div className="bounce-in flex justify-center gap-2 mt-4" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-1.5 opacity-40">
            <div className="w-6 h-6 rounded-full bg-[#55A67A] flex items-center justify-center text-white text-[10px] font-bold">✓</div>
            <span className="text-[11px] font-semibold text-[#55A67A]">Account</span>
          </div>
          <div className="w-8 h-px bg-[#F6B6A5] self-center" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full coral-gradient flex items-center justify-center text-white text-[10px] font-bold">2</div>
            <span className="text-[11px] font-semibold text-[#EE674E]">Payment</span>
          </div>
        </div>

        {/* Title */}
        <div className="pop-in text-center mt-5" style={{ animationDelay: '0.1s' }}>
          <div className="flex justify-center mb-3">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
              style={{ background: 'linear-gradient(135deg, #FFD6C9, #FFF8F4)', border: '2.5px dashed #F6B6A5' }}>
              💳
            </div>
          </div>
          <h2 className="font-display text-2xl text-[#242424]">Start your free trial 🎉</h2>
          <p className="text-sm text-[#6E6E73] mt-1 leading-relaxed">
            No charge today. Cancel anytime<br />before day 7 and pay nothing.
          </p>
        </div>

        {/* Trial summary card */}
        <div className="bounce-in mt-4" style={{ animationDelay: '0.18s' }}>
          <div className="rounded-2xl overflow-hidden" style={{ border: '2.5px solid #F6B6A5' }}>
            <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #FFF3EE, #FFD6C9)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="font-bold text-sm text-[#242424]">MomMind Plus</p>
                    <p className="text-[11px] text-[#6E6E73]">Full access · All features</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#EE674E] text-sm">FREE</p>
                  <p className="text-[10px] text-[#6E6E73]">for 7 days</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 px-4 divide-y divide-[#F6EDE8]">
              {[
                { icon: '✅', text: 'Today — Trial starts', right: '$0.00' },
                { icon: '📅', text: 'Day 7 — Auto-renews', right: `${plusPrice}/mo`, warn: true },
                { icon: '❌', text: 'Cancel before day 7', right: 'No charge' },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 gap-3">
                  <span className="text-sm flex-shrink-0">{row.icon}</span>
                  <span className="text-xs text-[#6E6E73] flex-1">{row.text}</span>
                  <span className={`text-xs font-bold flex-shrink-0 ${row.warn ? 'text-[#EE674E]' : 'text-[#55A67A]'}`}>{row.right}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card fields */}
        <div className="bounce-in mt-4 space-y-3" style={{ animationDelay: '0.24s' }}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">💳</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Card number"
              value={cardNumber}
              onChange={e => setCardNumber(formatCard(e.target.value))}
              className="cartoon-input w-full pl-11 pr-4 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4] tracking-wider"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                className="cartoon-input w-full px-4 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4]"
              />
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                placeholder="CVC"
                value={cardCvc}
                onChange={e => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="cartoon-input w-full px-4 py-4 text-sm font-medium text-[#242424] placeholder-[#C0B8B4]"
              />
            </div>
          </div>

          {/* Secure badge */}
          <div className="flex items-center justify-center gap-1.5">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M6 1L1 3v4c0 3 2.3 5.5 5 6 2.7-.5 5-3 5-6V3L6 1z" fill="#55A67A" fillOpacity="0.2" stroke="#55A67A" strokeWidth="1.2"/><path d="M3.5 7l1.8 1.8L8.5 5.5" stroke="#55A67A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="text-[10px] text-[#55A67A] font-semibold">256-bit SSL · Secured by Stripe</span>
          </div>

          {/* Start trial button */}
          <button
            onClick={submit}
            disabled={loading}
            className="cartoon-btn w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
            style={{
              background: loading ? '#F6B6A5' : 'linear-gradient(135deg, #EE674E, #F47B66)',
              border: `2.5px solid ${loading ? '#E8A090' : '#C94930'}`,
              boxShadow: loading ? '0 2px 0 #E8A090' : '0 6px 0 #C94930',
            }}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white spin-slow" />
                Activating trial…
              </>
            ) : (
              'Start My Free Trial 🎉'
            )}
          </button>
        </div>

        {/* Fine print */}
        <p className="text-[10px] text-[#6E6E73] text-center mt-3 leading-relaxed px-2">
          By starting your trial you authorise MomMind to charge{' '}
          <span className="font-semibold text-[#242424]">{plusPrice}/month</span> automatically after your 7-day free trial
          unless you cancel before the trial period ends. You can cancel anytime in{' '}
          <span className="text-[#EE674E]">Settings → Subscription</span>.
        </p>

        <div className="mt-auto pb-8 flex justify-center gap-3 opacity-40">
          {['🔒', '💳', '✨', '🍼', '💕'].map((e, i) => (
            <span key={i} className="text-lg">{e}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
function LogSheet({ activeLog, onClose, onSave }: { activeLog: string; onClose: () => void; onSave: (input: Omit<NewTrackingLog, 'childId'>) => void }) {
  const [saved, setSaved] = useState(false)
  const [amount, setAmount] = useState(5)
  const [feedMethod, setFeedMethod] = useState<'Bottle' | 'Breast' | 'Formula'>('Bottle')
  const [diaperType, setDiaperType] = useState<'Wet' | 'Dirty' | 'Mixed'>('Wet')
  const [sleepActive, setSleepActive] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [mealFoods, setMealFoods] = useState<string[]>([])
  const [customFood, setCustomFood] = useState('')
  const [growth, setGrowth] = useState<{ heightCm?: number; weightKg?: number; headCm?: number }>({})
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!sleepActive) return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [sleepActive])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`

  const toggleFood = (f: string) => setMealFoods(fs => fs.includes(f) ? fs.filter(x => x !== f) : [...fs, f])

  const handleSave = () => {
    const notesField = notes || undefined
    switch (activeLog) {
      case 'Feed':
        onSave({ type: 'Feed', notes: notesField, feed: { amountOz: amount, method: feedMethod } })
        break
      case 'Sleep':
        onSave({ type: 'Sleep', notes: notesField, sleep: { durationSec: elapsed } })
        break
      case 'Diaper':
        onSave({ type: 'Diaper', notes: notesField, diaper: { kind: diaperType } })
        break
      case 'Meal':
        onSave({ type: 'Meal', notes: notesField, meal: { foods: customFood.trim() ? [...mealFoods, customFood.trim()] : mealFoods } })
        break
      case 'Growth':
        onSave({ type: 'Growth', notes: notesField, growth })
        break
      default:
        // Medicine / Appointment / Activity / Vaccine / Temperature aren't
        // modeled by the Tracking Service yet — close rather than pretend
        // to persist them with a false "Saved" state.
        onClose()
        return
    }
    setSaved(true)
    setTimeout(onClose, 900)
  }

  const configs: Record<string, { icon: string; color: string; bg: string }> = {
    Feed:   { icon: '🍼', color: '#6299D5', bg: '#EBF2FC' },
    Sleep:  { icon: '🌙', color: '#B0A0F0', bg: '#F0EEF9' },
    Diaper: { icon: '🧷', color: '#F47B66', bg: '#FEEAE6' },
    Meal:   { icon: '🥣', color: '#55A67A', bg: '#E6F4ED' },
    Growth: { icon: '📏', color: '#F8C85E', bg: '#FEF7E0' },
  }
  const cfg = configs[activeLog] ?? { icon: '📋', color: '#EE674E', bg: '#FFD6C9' }

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 rounded-t-3xl px-5 pt-5 pb-8"
        style={{ background: '#FFFCFA', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}>

        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
              style={{ background: cfg.bg }}>
              {cfg.icon}
            </div>
            <div>
              <p className="font-display text-lg text-[#242424]">Log {activeLog}</p>
              <p className="text-xs text-[#6E6E73]">Maya · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F0E8E4] flex items-center justify-center text-[#6E6E73] text-sm font-bold">✕</button>
        </div>

        {/* Feed */}
        {activeLog === 'Feed' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide">Amount (oz)</p>
            <div className="flex items-center justify-between gap-4">
              <button onClick={() => setAmount(a => Math.max(1, a - 1))}
                className="action-btn w-12 h-12 rounded-2xl text-xl font-bold text-[#EE674E] flex items-center justify-center"
                style={{ background: '#FFD6C9', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>−</button>
              <div className="flex-1 text-center">
                <span className="font-display text-5xl text-[#242424]">{amount}</span>
                <span className="text-lg text-[#6E6E73] ml-1">oz</span>
              </div>
              <button onClick={() => setAmount(a => a + 1)}
                className="action-btn w-12 h-12 rounded-2xl text-xl font-bold text-[#EE674E] flex items-center justify-center"
                style={{ background: '#FFD6C9', border: '2px solid #F6B6A5', boxShadow: '0 3px 0 #F6B6A5' }}>+</button>
            </div>
            <div className="flex gap-2">
              {(['Bottle', 'Breast', 'Formula'] as const).map(t => (
                <button key={t} onClick={() => setFeedMethod(t)} className="action-btn flex-1 py-2.5 rounded-xl text-xs font-semibold"
                  style={feedMethod === t
                    ? { background: '#6299D5', border: '1.5px solid #4A7FBF', color: 'white' }
                    : { background: '#EBF2FC', border: '1.5px solid #C5D9F0', color: '#6299D5' }}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {/* Sleep */}
        {activeLog === 'Sleep' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5 text-center" style={{ background: '#F0EEF9' }}>
              <p className="text-4xl font-display text-[#242424] mb-1">{fmt(elapsed)}</p>
              <p className="text-xs text-[#6E6E73]">{sleepActive ? 'Maya is sleeping…' : 'Tap to start timer'}</p>
            </div>
            <button
              onClick={() => setSleepActive(v => !v)}
              className="action-btn w-full py-3.5 rounded-2xl font-bold text-base"
              style={sleepActive
                ? { background: '#FFD6C9', border: '2px solid #F6B6A5', color: '#C94930', boxShadow: '0 4px 0 #F6B6A5' }
                : { background: 'linear-gradient(135deg,#B0A0F0,#9080E0)', border: '2px solid #8070C0', color: 'white', boxShadow: '0 4px 0 #8070C0' }}>
              {sleepActive ? '⏹ Stop Sleep' : '▶ Start Sleep'}
            </button>
          </div>
        )}

        {/* Diaper */}
        {activeLog === 'Diaper' && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide">Type</p>
            <div className="grid grid-cols-3 gap-3">
              {(['Wet', 'Dirty', 'Mixed'] as const).map(t => (
                <button key={t} onClick={() => setDiaperType(t)}
                  className="action-btn py-4 rounded-2xl flex flex-col items-center gap-1.5 transition-all"
                  style={diaperType === t
                    ? { background: '#FEEAE6', border: '2.5px solid #F47B66', boxShadow: '0 3px 0 #F47B66' }
                    : { background: '#FFF8F4', border: '2px solid #F6B6A5' }}>
                  <span className="text-2xl">{t === 'Wet' ? '💧' : t === 'Dirty' ? '💩' : '🔄'}</span>
                  <span className="text-xs font-semibold text-[#242424]">{t}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Meal */}
        {activeLog === 'Meal' && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide">What did Maya eat?</p>
            <div className="flex flex-wrap gap-2">
              {['Banana', 'Oatmeal', 'Sweet potato', 'Chicken', 'Avocado', 'Yogurt', 'Peas', 'Carrot'].map(f => (
                <button key={f} onClick={() => toggleFood(f)} className="action-btn px-3 py-1.5 rounded-full text-xs font-medium"
                  style={mealFoods.includes(f)
                    ? { background: '#55A67A', border: '1.5px solid #3D8A60', color: 'white' }
                    : { background: '#E6F4ED', border: '1.5px solid #A8D9BC', color: '#55A67A' }}>{f}</button>
              ))}
            </div>
            <input value={customFood} onChange={e => setCustomFood(e.target.value)} placeholder="Or type custom food…" className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
          </div>
        )}

        {/* Growth */}
        {activeLog === 'Growth' && (
          <div className="space-y-3">
            {([
              { key: 'heightCm', label: 'Height', unit: 'cm', placeholder: '68' },
              { key: 'weightKg', label: 'Weight', unit: 'kg', placeholder: '7.2' },
              { key: 'headCm', label: 'Head', unit: 'cm', placeholder: '43' },
            ] as const).map(f => (
              <div key={f.label} className="flex items-center gap-3">
                <p className="text-sm font-medium text-[#242424] w-16">{f.label}</p>
                <div className="flex-1 relative">
                  <input type="number" placeholder={f.placeholder}
                    value={growth[f.key] ?? ''}
                    onChange={e => setGrowth(g => ({ ...g, [f.key]: e.target.value === '' ? undefined : Number(e.target.value) }))}
                    className="cartoon-input w-full px-4 py-3 pr-12 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#6E6E73] font-medium">{f.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Shared notes */}
        <div className="mt-4">
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Add a note (optional)…"
            className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="action-btn w-full mt-4 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 text-white"
          style={saved
            ? { background: '#55A67A', border: '2.5px solid #3D8A60', boxShadow: '0 4px 0 #3D8A60' }
            : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2.5px solid #C94930', boxShadow: '0 5px 0 #C94930' }}>
          {saved ? '✅ Saved!' : `Save ${activeLog} Log`}
        </button>
      </div>
    </div>
  )
}

const ALL_LOGS = [
  { icon: '🍼', label: 'Feed',         color: '#6299D5', bg: '#EBF2FC' },
  { icon: '🌙', label: 'Sleep',        color: '#B0A0F0', bg: '#F0EEF9' },
  { icon: '🧷', label: 'Diaper',       color: '#F47B66', bg: '#FEEAE6' },
  { icon: '🥣', label: 'Meal',         color: '#55A67A', bg: '#E6F4ED' },
  { icon: '📏', label: 'Growth',       color: '#F8C85E', bg: '#FEF7E0' },
  { icon: '💊', label: 'Medicine',     color: '#D9534F', bg: '#FAECEC' },
  { icon: '🏥', label: 'Appointment',  color: '#6299D5', bg: '#EBF2FC' },
  { icon: '🧸', label: 'Activity',     color: '#EE674E', bg: '#FFD6C9' },
  { icon: '💉', label: 'Vaccine',      color: '#55A67A', bg: '#E6F4ED' },
  { icon: '🌡️', label: 'Temperature', color: '#D9534F', bg: '#FAECEC' },
]

function AllLogsSheet({ onSelect, onClose }: { onSelect: (l: string) => void; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl px-5 pt-5 pb-8"
        style={{ background: '#FFFCFA', boxShadow: '0 -8px 40px rgba(0,0,0,0.12)' }}>
        <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <p className="font-display text-lg text-[#242424]">Log for Maya</p>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F0E8E4] flex items-center justify-center text-[#6E6E73] text-sm font-bold">✕</button>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {ALL_LOGS.map(item => (
            <button key={item.label}
              onClick={() => onSelect(item.label)}
              className="action-btn flex flex-col items-center gap-1.5 py-3 rounded-2xl"
              style={{ background: item.bg, border: `1.5px solid ${item.color}22` }}>
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-semibold text-[#242424] leading-tight text-center">{item.label}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-[#6E6E73] mt-4">Tap a category to log</p>
      </div>
    </div>
  )
}

function HomeScreen({ onVoice, onSignOut, onNavigate }: { onVoice: () => void; onSignOut: () => void; onNavigate: (s: Screen) => void }) {
  const { t } = useLang()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLog, setActiveLog] = useState<string | null>(null)
  const [showAllLogs, setShowAllLogs] = useState(false)
  const { logs, summary, save } = useTrackingLogs(DEMO_CHILD_ID)
  const homeTimeline = buildTimeline(logs)

  const openLog = (label: string) => {
    setShowAllLogs(false)
    setActiveLog(label)
  }

  return (
    <>
    <div className="scroll-area flex-1 px-4 pt-2 pb-4 space-y-4 slide-up">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="font-display text-2xl text-[#242424]">{t('good_morning')}, Sarah 👋</h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">Here's how Maya's day is looking.</p>
        </div>
        <div className="relative">
          <button onClick={() => setMenuOpen(v => !v)}>
            <Avatar size={44} initials="M" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#55A67A] rounded-full border-2 border-white" />
          </button>
          {menuOpen && (
            <>
              <div className="absolute inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-30 w-48 rounded-2xl overflow-hidden"
                style={{ background: '#FFF8F4', border: '2px solid #F6B6A5', boxShadow: '0 8px 24px rgba(238,103,78,0.15)' }}>
                <div className="px-4 py-3 border-b border-[#F6EDE8]">
                  <p className="font-semibold text-sm text-[#242424]">Sarah Mitchell</p>
                  <p className="text-xs text-[#6E6E73]">MomMind Plus</p>
                </div>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FFF3EE]"
                  onClick={() => setMenuOpen(false)}>
                  <span className="text-base">⚙️</span>
                  <span className="text-sm text-[#242424]">Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#FFF3EE] border-t border-[#F6EDE8]"
                  onClick={() => { setMenuOpen(false); onSignOut() }}>
                  <span className="text-base">🚪</span>
                  <span className="text-sm font-semibold text-[#D9534F]">Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Baby card */}
      <button onClick={() => onNavigate('baby')} className="action-btn w-full glass-card rounded-2xl p-4 flex items-center gap-3 text-left">
        <div className="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FFD6C9, #F6B6A5)' }}>
          <div className="w-full h-full flex items-center justify-center text-2xl">🍼</div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#242424]">Maya</p>
          <p className="text-sm text-[#6E6E73]">7 months, 12 days</p>
          <div className="flex gap-1 mt-1">
            {['Sleep', 'Feed', 'Diaper'].map(t => (
              <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFD6C9] text-[#C94930] font-medium">{t}</span>
            ))}
          </div>
        </div>
        <div className="text-[#EE674E]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </button>

      {/* AI Insight */}
      <div className="glass-card-strong rounded-3xl p-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #EE674E, transparent)', transform: 'translate(30%, -30%)' }} />
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 coral-gradient rounded-full flex items-center justify-center text-white text-xs">✨</div>
          <span className="text-xs font-semibold text-[#EE674E] uppercase tracking-wide">MomMind Insight</span>
        </div>
        <p className="text-[15px] text-[#242424] leading-relaxed font-medium">
          Maya slept 9h 42m last night. Her first nap will likely fall between{' '}
          <span className="text-[#EE674E] font-semibold">9:35–10:05 AM</span>.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onNavigate('ai')}
            className="action-btn flex-1 coral-gradient text-white text-sm font-semibold py-2.5 rounded-xl">
            Ask MomMind
          </button>
          <button
            onClick={() => onNavigate('planner')}
            className="action-btn flex-1 bg-[#FFD6C9] text-[#C94930] text-sm font-semibold py-2.5 rounded-xl">
            View Today
          </button>
        </div>
      </div>

      {/* Next Up */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#EE674E] uppercase tracking-wider">Next Up</span>
          <span className="text-[10px] text-[#6E6E73]">Based on last 7 days</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-xl text-[#242424]">Nap</p>
            <p className="text-sm text-[#6E6E73] mt-0.5">9:35–10:05 AM</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1 bg-[#E8F5EE] text-[#55A67A] text-xs font-semibold px-2.5 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-[#55A67A]" />
              High confidence
            </div>
            <p className="text-xs text-[#6E6E73] mt-1.5">About 42 minutes</p>
          </div>
        </div>
      </div>

      {/* Quick Log */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-[#242424]">Quick Log</p>
          <button
            onClick={() => setShowAllLogs(true)}
            className="action-btn text-xs font-semibold text-[#EE674E] px-3 py-1 rounded-full"
            style={{ background: '#FFD6C9' }}>
            See all
          </button>
        </div>
        <div className="flex justify-between">
          {[
            { icon: '🍼', label: 'Feed' },
            { icon: '🌙', label: 'Sleep' },
            { icon: '🧷', label: 'Diaper' },
            { icon: '🥣', label: 'Meal' },
            { icon: '📏', label: 'Growth' },
          ].map(a => (
            <QuickAction key={a.label} icon={a.icon} label={a.label} onTap={() => openLog(a.label)} />
          ))}
          <QuickAction icon="➕" label="More" onTap={() => setShowAllLogs(true)} />
        </div>
      </div>

      {/* Today's Summary */}
      <div>
        <p className="font-semibold text-[#242424] mb-3">Today's Summary</p>
        <div className="grid grid-cols-5 gap-2">
          <StatCard icon="🌙" label="Sleep" value={`${Math.floor(summary.sleepMinutes / 60)}h ${summary.sleepMinutes % 60}m`} />
          <StatCard icon="🍼" label="Milk" value={`${summary.milkOz} oz`} />
          <StatCard icon="🥣" label="Meals" value={String(summary.meals)} />
          <StatCard icon="🧷" label="Diapers" value={String(summary.diapers)} />
          <StatCard icon="🎯" label="Activities" value="3" sub="not tracked yet" />
        </div>
      </div>

      {/* Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-[#242424]">Today's Timeline</p>
          <button className="text-xs text-[#EE674E] font-medium">Full view</button>
        </div>
        <div className="glass-card rounded-2xl p-4 space-y-0">
          {homeTimeline.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="timeline-dot mt-0.5"
                  style={{
                    background: item.predicted ? 'transparent' : item.color,
                    border: item.predicted ? `2px dashed ${item.color}` : 'none',
                    opacity: item.done ? 1 : 0.6,
                  }}
                />
                {i < homeTimeline.length - 1 && (
                  <div className="w-px flex-1 my-0.5" style={{ background: 'rgba(110,110,115,0.15)', minHeight: 20 }} />
                )}
              </div>
              <div className={`pb-3 flex-1 ${i === homeTimeline.length - 1 ? 'pb-0' : ''}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-[13px] font-medium ${item.done ? 'text-[#242424]' : 'text-[#6E6E73]'}`}>
                      {item.icon} {item.label}
                    </p>
                    {item.predicted && (
                      <span className="text-[10px] text-[#B0A0F0] font-medium">Predicted</span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#6E6E73] flex-shrink-0 ml-2">{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Voice shortcut */}
      <button
        onClick={onVoice}
        className="action-btn w-full glass-card-strong rounded-2xl p-4 flex items-center gap-3"
      >
        <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-white text-lg">🎙️</div>
        <div className="text-left flex-1">
          <p className="font-semibold text-[#242424] text-sm">Voice Mode</p>
          <p className="text-xs text-[#6E6E73]">Tap to talk to MomMind</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#FFD6C9] flex items-center justify-center text-[#EE674E]">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="rotate(-90 7 7)"/></svg>
        </div>
      </button>
    </div>

    {/* Quick Log bottom sheet */}
    {activeLog && <LogSheet activeLog={activeLog} onClose={() => setActiveLog(null)} onSave={save} />}

    {/* All Logs bottom sheet */}
    {showAllLogs && (
      <AllLogsSheet
        onSelect={label => openLog(label)}
        onClose={() => setShowAllLogs(false)}
      />
    )}
    </>
  )
}

// ─── BABY SCREEN ──────────────────────────────────────────────────────────────
function BabyScreen() {
  const [tab, setTab] = useState<'overview' | 'timeline' | 'growth' | 'milestones'>('overview')
  const { logs, summary } = useTrackingLogs(DEMO_CHILD_ID)
  const babyTimeline = buildTimeline(logs)
  const feedSessions = logs.filter(l => l.type === 'Feed').length

  const milestones = [
    { icon: '😊', label: 'First Smile', date: 'March 14', done: true },
    { icon: '🍓', label: 'First Solid Food', date: 'May 2', done: true },
    { icon: '🦷', label: 'First Tooth', date: 'June 18', done: true },
    { icon: '🗣️', label: 'First Word', date: 'Coming soon…', done: false },
    { icon: '🚶', label: 'First Steps', date: 'Coming soon…', done: false },
  ]

  const overviewCards = [
    { icon: '🌙', label: 'Sleep', value: `${Math.floor(summary.sleepMinutes / 60)}h ${summary.sleepMinutes % 60}m`, sub: 'Today', color: '#B0A0F0' },
    { icon: '🍼', label: 'Feeding', value: `${feedSessions} sessions`, sub: `${summary.milkOz} oz total`, color: '#6299D5' },
    { icon: '🥣', label: 'Meals', value: `${summary.meals} meals`, sub: summary.meals > 0 ? 'Logged today' : 'None yet', color: '#55A67A' },
    { icon: '🧷', label: 'Diapers', value: `${summary.diapers} changes`, sub: 'Today', color: '#F47B66' },
    // Growth/Development aren't aggregated from logs yet — see docs/ARCHITECTURE.md NEXT list.
    { icon: '📏', label: 'Growth', value: '68 cm · 7.2 kg', sub: 'Last measured', color: '#F8C85E' },
    { icon: '🎯', label: 'Development', value: '3 activities', sub: 'This week', color: '#EE674E' },
  ]

  return (
    <div className="scroll-area flex-1 px-4 pt-2 pb-4 slide-up">
      {/* Header */}
      <div className="flex items-center gap-4 py-3 mb-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #FFD6C9, #F47B66)' }}>
          🍼
        </div>
        <div>
          <h1 className="font-display text-2xl text-[#242424]">Maya</h1>
          <p className="text-sm text-[#6E6E73]">7 months, 12 days</p>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-[#55A67A]" />
            <span className="text-xs text-[#55A67A] font-medium">All good today</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F6EDE8] p-1 rounded-xl mb-4">
        {(['overview', 'timeline', 'growth', 'milestones'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tab-pill flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize ${
              tab === t ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {overviewCards.map(c => (
              <div key={c.label} className="glass-card rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-sm"
                    style={{ background: `${c.color}22` }}>
                    {c.icon}
                  </div>
                  <span className="text-xs text-[#6E6E73] font-medium">{c.label}</span>
                </div>
                <p className="font-semibold text-[#242424] text-sm">{c.value}</p>
                <p className="text-[11px] text-[#6E6E73]">{c.sub}</p>
              </div>
            ))}
          </div>
          <div className="glass-card-strong rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#EE674E] uppercase tracking-wide mb-2">BabyPredict ✨</p>
            <p className="text-sm text-[#242424] font-medium">Next nap: <span className="text-[#EE674E]">9:35–10:05 AM</span></p>
            <p className="text-xs text-[#6E6E73] mt-0.5">82% confidence · Based on 7-day pattern</p>
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="glass-card rounded-2xl p-4 space-y-0">
          {babyTimeline.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="timeline-dot mt-0.5" style={{ background: item.predicted ? 'transparent' : item.color, border: item.predicted ? `2px dashed ${item.color}` : 'none' }} />
                {i < babyTimeline.length - 1 && <div className="w-px flex-1 my-0.5 bg-[#F0E8E4]" style={{ minHeight: 20 }} />}
              </div>
              <div className="pb-3 flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-[13px] font-medium text-[#242424]">{item.icon} {item.label}</p>
                  <span className="text-[11px] text-[#6E6E73] ml-2 flex-shrink-0">{item.time}</span>
                </div>
                {item.predicted && <span className="text-[10px] text-[#B0A0F0] font-medium">Predicted</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'growth' && (
        <div className="space-y-3">
          <div className="glass-card-strong rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide mb-3">Current Measurements</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Height', value: '68 cm', pct: 62 },
                { label: 'Weight', value: '7.2 kg', pct: 48 },
                { label: 'Head', value: '43 cm', pct: 55 },
                { label: 'BMI', value: 'Healthy', pct: 50 },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs text-[#6E6E73]">{m.label}</span>
                    <span className="text-xs font-semibold text-[#242424]">{m.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F0E8E4] overflow-hidden">
                    <div className="h-full rounded-full coral-gradient" style={{ width: `${m.pct}%` }} />
                  </div>
                  <p className="text-[10px] text-[#6E6E73] mt-1">{m.pct}th percentile</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#6E6E73] uppercase tracking-wide mb-3">Weight History</p>
            <div className="flex items-end gap-2 h-16">
              {[5.1, 5.8, 6.3, 6.7, 7.0, 7.2].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md" style={{ height: `${(v / 7.2) * 100}%`, background: i === 5 ? '#EE674E' : '#FFD6C9' }} />
                  <span className="text-[9px] text-[#6E6E73]">{['2m', '3m', '4m', '5m', '6m', '7m'][i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'milestones' && (
        <div className="space-y-3">
          <div className="glass-card-strong rounded-2xl p-4">
            <p className="text-xs font-semibold text-[#EE674E] uppercase tracking-wide mb-3">Maya's Milestones</p>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${m.done ? '' : 'opacity-40'}`}
                    style={{ background: m.done ? '#FFD6C9' : '#F0E8E4' }}>
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${m.done ? 'text-[#242424]' : 'text-[#6E6E73]'}`}>{m.label}</p>
                    <p className="text-xs text-[#6E6E73]">{m.date}</p>
                  </div>
                  {m.done && <div className="w-5 h-5 rounded-full bg-[#E8F5EE] flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#55A67A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── AI SCREEN ────────────────────────────────────────────────────────────────
function AIScreen({ onVoice }: { onVoice: () => void }) {
  const [messages, setMessages] = useState(chatHistory)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const aiReplies: Record<string, string> = {
    'How was last night?': 'Last night was great! Maya slept from 7:52 PM to 7:34 AM — a total of 9h 42m. That\'s 18 minutes longer than her 7-day average. No wake-ups recorded. 🌙',
    'Plan our day': 'Here\'s a suggested plan for today:\n\n9:35 AM — Nap (predicted, 60–90 min)\n11:00 AM — Bottle feed + lunch\n12:30 PM — Playtime / tummy time\n2:00 PM — Pediatric appointment\n3:30 PM — Afternoon nap\n5:30 PM — Dinner\n7:45 PM — Bedtime routine',
    'When should Maya nap?': 'Based on Maya\'s wake time at 7:10 AM and her typical wake window of 2h 20m, I\'d expect her to be ready for a nap around 9:35–10:05 AM. 82% confidence.',
    'What to cook today?': 'For Maya today I\'d suggest:\n\n🥣 Breakfast: Banana oatmeal (already had)\n🥕 Lunch: Sweet potato & chicken purée\n🥑 Dinner: Avocado pasta\n\nAll safe for 7-month-olds and quick to prepare!',
    'Create caregiver handoff': 'Creating handoff for Maya\'s evening...\n\nLast feeding: 4:20 PM — 5 oz\nLast nap: 2:05–3:22 PM\nNext feeding: ~7:15 PM\nBedtime: ~7:45 PM\nDinner: Sweet potato + chicken\n\nNote: Bottle prepared in refrigerator.\n\nShare with caregiver?',
  }

  const send = (text: string) => {
    if (!text.trim()) return
    setMessages(m => [...m, { role: 'user', text }])
    setInput('')
    setThinking(true)
    setTimeout(() => {
      const reply = aiReplies[text] || 'I\'ll look into that for you. Based on Maya\'s recent patterns, I\'ll have a detailed answer ready in a moment!'
      // Client-side stand-in for the real AI Gateway safety classifier — see
      // docs/ARCHITECTURE.md §4.1. Flags the message so the UI can render the
      // doctor-consult disclaimer distinctly rather than burying it in the reply text.
      const disclaimer = needsHealthDisclaimer(text) || needsHealthDisclaimer(reply)
      setMessages(m => [...m, { role: 'ai', text: reply, disclaimer }])
      setThinking(false)
    }, 1200)
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  return (
    <div className="flex-1 flex flex-col slide-up overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl text-[#242424]">MomMind AI</h1>
          <p className="text-xs text-[#6E6E73]">Your parenting copilot</p>
        </div>
        <button
          onClick={onVoice}
          className="action-btn w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-white text-lg shadow-lg"
        >
          🎙️
        </button>
      </div>

      {/* AI Orb */}
      <div className="flex justify-center pt-2 pb-4">
        <div className="ai-orb ai-orb-pulse rounded-full w-16 h-16 flex items-center justify-center">
          <span className="text-2xl">✨</span>
        </div>
      </div>

      {/* Chat */}
      <div ref={scrollRef} className="scroll-area flex-1 px-4 pb-2 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 coral-gradient rounded-full flex items-center justify-center text-white text-xs mr-2 flex-shrink-0 mt-0.5">✨</div>
            )}
            <div className="max-w-[80%]">
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'coral-gradient text-white rounded-br-sm'
                    : 'glass-card text-[#242424] rounded-bl-sm'
                }`}
              >
                {m.text}
              </div>
              {m.disclaimer && (
                <div className="flex items-start gap-1.5 mt-1.5 px-1">
                  <span className="text-xs mt-0.5">⚕️</span>
                  <p className="text-[11px] text-[#B0806E] leading-snug">{HEALTH_DISCLAIMER}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 coral-gradient rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✨</div>
            <div className="glass-card px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#EE674E]"
                  style={{ animation: `orbPulse 1s ease-in-out infinite ${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none' }}>
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="action-btn flex-shrink-0 px-3 py-2 rounded-xl bg-[#FFD6C9] text-[#C94930] text-xs font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-1">
        <div className="glass-card rounded-2xl flex items-center gap-2 px-3 py-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask MomMind anything…"
            className="flex-1 bg-transparent text-sm text-[#242424] placeholder-[#B0A8A4] outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim()}
            className="action-btn w-8 h-8 coral-gradient rounded-xl flex items-center justify-center text-white disabled:opacity-40 flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7 2l5 5-5 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── VOICE SCREEN ─────────────────────────────────────────────────────────────
function VoiceScreen({ onClose }: { onClose: () => void }) {
  const [state, setState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [disclaimer, setDisclaimer] = useState(false)

  useEffect(() => {
    // Spoken self-disclosure at the start of every voice session — see
    // docs/ARCHITECTURE.md §4.1. Not skippable: the assistant introduces
    // itself as AI before anything else happens.
    setState('speaking')
    setResponse(AI_SELF_DISCLOSURE)
    const t0 = setTimeout(() => {
      setResponse('')
      setState('listening')
    }, 2600)
    const t1 = setTimeout(() => {
      setTranscript('Maya just drank five ounces.')
      setState('thinking')
    }, 2600 + 2200)
    const t2 = setTimeout(() => {
      const reply = 'Got it. I logged a 5 oz bottle for Maya at 2:15 PM.'
      setDisclaimer(needsHealthDisclaimer('Maya just drank five ounces.') || needsHealthDisclaimer(reply))
      setResponse(reply)
      setState('speaking')
    }, 2600 + 3800)
    return () => { clearTimeout(t0); clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const stateLabel = { idle: 'Tap to speak', listening: 'Listening…', thinking: 'Thinking…', speaking: 'MomMind is responding' }

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center"
      style={{ background: 'linear-gradient(160deg, #EE674E 0%, #F47B66 35%, #F6B6A5 70%, #FFD6C9 100%)' }}>
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blob" style={{ width: 300, height: 300, background: 'rgba(255,255,255,0.12)', top: '5%', left: '-10%' }} />
        <div className="blob" style={{ width: 250, height: 250, background: 'rgba(255,255,255,0.08)', bottom: '20%', right: '-5%' }} />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between w-full px-5 pt-14 pb-4">
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">Voice Mode</p>
          <p className="text-white font-semibold">MomMind AI</p>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Orb */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-8 px-5">
        {/* Waveform rings */}
        <div className="relative flex items-center justify-center">
          {state === 'listening' && [1, 2, 3].map(r => (
            <div key={r} className="absolute rounded-full border border-white/20"
              style={{
                width: 96 + r * 52,
                height: 96 + r * 52,
                animation: `orbPulse ${1.5 + r * 0.3}s ease-in-out infinite ${r * 0.2}s`,
              }}
            />
          ))}
          <div className="w-24 h-24 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/40 shadow-2xl"
            style={state === 'listening' ? { animation: 'orbPulse 1.2s ease-in-out infinite' } : {}}>
            <span className="text-4xl">✨</span>
          </div>
        </div>

        {/* Waveform bars */}
        {state === 'listening' && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="wave-bar"
                style={{
                  animationDuration: `${0.5 + Math.random() * 0.6}s`,
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0.7 + Math.random() * 0.3,
                }}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <p className="text-white font-semibold text-lg">{stateLabel[state]}</p>
          {transcript && (
            <div className="mt-3 bg-white/20 rounded-2xl px-4 py-2.5 max-w-xs">
              <p className="text-white/70 text-xs font-medium mb-1">You said</p>
              <p className="text-white text-sm">"{ transcript}"</p>
            </div>
          )}
          {response && (
            <div className="mt-3 bg-white/30 rounded-2xl px-4 py-2.5 max-w-xs">
              <p className="text-white/70 text-xs font-medium mb-1">MomMind AI</p>
              <p className="text-white text-sm font-medium">"{response}"</p>
              {disclaimer && (
                <p className="text-white/80 text-[11px] mt-2 leading-snug">⚕️ {HEALTH_DISCLAIMER}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center gap-5 pb-14 px-5">
        <button className="w-14 h-14 rounded-full bg-white/20 flex flex-col items-center justify-center gap-0.5 border border-white/30">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 3v14M3 10h14" stroke="white" strokeWidth="1.8" strokeLinecap="round" transform="rotate(45 10 10)"/></svg>
          <span className="text-white/70 text-[9px]">Mute</span>
        </button>
        <button className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
          <div className="w-5 h-5 rounded-sm bg-[#EE674E]" />
        </button>
        <button className="w-14 h-14 rounded-full bg-white/20 flex flex-col items-center justify-center gap-0.5 border border-white/30">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="4" y="4" width="4" height="12" rx="1" fill="white"/><rect x="12" y="4" width="4" height="12" rx="1" fill="white"/></svg>
          <span className="text-white/70 text-[9px]">End</span>
        </button>
      </div>
    </div>
  )
}

// ─── PLANNER SCREEN ───────────────────────────────────────────────────────────
function PlannerScreen() {
  // Feeding/Meal/Sleep slots reconcile against real TrackingLogs (nearest
  // match within 90 min) instead of a disconnected local checkbox — see
  // src/services/plannerReconcile.ts. Activity/Appointment/Routine and any
  // `predicted` slot stay local-only toggles; there's no service for those yet.
  const { logs, save, remove } = useTrackingLogs(DEMO_CHILD_ID)
  const reconciled = reconcilePlanner(plannerItems, logs)
  const [manualDone, setManualDone] = useState<Set<number>>(new Set())
  const sections = ['Morning', 'Afternoon', 'Evening'] as const

  const completed = [...new Set([...manualDone, ...reconciled.keys()])]

  const toggle = (i: number) => {
    const item = plannerItems[i]
    const logType = !item.predicted ? PLANNER_CATEGORY_TO_LOG_TYPE[item.cat] : undefined

    if (!logType) {
      setManualDone(s => {
        const next = new Set(s)
        next.has(i) ? next.delete(i) : next.add(i)
        return next
      })
      return
    }

    const existing = reconciled.get(i)
    if (existing) {
      remove(existing.id)
      return
    }
    if (logType === 'Feed') save({ type: 'Feed', feed: { amountOz: 5, method: 'Bottle' } })
    else if (logType === 'Meal') save({ type: 'Meal', meal: { foods: [item.label] } })
    else if (logType === 'Sleep') save({ type: 'Sleep', sleep: { durationSec: 0 } })
  }

  return (
    <div className="scroll-area flex-1 px-4 pt-2 pb-4 slide-up">
      {/* Header */}
      <div className="flex items-center justify-between py-3 mb-2">
        <div>
          <h1 className="font-display text-2xl text-[#242424]">Today</h1>
          <p className="text-sm text-[#6E6E73]">Monday, August 10</p>
        </div>
        <button className="action-btn coral-gradient text-white text-xs font-semibold px-3.5 py-2 rounded-xl">
          ✨ Optimize Day
        </button>
      </div>

      {/* Progress */}
      <div className="glass-card rounded-2xl p-3.5 mb-4 flex items-center gap-3">
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg width="48" height="48" className="progress-ring">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#FFD6C9" strokeWidth="4" />
            <circle cx="24" cy="24" r="20" fill="none" stroke="#EE674E" strokeWidth="4"
              strokeDasharray={`${(completed.length / plannerItems.length) * 125.6} 125.6`}
              strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#EE674E]">
            {Math.round((completed.length / plannerItems.length) * 100)}%
          </span>
        </div>
        <div>
          <p className="font-semibold text-[#242424] text-sm">{completed.length} of {plannerItems.length} done</p>
          <p className="text-xs text-[#6E6E73]">Great progress, Sarah!</p>
        </div>
        <button className="ml-auto w-8 h-8 rounded-xl bg-[#FFD6C9] flex items-center justify-center text-[#EE674E] text-sm">+</button>
      </div>

      {sections.map(section => {
        const items = plannerItems.filter(p => p.section === section)
        return (
          <div key={section} className="mb-5">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wider mb-2">{section}</p>
            <div className="space-y-2">
              {items.map((item, i) => {
                const idx = plannerItems.indexOf(item)
                const done = completed.includes(idx)
                return (
                  <button
                    key={i}
                    onClick={() => toggle(idx)}
                    className={`action-btn w-full glass-card rounded-xl p-3 flex items-center gap-3 text-left ${done ? 'opacity-60' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: `${item.color}22` }}>
                      {done ? '✓' : item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${done ? 'line-through text-[#6E6E73]' : 'text-[#242424]'}`}>
                        {item.label}
                        {item.predicted && <span className="ml-1 text-[10px] text-[#B0A0F0] font-normal no-underline">predicted</span>}
                      </p>
                      <p className="text-[11px] text-[#6E6E73]">{item.cat}</p>
                    </div>
                    <span className="text-[11px] text-[#6E6E73] flex-shrink-0">{item.time}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── MORE SUB-SCREEN HEADER ────────────────────────────────────────────────────
function SubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0">
      <button onClick={onBack} className="action-btn w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: '#FFF8F4', border: '1.5px solid #F6B6A5', boxShadow: '0 2px 0 #F6B6A5' }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      <h2 className="font-display text-xl text-[#242424]">{title}</h2>
    </div>
  )
}

// ─── PROFILE SUB-SCREEN ────────────────────────────────────────────────────────
function ProfileSubScreen({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('Sarah Mitchell')
  const [email, setEmail] = useState('sarah@email.com')
  const [saved, setSaved] = useState(false)
  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="My Profile" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="relative">
            <Avatar size={72} initials="S" bg="#F47B66" />
            <button className="absolute -bottom-1 -right-1 w-7 h-7 coral-gradient rounded-full flex items-center justify-center text-white text-xs border-2 border-white">✎</button>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#242424]">Sarah Mitchell</p>
            <span className="text-[10px] px-3 py-1 rounded-full font-semibold text-[#EE674E]" style={{ background: '#FFD6C9' }}>MomMind Plus ⭐</span>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Personal Info</p>
          {[{ label: 'Full Name', val: name, set: setName }, { label: 'Email', val: email, set: setEmail }].map(f => (
            <div key={f.label}>
              <p className="text-xs text-[#6E6E73] mb-1">{f.label}</p>
              <input value={f.val} onChange={e => f.set(e.target.value)} className="cartoon-input w-full px-4 py-3 text-sm text-[#242424]" />
            </div>
          ))}
        </div>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
          {[{ icon: '👶', label: "Maya's Profile", sub: '7 months' }, { icon: '🔑', label: 'Change Password', sub: '' }, { icon: '📱', label: 'Linked Devices', sub: '2 devices' }].map((r, i) => (
            <button key={i} className="action-btn w-full flex items-center gap-3 px-4 py-3">
              <div className="w-8 h-8 rounded-xl bg-[#F0E8E4] flex items-center justify-center text-base">{r.icon}</div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[#242424]">{r.label}</p>
                {r.sub && <p className="text-xs text-[#6E6E73]">{r.sub}</p>}
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#B0A8A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 1800) }}
          className="action-btn w-full py-4 rounded-2xl font-bold text-base text-white"
          style={saved ? { background: '#55A67A', border: '2.5px solid #3D8A60', boxShadow: '0 4px 0 #3D8A60' } : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2.5px solid #C94930', boxShadow: '0 5px 0 #C94930' }}>
          {saved ? '✅ Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ─── FAMILY & CAREGIVERS SUB-SCREEN ────────────────────────────────────────────
type InviteType = 'family' | 'caregiver' | null

function InviteSheet({ type, onClose, onSent }: {
  type: InviteType
  onClose: () => void
  onSent: (name: string, role: string) => void
}) {
  const isFamily = type === 'family'

  const familyRoles = ['Partner / Spouse', 'Grandparent', 'Sibling', 'Other Family']
  const caregiverRoles = ['Nanny', 'Au Pair', 'Babysitter', 'Night Nurse', 'Other Caregiver']
  const roles = isFamily ? familyRoles : caregiverRoles

  const allPerms = ['View timeline', 'Log feeding', 'Log sleep', 'View meals', 'View appointments', 'View private notes', 'Marketplace access']
  const defaultPerms = isFamily ? [0, 1, 2, 3, 4] : [0, 1, 2, 3]

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [role, setRole] = useState('')
  const [tempAccess, setTempAccess] = useState(false)
  const [until, setUntil] = useState('10:00 PM')
  const [perms, setPerms] = useState(defaultPerms)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const togglePerm = (i: number) =>
    setPerms(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])

  const handleSend = () => {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSent(true)
      setTimeout(() => { onSent(name || (isFamily ? 'Family Member' : 'Caregiver'), role || roles[0]); onClose() }, 1200)
    }, 1400)
  }

  const canNext1 = contact.trim().length > 0 && role !== ''

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 rounded-t-3xl"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>

        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= s ? 'text-white' : 'text-[#B0A8A4]'}`}
                  style={{ background: step > s ? '#55A67A' : step === s ? 'linear-gradient(135deg,#EE674E,#F47B66)' : '#F0E8E4' }}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-[11px] font-semibold flex-1 ${step === s ? 'text-[#EE674E]' : step > s ? 'text-[#55A67A]' : 'text-[#B0A8A4]'}`}>
                  {s === 1 ? 'Details' : s === 2 ? 'Permissions' : 'Confirm'}
                </span>
                {s < 3 && <div className="w-4 h-px bg-[#F0E8E4] mx-1" />}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isFamily ? '' : ''}`}
              style={{ background: isFamily ? '#FFD6C9' : '#E6F4ED' }}>
              {isFamily ? '👨‍👩‍👧' : '🤝'}
            </div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">
                Invite {isFamily ? 'Family Member' : 'Caregiver'}
              </h3>
              <p className="text-xs text-[#6E6E73]">
                {isFamily ? "They'll have family access to Maya" : 'Set access for your caregiver'}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="scroll-area flex-1 px-5 pb-4">

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <div className="space-y-3 pt-1">
              <div>
                <p className="text-xs font-semibold text-[#6E6E73] mb-1.5">Their name <span className="text-[#B0A8A4]">(optional)</span></p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">😊</span>
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder={isFamily ? 'e.g. Grandma Rose' : 'e.g. Maria'}
                    className="cartoon-input w-full pl-11 pr-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6E6E73] mb-1.5">Email or phone number *</p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">📧</span>
                  <input value={contact} onChange={e => setContact(e.target.value)}
                    placeholder="email@example.com or +1 555 0000"
                    className="cartoon-input w-full pl-11 pr-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#6E6E73] mb-1.5">Their role *</p>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map(r => (
                    <button key={r} onClick={() => setRole(r)}
                      className="action-btn py-3 rounded-xl text-sm font-semibold transition-all text-left px-3.5"
                      style={role === r
                        ? { background: isFamily ? '#FFD6C9' : '#E6F4ED', border: `2px solid ${isFamily ? '#EE674E' : '#55A67A'}`, color: isFamily ? '#EE674E' : '#55A67A', boxShadow: `0 3px 0 ${isFamily ? '#F6B6A5' : '#A8D9BC'}` }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4', color: '#6E6E73' }}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {!isFamily && (
                <div className="glass-card rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#242424]">Temporary access</p>
                      <p className="text-xs text-[#6E6E73]">Auto-revoke after a time</p>
                    </div>
                    <button onClick={() => setTempAccess(v => !v)}
                      className="action-btn w-12 h-6 rounded-full transition-all flex-shrink-0"
                      style={{ background: tempAccess ? '#EE674E' : '#E0D8D4' }}>
                      <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                        style={{ marginLeft: tempAccess ? '24px' : '2px' }} />
                    </button>
                  </div>
                  {tempAccess && (
                    <div className="mt-3 pt-3 border-t border-[#F0E8E4]">
                      <p className="text-xs text-[#6E6E73] mb-2">Access until</p>
                      <div className="flex gap-2">
                        {['6:00 PM', '8:00 PM', '10:00 PM', '12:00 AM'].map(t => (
                          <button key={t} onClick={() => setUntil(t)}
                            className="action-btn flex-1 py-2 rounded-lg text-[11px] font-semibold"
                            style={until === t
                              ? { background: '#FFD6C9', border: '1.5px solid #EE674E', color: '#EE674E' }
                              : { background: '#F0E8E4', border: '1.5px solid transparent', color: '#6E6E73' }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Step 2: Permissions ── */}
          {step === 2 && (
            <div className="space-y-3 pt-1">
              <div className="glass-card-strong rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg,${isFamily ? '#EE674E' : '#55A67A'},${isFamily ? '#F47B66' : '#78C49A'})` }}>
                  {(name || (isFamily ? 'F' : 'C'))[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#242424]">{name || (isFamily ? 'Family Member' : 'Caregiver')}</p>
                  <p className="text-xs text-[#6E6E73]">{role} · {contact}</p>
                </div>
              </div>

              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">What can they access?</p>

              <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
                {allPerms.map((p, i) => {
                  const icons = ['📅', '🍼', '🌙', '🥣', '🏥', '📝', '🛍️']
                  const on = perms.includes(i)
                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-base w-6 text-center flex-shrink-0">{icons[i]}</span>
                      <p className="text-sm text-[#242424] flex-1">{p}</p>
                      <button onClick={() => togglePerm(i)}
                        className="action-btn w-12 h-6 rounded-full transition-all flex-shrink-0"
                        style={{ background: on ? (isFamily ? '#EE674E' : '#55A67A') : '#E0D8D4' }}>
                        <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                          style={{ marginLeft: on ? '24px' : '2px' }} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <button onClick={() => setPerms(allPerms.map((_, i) => i))}
                  className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-[#EE674E]"
                  style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>
                  Select All
                </button>
                <button onClick={() => setPerms([])}
                  className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-[#6E6E73]"
                  style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Confirm & Send ── */}
          {step === 3 && (
            <div className="space-y-3 pt-1">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-8 gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl">✅</div>
                  <div className="text-center">
                    <p className="font-display text-xl text-[#242424]">Invite sent!</p>
                    <p className="text-sm text-[#6E6E73] mt-1">
                      {name || 'They'} will receive an invite at{' '}
                      <span className="font-semibold text-[#242424]">{contact}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="glass-card-strong rounded-2xl p-4 space-y-3">
                    <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Invite Summary</p>
                    {[
                      { icon: '😊', label: 'Name', val: name || '—' },
                      { icon: '📧', label: 'Contact', val: contact },
                      { icon: '🎭', label: 'Role', val: role },
                      { icon: '🔐', label: 'Permissions', val: `${perms.length} of ${allPerms.length} enabled` },
                      ...(tempAccess ? [{ icon: '⏰', label: 'Access until', val: until }] : []),
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-base w-6 text-center">{r.icon}</span>
                        <p className="text-xs text-[#6E6E73] w-20 flex-shrink-0">{r.label}</p>
                        <p className="text-sm font-semibold text-[#242424] flex-1">{r.val}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
                    <p className="text-xs text-[#7A6010] leading-relaxed">
                      ⚠️ They'll receive a link to download MomMind and join your family. You can remove access at any time.
                    </p>
                  </div>

                  {/* Send methods */}
                  <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Send invite via</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[{ icon: '📱', label: 'SMS' }, { icon: '📧', label: 'Email' }, { icon: '🔗', label: 'Copy Link' }].map(m => (
                      <button key={m.label} onClick={handleSend}
                        className="action-btn py-3.5 rounded-xl flex flex-col items-center gap-1.5"
                        style={{ background: '#F8F4F2', border: '2px solid #F0E8E4', boxShadow: '0 3px 0 #E8E0DC' }}>
                        <span className="text-2xl">{m.icon}</span>
                        <span className="text-xs font-semibold text-[#242424]">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {!sent && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as 1 | 2 | 3)}
                className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            <button
              onClick={() => step < 3 ? setStep(s => (s + 1) as 1 | 2 | 3) : handleSend()}
              disabled={step === 1 && !canNext1}
              className="action-btn flex-1 py-3.5 rounded-xl font-bold text-base text-white"
              style={step === 1 && !canNext1
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : sending
                  ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 2px 0 #E8A090' }
                  : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2.5px solid #C94930', boxShadow: '0 5px 0 #C94930' }}>
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />
                  Sending…
                </span>
              ) : step === 1 ? 'Next — Set Permissions →' : step === 2 ? 'Review Invite →' : 'Send Invite 🎉'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function FamilySubScreen({ onBack }: { onBack: () => void }) {
  const [inviteType, setInviteType] = useState<InviteType>(null)
  const [members, setMembers] = useState([
    { name: 'Sarah', role: 'Mom', tag: 'Owner', color: '#EE674E', bg: '#FFD6C9', online: true },
    { name: 'David', role: 'Dad', tag: 'Parent', color: '#6299D5', bg: '#EBF2FC', online: true },
    { name: 'Grandma', role: 'Temporary Caregiver', tag: 'Until 10 PM', color: '#55A67A', bg: '#E6F4ED', online: false },
    { name: 'Nanny', role: 'Caregiver', tag: 'Active', color: '#B0A0F0', bg: '#F0EEF9', online: false },
  ])
  const perms = ['View timeline', 'Log feeding', 'Log sleep', 'View meals', 'View appointments', 'View private notes', 'Marketplace access']
  const [selected, setSelected] = useState([0, 1, 2, 3])
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const handleInviteSent = (name: string, role: string) => {
    const colors = ['#EE674E', '#6299D5', '#55A67A', '#B0A0F0', '#F8C85E']
    const bgs   = ['#FFD6C9', '#EBF2FC', '#E6F4ED', '#F0EEF9', '#FEF7E0']
    const idx   = members.length % colors.length
    setMembers(m => [...m, { name, role, tag: 'Pending', color: colors[idx], bg: bgs[idx], online: false }])
  }

  const handleDelete = (i: number) => {
    setMembers(m => m.filter((_, idx) => idx !== i))
    setConfirmDelete(null)
  }

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Family & Caregivers" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">
        {/* Member list */}
        <div className="space-y-2">
          {members.map((m, i) => (
            <div key={i}>
              <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3"
                style={confirmDelete === i ? { border: '1.5px solid #F6B6A5', background: 'rgba(255,214,201,0.5)' } : {}}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: `linear-gradient(135deg,${m.color},${m.color}99)` }}>{m.name[0]}</div>
                  {m.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#55A67A] rounded-full border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-[#242424]">{m.name}</p>
                  <p className="text-xs text-[#6E6E73]">{m.role}</p>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: m.bg, color: m.color }}>{m.tag}</span>
                {/* Delete button — hidden for Owner */}
                {m.tag !== 'Owner' && (
                  <button
                    onClick={() => setConfirmDelete(confirmDelete === i ? null : i)}
                    className="action-btn w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ml-1"
                    style={confirmDelete === i
                      ? { background: '#FFD6C9', border: '1.5px solid #EE674E' }
                      : { background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M2 3.5h9M5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M3.5 3.5l.5 7h5l.5-7" stroke={confirmDelete === i ? '#EE674E' : '#6E6E73'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
              {/* Inline confirm row */}
              {confirmDelete === i && (
                <div className="mx-1 rounded-b-2xl px-4 py-3 flex items-center gap-3"
                  style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5', borderTop: 'none', marginTop: -4 }}>
                  <p className="text-xs font-semibold text-[#EE674E] flex-1">Remove {m.name} from family?</p>
                  <button onClick={() => setConfirmDelete(null)}
                    className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#6E6E73]"
                    style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>
                    Cancel
                  </button>
                  <button onClick={() => handleDelete(i)}
                    className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '1.5px solid #C94930', boxShadow: '0 2px 0 #C94930' }}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Invite buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setInviteType('family')}
            className="action-btn flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            <span className="text-base">👨‍👩‍👧</span> Invite Family
          </button>
          <button
            onClick={() => setInviteType('caregiver')}
            className="action-btn flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm text-[#55A67A]"
            style={{ background: '#E6F4ED', border: '2px solid #A8D9BC', boxShadow: '0 4px 0 #A8D9BC' }}>
            <span className="text-base">🤝</span> Invite Caregiver
          </button>
        </div>

        {/* Permissions */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Manage Permissions</p>
          <div className="space-y-3">
            {perms.map((p, i) => {
              const icons = ['📅','🍼','🌙','🥣','🏥','📝','🛍️']
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-base w-6 text-center">{icons[i]}</span>
                  <p className="text-sm text-[#242424] flex-1">{p}</p>
                  <button onClick={() => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}
                    className="action-btn w-12 h-6 rounded-full transition-all flex-shrink-0"
                    style={{ background: selected.includes(i) ? '#EE674E' : '#E0D8D4' }}>
                    <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                      style={{ marginLeft: selected.includes(i) ? '24px' : '2px' }} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>

    {/* Invite bottom sheet */}
    {inviteType && (
      <InviteSheet
        type={inviteType}
        onClose={() => setInviteType(null)}
        onSent={handleInviteSent}
      />
    )}
    </>
  )
}

// ─── CAREGIVER HANDOFF SUB-SCREEN ──────────────────────────────────────────────
function HandoffShareSheet({ items, shared, onClose }: {
  items: { icon: string; label: string; val: string }[]
  shared: number[]
  onClose: () => void
}) {
  const caregivers = [
    { name: 'Grandma', role: 'Temporary Caregiver', color: '#55A67A', bg: '#E6F4ED' },
    { name: 'Nanny', role: 'Caregiver', color: '#B0A0F0', bg: '#F0EEF9' },
    { name: 'David', role: 'Dad', color: '#6299D5', bg: '#EBF2FC' },
  ]
  const methods = [
    { icon: '📱', label: 'SMS' },
    { icon: '📧', label: 'Email' },
    { icon: '💬', label: 'WhatsApp' },
    { icon: '🔗', label: 'Copy Link' },
  ]
  const [selectedCaregiver, setSelectedCaregiver] = useState(0)
  const [selectedMethod, setSelectedMethod] = useState<number | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [note, setNote] = useState('')

  const sharedItems = items.filter((_, i) => shared.includes(i))

  const handleSend = (methodIdx: number) => {
    setSelectedMethod(methodIdx)
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true) }, 1400)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '86%' }}>

        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-white text-lg">📤</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">Share Handoff</h3>
              <p className="text-xs text-[#6E6E73]">{sharedItems.length} of {items.length} items selected</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-2 space-y-4">
          {sent ? (
            /* ── Success state ── */
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">✅</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Handoff Shared!</p>
                <p className="text-sm text-[#6E6E73] mt-1">
                  Sent to <span className="font-semibold text-[#242424]">{caregivers[selectedCaregiver].name}</span> via{' '}
                  <span className="font-semibold text-[#242424]">{methods[selectedMethod!].label}</span>
                </p>
              </div>
              <div className="glass-card rounded-2xl p-4 w-full space-y-2">
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">What was shared</p>
                {sharedItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <p className="text-xs text-[#242424]"><span className="text-[#6E6E73]">{item.label}:</span> {item.val}</p>
                  </div>
                ))}
              </div>
              <button onClick={onClose}
                className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Caregiver picker */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Send to</p>
                <div className="space-y-2">
                  {caregivers.map((c, i) => (
                    <button key={i} onClick={() => setSelectedCaregiver(i)}
                      className="action-btn w-full rounded-2xl p-3 flex items-center gap-3 text-left"
                      style={selectedCaregiver === i
                        ? { background: c.bg, border: `2px solid ${c.color}`, boxShadow: `0 3px 0 ${c.color}44` }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${c.color},${c.color}99)` }}>{c.name[0]}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-[#242424]">{c.name}</p>
                        <p className="text-xs text-[#6E6E73]">{c.role}</p>
                      </div>
                      {selectedCaregiver === i && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: c.color }}>
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Handoff preview */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Handoff preview</p>
                <div className="glass-card rounded-2xl divide-y divide-[#F0E8E4] overflow-hidden">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5"
                      style={!shared.includes(i) ? { opacity: 0.35 } : {}}>
                      <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[#6E6E73]">{item.label}</p>
                        <p className="text-sm font-medium text-[#242424] truncate">{item.val}</p>
                      </div>
                      {!shared.includes(i) && <span className="text-[10px] text-[#B0A8A4] font-medium">excluded</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional note */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Add a note <span className="font-normal normal-case">(optional)</span></p>
                <div className="relative">
                  <textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder={`Hi ${caregivers[selectedCaregiver].name}! Here's Maya's handoff for tonight...`}
                    rows={2}
                    className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
                </div>
              </div>

              {/* Send via */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Send via</p>
                <div className="grid grid-cols-4 gap-2">
                  {methods.map((m, i) => (
                    <button key={i} onClick={() => handleSend(i)}
                      disabled={sending}
                      className="action-btn py-3.5 rounded-2xl flex flex-col items-center gap-1.5"
                      style={sending && selectedMethod === i
                        ? { background: '#FFD6C9', border: '2px solid #F6B6A5', boxShadow: '0 2px 0 #F6B6A5' }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4', boxShadow: '0 3px 0 #E8E0DC' }}>
                      {sending && selectedMethod === i ? (
                        <span className="w-5 h-5 rounded-full border-2 border-[#F6B6A5] border-t-[#EE674E] inline-block spin-slow" />
                      ) : (
                        <span className="text-2xl">{m.icon}</span>
                      )}
                      <span className="text-[11px] font-semibold text-[#242424]">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {!sent && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3">
            <button onClick={onClose}
              className="action-btn w-full py-3 rounded-2xl font-semibold text-sm text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CaregiverHandoffSubScreen({ onBack }: { onBack: () => void }) {
  const [shared, setShared] = useState([0, 1, 2, 3, 4])
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const items = [
    { icon: '🍼', label: 'Last feeding', val: '4:20 PM — 5 oz' },
    { icon: '🌙', label: 'Last nap', val: '2:05–3:22 PM' },
    { icon: '⏰', label: 'Next feeding', val: 'Around 7:15 PM' },
    { icon: '🛏️', label: 'Bedtime', val: 'Around 7:45 PM' },
    { icon: '🥣', label: 'Dinner', val: 'Sweet potato + chicken' },
    { icon: '📝', label: 'Important notes', val: 'Bottle prepared in refrigerator.' },
  ]
  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Caregiver Handoff" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">
        <div className="glass-card-strong rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 coral-gradient rounded-xl flex items-center justify-center text-white text-sm">✨</div>
            <div>
              <p className="font-semibold text-sm text-[#242424]">Maya's Evening Handoff</p>
              <p className="text-xs text-[#6E6E73]">Auto-generated · Monday Aug 10</p>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-[#F0E8E4]">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 py-2.5">
                <button onClick={() => setShared(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}
                  className="action-btn w-5 h-5 rounded-md flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all"
                  style={{ background: shared.includes(i) ? '#EE674E' : 'white', borderColor: shared.includes(i) ? '#EE674E' : '#F6B6A5' }}>
                  {shared.includes(i) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#6E6E73]">{item.icon} {item.label}</p>
                  <p className="text-sm font-medium text-[#242424]">{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600) }}
            className="action-btn flex-1 py-3.5 rounded-xl font-semibold text-sm text-white"
            style={copied ? { background: '#55A67A', border: '2px solid #3D8A60', boxShadow: '0 3px 0 #3D8A60' } : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            {copied ? '✅ Copied!' : '📋 Copy Handoff'}
          </button>
          <button onClick={() => setShareOpen(true)}
            className="action-btn flex-1 py-3.5 rounded-xl font-semibold text-sm text-[#EE674E]"
            style={{ background: '#FFD6C9', border: '2px solid #F6B6A5', boxShadow: '0 4px 0 #F6B6A5' }}>
            📤 Share with Grandma
          </button>
        </div>
      </div>
    </div>
    {shareOpen && (
      <HandoffShareSheet
        items={items}
        shared={shared}
        onClose={() => setShareOpen(false)}
      />
    )}
    </>
  )
}

// ─── TODDLER MEALS SUB-SCREEN ──────────────────────────────────────────────────
const RECIPES = [
  { name: 'Banana Oatmeal Porridge', time: '5 min', age: '6m+', icon: '🍌', cal: '120 kcal', servings: '1', tags: ['Breakfast', 'Iron-rich'], ingredients: ['½ ripe banana', '3 tbsp rolled oats', '¼ cup breast milk or formula', 'Pinch of cinnamon'], steps: ['Mash the banana thoroughly in a bowl.', 'Cook oats with milk/formula over low heat, stirring for 3 minutes.', 'Stir in mashed banana and cinnamon.', 'Cool to lukewarm before serving.'], tip: 'Add a tiny pinch of nutmeg for variety.' },
  { name: 'Sweet Potato Mash', time: '15 min', age: '4m+', icon: '🍠', cal: '90 kcal', servings: '2', tags: ['Puree', 'Vitamin A'], ingredients: ['1 small sweet potato', '2 tbsp breast milk or water', 'Pinch of turmeric (optional)'], steps: ['Peel and cube the sweet potato.', 'Steam for 12–15 minutes until fork-tender.', 'Blend with milk or water until smooth.', 'Thin with extra liquid to desired consistency.'], tip: 'Freeze in ice cube trays for up to 3 months.' },
  { name: 'Avocado Toast Fingers', time: '5 min', age: '8m+', icon: '🥑', cal: '150 kcal', servings: '1', tags: ['BLW', 'Healthy fats'], ingredients: ['¼ ripe avocado', '1 slice soft wholegrain bread', 'Squeeze of lemon juice', 'Pinch of mild cumin'], steps: ['Toast bread lightly then cut into finger strips.', 'Mash avocado with lemon and cumin.', 'Spread evenly on each finger strip.', 'Serve immediately.'], tip: 'Great for baby-led weaning — the strips are easy to grip.' },
]

function RecipeDetailSheet({ recipe, onClose }: {
  recipe: typeof RECIPES[0]
  onClose: () => void
}) {
  const [saved, setSaved] = useState(false)
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: '#FFD6C9' }}>{recipe.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-lg text-[#242424] leading-tight">{recipe.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-[#6E6E73]">⏱ {recipe.time}</span>
                <span className="text-xs text-[#6E6E73]">·</span>
                <span className="text-xs text-[#6E6E73]">👶 {recipe.age}</span>
                <span className="text-xs text-[#6E6E73]">·</span>
                <span className="text-xs text-[#6E6E73]">🔥 {recipe.cal}</span>
              </div>
            </div>
            <button onClick={() => setSaved(v => !v)}
              className="action-btn w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={saved ? { background: '#FFD6C9', border: '1.5px solid #EE674E' } : { background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
              <span className="text-base">{saved ? '❤️' : '🤍'}</span>
            </button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {recipe.tags.map(t => (
              <span key={t} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: '#FFD6C9', color: '#EE674E' }}>{t}</span>
            ))}
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Ingredients <span className="font-normal normal-case text-[#B0A8A4]">({recipe.servings} serving)</span></p>
            <div className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EE674E] flex-shrink-0" />
                  <p className="text-sm text-[#242424]">{ing}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Instructions</p>
            <div className="space-y-3">
              {recipe.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>{i + 1}</div>
                  <p className="text-sm text-[#242424] leading-relaxed flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
            <p className="text-xs text-[#7A6010]">💡 <span className="font-semibold">Tip:</span> {recipe.tip}</p>
          </div>
        </div>
        <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-[#F0E8E4]">
          <button onClick={onClose}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

function AddFoodSheet({ onClose, onAdd }: { onClose: () => void; onAdd: (food: string) => void }) {
  const suggestions = ['🍓 Strawberry', '🫛 Peas', '🍑 Peach', '🌽 Corn', '🍇 Grape', '🥝 Kiwi', '🥩 Beef', '🐟 Salmon', '🧀 Cheese', '🫐 Blackberry']
  const [input, setInput] = useState('')
  const [added, setAdded] = useState<string[]>([])

  const addFood = (f: string) => {
    if (!added.includes(f)) setAdded(a => [...a, f])
  }
  const removeAdded = (f: string) => setAdded(a => a.filter(x => x !== f))

  const handleSave = () => {
    added.forEach(f => onAdd(f))
    onClose()
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '80%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FFD6C9' }}>🥦</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">Add Food</h3>
              <p className="text-xs text-[#6E6E73]">Track what Maya has tried</p>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">🔍</span>
            <input value={input} onChange={e => setInput(e.target.value)}
              placeholder="Type a food name..."
              className="cartoon-input w-full pl-11 pr-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
            {input.trim() && (
              <button onClick={() => { addFood('🍽️ ' + input.trim()); setInput('') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>
                Add
              </button>
            )}
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          {added.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Adding</p>
              <div className="flex flex-wrap gap-2">
                {added.map(f => (
                  <button key={f} onClick={() => removeAdded(f)}
                    className="action-btn flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
                    style={{ background: '#FFD6C9', border: '1.5px solid #EE674E', color: '#EE674E' }}>
                    {f} <span className="text-xs">✕</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Suggestions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.filter(s => !added.includes(s) && s.toLowerCase().includes(input.toLowerCase())).map(s => (
                <button key={s} onClick={() => addFood(s)}
                  className="action-btn px-3 py-1.5 rounded-full text-sm font-medium text-[#242424]"
                  style={{ background: '#F8F4F2', border: '1.5px solid #F0E8E4' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
          <button onClick={onClose}
            className="action-btn flex-1 py-3 rounded-2xl font-semibold text-sm text-[#6E6E73]"
            style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={added.length === 0}
            className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm text-white"
            style={added.length === 0
              ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
              : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            Save {added.length > 0 ? `(${added.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

function AIMealPlanSheet({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [accepted, setAccepted] = useState(false)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const plan = [
    ['🍌 Banana Oatmeal', '🍗 Chicken Puree', '🥕 Carrot Mash'],
    ['🥑 Avocado Toast', '🐟 Salmon Flakes', '🍠 Sweet Potato'],
    ['🍳 Scrambled Egg', '🫛 Pea Puree', '🫐 Blueberry Yogurt'],
    ['🍌 Banana Pancake', '🥩 Beef Mash', '🥦 Broccoli Bites'],
    ['🍓 Berry Smoothie', '🧀 Cheese Toast', '🥑 Avocado Mash'],
    ['🍳 Omelette Strips', '🍗 Chicken Strips', '🍠 Sweet Potato Fries'],
    ['🥝 Kiwi Puree', '🐟 Fish Cake', '🌽 Corn Chowder'],
  ]
  useEffect(() => { const t = setTimeout(() => setLoading(false), 1800); return () => clearTimeout(t) }, [])
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-xl">✨</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">AI Meal Plan</h3>
              <p className="text-xs text-[#6E6E73]">Personalised for Maya · This week</p>
            </div>
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full coral-gradient flex items-center justify-center ai-orb-pulse">
                <span className="text-2xl">✨</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#242424]">Planning Maya's week...</p>
                <p className="text-xs text-[#6E6E73] mt-1">Considering age, tried foods & nutrition</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#EE674E]"
                    style={{ animation: `waveform 0.8s ease-in-out infinite ${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          ) : accepted ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">✅</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Plan saved!</p>
                <p className="text-sm text-[#6E6E73] mt-1">Maya's week is all planned out 🎉</p>
              </div>
              <button onClick={onClose}
                className="action-btn w-full py-3.5 rounded-2xl font-bold text-white mt-2"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
                <p className="text-xs text-[#7A6010]">✨ Based on Maya's tried foods, age, and nutritional balance</p>
              </div>
              {days.map((day, i) => (
                <div key={day} className="glass-card rounded-2xl p-3.5">
                  <p className="text-xs font-bold text-[#EE674E] mb-2">{day}</p>
                  <div className="space-y-1.5">
                    {['Breakfast', 'Lunch', 'Dinner'].map((meal, j) => (
                      <div key={meal} className="flex items-center gap-2">
                        <p className="text-[10px] text-[#B0A8A4] w-14 flex-shrink-0">{meal}</p>
                        <p className="text-sm text-[#242424]">{plan[i][j]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {!loading && !accepted && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn flex-1 py-3 rounded-2xl font-semibold text-sm text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>
              Regenerate
            </button>
            <button onClick={() => setAccepted(true)}
              className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
              Accept Plan ✓
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function GroceryListSheet({ onClose }: { onClose: () => void }) {
  const categories = [
    { label: 'Fruits', icon: '🍎', items: ['Banana ×3', 'Avocado ×2', 'Blueberries ×1 punnet', 'Strawberries ×1 punnet'] },
    { label: 'Vegetables', icon: '🥦', items: ['Sweet potato ×2', 'Carrots ×4', 'Broccoli ×1 head', 'Peas (frozen) ×1 bag'] },
    { label: 'Protein', icon: '🍗', items: ['Chicken breast ×2', 'Salmon fillet ×1', 'Eggs ×6'] },
    { label: 'Pantry', icon: '🫙', items: ['Rolled oats ×1 pack', 'Whole grain bread ×1 loaf'] },
    { label: 'Dairy', icon: '🧀', items: ['Mild cheddar ×1 block', 'Full-fat yogurt ×1 pot'] },
  ]
  const [checked, setChecked] = useState<string[]>([])
  const [copied, setCopied] = useState(false)

  const toggle = (item: string) => setChecked(c => c.includes(item) ? c.filter(x => x !== item) : [...c, item])
  const total = categories.reduce((s, c) => s + c.items.length, 0)

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#E6F4ED' }}>🛒</div>
            <div className="flex-1">
              <h3 className="font-display text-lg text-[#242424]">Grocery List</h3>
              <p className="text-xs text-[#6E6E73]">{checked.length} of {total} items checked</p>
            </div>
            <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1600) }}
              className="action-btn px-3 py-2 rounded-xl text-xs font-bold"
              style={copied ? { background: '#E6F4ED', color: '#55A67A', border: '1.5px solid #A8D9BC' } : { background: '#FFD6C9', color: '#EE674E', border: '1.5px solid #F6B6A5' }}>
              {copied ? '✅ Copied' : '📋 Copy'}
            </button>
          </div>
          {/* Progress bar */}
          <div className="mt-3 h-2 rounded-full bg-[#F0E8E4] overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(checked.length / total) * 100}%`, background: 'linear-gradient(90deg,#EE674E,#55A67A)' }} />
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-3">
          {categories.map(cat => (
            <div key={cat.label} className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#F8F4F2' }}>
                <span className="text-base">{cat.icon}</span>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">{cat.label}</p>
              </div>
              <div className="divide-y divide-[#F0E8E4]">
                {cat.items.map(item => {
                  const done = checked.includes(item)
                  return (
                    <div key={item} className="flex items-center gap-3 px-3 py-2.5">
                      {/* Standalone checkbox button — large tap target */}
                      <button
                        onClick={() => toggle(item)}
                        className="flex-shrink-0 flex items-center justify-center transition-all"
                        style={{
                          width: 32, height: 32, borderRadius: 10,
                          background: done ? '#55A67A' : '#fff',
                          border: `2.5px solid ${done ? '#3D8A60' : '#F6B6A5'}`,
                          boxShadow: done ? '0 3px 0 #3D8A60' : '0 3px 0 #F0E0D8',
                          transform: done ? 'translateY(2px)' : 'translateY(0)',
                        }}>
                        {done
                          ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : <div style={{ width: 8, height: 8, borderRadius: 2, background: '#F6B6A5', opacity: 0.5 }} />
                        }
                      </button>
                      {/* Row label — also toggles on tap */}
                      <button onClick={() => toggle(item)} className="flex-1 text-left py-0.5">
                        <p className={`text-sm transition-all ${done ? 'line-through text-[#B0A8A4]' : 'text-[#242424] font-medium'}`}>{item}</p>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-[#F0E8E4]">
          <button onClick={onClose}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#55A67A,#78C49A)', border: '2px solid #3D8A60', boxShadow: '0 4px 0 #3D8A60' }}>
            Done Shopping 🛒
          </button>
        </div>
      </div>
    </div>
  )
}

function ToddlerMealsSubScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'today' | 'tried' | 'recipes'>('today')
  const [meals, setMeals] = useState([
    { meal: 'Breakfast', food: 'Banana Oatmeal', icon: '🍌', eaten: true },
    { meal: 'Lunch', food: 'Chicken + Sweet Potato', icon: '🍗', eaten: true },
    { meal: 'Dinner', food: 'Avocado Pasta', icon: '🥑', eaten: false },
  ])
  const [triedFoods, setTriedFoods] = useState(['🍌 Banana', '🥑 Avocado', '🍗 Chicken', '🥕 Carrot', '🍠 Sweet Potato', '🫐 Blueberry', '🥦 Broccoli', '🍳 Egg'])
  const [activeRecipe, setActiveRecipe] = useState<typeof RECIPES[0] | null>(null)
  const [showAddFood, setShowAddFood] = useState(false)
  const [showAIPlan, setShowAIPlan] = useState(false)
  const [showGrocery, setShowGrocery] = useState(false)

  const toggleEaten = (i: number) => setMeals(m => m.map((meal, idx) => idx === i ? { ...meal, eaten: !meal.eaten } : meal))

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Toddler Meals" onBack={onBack} />
      <div className="flex gap-1 mx-4 bg-[#F6EDE8] p-1 rounded-xl mb-1">
        {(['today', 'tried', 'recipes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-pill flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize ${tab === t ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'}`}>
            {t === 'today' ? "Today's Plan" : t === 'tried' ? 'Foods Tried' : 'Recipes'}
          </button>
        ))}
      </div>
      <div className="scroll-area flex-1 px-4 pb-6 mt-3 space-y-3">
        {tab === 'today' && (<>
          {meals.map((m, i) => (
            <button key={i} onClick={() => toggleEaten(i)}
              className="action-btn w-full glass-card rounded-2xl p-3.5 flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: m.eaten ? '#E6F4ED' : '#F0E8E4' }}>{m.icon}</div>
              <div className="flex-1">
                <p className="text-xs text-[#6E6E73]">{m.meal}</p>
                <p className="font-semibold text-sm text-[#242424]">{m.food}</p>
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={m.eaten ? { background: '#E6F4ED', border: '2px solid #A8D9BC' } : { background: 'white', border: '2px solid #F6B6A5' }}>
                {m.eaten && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#55A67A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </button>
          ))}
          <button onClick={() => setShowAIPlan(true)}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            ✨ Plan This Week with AI
          </button>
          <button onClick={() => setShowGrocery(true)}
            className="action-btn w-full py-3 rounded-2xl font-bold text-sm text-[#55A67A]"
            style={{ background: '#E6F4ED', border: '2px solid #A8D9BC', boxShadow: '0 3px 0 #A8D9BC' }}>
            🛒 Generate Grocery List
          </button>
        </>)}

        {tab === 'tried' && (
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Foods Maya Has Tried</p>
            <div className="flex flex-wrap gap-2">
              {triedFoods.map((f, i) => (
                <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium text-[#242424]"
                  style={{ background: '#FFD6C9' }}>{f}</span>
              ))}
              <button onClick={() => setShowAddFood(true)}
                className="action-btn px-3 py-1.5 rounded-full text-sm font-semibold text-[#EE674E]"
                style={{ background: '#FFF3EE', border: '1.5px dashed #F6B6A5' }}>
                + Add Food
              </button>
            </div>
          </div>
        )}

        {tab === 'recipes' && (
          <div className="space-y-2">
            {RECIPES.map((r, i) => (
              <button key={i} onClick={() => setActiveRecipe(r)}
                className="action-btn w-full glass-card rounded-2xl p-3.5 flex items-center gap-3 text-left">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: '#FFD6C9' }}>{r.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-[#242424]">{r.name}</p>
                  <p className="text-xs text-[#6E6E73]">⏱ {r.time} · {r.age}</p>
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#FFD6C9' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>

    {activeRecipe && <RecipeDetailSheet recipe={activeRecipe} onClose={() => setActiveRecipe(null)} />}
    {showAddFood && <AddFoodSheet onClose={() => setShowAddFood(false)} onAdd={f => setTriedFoods(t => [...t, f])} />}
    {showAIPlan && <AIMealPlanSheet onClose={() => setShowAIPlan(false)} />}
    {showGrocery && <GroceryListSheet onClose={() => setShowGrocery(false)} />}
    </>
  )
}

// ─── DEVELOPMENT SUB-SCREEN ────────────────────────────────────────────────────

const ACTIVITIES = [
  {
    icon: '🎯', name: 'Object Transfer Game', duration: '5 min', durationSec: 300,
    area: 'Fine Motor', color: '#EE674E', bg: '#FFD6C9',
    desc: 'Help Maya build hand-eye coordination by passing objects between hands.',
    steps: ['Sit Maya comfortably on your lap facing you.', 'Hold a small soft toy in front of her.', 'Gently guide her to grasp it with one hand.', 'Encourage her to pass it to the other hand.', 'Repeat 5–8 times, cheering each transfer!'],
    tip: 'Use brightly coloured objects to keep her attention.',
    benefits: ['Hand-eye coordination', 'Fine motor control', 'Focus & attention'],
  },
  {
    icon: '🪞', name: 'Mirror Play', duration: '10 min', durationSec: 600,
    area: 'Social Development', color: '#6299D5', bg: '#EBF2FC',
    desc: 'Babies love faces! Mirror play builds self-awareness and social skills.',
    steps: ['Hold a baby-safe mirror in front of Maya.', 'Make exaggerated facial expressions.', 'Name the expressions: "Happy!", "Surprised!"', 'Let her touch the mirror and explore freely.', 'Copy any faces she makes back at her.'],
    tip: 'Try this right after a nap when she is most alert.',
    benefits: ['Self-awareness', 'Emotional recognition', 'Visual tracking'],
  },
  {
    icon: '🧸', name: 'Supported Sitting Play', duration: '10 min', durationSec: 600,
    area: 'Motor Skills', color: '#55A67A', bg: '#E6F4ED',
    desc: 'Strengthen Maya\'s core and improve balance with assisted sitting.',
    steps: ['Place Maya on a flat surface with a Boppy or cushions.', 'Sit close and spot her from both sides.', 'Place interesting toys just within reach.', 'Let her shift weight to grab toys.', 'Gradually reduce support as she steadies.'],
    tip: 'Keep sessions to 5–10 minutes to avoid fatigue.',
    benefits: ['Core strength', 'Balance', 'Independent play'],
  },
  {
    icon: '🎵', name: 'Singing & Clapping', duration: '5 min', durationSec: 300,
    area: 'Language', color: '#C49B30', bg: '#FEF7E0',
    desc: 'Rhythm and repetition are the building blocks of early language.',
    steps: ['Choose a favourite nursery rhyme — "Twinkle Twinkle" works great.', 'Sing slowly with exaggerated mouth movements.', 'Clap on the beat and guide Maya\'s hands to clap too.', 'Pause and wait — she may try to vocalise!', 'Repeat 2–3 times then switch to a new song.'],
    tip: 'The more animated you are, the more engaged she will be.',
    benefits: ['Language development', 'Rhythm & music', 'Bonding'],
  },
]

function ActivitySessionSheet({ activity, onClose }: {
  activity: typeof ACTIVITIES[0]
  onClose: () => void
}) {
  const [phase, setPhase] = useState<'preview' | 'active' | 'done'>('preview')
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setElapsed(e => {
      if (e + 1 >= activity.durationSec) { setRunning(false); setPhase('done'); return activity.durationSec }
      return e + 1
    }), 1000)
    return () => clearInterval(id)
  }, [running, activity.durationSec])

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`
  const pct = elapsed / activity.durationSec
  const r = 42, circ = 2 * Math.PI * r

  const startSession = () => { setPhase('active'); setRunning(true) }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={phase === 'preview' ? onClose : undefined} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>

        {/* Handle */}
        <div className="flex-shrink-0 px-5 pt-4">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
        </div>

        {/* ── Preview phase ── */}
        {phase === 'preview' && (
          <>
            <div className="flex-shrink-0 px-5 pb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                  style={{ background: activity.bg }}>{activity.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg text-[#242424] leading-tight">{activity.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#6E6E73]">⏱ {activity.duration}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: activity.bg, color: activity.color }}>{activity.area}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-[#6E6E73] leading-relaxed">{activity.desc}</p>
            </div>
            <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
              {/* Steps */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">How to play</p>
                <div className="space-y-3">
                  {activity.steps.map((s, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ background: `linear-gradient(135deg,${activity.color},${activity.color}bb)` }}>{i + 1}</div>
                      <p className="text-sm text-[#242424] leading-relaxed flex-1">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Benefits */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Benefits for Maya</p>
                <div className="flex flex-wrap gap-2">
                  {activity.benefits.map(b => (
                    <span key={b} className="text-xs font-semibold px-3 py-1.5 rounded-full"
                      style={{ background: activity.bg, color: activity.color }}>✓ {b}</span>
                  ))}
                </div>
              </div>
              {/* Tip */}
              <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
                <p className="text-xs text-[#7A6010]">💡 <span className="font-semibold">Tip:</span> {activity.tip}</p>
              </div>
            </div>
            <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
              <button onClick={onClose}
                className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button onClick={startSession}
                className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg,${activity.color},${activity.color}cc)`, border: `2px solid ${activity.color}`, boxShadow: `0 4px 0 ${activity.color}88` }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 3l9 5-9 5V3z" fill="white"/></svg>
                Start Activity
              </button>
            </div>
          </>
        )}

        {/* ── Active phase ── */}
        {phase === 'active' && (
          <div className="flex flex-col flex-1 px-5 pb-6 items-center gap-5">
            {/* Circular timer */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <svg width="110" height="110" viewBox="0 0 110 110">
                <circle cx="55" cy="55" r={r} fill="none" stroke="#F0E8E4" strokeWidth="8" />
                <circle cx="55" cy="55" r={r} fill="none" stroke={activity.color} strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={circ}
                  strokeDashoffset={circ - pct * circ}
                  transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                <text x="55" y="50" textAnchor="middle" fontSize="18" fontWeight="700" fill="#242424" fontFamily="Inter,sans-serif">
                  {fmt(activity.durationSec - elapsed)}
                </text>
                <text x="55" y="66" textAnchor="middle" fontSize="10" fill="#6E6E73" fontFamily="Inter,sans-serif">remaining</text>
              </svg>
              <p className="font-display text-base text-[#242424]">{activity.name}</p>
            </div>

            {/* Step guide */}
            <div className="w-full glass-card rounded-2xl p-4 flex-1">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Current step</p>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg,${activity.color},${activity.color}bb)` }}>{currentStep + 1}</div>
                <p className="text-sm text-[#242424] leading-relaxed flex-1">{activity.steps[currentStep]}</p>
              </div>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button onClick={() => setCurrentStep(s => s - 1)}
                    className="action-btn flex-1 py-2.5 rounded-xl text-sm font-semibold text-[#6E6E73]"
                    style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>← Prev</button>
                )}
                {currentStep < activity.steps.length - 1 && (
                  <button onClick={() => setCurrentStep(s => s + 1)}
                    className="action-btn flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: `linear-gradient(135deg,${activity.color},${activity.color}cc)`, border: `1.5px solid ${activity.color}` }}>
                    Next Step →
                  </button>
                )}
              </div>
              {/* Step dots */}
              <div className="flex justify-center gap-1.5 mt-3">
                {activity.steps.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{ background: i === currentStep ? activity.color : '#E0D8D4' }} />
                ))}
              </div>
            </div>

            <div className="w-full flex gap-3">
              <button onClick={() => setRunning(r => !r)}
                className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm"
                style={running
                  ? { background: '#FEF7E0', border: '2px solid #F8C85E', color: '#C49B30', boxShadow: '0 3px 0 #E8C040' }
                  : { background: `linear-gradient(135deg,${activity.color},${activity.color}cc)`, border: `2px solid ${activity.color}`, color: 'white', boxShadow: `0 3px 0 ${activity.color}88` }}>
                {running ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button onClick={() => { setPhase('done'); setRunning(false) }}
                className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg,#55A67A,#78C49A)', border: '2px solid #3D8A60', boxShadow: '0 3px 0 #3D8A60' }}>
                ✓ Done Early
              </button>
            </div>
          </div>
        )}

        {/* ── Done phase ── */}
        {phase === 'done' && (
          <div className="flex flex-col items-center px-5 pb-8 gap-5">
            <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">🎉</div>
            <div className="text-center">
              <p className="font-display text-2xl text-[#242424]">Activity Complete!</p>
              <p className="text-sm text-[#6E6E73] mt-1">Great work with Maya 👶</p>
            </div>
            <div className="w-full glass-card rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1">Today's win</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activity.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-[#242424]">{activity.name}</p>
                  <p className="text-xs text-[#6E6E73]">{fmt(elapsed)} completed · {activity.area}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl px-4 py-3 w-full" style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>
              <p className="text-xs text-[#EE674E] font-semibold text-center">💛 Logged to Maya's development journal</p>
            </div>
            <button onClick={onClose}
              className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
              Back to Activities
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const AREA_OPTIONS = [
  { label: 'Fine Motor', color: '#EE674E', bg: '#FFD6C9' },
  { label: 'Gross Motor', color: '#6299D5', bg: '#EBF2FC' },
  { label: 'Motor Skills', color: '#55A67A', bg: '#E6F4ED' },
  { label: 'Language', color: '#C49B30', bg: '#FEF7E0' },
  { label: 'Social Development', color: '#B0A0F0', bg: '#F0EEF9' },
  { label: 'Cognitive', color: '#EE674E', bg: '#FFE8F0' },
  { label: 'Sensory', color: '#55A67A', bg: '#E0F4F0' },
  { label: 'Creative', color: '#F08060', bg: '#FFE8DC' },
]
const ICON_OPTIONS = ['🎯','🪞','🧸','🎵','🎨','🧩','🏃','🎭','🌿','📚','🎪','🧶','🦋','🌈','🎲','⭐']
const DURATION_OPTIONS = ['5 min','10 min','15 min','20 min','30 min']

function AddActivitySheet({ onClose, onSave }: {
  onClose: () => void
  onSave: (activity: typeof ACTIVITIES[0]) => void
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [area, setArea] = useState(AREA_OPTIONS[0])
  const [duration, setDuration] = useState('10 min')
  const [durationSec, setDurationSec] = useState(600)
  const [desc, setDesc] = useState('')
  const [steps, setSteps] = useState([''])
  const [tip, setTip] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [step, setStep] = useState<1|2|3>(1)

  const canNext1 = name.trim().length > 0
  const canSave = steps.filter(s => s.trim()).length > 0

  const addStep = () => setSteps(s => [...s, ''])
  const updateStep = (i: number, val: string) => setSteps(s => s.map((x, idx) => idx === i ? val : x))
  const removeStep = (i: number) => setSteps(s => s.filter((_, idx) => idx !== i))

  const handleDuration = (d: string) => {
    setDuration(d)
    setDurationSec(parseInt(d) * 60)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      const newActivity = {
        icon, name: name.trim(),
        duration, durationSec,
        area: area.label, color: area.color, bg: area.bg,
        desc: desc || `A custom activity: ${name.trim()}`,
        steps: steps.filter(s => s.trim()),
        tip: tip || 'Have fun and follow Maya\'s lead!',
        benefits: [area.label, 'Bonding', 'Play'],
      }
      setTimeout(() => { onSave(newActivity); onClose() }, 1000)
    }, 900)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={step === 1 ? onClose : undefined} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '92%' }}>

        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />

          {/* Step indicator */}
          <div className="flex items-center gap-1 mb-4">
            {(['Basics','Steps','Review'] as const).map((label, idx) => {
              const s = idx + 1
              return (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${step > s ? 'text-white' : step === s ? 'text-white' : 'text-[#B0A8A4]'}`}
                    style={{ background: step > s ? '#55A67A' : step === s ? 'linear-gradient(135deg,#EE674E,#F47B66)' : '#F0E8E4' }}>
                    {step > s ? '✓' : s}
                  </div>
                  <span className={`text-[11px] font-semibold flex-1 ${step === s ? 'text-[#EE674E]' : step > s ? 'text-[#55A67A]' : 'text-[#B0A8A4]'}`}>{label}</span>
                  {s < 3 && <div className="w-3 h-px bg-[#F0E8E4]" />}
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: area.bg }}>{icon}</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">
                {step === 1 ? 'New Activity' : step === 2 ? 'Add Steps' : 'Review & Save'}
              </h3>
              <p className="text-xs text-[#6E6E73]">
                {step === 1 ? 'Set the basics' : step === 2 ? 'How to do this activity' : 'Check everything looks good'}
              </p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">

          {/* ── Step 1: Basics ── */}
          {step === 1 && (
            <>
              {/* Name */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Activity name *</p>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. Bubble Chasing"
                  className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              </div>

              {/* Icon picker */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Pick an icon</p>
                <div className="grid grid-cols-8 gap-2">
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} onClick={() => setIcon(ic)}
                      className="action-btn h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                      style={icon === ic
                        ? { background: area.bg, border: `2px solid ${area.color}`, boxShadow: `0 3px 0 ${area.color}66` }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Development area */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Development area</p>
                <div className="grid grid-cols-2 gap-2">
                  {AREA_OPTIONS.map(a => (
                    <button key={a.label} onClick={() => setArea(a)}
                      className="action-btn py-2.5 px-3 rounded-xl text-left transition-all"
                      style={area.label === a.label
                        ? { background: a.bg, border: `2px solid ${a.color}`, boxShadow: `0 3px 0 ${a.color}44`, color: a.color }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4', color: '#6E6E73' }}>
                      <p className="text-xs font-bold">{a.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Duration</p>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map(d => (
                    <button key={d} onClick={() => handleDuration(d)}
                      className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold transition-all"
                      style={duration === d
                        ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#EE674E', boxShadow: '0 3px 0 #F6B6A5' }
                        : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Description <span className="font-normal normal-case text-[#B0A8A4]">(optional)</span></p>
                <textarea value={desc} onChange={e => setDesc(e.target.value)}
                  placeholder="What is this activity about?"
                  rows={2} className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
              </div>
            </>
          )}

          {/* ── Step 2: Steps ── */}
          {step === 2 && (
            <>
              <p className="text-xs text-[#6E6E73]">Add step-by-step instructions to guide you through the activity.</p>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${area.color},${area.color}bb)` }}>{i + 1}</div>
                    <input value={s} onChange={e => updateStep(i, e.target.value)}
                      placeholder={`Step ${i + 1}...`}
                      className="cartoon-input flex-1 px-3.5 py-2.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                    {steps.length > 1 && (
                      <button onClick={() => removeStep(i)}
                        className="action-btn w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: '#FFF0EE', border: '1.5px solid #F6B6A5' }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5h6" stroke="#EE674E" strokeWidth="1.8" strokeLinecap="round"/></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addStep}
                className="action-btn w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-[#EE674E]"
                style={{ background: '#FFF3EE', border: '1.5px dashed #F6B6A5' }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 2v8M2 6h8" stroke="#EE674E" strokeWidth="1.8" strokeLinecap="round"/></svg>
                Add Step
              </button>

              {/* Tip */}
              <div>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Pro tip <span className="font-normal normal-case text-[#B0A8A4]">(optional)</span></p>
                <input value={tip} onChange={e => setTip(e.target.value)}
                  placeholder="e.g. Best done after a nap"
                  className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              </div>
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            saved ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl pop-in"
                  style={{ background: area.bg }}>{icon}</div>
                <div className="text-center">
                  <p className="font-display text-xl text-[#242424]">Activity Added!</p>
                  <p className="text-sm text-[#6E6E73] mt-1">{name} is ready to play</p>
                </div>
              </div>
            ) : (
              <>
                {/* Preview card */}
                <div className="glass-card-strong rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: area.bg }}>{icon}</div>
                  <div className="flex-1">
                    <p className="font-display text-base text-[#242424]">{name || 'Untitled'}</p>
                    <p className="text-xs text-[#6E6E73]">⏱ {duration} · {area.label}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ background: area.bg, color: area.color }}>{area.label}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="glass-card rounded-2xl p-4 space-y-3">
                  {desc && (
                    <div>
                      <p className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-1">Description</p>
                      <p className="text-sm text-[#242424]">{desc}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Steps ({steps.filter(s=>s.trim()).length})</p>
                    <div className="space-y-2">
                      {steps.filter(s => s.trim()).map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                            style={{ background: area.color }}>{i+1}</div>
                          <p className="text-sm text-[#242424] flex-1">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  {tip && (
                    <div className="rounded-xl px-3 py-2" style={{ background: '#FEF3CD', border: '1px solid #F8C85E' }}>
                      <p className="text-xs text-[#7A6010]">💡 {tip}</p>
                    </div>
                  )}
                </div>
              </>
            )
          )}
        </div>

        {/* Footer */}
        {!saved && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as 1|2|3)}
                className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            {step === 1 && (
              <button onClick={onClose}
                className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            <button
              onClick={() => step < 3 ? setStep(s => (s + 1) as 1|2|3) : handleSave()}
              disabled={(step === 1 && !canNext1) || (step === 3 && saving)}
              className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-base text-white"
              style={(step === 1 && !canNext1)
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : saving
                  ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 2px 0 #E8A090' }
                  : { background: `linear-gradient(135deg,${area.color},${area.color}cc)`, border: `2px solid ${area.color}99`, boxShadow: `0 5px 0 ${area.color}66` }}>
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />
                  Saving…
                </span>
              ) : step === 1 ? 'Next — Add Steps →'
                : step === 2 ? 'Preview Activity →'
                : '✓ Save Activity'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function DevelopmentSubScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<'activities' | 'milestones'>('activities')
  const [activeActivity, setActiveActivity] = useState<typeof ACTIVITIES[0] | null>(null)
  const [ageMonths, setAgeMonths] = useState(7)
  const [editingAge, setEditingAge] = useState(false)
  const [customActivities, setCustomActivities] = useState<typeof ACTIVITIES>([])
  const [showAddActivity, setShowAddActivity] = useState(false)
  const allActivities = [...ACTIVITIES, ...customActivities]
  const [milestones, setMilestones] = useState([
    { icon: '😊', label: 'Social Smile', done: true, date: 'March 14' },
    { icon: '🍓', label: 'First Solid Food', done: true, date: 'May 2' },
    { icon: '🦷', label: 'First Tooth', done: true, date: 'June 18' },
    { icon: '🤸', label: 'Rolls Both Ways', done: true, date: 'July 5' },
    { icon: '🗣️', label: 'Babbling (mama/dada)', done: false, date: '' },
    { icon: '🧍', label: 'Pulls to Stand', done: false, date: '' },
  ])

  const toggleMilestone = (i: number) => {
    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    setMilestones(ms => ms.map((m, idx) =>
      idx === i ? { ...m, done: !m.done, date: !m.done ? today : '' } : m
    ))
  }

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Grow With Maya" onBack={onBack} />
      <div className="flex gap-1 mx-4 bg-[#F6EDE8] p-1 rounded-xl mb-1">
        {(['activities', 'milestones'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-pill flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize ${tab === t ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'}`}>{t}</button>
        ))}
      </div>
      <div className="scroll-area flex-1 px-4 pb-6 mt-3 space-y-3">
        {tab === 'activities' && (<>
          {/* Age header — tappable to edit */}
          <button onClick={() => setEditingAge(true)}
            className="action-btn w-full glass-card-strong rounded-2xl p-3.5 flex items-center gap-3 text-left">
            <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-xl flex-shrink-0">👶</div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-[#242424]">{ageMonths} months old</p>
              <p className="text-xs text-[#6E6E73]">This week's suggested activities</p>
            </div>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="#EE674E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </button>

          {/* Age picker inline */}
          {editingAge && (
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-3">Maya's age</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.from({ length: 24 }, (_, i) => i + 1).map(m => (
                  <button key={m} onClick={() => setAgeMonths(m)}
                    className="action-btn w-10 h-10 rounded-xl text-sm font-bold"
                    style={ageMonths === m
                      ? { background: 'linear-gradient(135deg,#EE674E,#F47B66)', color: 'white', border: '2px solid #C94930', boxShadow: '0 3px 0 #C94930' }
                      : { background: '#F0E8E4', color: '#6E6E73', border: '2px solid #E8E0DC' }}>
                    {m}
                  </button>
                ))}
              </div>
              <button onClick={() => setEditingAge(false)}
                className="action-btn w-full py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 3px 0 #C94930' }}>
                Save Age ✓
              </button>
            </div>
          )}

          {/* Activity cards */}
          {allActivities.map((a, i) => {
            const isCustom = i >= ACTIVITIES.length
            return (
              <div key={i} className="glass-card rounded-2xl p-3.5 flex items-center gap-3"
                style={isCustom ? { border: '1.5px solid #F6B6A5' } : {}}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: a.bg }}>{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-[#242424]">{a.name}</p>
                    {isCustom && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: '#FFD6C9', color: '#EE674E' }}>CUSTOM</span>}
                  </div>
                  <p className="text-xs text-[#6E6E73]">⏱ {a.duration}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: a.bg, color: a.color }}>{a.area}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isCustom && (
                    <button onClick={() => setCustomActivities(c => c.filter((_, ci) => ci !== i - ACTIVITIES.length))}
                      className="action-btn w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: '#FFF0EE', border: '1.5px solid #F6B6A5' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2a.5.5 0 0 1 .5-.5h1A.5.5 0 0 1 7 2v1M3.5 3l.5 6.5h4L8.5 3" stroke="#EE674E" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  )}
                  <button onClick={() => setActiveActivity(a)}
                    className="action-btn w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg,${a.color},${a.color}cc)`, border: `2px solid ${a.color}99`, boxShadow: `0 4px 0 ${a.color}66` }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M4 2.5l8 4.5-8 4.5V2.5z" fill="white"/></svg>
                  </button>
                </div>
              </div>
            )
          })}

          {/* Add Activity button */}
          <button onClick={() => setShowAddActivity(true)}
            className="action-btn w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
            style={{ background: '#FFFCFA', border: '2px dashed #F6B6A5', color: '#EE674E' }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5h6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            Add Your Own Activity
          </button>
        </>)}

        {tab === 'milestones' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 mb-1">
              <p className="text-xs text-[#6E6E73]">{milestones.filter(m => m.done).length} of {milestones.length} reached</p>
              <div className="flex-1 mx-3 h-1.5 rounded-full bg-[#F0E8E4] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(milestones.filter(m => m.done).length / milestones.length) * 100}%`, background: 'linear-gradient(90deg,#EE674E,#55A67A)' }} />
              </div>
              <p className="text-xs font-bold text-[#EE674E]">{Math.round((milestones.filter(m => m.done).length / milestones.length) * 100)}%</p>
            </div>

            {milestones.map((m, i) => (
              <button key={i} onClick={() => toggleMilestone(i)}
                className="action-btn w-full glass-card rounded-2xl p-3.5 flex items-center gap-3 text-left transition-all"
                style={m.done ? {} : { opacity: 0.7 }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all"
                  style={{ background: m.done ? '#FFD6C9' : '#F0E8E4' }}>{m.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm transition-all ${m.done ? 'text-[#242424]' : 'text-[#6E6E73]'}`}>{m.label}</p>
                  <p className="text-xs text-[#6E6E73]">{m.done ? `Reached · ${m.date}` : 'Tap to mark as reached'}</p>
                </div>
                {/* Toggle badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={m.done
                    ? { background: '#E6F4ED', border: '2px solid #A8D9BC', boxShadow: '0 2px 0 #A8D9BC' }
                    : { background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 2px 0 #D8D0CC' }}>
                  {m.done
                    ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 7l3 3L11.5 4" stroke="#55A67A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 4v6M4 7h6" stroke="#B0A8A4" strokeWidth="2" strokeLinecap="round"/></svg>
                  }
                </div>
              </button>
            ))}

            <div className="rounded-2xl px-4 py-3 mt-2" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
              <p className="text-xs text-[#7A6010]">💡 Tap any milestone to mark it reached or unmark it. Dates are recorded automatically.</p>
            </div>
          </div>
        )}
      </div>
    </div>

    {activeActivity && (
      <ActivitySessionSheet activity={activeActivity} onClose={() => setActiveActivity(null)} />
    )}
    {showAddActivity && (
      <AddActivitySheet
        onClose={() => setShowAddActivity(false)}
        onSave={a => setCustomActivities(c => [...c, a])}
      />
    )}
    </>
  )
}

// ─── BABY SUPPLIES SUB-SCREEN ──────────────────────────────────────────────────
type Supply = { icon: string; name: string; qty: number; unit: string; days: number; status: string }

const STATUS_META: Record<string, { bg: string; text: string; label: string; bar: string }> = {
  critical: { bg: '#FAECEC', text: '#D9534F', label: 'Critical', bar: '#D9534F' },
  low:      { bg: '#FEF3CD', text: '#B8860B', label: 'Low',      bar: '#F8C85E' },
  ok:       { bg: '#E6F4ED', text: '#55A67A', label: 'Good',     bar: '#55A67A' },
}

function SupplyShoppingSheet({ items, onClose }: { items: Supply[]; onClose: () => void }) {
  const [checked, setChecked] = useState<string[]>([])
  const [added, setAdded] = useState(false)
  const toggle = (n: string) => setChecked(c => c.includes(n) ? c.filter(x => x !== n) : [...c, n])
  const handleAdd = () => { setAdded(true); setTimeout(onClose, 1200) }
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '82%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: '#FFD6C9' }}>🛒</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">Shopping List</h3>
              <p className="text-xs text-[#6E6E73]">{items.length} low/critical items</p>
            </div>
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-2">
          {added ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#E6F4ED] flex items-center justify-center text-3xl pop-in">✅</div>
              <p className="font-display text-xl text-[#242424]">Added to list!</p>
              <p className="text-sm text-[#6E6E73]">{checked.length || items.length} items saved to your shopping list</p>
            </div>
          ) : (<>
            <p className="text-xs text-[#6E6E73] pb-1">Select the items you want to add to your shopping list.</p>
            {items.map((s, i) => {
              const sc = STATUS_META[s.status]
              const on = checked.includes(s.name)
              return (
                <button key={i} onClick={() => toggle(s.name)}
                  className="action-btn w-full rounded-2xl p-3.5 flex items-center gap-3 text-left"
                  style={on ? { background: sc.bg, border: `2px solid ${sc.text}40`, boxShadow: `0 3px 0 ${sc.text}20` } : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: on ? sc.bg : '#F0E8E4' }}>{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#242424]">{s.name}</p>
                    <p className="text-xs text-[#6E6E73]">{s.qty} {s.unit} left · ~{s.days} days</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: on ? sc.text : '#F0E8E4', border: `2px solid ${on ? sc.text : '#E0D8D4'}` }}>
                    {on && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                </button>
              )
            })}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setChecked(items.map(s => s.name))}
                className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-[#EE674E]"
                style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>Select All</button>
              <button onClick={() => setChecked([])}
                className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-[#6E6E73]"
                style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>Clear</button>
            </div>
          </>)}
        </div>
        {!added && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn flex-1 py-3 rounded-2xl font-semibold text-sm text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>Cancel</button>
            <button onClick={handleAdd}
              className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
              Add {checked.length > 0 ? `(${checked.length})` : 'All'} to List 🛒
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function AddSupplySheet({ onClose, onSave }: { onClose: () => void; onSave: (s: Supply) => void }) {
  const SUPPLY_ICONS = ['🧷','🧻','🍼','🥣','🧴','👶','🛁','🧸','💊','🩹','🧃','🍭','👕','🧦','🛏️','🪣']
  const UNITS = ['left','packs','cans','pouches','bottles','boxes','rolls','bags','pieces']
  const [icon, setIcon] = useState('🧷')
  const [name, setName] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('left')
  const [days, setDays] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const status = !days ? 'ok' : parseInt(days) <= 2 ? 'critical' : parseInt(days) <= 5 ? 'low' : 'ok'
  const canSave = name.trim() && qty && days

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false); setSaved(true)
      const newItem: Supply = { icon, name: name.trim(), qty: parseInt(qty), unit, days: parseInt(days), status }
      setTimeout(() => { onSave(newItem); onClose() }, 900)
    }, 800)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: STATUS_META[status].bg }}>{icon}</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">New Supply Item</h3>
              <p className="text-xs text-[#6E6E73]">Track what you need for Maya</p>
            </div>
            {days && (
              <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: STATUS_META[status].bg, color: STATUS_META[status].text }}>
                {STATUS_META[status].label}
              </span>
            )}
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          {saved ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl pop-in"
                style={{ background: STATUS_META[status].bg }}>{icon}</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Supply Added!</p>
                <p className="text-sm text-[#6E6E73] mt-1">{name} is now being tracked</p>
              </div>
            </div>
          ) : (<>
            {/* Icon */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Icon</p>
              <div className="grid grid-cols-8 gap-2">
                {SUPPLY_ICONS.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)}
                    className="action-btn h-10 rounded-xl flex items-center justify-center text-xl"
                    style={icon === ic
                      ? { background: '#FFD6C9', border: '2px solid #EE674E', boxShadow: '0 3px 0 #F6B6A5' }
                      : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Item name *</p>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Diapers Size 3"
                className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
            </div>

            {/* Qty + unit */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Quantity *</p>
              <div className="flex gap-2">
                <input value={qty} onChange={e => setQty(e.target.value.replace(/\D/g,''))}
                  placeholder="e.g. 23" type="number" inputMode="numeric"
                  className="cartoon-input flex-1 px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                <div className="relative flex-1">
                  <select value={unit} onChange={e => setUnit(e.target.value)}
                    className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] appearance-none pr-8">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="#B0A8A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </div>

            {/* Days remaining */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Days remaining *</p>
              <input value={days} onChange={e => setDays(e.target.value.replace(/\D/g,''))}
                placeholder="Estimated days before you run out"
                type="number" inputMode="numeric"
                className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              {days && (
                <div className="mt-2 h-2 rounded-full bg-[#F0E8E4] overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100,(parseInt(days)/14)*100)}%`, background: STATUS_META[status].bar }} />
                </div>
              )}
            </div>
          </>)}
        </div>

        {!saved && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={handleSave} disabled={!canSave || saving}
              className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-sm text-white"
              style={!canSave
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : saving
                  ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 2px 0 #E8A090' }
                  : { background: 'linear-gradient(135deg,#6299D5,#7AACE0)', border: '2px solid #4A82C0', boxShadow: '0 4px 0 #4A82C0' }}>
              {saving
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Saving…</span>
                : '+ Add to Supplies'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function BabySuppliesSubScreen({ onBack }: { onBack: () => void }) {
  const [supplies, setSupplies] = useState<Supply[]>([
    { icon: '🧷', name: 'Diapers',     qty: 23, unit: 'left',    days: 4,  status: 'low'      },
    { icon: '🧻', name: 'Wipes',       qty: 12, unit: 'packs',   days: 2,  status: 'critical' },
    { icon: '🍼', name: 'Formula',     qty: 1,  unit: 'can',     days: 6,  status: 'ok'       },
    { icon: '🥣', name: 'Baby Food',   qty: 8,  unit: 'pouches', days: 10, status: 'ok'       },
    { icon: '🧴', name: 'Baby Lotion', qty: 1,  unit: 'bottle',  days: 14, status: 'ok'       },
  ])
  const [showShoppingList, setShowShoppingList] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null)

  const lowItems = supplies.filter(s => s.status === 'critical' || s.status === 'low')

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Baby Supplies" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-3">

        {/* Alert banner — tappable, dismissable */}
        {!alertDismissed && lowItems.length > 0 && (
          <div onClick={() => setShowShoppingList(true)}
            className="action-btn w-full rounded-2xl p-3.5 flex items-center gap-2.5 cursor-pointer"
            style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E', boxShadow: '0 3px 0 #F0D840' }}>
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#B8860B]">{lowItems.length} item{lowItems.length > 1 ? 's' : ''} need restocking soon</p>
              <p className="text-xs text-[#7A6010]">Tap to add to shopping list →</p>
            </div>
            <button onClick={e => { e.stopPropagation(); setAlertDismissed(true) }}
              className="action-btn w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: '#F8E88050', border: '1px solid #F8C85E80' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="#B8860B" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
        )}

        {/* Supply cards */}
        {supplies.map((s, i) => {
          const sc = STATUS_META[s.status]
          const pct = Math.min(100, (s.days / 14) * 100)
          return (
            <div key={i}>
              <div className="glass-card rounded-2xl p-3.5"
                style={confirmDeleteIdx === i ? { border: '1.5px solid #F6B6A5', background: 'rgba(255,214,201,0.4)' } : {}}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: sc.bg }}>{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <p className="font-semibold text-sm text-[#242424]">{s.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: sc.bg, color: sc.text }}>{sc.label}</span>
                    </div>
                    <p className="text-xs text-[#6E6E73]">{s.qty} {s.unit} · ~{s.days} days remaining</p>
                  </div>
                  <button onClick={() => setConfirmDeleteIdx(confirmDeleteIdx === i ? null : i)}
                    className="action-btn w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={confirmDeleteIdx === i
                      ? { background: '#FFD6C9', border: '1.5px solid #EE674E' }
                      : { background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5V3M3.5 3l.5 6.5h4L8.5 3" stroke={confirmDeleteIdx === i ? '#EE674E' : '#6E6E73'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
                <div className="h-1.5 rounded-full bg-[#F0E8E4] overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: sc.bar }} />
                </div>
              </div>
              {confirmDeleteIdx === i && (
                <div className="mx-1 rounded-b-2xl px-4 py-2.5 flex items-center gap-3"
                  style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5', borderTop: 'none', marginTop: -4 }}>
                  <p className="text-xs font-semibold text-[#EE674E] flex-1">Remove {s.name}?</p>
                  <button onClick={() => setConfirmDeleteIdx(null)}
                    className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#6E6E73]"
                    style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
                  <button onClick={() => { setSupplies(sv => sv.filter((_,idx) => idx !== i)); setConfirmDeleteIdx(null) }}
                    className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '1.5px solid #C94930', boxShadow: '0 2px 0 #C94930' }}>
                    Remove
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Action buttons */}
        <button onClick={() => setShowShoppingList(true)}
          className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
          🛒 Add All Low Items to Shopping List
          {lowItems.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-[#EE674E]">{lowItems.length}</span>
          )}
        </button>
        <button onClick={() => setShowAddItem(true)}
          className="action-btn w-full py-3 rounded-2xl font-bold text-sm text-[#6299D5] flex items-center justify-center gap-2"
          style={{ background: '#EBF2FC', border: '2px solid #C5D9F0', boxShadow: '0 3px 0 #C5D9F0' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#6299D5" strokeWidth="2" strokeLinecap="round"/></svg>
          Add New Supply Item
        </button>
      </div>
    </div>

    {showShoppingList && (
      <SupplyShoppingSheet items={lowItems} onClose={() => setShowShoppingList(false)} />
    )}
    {showAddItem && (
      <AddSupplySheet
        onClose={() => setShowAddItem(false)}
        onSave={item => setSupplies(sv => [...sv, item])}
      />
    )}
    </>
  )
}

// ─── MEMORY JOURNAL SUB-SCREEN ─────────────────────────────────────────────────
type Memory = { icon: string; title: string; date: string; color: string; bg: string; note: string }

const MEMORY_ICONS = ['😊','🍓','🦷','🤸','🎂','🗣️','👶','🌟','❤️','🎵','🛁','🌈','🤣','👣','🎯','🌙']
const MEMORY_COLORS = [
  { color: '#F47B66', bg: '#FFD6C9' },
  { color: '#55A67A', bg: '#E6F4ED' },
  { color: '#6299D5', bg: '#EBF2FC' },
  { color: '#B0A0F0', bg: '#F0EEF9' },
  { color: '#F8C85E', bg: '#FEF7E0' },
  { color: '#EE674E', bg: '#FFE8E0' },
]

function AddMemorySheet({ onClose, onSave }: { onClose: () => void; onSave: (m: Memory) => void }) {
  const [icon, setIcon] = useState('😊')
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' }))
  const [colorIdx, setColorIdx] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const palette = MEMORY_COLORS[colorIdx]
  const canSave = title.trim() && note.trim()

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false); setSaved(true)
      setTimeout(() => {
        onSave({ icon, title: title.trim(), note: note.trim(), date, ...palette })
        onClose()
      }, 900)
    }, 800)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>

        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: palette.bg }}>{icon}</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">New Memory</h3>
              <p className="text-xs text-[#6E6E73]">Capture a precious moment with Maya</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          {saved ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl pop-in"
                style={{ background: palette.bg }}>{icon}</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Memory Saved! 💛</p>
                <p className="text-sm text-[#6E6E73] mt-1">"{title}" added to Maya's story</p>
              </div>
            </div>
          ) : (<>
            {/* Icon */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Choose an icon</p>
              <div className="grid grid-cols-8 gap-2">
                {MEMORY_ICONS.map(ic => (
                  <button key={ic} onClick={() => setIcon(ic)}
                    className="action-btn h-10 rounded-xl flex items-center justify-center text-xl"
                    style={icon === ic
                      ? { background: palette.bg, border: `2px solid ${palette.color}`, boxShadow: `0 3px 0 ${palette.color}55` }
                      : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Colour */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Colour</p>
              <div className="flex gap-2">
                {MEMORY_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setColorIdx(i)}
                    className="action-btn w-9 h-9 rounded-xl transition-all"
                    style={{ background: c.bg, border: colorIdx === i ? `2.5px solid ${c.color}` : '2.5px solid transparent', boxShadow: colorIdx === i ? `0 3px 0 ${c.color}66` : 'none' }} />
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Memory title *</p>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. First Steps!"
                className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
            </div>

            {/* Note */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Your note *</p>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="Describe this precious moment…"
                rows={3}
                className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
            </div>

            {/* Date */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Date</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">📅</span>
                <input value={date} onChange={e => setDate(e.target.value)}
                  placeholder="e.g. August 10"
                  className="cartoon-input w-full pl-11 pr-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              </div>
            </div>

            {/* Preview */}
            {title && note && (
              <div className="glass-card rounded-2xl p-4" style={{ borderLeft: `4px solid ${palette.color}` }}>
                <p className="text-[10px] font-bold text-[#B0A8A4] uppercase tracking-wide mb-2">Preview</p>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: palette.bg }}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-[#242424]">{title}</p>
                      <span className="text-[11px] text-[#6E6E73]">{date}</span>
                    </div>
                    <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed italic">"{note}"</p>
                  </div>
                </div>
              </div>
            )}
          </>)}
        </div>

        {!saved && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={handleSave} disabled={!canSave || saving}
              className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-sm text-white"
              style={!canSave
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : saving
                  ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 2px 0 #E8A090' }
                  : { background: `linear-gradient(135deg,${palette.color},${palette.color}cc)`, border: `2px solid ${palette.color}99`, boxShadow: `0 4px 0 ${palette.color}66` }}>
              {saving
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Saving…</span>
                : '💛 Save Memory'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MonthlyStorySheet({ memories, onClose }: { memories: Memory[]; onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => { const t = setTimeout(() => setLoading(false), 2000); return () => clearTimeout(t) }, [])

  const story = `This month, Maya reached so many incredible milestones. It all started on ${memories[0]?.date} when ${memories[0]?.note.toLowerCase()} Every day brought something new and magical.\n\nBy ${memories[1]?.date}, she had already ${memories[1]?.note.toLowerCase()} The look of pure joy on her face made every sleepless night worth it.\n\nAs the weeks passed, she grew stronger and more curious. On ${memories[2]?.date}, ${memories[2]?.note.toLowerCase()} And just recently on ${memories[3]?.date}, she amazed us all when she ${memories[3]?.note.toLowerCase()}\n\nEvery moment with Maya is a gift. She is growing so fast, and watching her discover the world fills our hearts with endless love. Here's to many more beautiful memories ahead. 💛`

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>

        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 coral-gradient rounded-xl flex items-center justify-center text-xl flex-shrink-0">✨</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">Monthly Story</h3>
              <p className="text-xs text-[#6E6E73]">AI-written from Maya's memories</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-5">
              <div className="w-16 h-16 rounded-full coral-gradient flex items-center justify-center ai-orb-pulse">
                <span className="text-2xl">✨</span>
              </div>
              <div className="text-center">
                <p className="font-semibold text-[#242424]">Writing Maya's story…</p>
                <p className="text-xs text-[#6E6E73] mt-1">Weaving {memories.length} memories into a beautiful tale</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-[#EE674E]"
                    style={{ animation: `waveform 0.8s ease-in-out infinite ${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          ) : saved ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#FFD6C9] flex items-center justify-center text-4xl pop-in">📖</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Story Saved!</p>
                <p className="text-sm text-[#6E6E73] mt-1">Maya's first 7 months, beautifully captured</p>
              </div>
              <button onClick={onClose}
                className="action-btn w-full py-3.5 rounded-2xl font-bold text-white mt-2"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
                Done 💛
              </button>
            </div>
          ) : (<>
            <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
              <p className="text-xs text-[#7A6010]">✨ Generated from {memories.length} memories · You can edit before saving</p>
            </div>
            <div className="glass-card-strong rounded-2xl p-4" style={{ background: 'linear-gradient(135deg,#FFF8F4,#FFF3EE)' }}>
              <p className="font-display text-base text-[#242424] mb-3">Maya's First 7 Months 📖</p>
              <p className="text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-line">{story}</p>
            </div>
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5" style={{ background: '#F8F4F2' }}>
                <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Memories included</p>
              </div>
              {memories.map((m, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-t border-[#F0E8E4]">
                  <span className="text-base">{m.icon}</span>
                  <p className="text-sm text-[#242424] flex-1">{m.title}</p>
                  <span className="text-xs text-[#6E6E73]">{m.date}</span>
                </div>
              ))}
            </div>
          </>)}
        </div>

        {!loading && !saved && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn flex-1 py-3 rounded-2xl font-semibold text-sm text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>
              Regenerate
            </button>
            <button onClick={() => setSaved(true)}
              className="action-btn flex-1 py-3 rounded-2xl font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
              Save Story 📖
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MemoryJournalSubScreen({ onBack }: { onBack: () => void }) {
  const [memories, setMemories] = useState<Memory[]>([
    { icon: '😊', title: 'First Smile',      date: 'March 14', color: '#F47B66', bg: '#FFD6C9', note: 'She smiled at me for the first time today. My heart melted.' },
    { icon: '🍓', title: 'First Solid Food', date: 'May 2',     color: '#55A67A', bg: '#E6F4ED', note: 'Tried banana purée. Made the funniest face but ate it all!' },
    { icon: '🦷', title: 'First Tooth',      date: 'June 18',   color: '#6299D5', bg: '#EBF2FC', note: 'Bottom left tooth appeared. Lots of drooling leading up to this!' },
    { icon: '🤸', title: 'Rolled Over!',     date: 'July 5',    color: '#B0A0F0', bg: '#F0EEF9', note: 'Rolled from tummy to back all by herself. So proud!' },
  ])
  const [showAddMemory, setShowAddMemory] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const [confirmDeleteIdx, setConfirmDeleteIdx] = useState<number | null>(null)

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Maya's Story ❤️" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-3">

        {/* Header card */}
        <div className="glass-card-strong rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg,#FFF3EE,#FFD6C9)' }}>
          <p className="text-2xl mb-1">📖</p>
          <p className="font-display text-lg text-[#242424]">Maya's First 7 Months</p>
          <p className="text-xs text-[#6E6E73] mt-1">{memories.length} {memories.length === 1 ? 'memory' : 'memories'} captured</p>
          <button onClick={() => setShowStory(true)}
            className="action-btn mt-3 px-5 py-2.5 rounded-xl font-bold text-xs text-white"
            style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '1.5px solid #C94930', boxShadow: '0 3px 0 #C94930' }}>
            ✨ Create Monthly Story with AI
          </button>
        </div>

        {/* Memory cards */}
        {memories.map((m, i) => (
          <div key={i}>
            <div className="glass-card rounded-2xl p-4" style={{ borderLeft: `4px solid ${m.color}` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: m.bg }}>{m.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-[#242424]">{m.title}</p>
                    <span className="text-[11px] text-[#6E6E73] flex-shrink-0">{m.date}</span>
                  </div>
                  <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed italic">"{m.note}"</p>
                </div>
                <button onClick={() => setConfirmDeleteIdx(confirmDeleteIdx === i ? null : i)}
                  className="action-btn w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={confirmDeleteIdx === i
                    ? { background: '#FFD6C9', border: '1.5px solid #EE674E' }
                    : { background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M5 3V2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5V3M3.5 3l.5 6.5h4L8.5 3" stroke={confirmDeleteIdx === i ? '#EE674E' : '#6E6E73'} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
            {confirmDeleteIdx === i && (
              <div className="mx-1 rounded-b-2xl px-4 py-2.5 flex items-center gap-3"
                style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5', borderTop: 'none', marginTop: -4 }}>
                <p className="text-xs font-semibold text-[#EE674E] flex-1">Delete "{m.title}"?</p>
                <button onClick={() => setConfirmDeleteIdx(null)}
                  className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#6E6E73]"
                  style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
                <button onClick={() => { setMemories(ms => ms.filter((_,idx) => idx !== i)); setConfirmDeleteIdx(null) }}
                  className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '1.5px solid #C94930', boxShadow: '0 2px 0 #C94930' }}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add button */}
        <button onClick={() => setShowAddMemory(true)}
          className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-[#EE674E] flex items-center justify-center gap-2"
          style={{ background: '#FFD6C9', border: '2px dashed #F6B6A5', boxShadow: '0 3px 0 #F0C8B8' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="#EE674E" strokeWidth="2" strokeLinecap="round"/></svg>
          Add New Memory
        </button>
      </div>
    </div>

    {showAddMemory && (
      <AddMemorySheet
        onClose={() => setShowAddMemory(false)}
        onSave={m => setMemories(ms => [...ms, m])}
      />
    )}
    {showStory && (
      <MonthlyStorySheet memories={memories} onClose={() => setShowStory(false)} />
    )}
    </>
  )
}

// ─── MARKETPLACE SUB-SCREEN ────────────────────────────────────────────────────
type Provider = { name: string; role: string; rating: number; reviews: number; price: string; avail: string; verified: boolean; color: string; category: string }

const ALL_PROVIDERS: Provider[] = [
  { name: 'Jessica M.', role: 'Babysitter',        rating: 4.9, reviews: 127, price: '$24/hr', avail: 'Available Sat',  verified: true,  color: '#EE674E', category: 'Babysitters' },
  { name: 'Maria L.',   role: 'Nanny',              rating: 5.0, reviews: 84,  price: '$28/hr', avail: 'Available today',verified: true,  color: '#6299D5', category: 'Nannies'     },
  { name: 'Priya K.',   role: 'Postpartum Support', rating: 4.8, reviews: 56,  price: '$35/hr', avail: 'Available Sun',  verified: true,  color: '#B0A0F0', category: 'Postpartum'  },
  { name: 'Amy T.',     role: 'House Cleaner',      rating: 4.7, reviews: 203, price: '$22/hr', avail: 'Available Mon',  verified: true,  color: '#55A67A', category: 'Cleaning'    },
  { name: 'Rosa G.',    role: 'Meal Prep Chef',     rating: 4.9, reviews: 41,  price: '$30/hr', avail: 'Available Wed',  verified: false, color: '#C49B30', category: 'Meal Prep'   },
  { name: 'Lily S.',    role: 'Baby Photographer',  rating: 5.0, reviews: 88,  price: '$120/session', avail: 'Available Fri', verified: true, color: '#F47B66', category: 'Photography' },
]

function MessageSheet({ provider, onClose }: { provider: Provider; onClose: () => void }) {
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState([
    { from: 'them', text: `Hi! I'm ${provider.name}. How can I help you today?` },
  ])
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const QUICK = ['What are your hours?', 'Are you available this weekend?', `What's your experience with infants?`]

  const send = (text: string) => {
    if (!text.trim()) return
    setMsgs(m => [...m, { from: 'me', text }])
    setInput('')
    setSending(true)
    const replies: Record<string, string> = {
      'What are your hours?': `I'm available Mon–Sat, 7am–9pm. Sundays by arrangement!`,
      'Are you available this weekend?': `Yes! I have Saturday afternoon free. Want me to pencil you in?`,
      "What's your experience with infants?": `I have 5+ years with newborns to 12 months. CPR certified and first-aid trained.`,
    }
    setTimeout(() => {
      setSending(false)
      setMsgs(m => [...m, { from: 'them', text: replies[text] || `Thanks for your message! I'll get back to you shortly 😊` }])
    }, 1200)
  }

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', height: '78%' }}>

        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3 border-b border-[#F0E8E4]">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-3" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${provider.color},${provider.color}cc)` }}>{provider.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-[#242424]">{provider.name}</p>
              <p className="text-xs text-[#6E6E73]">{provider.role} · {provider.price}</p>
            </div>
            <button onClick={onClose}
              className="action-btn w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="#6E6E73" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="scroll-area flex-1 px-4 py-3 space-y-2">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={m.from === 'me'
                  ? { background: 'linear-gradient(135deg,#EE674E,#F47B66)', color: 'white', borderBottomRightRadius: 6 }
                  : { background: '#F0E8E4', color: '#242424', borderBottomLeftRadius: 6 }}>
                {m.text}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-[#F0E8E4]" style={{ borderBottomLeftRadius: 6 }}>
                <div className="flex gap-1">{[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#B0A8A4]" style={{ animation: `waveform 0.8s ease-in-out infinite ${i*0.2}s` }} />)}</div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div className="flex-shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto">
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)}
              className="action-btn flex-shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#EE674E] whitespace-nowrap"
              style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>{q}</button>
          ))}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-4 pb-5 pt-1 flex gap-2 items-center">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Type a message…"
            className="cartoon-input flex-1 px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
          <button onClick={() => send(input)} disabled={!input.trim()}
            className="action-btn w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: input.trim() ? 'linear-gradient(135deg,#EE674E,#F47B66)' : '#F0E8E4', border: input.trim() ? '2px solid #C94930' : '2px solid #E0D8D4', boxShadow: input.trim() ? '0 3px 0 #C94930' : 'none' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l12-5-5 12-2-5-5-2z" fill={input.trim() ? 'white' : '#B0A8A4'}/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function BookingSheet({ provider, onClose, onSave }: { provider: Provider; onClose: () => void; onSave: (input: { providerName: string; providerRole: string; day: string; slot: string; durationHrs: number; note?: string; estTotal: string }) => void }) {
  const days = ['Mon Aug 11','Tue Aug 12','Wed Aug 13','Thu Aug 14','Fri Aug 15','Sat Aug 16','Sun Aug 17']
  const slots = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','2:00 PM','3:00 PM','4:00 PM','6:00 PM']
  const durations = ['2 hrs','3 hrs','4 hrs','6 hrs','8 hrs']

  const [selDay, setSelDay] = useState<string|null>(null)
  const [selSlot, setSelSlot] = useState<string|null>(null)
  const [selDur, setSelDur] = useState('3 hrs')
  const [note, setNote] = useState('')
  const [step, setStep] = useState<1|2|3>(1)
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)

  const canNext = selDay && selSlot
  const hrs = parseInt(selDur)
  // provider.price is like "$24/hr" — parseInt() chokes on the leading "$"
  // and silently returns NaN, which used to only ever be displayed (never
  // persisted, so the bug was invisible). Strip to digits first.
  const hourlyRate = parseInt(provider.price.replace(/[^0-9.]/g, '')) || 0
  const total = selDur ? `$${hourlyRate * hrs}` : '—'

  const handleBook = () => {
    setBooking(true)
    setTimeout(() => {
      setBooking(false)
      setBooked(true)
      // Real persisted write — see docs/ARCHITECTURE.md §6/§13. Marketplace
      // is still mock (no live availability, no payment capture), but the
      // request itself is no longer thrown away.
      onSave({
        providerName: provider.name, providerRole: provider.role,
        day: selDay!, slot: selSlot!, durationHrs: hrs, note: note || undefined, estTotal: total,
      })
    }, 1400)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={step === 1 ? onClose : undefined} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>

        {/* Handle + header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />

          {/* Steps */}
          {!booked && (
            <div className="flex items-center gap-1 mb-4">
              {(['Date & Time','Details','Confirm'] as const).map((label, idx) => {
                const s = idx + 1
                return (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all`}
                      style={{ background: step > s ? '#55A67A' : step === s ? 'linear-gradient(135deg,#EE674E,#F47B66)' : '#F0E8E4', color: step >= s ? 'white' : '#B0A8A4' }}>
                      {step > s ? '✓' : s}
                    </div>
                    <span className={`text-[11px] font-semibold flex-1 ${step === s ? 'text-[#EE674E]' : step > s ? 'text-[#55A67A]' : 'text-[#B0A8A4]'}`}>{label}</span>
                    {s < 3 && <div className="w-3 h-px bg-[#F0E8E4]" />}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${provider.color},${provider.color}cc)` }}>{provider.name[0]}</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">{booked ? 'Booking Confirmed!' : 'Request Booking'}</h3>
              <p className="text-xs text-[#6E6E73]">{provider.name} · {provider.role} · {provider.price}</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">

          {booked ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">🎉</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Request Sent!</p>
                <p className="text-sm text-[#6E6E73] mt-1">{provider.name} will confirm within 2 hours</p>
              </div>
              <div className="w-full glass-card rounded-2xl p-4 space-y-2.5">
                {[
                  { icon: '👤', label: 'Provider', val: provider.name },
                  { icon: '📅', label: 'Date', val: selDay! },
                  { icon: '🕐', label: 'Time', val: selSlot! },
                  { icon: '⏱', label: 'Duration', val: selDur },
                  { icon: '💰', label: 'Est. Total', val: total },
                ].map((r,i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-base w-5 text-center">{r.icon}</span>
                    <p className="text-xs text-[#6E6E73] w-16 flex-shrink-0">{r.label}</p>
                    <p className="text-sm font-semibold text-[#242424]">{r.val}</p>
                  </div>
                ))}
              </div>
              <button onClick={onClose}
                className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
                Done
              </button>
            </div>
          ) : step === 1 ? (<>
            {/* Day picker */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Select a day</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {days.map(d => {
                  const parts = d.split(' ')
                  return (
                    <button key={d} onClick={() => setSelDay(d)}
                      className="action-btn flex-shrink-0 flex flex-col items-center py-2.5 px-3 rounded-2xl min-w-[58px]"
                      style={selDay === d
                        ? { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 3px 0 #C94930' }
                        : { background: '#F8F4F2', border: '2px solid #F0E8E4' }}>
                      <span className={`text-[10px] font-semibold ${selDay === d ? 'text-white/80' : 'text-[#6E6E73]'}`}>{parts[0]}</span>
                      <span className={`text-base font-bold ${selDay === d ? 'text-white' : 'text-[#242424]'}`}>{parts[2]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Select a time</p>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(s => (
                  <button key={s} onClick={() => setSelSlot(s)}
                    className="action-btn py-2.5 rounded-xl text-xs font-semibold"
                    style={selSlot === s
                      ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#EE674E', boxShadow: '0 3px 0 #F6B6A5' }
                      : { background: '#F8F4F2', border: '2px solid #F0E8E4', color: '#6E6E73' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Duration</p>
              <div className="flex gap-2">
                {durations.map(d => (
                  <button key={d} onClick={() => setSelDur(d)}
                    className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold"
                    style={selDur === d
                      ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#EE674E', boxShadow: '0 3px 0 #F6B6A5' }
                      : { background: '#F0E8E4', border: '2px solid #E8E0DC', color: '#6E6E73' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {selDay && selSlot && (
              <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: '#E6F4ED', border: '1.5px solid #A8D9BC' }}>
                <span className="text-xl">💰</span>
                <div>
                  <p className="text-xs text-[#6E6E73]">Estimated total</p>
                  <p className="font-bold text-[#242424]">{total} <span className="font-normal text-xs text-[#6E6E73]">for {selDur}</span></p>
                </div>
              </div>
            )}

          </>) : step === 2 ? (<>
            {/* Additional notes */}
            <div>
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-1.5">Special instructions <span className="font-normal normal-case text-[#B0A8A4]">(optional)</span></p>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder={`Any notes for ${provider.name.split(' ')[0]}? e.g. allergies, routines, gate code…`}
                rows={3} className="cartoon-input w-full px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4] resize-none" />
            </div>

            {/* Summary */}
            <div className="glass-card rounded-2xl p-4 space-y-2.5">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Booking summary</p>
              {[
                { icon: '👤', label: 'Provider', val: `${provider.name} · ${provider.role}` },
                { icon: '📅', label: 'Date', val: selDay! },
                { icon: '🕐', label: 'Time', val: selSlot! },
                { icon: '⏱', label: 'Duration', val: selDur },
                { icon: '💰', label: 'Est. Total', val: total },
              ].map((r,i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-base w-5 text-center">{r.icon}</span>
                  <p className="text-xs text-[#6E6E73] w-16 flex-shrink-0">{r.label}</p>
                  <p className="text-sm font-semibold text-[#242424] flex-1">{r.val}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
              <p className="text-xs text-[#7A6010]">ℹ️ Payment is collected after the session is completed. You can cancel up to 24 hours before.</p>
            </div>

          </>) : null}
        </div>

        {/* Footer */}
        {!booked && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            {step > 1 && (
              <button onClick={() => setStep(s => (s - 1) as 1|2|3)}
                className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            {step === 1 && (
              <button onClick={onClose}
                className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
            <button
              onClick={() => step < 2 ? setStep(2) : handleBook()}
              disabled={(step === 1 && !canNext) || booking}
              className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-sm text-white"
              style={(step === 1 && !canNext) || booking
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : { background: `linear-gradient(135deg,${provider.color},${provider.color}cc)`, border: `2px solid ${provider.color}99`, boxShadow: `0 4px 0 ${provider.color}66` }}>
              {booking
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Sending…</span>
                : step === 1 ? 'Next — Add Details →' : 'Confirm Booking 🎉'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MarketplaceSubScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [messageProvider, setMessageProvider] = useState<Provider | null>(null)
  const [bookingProvider, setBookingProvider] = useState<Provider | null>(null)
  const { bookings, save: saveBooking } = useBookings(DEMO_CHILD_ID)

  const categories = [
    { icon: '👶', label: 'Babysitters', color: '#EE674E', bg: '#FFD6C9' },
    { icon: '🏠', label: 'Nannies',     color: '#6299D5', bg: '#EBF2FC' },
    { icon: '💆', label: 'Postpartum',  color: '#B0A0F0', bg: '#F0EEF9' },
    { icon: '🧹', label: 'Cleaning',    color: '#55A67A', bg: '#E6F4ED' },
    { icon: '🍳', label: 'Meal Prep',   color: '#C49B30', bg: '#FEF7E0' },
    { icon: '📸', label: 'Photography', color: '#F47B66', bg: '#FEEAE6' },
  ]

  const filtered = ALL_PROVIDERS.filter(p => {
    const matchCat = !activeCategory || p.category === activeCategory
    const matchQ = !query.trim() || p.name.toLowerCase().includes(query.toLowerCase()) || p.role.toLowerCase().includes(query.toLowerCase())
    return matchCat && matchQ
  })

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Marketplace" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">

        {/* Search */}
        <div className="cartoon-input flex items-center gap-2 px-3 py-2.5">
          <span className="text-base">🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="What do you need help with?"
            className="flex-1 bg-transparent text-sm text-[#242424] placeholder-[#C0B8B4] outline-none" />
          {query && (
            <button onClick={() => setQuery('')} className="action-btn text-[#B0A8A4] text-sm">✕</button>
          )}
        </div>

        {/* Categories */}
        <div>
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Categories</p>
          <div className="grid grid-cols-3 gap-2">
            {categories.map((c, i) => (
              <button key={i} onClick={() => setActiveCategory(activeCategory === c.label ? null : c.label)}
                className="action-btn py-3.5 rounded-2xl flex flex-col items-center gap-1.5 transition-all"
                style={activeCategory === c.label
                  ? { background: c.bg, border: `2.5px solid ${c.color}`, boxShadow: `0 4px 0 ${c.color}55` }
                  : { background: c.bg, border: `1.5px solid ${c.color}33` }}>
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[10px] font-bold text-[#242424]">{c.label}</span>
                {activeCategory === c.label && <div className="w-1 h-1 rounded-full" style={{ background: c.color }} />}
              </button>
            ))}
          </div>
          {activeCategory && (
            <button onClick={() => setActiveCategory(null)}
              className="action-btn mt-2 w-full py-2 rounded-xl text-xs font-semibold text-[#6E6E73]"
              style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
              ✕ Clear filter: {activeCategory}
            </button>
          )}
        </div>

        {/* Providers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">
              {activeCategory ? activeCategory : 'Top Providers Near You'}
            </p>
            <p className="text-xs text-[#6E6E73]">{filtered.length} found</p>
          </div>

          {filtered.length === 0 ? (
            <div className="glass-card rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
              <span className="text-3xl">🔍</span>
              <p className="font-semibold text-sm text-[#242424]">No providers found</p>
              <p className="text-xs text-[#6E6E73]">Try a different search or category</p>
              <button onClick={() => { setQuery(''); setActiveCategory(null) }}
                className="action-btn px-4 py-2 rounded-xl text-xs font-bold text-[#EE674E]"
                style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5' }}>Clear filters</button>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((p, i) => (
                <div key={i} className="glass-card rounded-2xl p-3.5">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-lg flex-shrink-0"
                      style={{ background: `linear-gradient(135deg,${p.color},${p.color}cc)` }}>{p.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-sm text-[#242424]">{p.name}</p>
                        {p.verified && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-[#6299D5]" style={{ background: '#EBF2FC' }}>✓ Verified</span>}
                      </div>
                      <p className="text-xs text-[#6E6E73]">{p.role}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs font-semibold text-[#C49B30]">⭐ {p.rating}</span>
                        <span className="text-[10px] text-[#6E6E73]">{p.reviews} reviews</span>
                        <span className="text-xs font-bold text-[#242424]">{p.price}</span>
                      </div>
                      <p className="text-[10px] text-[#55A67A] font-medium mt-0.5">🟢 {p.avail}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setMessageProvider(p)}
                      className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-[#EE674E] flex items-center justify-center gap-1"
                      style={{ background: '#FFD6C9', border: '1.5px solid #F6B6A5', boxShadow: '0 2px 0 #F6B6A5' }}>
                      💬 Message
                    </button>
                    <button onClick={() => setBookingProvider(p)}
                      className="action-btn flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1"
                      style={{ background: `linear-gradient(135deg,${p.color},${p.color}cc)`, border: `1.5px solid ${p.color}99`, boxShadow: `0 3px 0 ${p.color}66` }}>
                      📅 Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Requests — real persisted bookings, see docs/ARCHITECTURE.md §6/§13 */}
        {bookings.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">My Requests</p>
            <div className="space-y-2">
              {bookings.map(b => (
                <div key={b.id} className="glass-card rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#242424] truncate">{b.providerName}</p>
                    <p className="text-xs text-[#6E6E73]">{b.day} · {b.slot} · {b.durationHrs} hrs</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0" style={{ background: '#FEF3CD', color: '#B8860B' }}>
                    Requested
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>

    {messageProvider && <MessageSheet provider={messageProvider} onClose={() => setMessageProvider(null)} />}
    {bookingProvider && <BookingSheet provider={bookingProvider} onClose={() => setBookingProvider(null)} onSave={saveBooking} />}
    </>
  )
}

// ─── MOMMIND PLUS SUB-SCREEN ───────────────────────────────────────────────────
function TrialStartSheet({ planName, price, onClose, onConfirm }: {
  planName: string; price: string; onClose: () => void; onConfirm: () => void
}) {
  const [card, setCard] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const formatCard = (v: string) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()
  const formatExpiry = (v: string) => { const d = v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) : d }
  const canStart = card.replace(/\s/g,'').length === 16 && expiry.length === 5 && cvv.length >= 3 && agreed

  const handleStart = () => {
    setProcessing(true)
    setTimeout(() => { setProcessing(false); setDone(true); setTimeout(onConfirm, 1200) }, 1600)
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '90%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 coral-gradient rounded-xl flex items-center justify-center text-xl flex-shrink-0">✨</div>
            <div>
              <h3 className="font-display text-lg text-[#242424]">Start Free Trial</h3>
              <p className="text-xs text-[#6E6E73]">{planName} · 7 days free, then {price}/mo</p>
            </div>
          </div>
        </div>

        <div className="scroll-area flex-1 px-5 pb-4 space-y-4">
          {done ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-20 h-20 rounded-full bg-[#E6F4ED] flex items-center justify-center text-4xl pop-in">🎉</div>
              <div className="text-center">
                <p className="font-display text-xl text-[#242424]">Trial Started!</p>
                <p className="text-sm text-[#6E6E73] mt-1">7 days free. Cancel anytime before day 7.</p>
              </div>
            </div>
          ) : (<>
            {/* Trial banner */}
            <div className="rounded-2xl px-4 py-3.5 text-center" style={{ background: 'linear-gradient(135deg,#FFD6C9,#FFF3EE)', border: '1.5px solid #F6B6A5' }}>
              <p className="font-bold text-sm text-[#EE674E]">🎁 7-Day Free Trial</p>
              <p className="text-xs text-[#6E6E73] mt-0.5">Your card won't be charged until day 8. Cancel anytime.</p>
            </div>

            {/* Card input */}
            <div className="glass-card rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Payment details</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base">💳</span>
                <input value={card} onChange={e => setCard(formatCard(e.target.value))}
                  placeholder="1234 5678 9012 3456" inputMode="numeric"
                  className="cartoon-input w-full pl-11 pr-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              </div>
              <div className="flex gap-3">
                <input value={expiry} onChange={e => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY" inputMode="numeric"
                  className="cartoon-input flex-1 px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
                <input value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))}
                  placeholder="CVV" inputMode="numeric"
                  className="cartoon-input flex-1 px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]" />
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                {['🔒 Stripe','Visa','Mastercard'].map(b => (
                  <span key={b} className="text-[10px] font-bold text-[#B0A8A4] px-2 py-1 rounded-lg" style={{ background: '#F0E8E4' }}>{b}</span>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">Order summary</p>
              {[
                { label: 'Plan', val: planName },
                { label: 'Trial period', val: '7 days free' },
                { label: 'Then billed', val: `${price}/month` },
                { label: 'Due today', val: '$0.00' },
              ].map((r,i) => (
                <div key={i} className="flex justify-between items-center">
                  <p className="text-xs text-[#6E6E73]">{r.label}</p>
                  <p className={`text-sm font-semibold ${r.label === 'Due today' ? 'text-[#55A67A]' : 'text-[#242424]'}`}>{r.val}</p>
                </div>
              ))}
            </div>

            {/* Agreement */}
            <button onClick={() => setAgreed(v => !v)}
              className="action-btn w-full flex items-start gap-3 text-left py-1">
              <div className="w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center border-2 mt-0.5 transition-all"
                style={{ background: agreed ? '#EE674E' : 'white', borderColor: agreed ? '#EE674E' : '#F6B6A5' }}>
                {agreed && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <p className="text-xs text-[#6E6E73] leading-relaxed flex-1">
                I agree to the <span className="text-[#EE674E] font-semibold">Terms of Service</span>. After 7 days, {price}/month will be charged automatically unless cancelled.
              </p>
            </button>
          </>)}
        </div>

        {!done && (
          <div className="flex-shrink-0 px-5 pb-6 pt-3 flex gap-3 border-t border-[#F0E8E4]">
            <button onClick={onClose}
              className="action-btn w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#F0E8E4', border: '2px solid #E0D8D4', boxShadow: '0 3px 0 #D8D0CC' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="#6E6E73" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={handleStart} disabled={!canStart || processing}
              className="action-btn flex-1 py-3.5 rounded-2xl font-bold text-sm text-white"
              style={!canStart
                ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
                : processing
                  ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 2px 0 #E8A090' }
                  : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
              {processing
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Processing…</span>
                : '✨ Start My Free Trial'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function SubscriptionSubScreen({ onBack }: { onBack: () => void }) {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly')
  const [activePlan, setActivePlan] = useState<string>('Free')
  const [trialPlan, setTrialPlan] = useState<{ name: string; price: string } | null>(null)
  // Country-config-driven pricing — see docs/ARCHITECTURE.md §7.1/§7.2. Same
  // mechanism and same reference numbers as apps/website/src/i18n.ts.
  const [country] = useState(() => detectCountry())

  const plans = [
    {
      id: 'free', name: 'Free', price: `${country.symbol}0`, period: 'forever', color: '#6E6E73', accent: '#F0E8E4',
      features: ['1 child', 'Core tracking', 'Basic summary', 'Limited AI (5/day)', 'Marketplace browsing'],
      cta: 'Current Plan', highlight: false, badge: null, trial: false,
    },
    {
      id: 'plus', name: 'MomMind Plus', price: planPrice(country, 'plus', billing),
      period: billing === 'monthly' ? '/month' : '/month (billed annually)', color: '#EE674E', accent: '#FFD6C9',
      features: ['Everything in Free', 'Unlimited AI assistant', 'AI Voice logging', 'BabyPredict', 'Smart meal planning', 'Development activities', 'Data exports'],
      cta: 'Start Free Trial', highlight: true, badge: 'Most Popular', trial: true,
    },
    {
      id: 'family', name: 'Family', price: planPrice(country, 'family', billing),
      period: billing === 'monthly' ? '/month' : '/month (billed annually)', color: '#6299D5', accent: '#EBF2FC',
      features: ['Everything in Plus', 'Multiple children', 'Partner & grandparent access', 'Caregiver handoffs', 'Shared tasks', 'Advanced permissions'],
      cta: 'Start Family Plan', highlight: false, badge: null, trial: true,
    },
    {
      id: 'custom', name: 'MomMind Pro', price: 'Custom',
      period: '— tailored pricing', color: '#B0A0F0', accent: '#F0EEF9',
      features: ['Everything in Family', 'Multiple family groups', 'Dedicated account manager', 'White-glove onboarding', 'API access', 'Custom integrations', 'Priority 24/7 support'],
      cta: 'Contact Us', highlight: false, badge: '🌟 Enterprise', trial: false,
    },
  ]

  const handleCTA = (plan: typeof plans[0]) => {
    if (plan.id === 'free' || activePlan === plan.name) return
    if (plan.id === 'custom') return // contact flow TBD
    setTrialPlan({ name: plan.name, price: plan.price })
  }

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Choose Your Plan" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">
        <p className="text-sm text-[#6E6E73] text-center">Grows with your family</p>

        {/* Active plan banner */}
        {activePlan !== 'Free' && (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: '#E6F4ED', border: '1.5px solid #A8D9BC' }}>
            <span className="text-xl">✅</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#55A67A]">Active: {activePlan}</p>
              <p className="text-xs text-[#3D8A60]">7-day trial · Cancel anytime in settings</p>
            </div>
          </div>
        )}

        {/* Billing toggle */}
        <div className="flex gap-1 bg-[#F6EDE8] p-1 rounded-xl">
          {(['monthly', 'annual'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)}
              className={`tab-pill flex-1 py-2 rounded-lg text-xs font-semibold ${billing === b ? 'bg-white text-[#EE674E] shadow-sm' : 'text-[#6E6E73]'}`}>
              {b === 'annual' ? '🏷 Annual (Save 17%)' : 'Monthly'}
            </button>
          ))}
        </div>

        {/* Plan cards */}
        {plans.map((plan) => {
          const isCurrent = activePlan === plan.name
          const isCustom = plan.id === 'custom'
          return (
            <div key={plan.id} className={`rounded-2xl p-4 ${plan.highlight ? 'glass-card-strong' : 'glass-card'}`}
              style={isCurrent
                ? { border: `2px solid ${plan.color}`, boxShadow: `0 0 0 4px ${plan.color}18` }
                : plan.highlight
                  ? { border: `2px solid #EE674E` }
                  : isCustom
                    ? { border: `2px dashed ${plan.color}88`, background: 'linear-gradient(135deg,#F8F4FF,#F0EEF9)' }
                    : {}}>

              {/* Badge row */}
              <div className="flex items-center gap-2 mb-2">
                {plan.badge && (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white ${plan.highlight ? 'coral-gradient' : ''}`}
                    style={!plan.highlight ? { background: plan.color } : {}}>
                    {plan.badge}
                  </span>
                )}
                {isCurrent && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold text-[#55A67A]"
                    style={{ background: '#E6F4ED' }}>✓ Active</span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-1 mb-1">
                <span className="font-display text-3xl text-[#242424]">{plan.price}</span>
                <span className="text-xs text-[#6E6E73] mb-1">{plan.period}</span>
              </div>
              <p className="font-bold text-sm text-[#242424] mb-3">{plan.name}</p>

              {/* Features */}
              <div className="space-y-1.5 mb-4">
                {plan.features.map((f, fi) => (
                  <div key={fi} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: plan.accent }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke={plan.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span className="text-xs text-[#6E6E73]">{f}</span>
                  </div>
                ))}
              </div>

              {/* Trial note for paid plans */}
              {plan.trial && !isCurrent && (
                <p className="text-[10px] text-[#6E6E73] text-center mb-2">🎁 7-day free trial · No charge until day 8</p>
              )}

              {/* CTA */}
              <button
                onClick={() => handleCTA(plan)}
                className="action-btn w-full py-3 rounded-xl font-bold text-sm"
                style={isCurrent
                  ? { background: '#F0E8E4', color: '#6E6E73', cursor: 'default' }
                  : isCustom
                    ? { background: 'linear-gradient(135deg,#B0A0F0,#C8B8FF)', border: '2px solid #9880E0', boxShadow: '0 4px 0 #9880E0', color: 'white' }
                    : plan.highlight
                      ? { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930', color: 'white' }
                      : { background: plan.accent, border: `1.5px solid ${plan.color}66`, boxShadow: `0 3px 0 ${plan.color}44`, color: plan.color }}>
                {isCurrent ? '✓ Current Plan' : plan.cta}
              </button>
            </div>
          )
        })}

        {/* Footer note */}
        <p className="text-[10px] text-[#B0A8A4] text-center px-4 leading-relaxed">
          Cancel anytime. Subscriptions auto-renew unless cancelled at least 24 hours before the end of the billing period.
        </p>
      </div>
    </div>

    {trialPlan && (
      <TrialStartSheet
        planName={trialPlan.name}
        price={trialPlan.price}
        onClose={() => setTrialPlan(null)}
        onConfirm={() => { setActivePlan(trialPlan.name); setTrialPlan(null) }}
      />
    )}
    </>
  )
}

// ─── NOTIFICATIONS SUB-SCREEN ──────────────────────────────────────────────────
function NotificationsSubScreen({ onBack }: { onBack: () => void }) {
  const [quiet, setQuiet] = useState(false)
  const categories = [
    { icon: '🔮', label: 'Routine Predictions', sub: 'Nap & feed predictions', on: true },
    { icon: '🍼', label: 'Feeding Reminders', sub: 'Every 3-4 hours', on: true },
    { icon: '🌙', label: 'Sleep Reminders', sub: 'Bedtime & wake window', on: true },
    { icon: '🏥', label: 'Appointments', sub: 'Upcoming bookings', on: true },
    { icon: '👨‍👩‍👧', label: 'Family Activity', sub: 'When family logs data', on: false },
    { icon: '🛍️', label: 'Marketplace', sub: 'Booking updates', on: true },
    { icon: '📦', label: 'Supply Alerts', sub: 'When stock is low', on: true },
    { icon: '✨', label: 'MomMind Insights', sub: 'Daily AI summaries', on: true },
    { icon: '📣', label: 'Marketing', sub: 'Tips & promotions', on: false },
  ]
  const [states, setStates] = useState(categories.map(c => c.on))
  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Notifications" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-3">
        <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌙</span>
            <div>
              <p className="text-sm font-semibold text-[#242424]">Quiet Hours</p>
              <p className="text-xs text-[#6E6E73]">10 PM – 7 AM · No alerts</p>
            </div>
          </div>
          <button onClick={() => setQuiet(v => !v)}
            className="action-btn w-12 h-6 rounded-full transition-all"
            style={{ background: quiet ? '#EE674E' : '#E0D8D4' }}>
            <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
              style={{ marginLeft: quiet ? '24px' : '2px' }} />
          </button>
        </div>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
          {categories.map((c, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span className="text-lg">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#242424]">{c.label}</p>
                <p className="text-xs text-[#6E6E73]">{c.sub}</p>
              </div>
              <button onClick={() => setStates(s => s.map((v, j) => j === i ? !v : v))}
                className="action-btn w-11 h-6 rounded-full transition-all flex-shrink-0"
                style={{ background: states[i] ? '#EE674E' : '#E0D8D4' }}>
                <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                  style={{ marginLeft: states[i] ? '22px' : '2px' }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── PRIVACY CENTER SUB-SCREEN ─────────────────────────────────────────────────

type PrivacySheet = 'ai-memory' | 'family-access' | 'voice-data' | 'connected' | 'download' | 'delete' | null

function PrivacySheetWrapper({ title, icon, iconBg, onClose, children, footer }: {
  title: string; icon: string; iconBg: string; onClose: () => void
  children: React.ReactNode; footer?: React.ReactNode
}) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col"
        style={{ background: '#FFFCFA', boxShadow: '0 -12px 48px rgba(0,0,0,0.14)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full bg-[#E0D8D4] mx-auto mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: iconBg }}>{icon}</div>
            <h3 className="font-display text-lg text-[#242424]">{title}</h3>
            <button onClick={onClose} className="action-btn ml-auto w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: '#F0E8E4', border: '1.5px solid #E0D8D4' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="#6E6E73" strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-3">{children}</div>
        {footer && <div className="flex-shrink-0 px-5 pb-6 pt-3 border-t border-[#F0E8E4]">{footer}</div>}
      </div>
    </div>
  )
}

function AIMemorySheet({ onClose }: { onClose: () => void }) {
  const [memories, setMemories] = useState([
    { id: 1, text: 'Maya usually goes to bed around 7:45 PM.' },
    { id: 2, text: "Maya's average nap is 75 minutes." },
    { id: 3, text: 'Sarah prefers bottle feeding reminders every 3 hours.' },
    { id: 4, text: 'Maya dislikes broccoli (logged 3 times).' },
  ])
  const [input, setInput] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [cleared, setCleared] = useState(false)

  const addMemory = () => {
    if (!input.trim()) return
    setMemories(m => [...m, { id: Date.now(), text: input.trim() }])
    setInput('')
  }
  const forget = (id: number) => setMemories(m => m.filter(x => x.id !== id))
  const clearAll = () => { setMemories([]); setCleared(true); setConfirmClear(false) }

  return (
    <PrivacySheetWrapper title="AI Memory" icon="🧠" iconBg="#FFD6C9" onClose={onClose}>
      <p className="text-xs text-[#6E6E73]">These are the insights MomMind has learned about your family. You can delete individual memories or clear all at once.</p>

      {cleared ? (
        <div className="flex flex-col items-center py-6 gap-3">
          <span className="text-4xl">🧹</span>
          <p className="font-semibold text-sm text-[#242424]">All memories cleared</p>
          <p className="text-xs text-[#6E6E73]">MomMind will learn fresh from your activity</p>
        </div>
      ) : (
        <div className="space-y-2">
          {memories.map(m => (
            <div key={m.id} className="flex items-start gap-3 p-3 rounded-2xl"
              style={{ background: '#FFF3EE', border: '1px solid #F6B6A5' }}>
              <p className="text-xs text-[#242424] flex-1 leading-relaxed">{m.text}</p>
              <button onClick={() => forget(m.id)}
                className="action-btn flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#D9534F]"
                style={{ background: '#FAECEC', border: '1px solid #ECA0A0' }}>Forget</button>
            </div>
          ))}
        </div>
      )}

      {/* Add new memory */}
      {!cleared && (
        <div className="flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addMemory()}
            placeholder="Add a custom memory note…"
            className="cartoon-input flex-1 px-4 py-3 text-sm text-[#242424] placeholder-[#C0B8B4]" />
          <button onClick={addMemory} disabled={!input.trim()}
            className="action-btn w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: input.trim() ? 'linear-gradient(135deg,#EE674E,#F47B66)' : '#F0E8E4', border: input.trim() ? '2px solid #C94930' : '2px solid #E0D8D4', boxShadow: input.trim() ? '0 3px 0 #C94930' : 'none' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke={input.trim() ? 'white' : '#B0A8A4'} strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      )}

      {!cleared && memories.length > 0 && (
        confirmClear ? (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
            <p className="text-xs font-semibold text-[#D9534F] flex-1">Clear all {memories.length} memories?</p>
            <button onClick={() => setConfirmClear(false)} className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#6E6E73]" style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
            <button onClick={clearAll} className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#D9534F', border: '1.5px solid #B03030', boxShadow: '0 2px 0 #B03030' }}>Clear All</button>
          </div>
        ) : (
          <button onClick={() => setConfirmClear(true)}
            className="action-btn w-full py-2.5 rounded-xl text-xs font-bold text-[#D9534F]"
            style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
            🗑️ Clear All Memories
          </button>
        )
      )}
    </PrivacySheetWrapper>
  )
}

function FamilyAccessSheet({ onClose }: { onClose: () => void }) {
  const dataTypes = ['Timeline & logs', 'Feeding data', 'Sleep data', 'Growth charts', 'Meal plans', 'Private notes', 'Photos & memories']
  const [members, setMembers] = useState([
    { name: 'David', role: 'Dad', color: '#6299D5', perms: [0,1,2,3,4] },
    { name: 'Grandma', role: 'Caregiver', color: '#55A67A', perms: [0,1,2] },
    { name: 'Nanny', role: 'Caregiver', color: '#B0A0F0', perms: [0,1,2,3] },
  ])
  const [expanded, setExpanded] = useState<number | null>(0)

  const toggle = (mi: number, pi: number) => setMembers(ms => ms.map((m, i) => i === mi
    ? { ...m, perms: m.perms.includes(pi) ? m.perms.filter(x => x !== pi) : [...m.perms, pi] } : m))

  return (
    <PrivacySheetWrapper title="Family Access" icon="👨‍👩‍👧" iconBg="#EBF2FC" onClose={onClose}>
      <p className="text-xs text-[#6E6E73]">Control exactly what each family member and caregiver can see.</p>
      {members.map((m, mi) => (
        <div key={mi} className="glass-card rounded-2xl overflow-hidden">
          <button onClick={() => setExpanded(expanded === mi ? null : mi)}
            className="action-btn w-full flex items-center gap-3 px-4 py-3 text-left">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${m.color},${m.color}99)` }}>{m.name[0]}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#242424]">{m.name}</p>
              <p className="text-xs text-[#6E6E73]">{m.role} · {m.perms.length}/{dataTypes.length} items</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ transform: expanded === mi ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M5 3l4 4-4 4" stroke="#B0A8A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {expanded === mi && (
            <div className="px-4 pb-3 space-y-2 border-t border-[#F0E8E4] pt-2">
              {dataTypes.map((d, pi) => (
                <div key={pi} className="flex items-center justify-between">
                  <p className="text-xs text-[#242424]">{d}</p>
                  <button onClick={() => toggle(mi, pi)}
                    className="action-btn w-10 h-5 rounded-full transition-all"
                    style={{ background: m.perms.includes(pi) ? m.color : '#E0D8D4' }}>
                    <div className="w-3.5 h-3.5 bg-white rounded-full shadow transition-all"
                      style={{ marginLeft: m.perms.includes(pi) ? '22px' : '2px' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </PrivacySheetWrapper>
  )
}

function VoiceDataSheet({ onClose }: { onClose: () => void }) {
  const [retention, setRetention] = useState('30')
  const [autoDelete, setAutoDelete] = useState(true)
  const [confirmClear, setConfirmClear] = useState(false)
  const [cleared, setCleared] = useState(false)
  const recordings = ['Aug 10 · 0:14 — feeding log', 'Aug 9 · 0:08 — sleep log', 'Aug 9 · 0:22 — note', 'Aug 8 · 0:11 — diaper log']
  const [recs, setRecs] = useState(recordings)

  return (
    <PrivacySheetWrapper title="Voice Data" icon="🎙️" iconBg="#E6F4ED" onClose={onClose}>
      <p className="text-xs text-[#6E6E73]">Voice recordings are transcribed and deleted based on your retention setting.</p>
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-semibold text-[#242424]">Auto-delete recordings</p><p className="text-xs text-[#6E6E73]">After transcription</p></div>
          <button onClick={() => setAutoDelete(v => !v)} className="action-btn w-12 h-6 rounded-full transition-all"
            style={{ background: autoDelete ? '#EE674E' : '#E0D8D4' }}>
            <div className="w-4 h-4 bg-white rounded-full shadow transition-all" style={{ marginLeft: autoDelete ? '24px' : '2px' }} />
          </button>
        </div>
        <div>
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Retention period</p>
          <div className="flex gap-2">
            {['7','14','30','90'].map(d => (
              <button key={d} onClick={() => setRetention(d)}
                className="action-btn flex-1 py-2 rounded-xl text-xs font-bold"
                style={retention === d ? { background: '#FFD6C9', border: '2px solid #EE674E', color: '#EE674E' } : { background: '#F0E8E4', color: '#6E6E73' }}>
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Stored recordings ({recs.length})</p>
        {cleared || recs.length === 0 ? (
          <div className="flex flex-col items-center py-4 gap-2"><span className="text-2xl">✅</span><p className="text-xs text-[#6E6E73]">No recordings stored</p></div>
        ) : (
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
            {recs.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-base flex-shrink-0">🎤</span>
                <p className="text-xs text-[#242424] flex-1">{r}</p>
                <button onClick={() => setRecs(rs => rs.filter((_,idx) => idx !== i))}
                  className="action-btn px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#D9534F]"
                  style={{ background: '#FAECEC', border: '1px solid #ECA0A0' }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {recs.length > 0 && !cleared && (
        confirmClear ? (
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3" style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
            <p className="text-xs font-semibold text-[#D9534F] flex-1">Delete all recordings?</p>
            <button onClick={() => setConfirmClear(false)} className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-[#6E6E73]" style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
            <button onClick={() => { setRecs([]); setCleared(true); setConfirmClear(false) }} className="action-btn px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background: '#D9534F', border: '1.5px solid #B03030', boxShadow: '0 2px 0 #B03030' }}>Delete All</button>
          </div>
        ) : (
          <button onClick={() => setConfirmClear(true)} className="action-btn w-full py-2.5 rounded-xl text-xs font-bold text-[#D9534F]"
            style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>🗑️ Delete All Recordings</button>
        )
      )}
    </PrivacySheetWrapper>
  )
}

function ConnectedServicesSheet({ onClose }: { onClose: () => void }) {
  const [services, setServices] = useState([
    { icon: '📅', name: 'Apple Calendar', desc: 'Syncs appointments', connected: true, color: '#6299D5' },
    { icon: '🏥', name: 'Baby Health App', desc: 'Shares growth data', connected: true, color: '#55A67A' },
    { icon: '🛒', name: 'Amazon Baby', desc: 'Supply tracking', connected: false, color: '#F8C85E' },
    { icon: '📊', name: 'Google Fit', desc: 'Activity data', connected: false, color: '#EE674E' },
  ])
  const [confirmDisconnect, setConfirmDisconnect] = useState<number | null>(null)

  const toggle = (i: number) => {
    if (services[i].connected) { setConfirmDisconnect(i) }
    else setServices(sv => sv.map((s, idx) => idx === i ? { ...s, connected: true } : s))
  }

  return (
    <PrivacySheetWrapper title="Connected Services" icon="🔗" iconBg="#EBF2FC" onClose={onClose}>
      <p className="text-xs text-[#6E6E73]">Apps and services that have access to your MomMind data. Disconnect any time.</p>
      <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
        {services.map((s, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: s.connected ? `${s.color}22` : '#F0E8E4' }}>{s.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#242424]">{s.name}</p>
                <p className="text-xs text-[#6E6E73]">{s.desc}</p>
              </div>
              <button onClick={() => toggle(i)} className="action-btn w-12 h-6 rounded-full transition-all"
                style={{ background: s.connected ? s.color : '#E0D8D4' }}>
                <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                  style={{ marginLeft: s.connected ? '24px' : '2px' }} />
              </button>
            </div>
            {confirmDisconnect === i && (
              <div className="mx-3 mb-2 rounded-xl px-3 py-2 flex items-center gap-2"
                style={{ background: '#FEF3CD', border: '1px solid #F8C85E' }}>
                <p className="text-xs text-[#7A6010] flex-1">Disconnect {s.name}?</p>
                <button onClick={() => setConfirmDisconnect(null)} className="action-btn px-2 py-1 rounded-lg text-[10px] font-bold text-[#6E6E73]" style={{ background: '#fff' }}>Cancel</button>
                <button onClick={() => { setServices(sv => sv.map((x, idx) => idx === i ? { ...x, connected: false } : x)); setConfirmDisconnect(null) }}
                  className="action-btn px-2 py-1 rounded-lg text-[10px] font-bold text-white" style={{ background: '#D9534F' }}>Disconnect</button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="rounded-2xl px-4 py-3" style={{ background: '#FEF3CD', border: '1.5px solid #F8C85E' }}>
        <p className="text-xs text-[#7A6010]">ℹ️ Disconnecting a service stops future data sharing but does not delete data already shared.</p>
      </div>
    </PrivacySheetWrapper>
  )
}

function DownloadDataSheet({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState<'JSON' | 'CSV'>('JSON')
  const [selected, setSelected] = useState([0,1,2,3,4])
  const dataTypes = ['Activity logs', 'Growth data', 'Meal records', 'AI conversations', 'Photos & memories']
  const [preparing, setPreparing] = useState(false)
  const [ready, setReady] = useState(false)

  const toggle = (i: number) => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])
  const handleExport = () => {
    setPreparing(true)
    setTimeout(() => { setPreparing(false); setReady(true) }, 1800)
  }

  return (
    <PrivacySheetWrapper title="Download My Data" icon="⬇️" iconBg="#E6F4ED" onClose={onClose}
      footer={
        ready ? (
          <button onClick={onClose} className="action-btn w-full py-3.5 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#55A67A,#78C49A)', border: '2px solid #3D8A60', boxShadow: '0 4px 0 #3D8A60' }}>
            ✅ Download Ready — Save File
          </button>
        ) : (
          <button onClick={handleExport} disabled={selected.length === 0 || preparing}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={selected.length === 0 ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' }
              : preparing ? { background: '#F6B6A5', border: '2px solid #E8A090' }
              : { background: 'linear-gradient(135deg,#55A67A,#78C49A)', border: '2px solid #3D8A60', boxShadow: '0 4px 0 #3D8A60' }}>
            {preparing
              ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Preparing export…</span>
              : `⬇️ Export ${selected.length} categories as ${format}`}
          </button>
        )
      }>
      <p className="text-xs text-[#6E6E73]">Export a full copy of your data. Choose what to include and your preferred format.</p>

      {ready && (
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="w-14 h-14 rounded-full bg-[#E6F4ED] flex items-center justify-center text-3xl pop-in">📦</div>
          <p className="font-semibold text-sm text-[#242424]">Export ready!</p>
          <p className="text-xs text-[#6E6E73]">{selected.length} categories · {format} format</p>
        </div>
      )}

      {!ready && (<>
        <div>
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Format</p>
          <div className="flex gap-2">
            {(['JSON','CSV'] as const).map(f => (
              <button key={f} onClick={() => setFormat(f)}
                className="action-btn flex-1 py-3 rounded-xl font-bold text-sm"
                style={format === f ? { background: '#E6F4ED', border: '2px solid #55A67A', color: '#55A67A', boxShadow: '0 3px 0 #A8D9BC' } : { background: '#F0E8E4', color: '#6E6E73' }}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide mb-2">Include</p>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
            {dataTypes.map((d, i) => (
              <button key={i} onClick={() => toggle(i)} className="action-btn w-full flex items-center gap-3 px-4 py-3 text-left">
                <div className="w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all flex-shrink-0"
                  style={{ background: selected.includes(i) ? '#55A67A' : 'white', borderColor: selected.includes(i) ? '#55A67A' : '#F6B6A5' }}>
                  {selected.includes(i) && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <p className="text-sm text-[#242424] flex-1">{d}</p>
              </button>
            ))}
          </div>
        </div>
      </>)}
    </PrivacySheetWrapper>
  )
}

function DeleteDataSheet({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<1|2|3>(1)
  const [typed, setTyped] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const handleDelete = () => {
    setDeleting(true)
    setTimeout(() => { setDeleting(false); setDeleted(true) }, 2000)
  }

  return (
    <PrivacySheetWrapper title="Delete My Data" icon="🗑️" iconBg="#FAECEC" onClose={onClose}>
      {deleted ? (
        <div className="flex flex-col items-center py-8 gap-4">
          <span className="text-4xl">✅</span>
          <div className="text-center">
            <p className="font-semibold text-sm text-[#242424]">Deletion request submitted</p>
            <p className="text-xs text-[#6E6E73] mt-1">Your data will be permanently removed within 30 days. You'll receive a confirmation email.</p>
          </div>
          <button onClick={onClose} className="action-btn w-full py-3 rounded-2xl font-bold text-sm text-[#6E6E73]"
            style={{ background: '#F0E8E4', border: '2px solid #E0D8D4' }}>Close</button>
        </div>
      ) : step === 1 ? (<>
        <div className="rounded-2xl px-4 py-4 text-center" style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
          <p className="text-2xl mb-2">⚠️</p>
          <p className="font-bold text-sm text-[#D9534F]">This cannot be undone</p>
          <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">All your data — logs, memories, AI conversations, and account — will be permanently deleted.</p>
        </div>
        {[['📊','Activity & growth logs'],['🧠','AI memory & conversations'],['📸','Photos & memories'],['👨‍👩‍👧','Family access data'],['💳','Subscription & billing']].map(([icon, label], i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: '#FFF3EE' }}>
            <span className="text-base">{icon}</span>
            <p className="text-xs text-[#242424]">{label}</p>
            <span className="ml-auto text-[10px] font-bold text-[#D9534F]">Will be deleted</span>
          </div>
        ))}
        <button onClick={() => setStep(2)} className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
          style={{ background: '#D9534F', border: '2px solid #B03030', boxShadow: '0 4px 0 #B03030' }}>
          I understand, continue →
        </button>
        <button onClick={onClose} className="action-btn w-full py-2.5 rounded-xl text-sm font-semibold text-[#6E6E73]"
          style={{ background: '#F0E8E4' }}>Keep my data</button>
      </>) : step === 2 ? (<>
        <p className="text-sm text-[#242424] font-semibold">Type <span className="text-[#D9534F]">DELETE</span> to confirm</p>
        <input value={typed} onChange={e => setTyped(e.target.value)}
          placeholder="Type DELETE here"
          className="cartoon-input w-full px-4 py-3.5 text-sm text-[#242424] placeholder-[#C0B8B4]"
          style={{ borderColor: typed === 'DELETE' ? '#D9534F' : undefined }} />
        <button onClick={() => setStep(3)} disabled={typed !== 'DELETE'}
          className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
          style={typed !== 'DELETE' ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' } : { background: '#D9534F', border: '2px solid #B03030', boxShadow: '0 4px 0 #B03030' }}>
          Continue to final step →
        </button>
      </>) : (<>
        <div className="rounded-2xl px-4 py-4 text-center" style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
          <p className="font-bold text-sm text-[#D9534F]">Final confirmation</p>
          <p className="text-xs text-[#6E6E73] mt-1">Your account and all data will be permanently deleted. This action is irreversible.</p>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
          style={{ background: deleting ? '#F6B6A5' : '#D9534F', border: '2px solid #B03030', boxShadow: deleting ? 'none' : '0 4px 0 #B03030' }}>
          {deleting ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Deleting…</span> : '🗑️ Permanently Delete My Data'}
        </button>
        <button onClick={() => setStep(1)} className="action-btn w-full py-2.5 rounded-xl text-sm font-semibold text-[#6E6E73]"
          style={{ background: '#F0E8E4' }}>Cancel — Keep my account</button>
      </>)}
    </PrivacySheetWrapper>
  )
}

function PrivacyCenterSubScreen({ onBack }: { onBack: () => void }) {
  const [activeSheet, setActiveSheet] = useState<PrivacySheet>(null)

  const rows = [
    { key: 'ai-memory' as PrivacySheet,   icon: '🧠',      label: 'AI Memory',           sub: 'What MomMind remembers',     danger: false },
    { key: 'family-access' as PrivacySheet, icon: '👨‍👩‍👧',  label: 'Family Access',        sub: 'Who can see what',           danger: false },
    { key: 'voice-data' as PrivacySheet,  icon: '🎙️',      label: 'Voice Data',           sub: 'Recording storage · 30 days',danger: false },
    { key: 'connected' as PrivacySheet,   icon: '🔗',      label: 'Connected Services',   sub: '2 services linked',          danger: false },
    { key: 'download' as PrivacySheet,    icon: '⬇️',      label: 'Download My Data',     sub: 'Full export as JSON/CSV',    danger: false },
    { key: 'delete' as PrivacySheet,      icon: '🗑️',      label: 'Delete My Data',       sub: 'Permanently remove all data',danger: true  },
  ]

  return (
    <>
    <div className="flex flex-col flex-1 overflow-hidden slide-up">
      <SubHeader title="Privacy Center" onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-3">
        <div className="glass-card-strong rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg,#FFF3EE,#FFD6C9)' }}>
          <p className="text-3xl mb-2">🔒</p>
          <p className="font-display text-lg text-[#242424]">Your Family. Your Data.</p>
          <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">You control everything MomMind knows and stores about your family.</p>
        </div>
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
          {rows.map((r, i) => (
            <button key={i} onClick={() => setActiveSheet(r.key)}
              className="action-btn w-full flex items-center gap-3 px-4 py-3.5 text-left">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: r.danger ? '#FAECEC' : '#F0E8E4' }}>{r.icon}</div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${r.danger ? 'text-[#D9534F]' : 'text-[#242424]'}`}>{r.label}</p>
                <p className="text-xs text-[#6E6E73]">{r.sub}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke={r.danger ? '#ECA0A0' : '#B0A8A4'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>
      </div>
    </div>

    {activeSheet === 'ai-memory'     && <AIMemorySheet         onClose={() => setActiveSheet(null)} />}
    {activeSheet === 'family-access' && <FamilyAccessSheet     onClose={() => setActiveSheet(null)} />}
    {activeSheet === 'voice-data'    && <VoiceDataSheet        onClose={() => setActiveSheet(null)} />}
    {activeSheet === 'connected'     && <ConnectedServicesSheet onClose={() => setActiveSheet(null)} />}
    {activeSheet === 'download'      && <DownloadDataSheet     onClose={() => setActiveSheet(null)} />}
    {activeSheet === 'delete'        && <DeleteDataSheet       onClose={() => setActiveSheet(null)} />}
    </>
  )
}

// ─── SECURITY SUB-SCREEN ───────────────────────────────────────────────────────
function SecuritySubScreen({ onBack }: { onBack: () => void }) {
  const { t } = useLang()
  const [faceId, setFaceId] = useState(true)
  const [twoStep, setTwoStep] = useState(true)

  type Device = { id: number; name: string; icon: string; last: string; current: boolean; location: string }
  const [devices, setDevices] = useState<Device[]>([
    { id: 1, name: 'iPhone 17 Pro', icon: '📱', last: 'Current device', current: true, location: 'New York, US' },
    { id: 2, name: 'Samsung Galaxy S25', icon: '📲', last: 'Last active yesterday', current: false, location: 'Brooklyn, US' },
    { id: 3, name: 'iPad Air', icon: '📋', last: 'Last active 3 days ago', current: false, location: 'New York, US' },
  ])
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [confirmAll, setConfirmAll] = useState(false)
  const [signingOut, setSigningOut] = useState<number | 'all' | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2600)
  }

  const signOutDevice = (id: number) => {
    setSigningOut(id)
    setTimeout(() => {
      setDevices(ds => ds.filter(d => d.id !== id))
      setConfirmId(null)
      setSigningOut(null)
      showToast('Device signed out successfully')
    }, 1200)
  }

  const signOutAll = () => {
    setSigningOut('all')
    setTimeout(() => {
      setDevices(ds => ds.filter(d => d.current))
      setConfirmAll(false)
      setSigningOut(null)
      showToast('All other devices signed out')
    }, 1400)
  }

  const otherDevices = devices.filter(d => !d.current)

  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up" style={{ position: 'relative' }}>
      <SubHeader title={t('security')} onBack={onBack} />

      {/* Toast notification */}
      {toast !== '' && (
        <div className="absolute top-14 left-4 right-4 z-50 pop-in">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: '#242424', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }}>
            <span className="text-base">✅</span>
            <p className="text-sm font-semibold text-white flex-1">{toast}</p>
          </div>
        </div>
      )}

      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">

        {/* Biometrics & 2FA */}
        <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
          {[
            { icon: '👁️', label: t('face_id'), sub: t('face_id_sub'), state: faceId, set: setFaceId },
            { icon: '🔑', label: t('two_step'), sub: t('two_step_sub'), state: twoStep, set: setTwoStep },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: r.state ? '#FFD6C9' : '#F0E8E4' }}>{r.icon}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#242424]">{r.label}</p>
                <p className="text-xs text-[#6E6E73]">{r.sub}</p>
              </div>
              <button onClick={() => r.set((v: boolean) => !v)}
                className="action-btn w-12 h-6 rounded-full transition-all flex-shrink-0"
                style={{ background: r.state ? '#EE674E' : '#E0D8D4' }}>
                <div className="w-4 h-4 bg-white rounded-full shadow transition-all"
                  style={{ marginLeft: r.state ? '24px' : '2px' }} />
              </button>
            </div>
          ))}
        </div>

        {/* Logged-in devices */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wide">{t('logged_in_devices')}</p>
            <span className="text-xs text-[#6E6E73]">{devices.length} active</span>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
            {devices.map((d) => (
              <div key={d.id}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: d.current ? '#E6F4ED' : '#F0E8E4' }}>{d.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-[#242424]">{d.name}</p>
                      {d.current && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold text-[#55A67A]"
                          style={{ background: '#E6F4ED' }}>This device</span>
                      )}
                    </div>
                    <p className="text-xs text-[#6E6E73]">{d.last} · {d.location}</p>
                  </div>
                  {!d.current && (
                    confirmId === d.id ? null : (
                      <button onClick={() => setConfirmId(d.id)}
                        className="action-btn px-3 py-1.5 rounded-xl text-xs font-bold text-[#D9534F] flex-shrink-0"
                        style={{ background: '#FAECEC', border: '1px solid #ECA0A0' }}>
                        Sign out
                      </button>
                    )
                  )}
                </div>

                {/* Inline confirm strip */}
                {confirmId === d.id && (
                  <div className="mx-3 mb-2.5 rounded-2xl px-4 py-3 flex items-center gap-2"
                    style={{ background: '#FFF3EE', border: '1.5px solid #F6B6A5' }}>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-[#242424]">Sign out {d.name}?</p>
                      <p className="text-[10px] text-[#6E6E73] mt-0.5">This device will need to log in again.</p>
                    </div>
                    <button onClick={() => setConfirmId(null)}
                      className="action-btn px-3 py-1.5 rounded-xl text-xs font-bold text-[#6E6E73] flex-shrink-0"
                      style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
                    <button onClick={() => signOutDevice(d.id)} disabled={signingOut === d.id}
                      className="action-btn px-3 py-1.5 rounded-xl text-xs font-bold text-white flex-shrink-0"
                      style={{ background: signingOut === d.id ? '#F6B6A5' : '#D9534F', border: '1.5px solid #B03030', boxShadow: signingOut === d.id ? 'none' : '0 2px 0 #B03030' }}>
                      {signingOut === d.id
                        ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Signing out…</span>
                        : 'Sign out'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sign out all other devices */}
        {otherDevices.length > 0 ? (
          confirmAll ? (
            <div className="rounded-2xl px-4 py-4 space-y-3"
              style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0' }}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-[#D9534F]">Sign out {otherDevices.length} other device{otherDevices.length > 1 ? 's' : ''}?</p>
                  <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                    {otherDevices.map(d => d.name).join(' and ')} will be immediately logged out and need to sign in again.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirmAll(false)}
                  className="action-btn flex-1 py-2.5 rounded-xl text-sm font-bold text-[#6E6E73]"
                  style={{ background: '#fff', border: '1.5px solid #E0D8D4' }}>Cancel</button>
                <button onClick={signOutAll} disabled={signingOut === 'all'}
                  className="action-btn flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: signingOut === 'all' ? '#F6B6A5' : '#D9534F', border: '1.5px solid #B03030', boxShadow: signingOut === 'all' ? 'none' : '0 3px 0 #B03030' }}>
                  {signingOut === 'all'
                    ? <span className="flex items-center justify-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Signing out…</span>
                    : '🚪 Sign Out All'}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setConfirmAll(true)}
              className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-[#D9534F]"
              style={{ background: '#FAECEC', border: '1.5px solid #ECA0A0', boxShadow: '0 3px 0 #E8A0A0' }}>
              🚪 {t('sign_out_all')}
            </button>
          )
        ) : (
          <div className="flex flex-col items-center gap-2 py-4">
            <span className="text-2xl">🔒</span>
            <p className="text-xs font-semibold text-[#55A67A]">{t('only_device')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SETTINGS SUB-SCREEN & ALL LANGUAGES ──────────────────────────────────────
const ALL_LANGUAGES = [
  // A
  'Abkhazian','Afar','Afrikaans','Akan','Albanian','Amharic','Arabic','Aragonese','Armenian','Assamese','Avaric','Avestan','Aymara','Azerbaijani',
  // B
  'Bambara','Bangla (বাংলা)','Bashkir','Basque','Belarusian','Bengali','Bihari','Bislama','Bosnian','Breton','Bulgarian','Burmese',
  // C
  'Catalan','Chamorro','Chechen','Chichewa','Chinese (Simplified)','Chinese (Traditional)','Chuvash','Cornish','Corsican','Cree','Croatian','Czech',
  // D
  'Danish','Divehi','Dutch','Dzongkha',
  // E
  'English','Esperanto','Estonian','Ewe',
  // F
  'Faroese','Fijian','Finnish','French','Fula',
  // G
  'Galician','Georgian','German','Greek','Guaraní','Gujarati',
  // H
  'Haitian Creole','Hausa','Hebrew','Herero','Hindi (हिन्दी)','Hiri Motu','Hungarian',
  // I
  'Interlingua','Indonesian','Interlingue','Irish','Igbo','Inupiaq','Ido','Icelandic','Italian','Inuktitut',
  // J
  'Japanese','Javanese',
  // K
  'Kalaallisut','Kannada','Kanuri','Kashmiri','Kazakh','Khmer','Kikuyu','Kinyarwanda','Kirghiz','Komi','Kongo','Korean','Kurdish','Kwanyama',
  // L
  'Latin','Luxembourgish','Luganda','Limburgish','Lingala','Lao','Lithuanian','Luba-Katanga','Latvian',
  // M
  'Manx','Macedonian','Malagasy','Malay','Malayalam','Maltese','Māori','Marathi','Marshallese','Mongolian',
  // N
  'Nauru','Navajo','Norwegian Bokmål','North Ndebele','Nepali','Ndonga','Norwegian Nynorsk','Norwegian','Nuosu','South Ndebele','Occitan','Ojibwe','Old Church Slavonic','Oromo','Oriya','Ossetian',
  // P
  'Pāli','Pashto','Persian (Farsi)','Polish','Pashto','Portuguese','Punjabi',
  // Q
  'Quechua',
  // R
  'Romansh','Kirundi','Romanian','Russian',
  // S
  'Sanskrit','Sardinian','Sindhi','Northern Sami','Samoan','Sango','Serbian','Scottish Gaelic','Shona','Sinhala','Slovak','Slovenian','Somali','Southern Sotho','Spanish','Sundanese','Swahili','Swati','Swedish',
  // T
  'Tamil','Telugu','Tajik','Thai','Tigrinya','Tibetan','Turkmen','Tagalog','Tswana','Tonga','Turkish','Tsonga',
  // U
  'Urdu (اردو)','Uzbek','Uighur',
  // V
  'Venda','Vietnamese','Volapük',
  // W
  'Walloon','Welsh','Wolof',
  // X
  'Xhosa',
  // Y
  'Yiddish','Yoruba',
  // Z
  'Zhuang','Zulu',
]

function LanguageSheet({ current, bg, card, border, text, sub, iconBg, onSelect, onClose }: {
  current: string; bg: string; card: string | undefined; border: string; text: string; sub: string; iconBg: string
  onSelect: (l: string) => void; onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = query.trim()
    ? ALL_LANGUAGES.filter(l => l.toLowerCase().includes(query.toLowerCase()))
    : ALL_LANGUAGES

  // Group by first letter
  const groups: Record<string, string[]> = {}
  filtered.forEach(l => {
    const letter = l[0].toUpperCase()
    if (!groups[letter]) groups[letter] = []
    groups[letter].push(l)
  })

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={onClose} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: bg, boxShadow: '0 -12px 48px rgba(0,0,0,0.18)', maxHeight: '92%' }}>
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: border }} />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: iconBg }}>🌐</div>
            <div className="flex-1">
              <h3 className="font-display text-lg leading-tight" style={{ color: text }}>Language</h3>
              <p className="text-xs" style={{ color: sub }}>{ALL_LANGUAGES.length} languages available</p>
            </div>
            <button onClick={onClose} className="action-btn w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: iconBg, border: `1.5px solid ${border}` }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke={sub} strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke={sub} strokeWidth="1.5"/>
              <path d="M9.5 9.5l3 3" stroke={sub} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search languages…"
              className="cartoon-input w-full pl-9 pr-4 py-2.5 text-sm"
              style={{ color: text, background: card, borderColor: border }} />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs" style={{ color: sub }}>✕</button>
            )}
          </div>
        </div>

        {/* List */}
        <div className="scroll-area flex-1 px-4 pb-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <span className="text-3xl">🔍</span>
              <p className="text-sm font-semibold" style={{ color: text }}>No languages found</p>
              <p className="text-xs" style={{ color: sub }}>Try a different search term</p>
            </div>
          ) : query.trim() ? (
            /* Flat list when searching */
            <div className="rounded-2xl overflow-hidden divide-y" style={{ background: card, border: `1px solid ${border}` }}>
              {filtered.map(l => (
                <button key={l} onClick={() => onSelect(l)}
                  className="action-btn w-full flex items-center justify-between px-4 py-3 text-left" style={{ borderColor: border }}>
                  <p className="text-sm font-medium" style={{ color: text }}>{l}</p>
                  {current === l && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </button>
              ))}
            </div>
          ) : (
            /* Grouped by letter */
            <div className="space-y-3">
              {Object.keys(groups).sort().map(letter => (
                <div key={letter}>
                  <p className="text-xs font-bold px-1 pb-1" style={{ color: '#EE674E' }}>{letter}</p>
                  <div className="rounded-2xl overflow-hidden divide-y" style={{ background: card, border: `1px solid ${border}` }}>
                    {groups[letter].map(l => (
                      <button key={l} onClick={() => onSelect(l)}
                        className="action-btn w-full flex items-center justify-between px-4 py-3 text-left" style={{ borderColor: border }}>
                        <p className="text-sm font-medium" style={{ color: text }}>{l}</p>
                        {current === l && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 5" stroke="#EE674E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsSubScreen({ onBack, darkMode, setDarkMode }: { onBack: () => void; darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const { lang, setLang, t } = useLang()
  const [units, setUnits] = useState<'imperial' | 'metric'>('imperial')
  const [activeSheet, setActiveSheet] = useState<'language' | 'rate' | 'feedback' | 'help' | 'terms' | null>(null)
  const [rating, setRating] = useState(0)
  const [ratingDone, setRatingDone] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [feedbackSending, setFeedbackSending] = useState(false)

  const dk = darkMode
  const bg = dk ? '#27272A' : '#FFFCFA'
  const card = dk ? 'rgba(39,39,42,0.95)' : undefined
  const border = dk ? '#3F3F46' : '#F0E8E4'
  const text = dk ? '#F4F4F5' : '#242424'
  const sub = dk ? '#A1A1AA' : '#6E6E73'
  const iconBg = dk ? '#3F3F46' : '#F0E8E4'

  const SheetWrap = ({ title, icon, children, footer }: { title: string; icon: string; children: React.ReactNode; footer?: React.ReactNode }) => (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[3px]" onClick={() => setActiveSheet(null)} />
      <div className="relative z-10 rounded-t-3xl flex flex-col" style={{ background: bg, boxShadow: '0 -12px 48px rgba(0,0,0,0.18)', maxHeight: '88%' }}>
        <div className="flex-shrink-0 px-5 pt-4 pb-3">
          <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: border }} />
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: iconBg }}>{icon}</div>
            <h3 className="font-display text-lg" style={{ color: text }}>{title}</h3>
            <button onClick={() => setActiveSheet(null)} className="action-btn ml-auto w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: iconBg, border: `1.5px solid ${border}` }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke={sub} strokeWidth="1.6" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>
        <div className="scroll-area flex-1 px-5 pb-4 space-y-3">{children}</div>
        {footer && <div className="flex-shrink-0 px-5 pb-6 pt-3" style={{ borderTop: `1px solid ${border}` }}>{footer}</div>}
      </div>
    </div>
  )

  return (
    <div className="flex flex-col flex-1 overflow-hidden slide-up" style={{ position: 'relative', background: dk ? '#18181B' : undefined }}>
      <SubHeader title={t('settings')} onBack={onBack} />
      <div className="scroll-area flex-1 px-4 pb-6 space-y-4">

        {/* Preferences */}
        <div className="glass-card rounded-2xl overflow-hidden divide-y" style={{ background: card, borderColor: border }}>
          {/* Dark Mode */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderColor: border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: dk ? '#3F3F46' : '#F0E8E4' }}>{dk ? '🌙' : '☀️'}</div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: text }}>{t('dark_mode')}</p>
              <p className="text-xs" style={{ color: sub }}>{t('dark_mode_sub')}</p>
            </div>
            <button onClick={() => setDarkMode(!darkMode)}
              className="action-btn w-12 h-6 rounded-full transition-all flex-shrink-0"
              style={{ background: darkMode ? '#EE674E' : '#E0D8D4' }}>
              <div className="w-4 h-4 bg-white rounded-full shadow transition-all" style={{ marginLeft: darkMode ? '24px' : '2px' }} />
            </button>
          </div>

          {/* Measurement Units */}
          <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderColor: border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: iconBg }}>📏</div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: text }}>{t('measurement_units')}</p>
            </div>
            <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: iconBg }}>
              {(['imperial', 'metric'] as const).map(u => (
                <button key={u} onClick={() => setUnits(u)}
                  className="action-btn px-2.5 py-1 rounded-md text-xs font-bold transition-all"
                  style={units === u ? { background: '#EE674E', color: '#fff', boxShadow: '0 2px 0 #C94930' } : { color: sub }}>
                  {u === 'imperial' ? 'oz/lbs' : 'ml/kg'}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <button onClick={() => setActiveSheet('language')} className="action-btn w-full flex items-center gap-3 px-4 py-3.5 text-left" style={{ borderColor: border }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: iconBg }}>🌐</div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: text }}>{t('language')}</p>
              <p className="text-xs" style={{ color: sub }}>{lang}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke={sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        {/* About & Support */}
        <div className="glass-card rounded-2xl overflow-hidden divide-y" style={{ background: card, borderColor: border }}>
          {[
            { icon: '⭐', label: t('rate_mommind'), key: 'rate' as const },
            { icon: '💬', label: t('send_feedback'), key: 'feedback' as const },
            { icon: '❓', label: t('help_support'), key: 'help' as const },
            { icon: '📄', label: t('terms_privacy'), key: 'terms' as const },
          ].map((r) => (
            <button key={r.key} onClick={() => setActiveSheet(r.key)}
              className="action-btn w-full flex items-center gap-3 px-4 py-3.5 text-left" style={{ borderColor: border }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: iconBg }}>{r.icon}</div>
              <p className="text-sm font-semibold flex-1" style={{ color: text }}>{r.label}</p>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke={sub} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          ))}
        </div>

        <p className="text-center text-[10px]" style={{ color: sub }}>MomMind AI v2.4.1 · Made with ❤️ for moms</p>
      </div>

      {/* ── Language Sheet ── */}
      {activeSheet === 'language' && (
        <LanguageSheet
          current={lang}
          bg={bg} card={card} border={border} text={text} sub={sub} iconBg={iconBg}
          onSelect={(l) => { setLang(l); setActiveSheet(null) }}
          onClose={() => setActiveSheet(null)}
        />
      )}

      {/* ── Rate Sheet ── */}
      {activeSheet === 'rate' && (
        <SheetWrap title="Rate MomMind" icon="⭐"
          footer={!ratingDone && <button onClick={() => { if (rating > 0) setRatingDone(true) }} disabled={rating === 0}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={rating === 0 ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' } : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            Submit Rating
          </button>}>
          {ratingDone ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="text-5xl pop-in">🎉</div>
              <p className="font-display text-xl" style={{ color: text }}>Thank you!</p>
              <p className="text-sm text-center" style={{ color: sub }}>Your rating helps other moms discover MomMind.</p>
              <div className="flex gap-1">{[1,2,3,4,5].map(s => <span key={s} className="text-2xl">{s <= rating ? '⭐' : '☆'}</span>)}</div>
            </div>
          ) : (<>
            <p className="text-sm text-center font-semibold" style={{ color: text }}>How would you rate MomMind?</p>
            <div className="flex justify-center gap-3 py-4">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setRating(s)} className="action-btn text-4xl transition-transform" style={{ transform: s <= rating ? 'scale(1.2)' : 'scale(1)' }}>
                  {s <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['Easy to use', 'Saves time', 'Love the AI', 'Great design', 'Very helpful', 'Recommend it'].map(tag => (
                <div key={tag} className="px-3 py-2 rounded-xl text-center text-xs font-semibold" style={{ background: iconBg, color: sub }}>{tag}</div>
              ))}
            </div>
          </>)}
        </SheetWrap>
      )}

      {/* ── Feedback Sheet ── */}
      {activeSheet === 'feedback' && (
        <SheetWrap title="Send Feedback" icon="💬"
          footer={!feedbackSent && <button onClick={() => { if (feedbackText.trim()) { setFeedbackSending(true); setTimeout(() => { setFeedbackSending(false); setFeedbackSent(true) }, 1400) } }}
            disabled={!feedbackText.trim() || feedbackSending}
            className="action-btn w-full py-3.5 rounded-2xl font-bold text-sm text-white"
            style={!feedbackText.trim() ? { background: '#F6B6A5', border: '2px solid #E8A090', boxShadow: '0 3px 0 #E8A090' } : { background: 'linear-gradient(135deg,#EE674E,#F47B66)', border: '2px solid #C94930', boxShadow: '0 4px 0 #C94930' }}>
            {feedbackSending ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white inline-block spin-slow" />Sending…</span> : '📨 Send Feedback'}
          </button>}>
          {feedbackSent ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="text-5xl pop-in">💌</div>
              <p className="font-display text-xl" style={{ color: text }}>Feedback received!</p>
              <p className="text-sm text-center" style={{ color: sub }}>Our team reads every message. Thank you for helping us improve MomMind!</p>
            </div>
          ) : (<>
            <p className="text-xs" style={{ color: sub }}>Share your thoughts, suggestions, or report a bug.</p>
            <div className="flex gap-2 flex-wrap">
              {['Bug report', 'Feature request', 'Praise', 'Other'].map(t => (
                <button key={t} className="action-btn px-3 py-1.5 rounded-xl text-xs font-semibold" style={{ background: iconBg, color: sub }}>{t}</button>
              ))}
            </div>
            <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
              placeholder="Tell us what you think…"
              rows={5} className="cartoon-input w-full px-4 py-3 text-sm resize-none"
              style={{ color: text, background: dk ? '#3F3F46' : undefined, borderColor: dk ? '#52525B' : undefined }} />
          </>)}
        </SheetWrap>
      )}

      {/* ── Help & Support Sheet ── */}
      {activeSheet === 'help' && (
        <SheetWrap title="Help & Support" icon="❓">
          <p className="text-xs" style={{ color: sub }}>Find answers or get in touch with our team.</p>
          {[
            { q: 'How do I add a caregiver?', a: 'Go to More → Family & Caregivers → Invite Caregiver.' },
            { q: 'How does the AI work?', a: "MomMind's AI learns from your baby's patterns to provide personalised advice." },
            { q: 'Is my data private?', a: 'Yes. Visit Privacy Center to manage and control all your data.' },
            { q: 'How do I cancel my subscription?', a: 'Go to More → MomMind Plus → Manage Subscription.' },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: iconBg, border: `1px solid ${border}` }}>
              <p className="text-sm font-semibold mb-1" style={{ color: text }}>❓ {item.q}</p>
              <p className="text-xs leading-relaxed" style={{ color: sub }}>{item.a}</p>
            </div>
          ))}
          <div className="rounded-2xl p-4 text-center" style={{ background: 'linear-gradient(135deg,#FFF3EE,#FFD6C9)', border: '1.5px solid #F6B6A5' }}>
            <p className="text-sm font-bold text-[#EE674E] mb-1">Still need help?</p>
            <p className="text-xs text-[#6E6E73]">Email us at hello@mommind.ai — we reply within 24 hours.</p>
          </div>
        </SheetWrap>
      )}

      {/* ── Terms & Privacy Sheet ── */}
      {activeSheet === 'terms' && (
        <SheetWrap title="Terms & Privacy" icon="📄">
          {[
            { title: '📋 Terms of Service', body: 'By using MomMind, you agree to use the app for personal, non-commercial purposes. We reserve the right to update these terms at any time with notice.' },
            { title: '🔒 Privacy Policy', body: "We collect only what's needed to provide the service. Your data is never sold to third parties. You can export or delete your data at any time from Privacy Center." },
            { title: '🍪 Cookie Policy', body: 'We use essential cookies to keep you signed in. No tracking or advertising cookies are used.' },
            { title: '👶 Child Data', body: "Data about your child is treated with the highest sensitivity. It's stored encrypted and only accessible to you and the family members you invite." },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: iconBg, border: `1px solid ${border}` }}>
              <p className="text-sm font-bold mb-2" style={{ color: text }}>{s.title}</p>
              <p className="text-xs leading-relaxed" style={{ color: sub }}>{s.body}</p>
            </div>
          ))}
          <p className="text-center text-[10px]" style={{ color: sub }}>Last updated: August 2026</p>
        </SheetWrap>
      )}
    </div>
  )
}

// ─── MORE SCREEN ──────────────────────────────────────────────────────────────
type MoreSub = 'profile' | 'family' | 'handoff' | 'meals' | 'development' | 'supplies' | 'journal' | 'marketplace' | 'subscription' | 'notifications' | 'privacy' | 'security' | 'settings' | null

function MoreScreen({ onSignOut, darkMode, setDarkMode }: { onSignOut: () => void; darkMode: boolean; setDarkMode: (v: boolean) => void }) {
  const [sub, setSub] = useState<MoreSub>(null)

  if (sub === 'profile') return <ProfileSubScreen onBack={() => setSub(null)} />
  if (sub === 'family') return <FamilySubScreen onBack={() => setSub(null)} />
  if (sub === 'handoff') return <CaregiverHandoffSubScreen onBack={() => setSub(null)} />
  if (sub === 'meals') return <ToddlerMealsSubScreen onBack={() => setSub(null)} />
  if (sub === 'development') return <DevelopmentSubScreen onBack={() => setSub(null)} />
  if (sub === 'supplies') return <BabySuppliesSubScreen onBack={() => setSub(null)} />
  if (sub === 'journal') return <MemoryJournalSubScreen onBack={() => setSub(null)} />
  if (sub === 'marketplace') return <MarketplaceSubScreen onBack={() => setSub(null)} />
  if (sub === 'subscription') return <SubscriptionSubScreen onBack={() => setSub(null)} />
  if (sub === 'notifications') return <NotificationsSubScreen onBack={() => setSub(null)} />
  if (sub === 'privacy') return <PrivacyCenterSubScreen onBack={() => setSub(null)} />
  if (sub === 'security') return <SecuritySubScreen onBack={() => setSub(null)} />
  if (sub === 'settings') return <SettingsSubScreen onBack={() => setSub(null)} darkMode={darkMode} setDarkMode={setDarkMode} />

  const { t } = useLang()
  const sections = [
    { label: t('section_family'), items: [
      { icon: '👨‍👩‍👧', label: t('family_caregivers'), sub: '3 members', key: 'family' as MoreSub },
      { icon: '📋', label: t('caregiver_handoff'), sub: 'Generate handoff', key: 'handoff' as MoreSub },
    ]},
    { label: t('section_baby_care'), items: [
      { icon: '🥣', label: t('toddler_meals'), sub: "Today's plan ready", key: 'meals' as MoreSub },
      { icon: '🌱', label: t('development_screen'), sub: '3 activities this week', key: 'development' as MoreSub },
      { icon: '📦', label: t('baby_supplies'), sub: '2 items running low', key: 'supplies' as MoreSub },
      { icon: '❤️', label: t('memory_journal'), sub: "Maya's Story", key: 'journal' as MoreSub },
    ]},
    { label: t('section_services'), items: [
      { icon: '🛍️', label: t('marketplace'), sub: 'Find family services', key: 'marketplace' as MoreSub },
    ]},
    { label: t('section_account'), items: [
      { icon: '⭐', label: 'MomMind Plus', sub: t('upgrade_plan'), key: 'subscription' as MoreSub, highlight: true },
      { icon: '🔔', label: t('notifications'), sub: t('manage_alerts'), key: 'notifications' as MoreSub },
      { icon: '🔒', label: t('privacy_center'), sub: t('your_family_your_data'), key: 'privacy' as MoreSub },
      { icon: '🛡️', label: t('security'), sub: 'Face ID · 2-step on', key: 'security' as MoreSub },
      { icon: '⚙️', label: t('settings'), sub: '', key: 'settings' as MoreSub },
    ]},
  ]

  return (
    <div className="scroll-area flex-1 px-4 pt-2 pb-4 slide-up">
      {/* Profile */}
      <button onClick={() => setSub('profile')} className="action-btn w-full flex items-center gap-3 py-4 text-left">
        <Avatar size={52} initials="S" bg="#F47B66" />
        <div className="flex-1">
          <p className="font-semibold text-[#242424]">Sarah Mitchell</p>
          <p className="text-xs text-[#6E6E73]">MomMind Plus · sarah@email.com</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-[#F0E8E4] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#6E6E73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </button>

      {/* Supply warning */}
      <div className="glass-card-strong rounded-xl p-3 flex items-center gap-2.5 mb-4 border border-[#F8C85E]/40">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: '#FEF3CD' }}>⚠️</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[#242424]">Supplies running low</p>
          <p className="text-xs text-[#6E6E73]">Wipes · Diapers ~4 days left</p>
        </div>
        <button onClick={() => setSub('supplies')}
          className="action-btn text-xs font-bold text-white px-3 py-1.5 rounded-lg"
          style={{ background: 'linear-gradient(135deg,#EE674E,#F47B66)' }}>
          View
        </button>
      </div>

      {sections.map(s => (
        <div key={s.label} className="mb-4">
          <p className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wider mb-2 px-1">{s.label}</p>
          <div className="glass-card rounded-2xl overflow-hidden divide-y divide-[#F0E8E4]">
            {s.items.map((item, i) => (
              <button key={i} onClick={() => setSub(item.key)}
                className={`action-btn w-full flex items-center gap-3 px-4 py-3 text-left ${(item as any).highlight ? 'bg-gradient-to-r from-[#FFF3EF] to-transparent' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${(item as any).highlight ? 'coral-gradient' : 'bg-[#F0E8E4]'}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${(item as any).highlight ? 'text-[#EE674E]' : 'text-[#242424]'}`}>{item.label}</p>
                  {item.sub && <p className="text-xs text-[#6E6E73]">{item.sub}</p>}
                </div>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#B0A8A4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            ))}
          </div>
        </div>
      ))}

      <button onClick={onSignOut} className="w-full py-3 text-sm text-[#D9534F] font-semibold">🚪 Sign Out</button>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ screen, onChange, onVoice }: {
  screen: Screen
  onChange: (s: Screen) => void
  onVoice: () => void
}) {
  const { t } = useLang()
  const items: { id: Screen; label: string; icon: (active: boolean) => JSX.Element }[] = [
    {
      id: 'home', label: t('nav_home'),
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H6a1 1 0 01-1-1V9.5z" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" strokeLinejoin="round" fill={a ? '#FFD6C9' : 'none'} />
          <path d="M8 20v-7h6v7" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
      ),
    },
    {
      id: 'baby', label: t('nav_baby'),
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="9" r="5" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" fill={a ? '#FFD6C9' : 'none'} />
          <path d="M3 20c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'planner', label: t('nav_planner'),
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <rect x="3" y="5" width="16" height="15" rx="2" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" fill={a ? '#FFD6C9' : 'none'} />
          <path d="M7 2v4M15 2v4M3 10h16" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.7" strokeLinecap="round" />
          <path d="M7 14h4M7 17h6" stroke={a ? '#EE674E' : '#B0A8A4'} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      id: 'more', label: t('nav_more'),
      icon: (a) => (
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="6" r="1.5" fill={a ? '#EE674E' : '#B0A8A4'} />
          <circle cx="11" cy="11" r="1.5" fill={a ? '#EE674E' : '#B0A8A4'} />
          <circle cx="11" cy="16" r="1.5" fill={a ? '#EE674E' : '#B0A8A4'} />
        </svg>
      ),
    },
  ]

  return (
    <div className="glass-card-strong border-t border-white/60 px-2 pt-2 pb-5 flex items-center">
      {/* Home + Baby */}
      {items.slice(0, 2).map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className="bottom-nav-item flex-1 flex flex-col items-center gap-0.5 py-1"
        >
          {item.icon(screen === item.id)}
          <span className={`text-[10px] font-medium ${screen === item.id ? 'text-[#EE674E]' : 'text-[#B0A8A4]'}`}>
            {item.label}
          </span>
        </button>
      ))}

      {/* Center AI Button */}
      <div className="flex-1 flex justify-center -mt-7">
        <button
          onClick={() => screen === 'ai' ? onVoice() : onChange('ai')}
          className="action-btn w-14 h-14 coral-gradient rounded-2xl flex flex-col items-center justify-center gap-0.5 shadow-lg"
          style={{ boxShadow: '0 4px 20px rgba(238,103,78,0.45)' }}
        >
          <span className="text-xl">✨</span>
          <span className="text-[9px] font-bold text-white/90 uppercase tracking-wide">{t('nav_ai')}</span>
        </button>
      </div>

      {/* Planner + More */}
      {items.slice(2).map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className="bottom-nav-item flex-1 flex flex-col items-center gap-0.5 py-1"
        >
          {item.icon(screen === item.id)}
          <span className={`text-[10px] font-medium ${screen === item.id ? 'text-[#EE674E]' : 'text-[#B0A8A4]'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [appState, setAppState] = useState<AppState>('login')
  const [screen, setScreen] = useState<Screen>('home')
  const [darkMode, setDarkMode] = useState(false)
  const [lang, setLang] = useState('English')
  const t = makeT(lang)
  const isRTL = RTL_LANGS.has(lang)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [aiSubScreen, setAISubScreen] = useState<AIScreen>('chat')

  const handleSignOut = () => setAppState('login')

  const handleVoice = () => {
    setVoiceOpen(true)
    setAISubScreen('voice')
  }

  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  const [vh, setVh] = useState(typeof window !== 'undefined' ? window.innerHeight : 844)
  useEffect(() => {
    const onResize = () => { setVw(window.innerWidth); setVh(window.innerHeight) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Responsive layout decisions
  const isMobile = vw < 640

  // On mobile: fill screen. On tablet/desktop: phone frame scaled to fit,
  // centered with no side panel — see docs/ARCHITECTURE.md for why the
  // desktop marketing sidebar was removed (2026-08-11, user request: match
  // the phone-only mockup on every viewport).
  const frameW = 390
  const frameH = 844
  const scale = isMobile ? 1 : Math.min(1, (vw * 0.9) / frameW, (vh * 0.95) / frameH)
  const borderRad = isMobile ? 0 : 44

  return (
    <div
      className="flex items-center justify-center overflow-hidden"
      style={{
        minHeight: '100dvh',
        background: isMobile
          ? '#FFFCFA'
          : 'radial-gradient(ellipse at 20% 30%, #FFE8DE 0%, #FFF8F4 45%, #EEF4FF 100%)',
      }}
    >
      {/* Decorative blobs visible on desktop behind the phone */}
      {!isMobile && (
        <>
          <div style={{ position: 'fixed', width: 500, height: 500, borderRadius: '50%', background: 'rgba(246,182,165,0.22)', filter: 'blur(80px)', top: '-100px', left: '-120px', pointerEvents: 'none' }} />
          <div style={{ position: 'fixed', width: 400, height: 400, borderRadius: '50%', background: 'rgba(98,153,213,0.13)', filter: 'blur(70px)', bottom: '-80px', right: '-100px', pointerEvents: 'none' }} />
        </>
      )}

      {/* Phone frame */}
      <div
        className="relative flex flex-col overflow-hidden"
        data-dark={darkMode ? 'true' : undefined}
        style={{
          width: isMobile ? '100%' : frameW,
          height: isMobile ? '100dvh' : frameH,
          maxWidth: isMobile ? '100%' : frameW,
          borderRadius: borderRad,
          background: darkMode ? '#18181B' : '#FFFCFA',
          transform: isMobile ? 'none' : `scale(${scale})`,
          transformOrigin: 'center center',
          boxShadow: isMobile ? 'none' : '0 32px 80px rgba(0,0,0,0.22), 0 4px 16px rgba(0,0,0,0.10)',
          flexShrink: 0,
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
      <LangContext.Provider value={{ lang, setLang, t }}>
        {appState === 'login' ? (
          <LoginScreen onLogin={() => setAppState('app')} />
        ) : (
          <>
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <BlobBackground />
            </div>

            {/* Status bar */}
            <div className="relative z-10 flex items-center justify-between px-8 pt-4 pb-1">
              <span className="text-xs font-semibold text-[#242424]">9:41</span>
              <div className="flex items-center gap-1.5">
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <rect x="0" y="6" width="3" height="6" rx="0.5" fill="#242424" />
                  <rect x="4.5" y="4" width="3" height="8" rx="0.5" fill="#242424" />
                  <rect x="9" y="2" width="3" height="10" rx="0.5" fill="#242424" />
                  <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="#242424" />
                </svg>
                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                  <path d="M8 2.5C10.5 2.5 12.8 3.6 14.3 5.4L15.5 4.1C13.7 2 11 .8 8 .8s-5.7 1.2-7.5 3.3L1.7 5.4C3.2 3.6 5.5 2.5 8 2.5z" fill="#242424"/>
                  <path d="M8 5.5c1.6 0 3 .7 4 1.8l1.2-1.3C11.7 4.6 10 3.8 8 3.8S4.3 4.6 2.8 6L4 7.3C5 6.2 6.4 5.5 8 5.5z" fill="#242424"/>
                  <circle cx="8" cy="10.5" r="1.5" fill="#242424"/>
                </svg>
                <div className="flex items-center gap-0.5">
                  <div className="w-5.5 h-3 rounded-sm border border-[#242424]/40 p-0.5 flex">
                    <div className="w-3/4 h-full rounded-xs bg-[#55A67A]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Screen content */}
            <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
              {screen === 'home' && <HomeScreen onVoice={handleVoice} onSignOut={handleSignOut} onNavigate={setScreen} />}
              {screen === 'baby' && <BabyScreen />}
              {screen === 'ai' && <AIScreen onVoice={handleVoice} />}
              {screen === 'planner' && <PlannerScreen />}
              {screen === 'more' && <MoreScreen onSignOut={handleSignOut} darkMode={darkMode} setDarkMode={setDarkMode} />}
            </div>

            {/* Bottom navigation */}
            <div className="relative z-10">
              <BottomNav screen={screen} onChange={setScreen} onVoice={handleVoice} />
            </div>

            {/* Voice overlay */}
            {voiceOpen && <VoiceScreen onClose={() => setVoiceOpen(false)} />}
          </>
        )}
      </LangContext.Provider>
      </div>
    </div>
  )
}
