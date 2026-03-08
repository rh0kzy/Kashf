import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'ar'

interface Translations {
    nav: {
        home: string
        reader: string
        detector: string
        map: string
    }
    home: {
        tagline: string
        readerTitle: string
        readerDesc: string
        detectorTitle: string
        detectorDesc: string
        mapTitle: string
        mapDesc: string
    }
    reader: {
        title: string
        subtitle: string
        placeholder: string
        analyze: string
        analyzing: string
        results: string
        noResults: string
        bias: string
        tone: string
        opinion: string
        framing: string
        keyVerbs: string
        readMore: string
        left: string
        center: string
        right: string
    }
    detector: {
        title: string
        subtitle: string
        pasteMode: string
        urlMode: string
        titlePlaceholder: string
        sourcePlaceholder: string
        contentPlaceholder: string
        urlPlaceholder: string
        check: string
        checking: string
        verdict: string
        scores: string
        credibility: string
        manipulation: string
        emotional: string
        opinionFact: string
        redFlags: string
        verified: string
        suspicious: string
    }
    map: {
        title: string
        liveField: string
        clickZone: string
        loading: string
        noArticles: string
        back: string
    }
    common: {
        retry: string
        error: string
        live: string
        connected: string
        severity: {
            critical: string
            high: string
            low: string
        }
    }
}

const en: Translations = {
    nav: {
        home: 'Home',
        reader: 'Reader',
        detector: 'Detector',
        map: 'Conflict Map',
    },
    home: {
        tagline: 'Uncover the truth. Compare how the world\'s media covers the same story.',
        readerTitle: 'Side-by-Side Reader',
        readerDesc: 'Same story, different narratives. Compare coverage across global outlets.',
        detectorTitle: 'Fake News Detector',
        detectorDesc: 'Paste any article. Get a credibility score and bias analysis.',
        mapTitle: 'Conflict Map',
        mapDesc: 'Live conflict zones with news feeds attached to each location.',
    },
    reader: {
        title: 'Side-by-Side Reader',
        subtitle: 'Search any topic and see how different outlets frame the same story.',
        placeholder: 'e.g. Gaza, Ukraine, Climate Change...',
        analyze: 'Analyze',
        analyzing: 'Analyzing...',
        results: 'articles analyzed for',
        noResults: 'No articles found. Try a different query.',
        bias: 'Bias',
        tone: 'Tone',
        opinion: 'Opinion %',
        framing: 'Framing',
        keyVerbs: 'Key verbs',
        readMore: 'Read original article',
        left: 'Left',
        center: 'Center',
        right: 'Right',
    },
    detector: {
        title: 'Fake News Detector',
        subtitle: 'Analyze any article for credibility, bias and manipulation.',
        pasteMode: 'Paste Text',
        urlMode: 'From URL',
        titlePlaceholder: 'Article title (optional)',
        sourcePlaceholder: 'Source / outlet name (optional)',
        contentPlaceholder: 'Paste the full article content here...',
        urlPlaceholder: 'https://example.com/article',
        check: 'Check Article',
        checking: 'Analyzing...',
        verdict: 'Verdict',
        scores: 'Scores',
        credibility: 'Credibility',
        manipulation: 'Manipulation',
        emotional: 'Emotional Language',
        opinionFact: 'Opinion vs Fact',
        redFlags: 'Red Flags',
        verified: 'Verified Claims',
        suspicious: 'Suspicious Claims',
    },
    map: {
        title: 'Conflict Map',
        liveField: 'Live Conflict Feed',
        clickZone: 'Click a zone on the map for local news',
        loading: 'Loading conflict data...',
        noArticles: 'No articles found.',
        back: 'Back',
    },
    common: {
        retry: 'Retry',
        error: 'Error',
        live: 'LIVE',
        connected: 'CONNECTED',
        severity: {
            critical: 'CRITICAL',
            high: 'HIGH',
            low: 'LOW',
        },
    },
}

