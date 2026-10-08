const TRANSLATIONS = {
    en: {
        app_title: "REUNITE",
        app_subtitle: "AI-Powered Missing Persons & Reunification Platform",
        nav_report_missing: "Report Person",
        nav_report_found: "Report Found",
        nav_quick_mode: "⚡ Quick Mode",
        nav_status_check: "Check Status",
        nav_responder: "Responder Portal",
        nav_admin: "Admin Center",
        hero_heading: "Reuniting Loved Ones through AI & Biometric Intelligence",
        hero_sub: "Multi-dimensional matching: 128-d Face Embeddings, Haversine Geo-spatial distance, Time interval decay, and Family secret verification.",
        offline_badge: "Status: Online",
        offline_queued: "Queued Reports: 0",
        
        btn_voice_input: "🎤 Speak Details",
        btn_read_aloud: "🔊 Read Guidance Aloud",
        btn_review_modal: "🔍 Review Report Before Submission",
        btn_submit_report: "Submit Case Report",
        btn_quick_emergency: "🚨 Child / Elderly Emergency Report",
        btn_retry_sync: "🔄 Retry Sync Now",
        
        lbl_case_type: "Case Category",
        lbl_vulnerability: "Vulnerability Category",
        lbl_full_name: "Full Name of Person",
        lbl_aliases: "Aliases / Alternate Spellings / Native Scripts (comma separated)",
        lbl_gender: "Gender",
        lbl_age: "Age (Years)",
        lbl_height: "Height (cm)",
        lbl_clothing: "Clothing & Appearance Details",
        lbl_marks: "Distinguishing Marks / Features",
        lbl_location: "Last Known Location",
        lbl_latitude: "Latitude",
        lbl_longitude: "Longitude",
        lbl_incident_time: "Incident Date & Time",
        lbl_reporter_name: "Your Name (Reporter)",
        lbl_reporter_phone: "Your Phone Number",
        lbl_secret_q: "Family Secret Question",
        lbl_secret_a: "Family Secret Answer",
        lbl_family_graph: "Family Relationship Graph",
        lbl_consent: "I grant explicit consent to process case data for reunification purposes.",
        lbl_photo: "Upload Photo (Optional face embedding clue)",
        
        ai_guidance_title: "💡 AI Assistance & Guidance",
        ai_guidance_text: "Fill in as many details as possible. Aliases help match different spellings across languages. Family links help responders confirm identity.",
        
        status_portal_title: "Track Case & Verify Match Status",
        lbl_token: "Security Case Token",
        lbl_check_btn: "Check Status",
        
        responder_title: "Human Responder Verification Portal",
        responder_desc: "Prioritized review queue (Children & Elderly top-ranked). Verify identity proof, secret answers & authorize contact.",
        admin_title: "Admin Operational Command Center",
        
        opt_child: "Child (High Priority)",
        opt_elderly: "Elderly (High Priority)",
        opt_injured: "Injured / Emergency",
        opt_standard: "Standard Adult"
    },
    ta: {
        app_title: "ரீயூனைட் (REUNITE)",
        app_subtitle: "காணாமல் போன நபர்களைக் கண்டறியும் செயலி",
        nav_report_missing: "நபரை பதிவு செய்க",
        nav_report_found: "கண்டெடுக்கப்பட்டவர் பதிவு",
        nav_quick_mode: "⚡ அவசர பதிவு",
        nav_status_check: "நிலை சரிபார்க்க",
        nav_responder: "பரிசீலனை மையம்",
        nav_admin: "நிர்வாக மையம்",
        hero_heading: "செயற்கை நுண்ணறிவு மூலம் குடும்பங்களை இணைக்கிறோம்",
        hero_sub: "முகப் பொருத்தம், இருப்பிடத் தொலைவு, ரகசிய கேள்வி சரிபார்ப்பு மற்றும் பாதுகாப்பான அறிவிப்புகள்.",
        offline_badge: "நிலை: இணைய இணைப்பு உள்ளது",
        offline_queued: "சேமிக்கப்பட்ட தகவல்கள்: 0",
        
        btn_voice_input: "🎤 குரல் மூலம் உள்ளிடவும்",
        btn_read_aloud: "🔊 வழிகாட்டலை உரக்கப் படிக்கவும்",
        btn_review_modal: "🔍 சமர்ப்பிக்கும் முன் சரிபார்க்கவும்",
        btn_submit_report: "வழக்கை பதிவு செய்க",
        btn_quick_emergency: "🚨 சிறுவர் / முதியோர் அவசர பதிவு",
        btn_retry_sync: "🔄 மீண்டுமாக ஒத்திசைக்குக",
        
        lbl_case_type: "வழக்கு வகை",
        lbl_vulnerability: "பாதிக்கப்படக்கூடிய வகை",
        lbl_full_name: "நபரின் முழு பெயர்",
        lbl_aliases: "மாற்று பெயர்கள் / பிற எழுத்து வடிவங்கள்",
        lbl_gender: "பாலினம்",
        lbl_age: "வயது (ஆண்டுகள்)",
        lbl_height: "உயரம் (செ.மீ)",
        lbl_clothing: "அணிந்திருந்த உடை விவரங்கள்",
        lbl_marks: "அடையாள குறிகள்",
        lbl_location: "கடைசியாக பார்த்த இடம்",
        lbl_latitude: "அட்சரேகை (Latitude)",
        lbl_longitude: "தீர்க்கரேகை (Longitude)",
        lbl_incident_time: "நிகழ்வு நேரம்",
        lbl_reporter_name: "உங்கள் பெயர்",
        lbl_reporter_phone: "உங்கள் தொலைபேசி எண்",
        lbl_secret_q: "குடும்ப ரகசிய கேள்வி",
        lbl_secret_a: "குடும்ப ரகசிய பதில்",
        lbl_family_graph: "குடும்ப உறவுப் படம்",
        lbl_consent: "வழக்கு செயலாக்கத்திற்கு எனது சம்மதத்தை தெரிவிக்கிறேன்.",
        lbl_photo: "புகைப்படம் பதிவேற்றவும்",
        
        ai_guidance_title: "💡 AI வழிகாட்டல் సహాయம்",
        ai_guidance_text: "முடிந்தவரை முழு விவரங்களை உள்ளிடவும். மாற்றுப் பெயர்கள் வெவ்வேறு மொழிகளில் கண்டறிய உதவும்.",
        
        status_portal_title: "வழக்கின் நிலையை சரிபார்க்கவும்",
        lbl_token: "பாதுகாப்பு குறியீடு (Token)",
        lbl_check_btn: "நிலையை காட்டு",
        
        responder_title: "மனு பரிசீலனையாளர் தளம்",
        responder_desc: "முன்னுரிமை அடிப்படையில் வழக்குகள் (குழந்தைகள் மற்றும் முதியோருக்கு முதலிடம்).",
        admin_title: "நிர்வாக மற்றும் கட்டுப்பாட்டு மையம்",
        
        opt_child: "குழந்தை (அதிமுக்கியத்துவம்)",
        opt_elderly: "முதியவர் (அதிமுக்கியத்துவம்)",
        opt_injured: "காயமடைந்தவர்",
        opt_standard: "சாதாரண பிரிவு"
    },
    hi: {
        app_title: "रीयुनाइट (REUNITE)",
        app_subtitle: "लापता व्यक्तियों की खोज और पुनर्मिलन मंच",
        nav_report_missing: "रिपोर्ट दर्ज करें",
        nav_report_found: "मिला व्यक्ति दर्ज करें",
        nav_quick_mode: "⚡ त्वरित रिपोर्ट",
        nav_status_check: "स्थिति जांचें",
        nav_responder: "समीक्षक पोर्टल",
        nav_admin: "प्रशासन केंद्र",
        hero_heading: "एआई और बायोमेट्रिक तकनीक से परिवारों को मिलाना",
        hero_sub: "चेहरे की समानता, स्थान दूरी मिलान, गुप्त प्रश्न सत्यापन और गोपनीयता-सुरक्षित सूचनाएं।",
        offline_badge: "स्थिति: ऑनलाइन",
        offline_queued: "कतारबद्ध रिपोर्ट: 0",
        
        btn_voice_input: "🎤 बोलकर दर्ज करें",
        btn_read_aloud: "🔊 निर्देश सुनें",
        btn_review_modal: "🔍 सबमिट करने से पहले समीक्षा करें",
        btn_submit_report: "रिपोर्ट सबमिट करें",
        btn_quick_emergency: "🚨 बच्चे/बुजुर्ग आपातकालीन रिपोर्ट",
        btn_retry_sync: "🔄 पुनः सिंक करें",
        
        lbl_case_type: "मामला श्रेणी",
        lbl_vulnerability: "संवेदनशीलता श्रेणी",
        lbl_full_name: "व्यक्ति का पूरा नाम",
        lbl_aliases: "उपनाम / वैकल्पिक नाम / अन्य लिपियाँ",
        lbl_gender: "लिंग",
        lbl_age: "आयु (वर्ष)",
        lbl_height: "कद (सेमी)",
        lbl_clothing: "कपड़े और रूप-रंग विवरण",
        lbl_marks: "पहचान के निशान",
        lbl_location: "अंतिम ज्ञात स्थान",
        lbl_latitude: "अक्षांश (Latitude)",
        lbl_longitude: "देशांतर (Longitude)",
        lbl_incident_time: "घटना का समय",
        lbl_reporter_name: "आपका नाम",
        lbl_reporter_phone: "आपका फोन नंबर",
        lbl_secret_q: "पारिवारिक गुप्त प्रश्न",
        lbl_secret_a: "पारिवारिक गुप्त उत्तर",
        lbl_family_graph: "पारिवारिक संबंध आरेख",
        lbl_consent: "मैं मामला प्रसंस्करण के लिए सहमति प्रदान करता/करती हूँ।",
        lbl_photo: "फोटो अपलोड करें",
        
        ai_guidance_title: "💡 एआई मार्गदर्शन",
        ai_guidance_text: "अधिक से अधिक विवरण भरें। उपनाम विभिन्न भाषाओं में मिलान करने में मदद करते हैं।",
        
        status_portal_title: "मामला स्थिति और मैच जांचें",
        lbl_token: "सुरक्षा टोकन",
        lbl_check_btn: "स्थिति देखें",
        
        responder_title: "मानव समीक्षक सत्यापन पोर्टल",
        responder_desc: "प्राथमिकता प्राप्त समीक्षा कतार (बच्चे और बुजुर्ग शीर्ष पर)।",
        admin_title: "प्रशासनिक कमान केंद्र",
        
        opt_child: "बच्चा (उच्च प्राथमिकता)",
        opt_elderly: "बुजुर्ग (उच्च प्राथमिकता)",
        opt_injured: "घायल / आपातकालीन",
        opt_standard: "सामान्य वयस्क"
    }
};

let currentLang = "en";

function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    document.querySelectorAll("[data-i18n]").forEach(elem => {
        const key = elem.getAttribute("data-i18n");
        if (TRANSLATIONS[lang][key]) {
            if (elem.tagName === "INPUT" && elem.type === "placeholder") {
                elem.placeholder = TRANSLATIONS[lang][key];
            } else {
                elem.innerText = TRANSLATIONS[lang][key];
            }
        }
    });
}