const ar: Translations = {
    nav: {
        home: 'الرئيسية',
        reader: 'القارئ',
        detector: 'كاشف الأخبار',
        map: 'خريطة النزاعات',
    },
    home: {
        tagline: 'اكشف الحقيقة. قارن كيف تغطي وسائل الإعلام العالمية نفس الخبر.',
        readerTitle: 'القراءة المقارنة',
        readerDesc: 'نفس الخبر، روايات مختلفة. قارن التغطية عبر المنابر العالمية.',
        detectorTitle: 'كاشف الأخبار المزيفة',
        detectorDesc: 'الصق أي مقال واحصل على تقييم للمصداقية وتحليل التحيز.',
        mapTitle: 'خريطة النزاعات',
        mapDesc: 'مناطق النزاع الحية مع تغذية إخبارية مرتبطة بكل موقع.',
    },
    reader: {
        title: 'القراءة المقارنة',
        subtitle: 'ابحث عن أي موضوع وشاهد كيف تؤطر المنابر المختلفة نفس القصة.',
        placeholder: 'مثال: غزة، أوكرانيا، تغير المناخ...',
        analyze: 'تحليل',
        analyzing: 'جارٍ التحليل...',
        results: 'مقالات محللة عن',
        noResults: 'لم يتم العثور على مقالات. جرب استعلاماً مختلفاً.',
        bias: 'التحيز',
        tone: 'النبرة',
        opinion: '% الرأي',
        framing: 'الإطار',
        keyVerbs: 'الأفعال الرئيسية',
        readMore: 'قراءة المقال الأصلي',
        left: 'يسار',
        center: 'وسط',
        right: 'يمين',
    },
    detector: {
        title: 'كاشف الأخبار المزيفة',
        subtitle: 'حلل أي مقال للتحقق من مصداقيته وتحيزه ومحتواه التلاعبي.',
        pasteMode: 'لصق النص',
        urlMode: 'من رابط',
        titlePlaceholder: 'عنوان المقال (اختياري)',
        sourcePlaceholder: 'المصدر / اسم المنبر (اختياري)',
        contentPlaceholder: 'الصق محتوى المقال الكامل هنا...',
        urlPlaceholder: 'https://example.com/article',
        check: 'تحقق من المقال',
        checking: 'جارٍ التحليل...',
        verdict: 'الحكم',
        scores: 'النتائج',
        credibility: 'المصداقية',
        manipulation: 'التلاعب',
        emotional: 'اللغة العاطفية',
        opinionFact: 'الرأي مقابل الحقيقة',
        redFlags: 'المؤشرات الحمراء',
        verified: 'الادعاءات الموثقة',
        suspicious: 'الادعاءات المشبوهة',
    },
    map: {
        title: 'خريطة النزاعات',
        liveField: 'التغذية الحية للنزاعات',
        clickZone: 'انقر على منطقة في الخريطة للأخبار المحلية',
        loading: 'جارٍ تحميل بيانات النزاعات...',
        noArticles: 'لم يتم العثور على مقالات.',
        back: 'رجوع',
    },
    common: {
        retry: 'إعادة المحاولة',
        error: 'خطأ',
        live: 'مباشر',
        connected: 'متصل',
        severity: {
            critical: 'حرج',
            high: 'عالي',
            low: 'منخفض',
        },
    },
}

const LanguageContext = createContext<{
    lang: Language
    t: Translations
    toggleLang: () => void
}>({
    lang: 'en',
    t: en,
    toggleLang: () => { },
})

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLang] = useState<Language>(() => {
        return (localStorage.getItem('kashf-lang') as Language) || 'en'
    })

    const t = lang === 'ar' ? ar : en

    useEffect(() => {
        localStorage.setItem('kashf-lang', lang)
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.lang = lang
    }, [lang])

    const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en')

    return (
        <LanguageContext.Provider value={{ lang, t, toggleLang }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLang = () => useContext(LanguageContext)