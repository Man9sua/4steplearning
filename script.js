// ==================== TOAST NOTIFICATION ====================
function showToast(message, type = 'info', duration = 10000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        </div>
        <div class="toast-progress"></div>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after duration
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    });
}

function togglePasswordField(inputId, checkboxId) {
    const pass = document.getElementById(inputId);
    const show = document.getElementById(checkboxId);
    if (pass && show) {
        pass.type = show.checked ? 'text' : 'password';
    }
}
// ==================== DATA ====================
let factsData = [];
let currentModule = 0;
let currentCard = 0;
let score = 0;
let totalQuestions = 0;
let selectedMatchItem = null;
let currentFillIndex = 0;
let matchedPairs = [];
let enabledModules = {
    flashcards: true,
    quiz: true,
    matching: true,
    fillBlanks: true
};

// Section scores tracking
let sectionScores = {
    flashcards: { correct: 0, total: 0, answered: 0 },
    quiz: { correct: 0, total: 0, answered: 0 },
    matching: { correct: 0, total: 0, answered: 0 },
    fillBlanks: { correct: 0, total: 0, answered: 0 }
};

// Supabase client (set your values here)
const SUPABASE_URL = 'https://wuaciyhbdwzesnzinbux.supabase.co'; // TODO: replace
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1YWNpeWhiZHd6ZXNuemluYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMDQwNjAsImV4cCI6MjA4MDc4MDA2MH0.4bzZckxtZb2UugZTS1UXJJORPuZ9-hU_rz2VubZXCkY'; // TODO: replace
const supabaseClient = (typeof supabase !== 'undefined')
    ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

// Google Sheets API configuration
// Replace this with your Google Apps Script web app URL after deployment
const SHEETS_API_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLh62WToTzCEr2YszdYL5zdRTKtx7b3ZNmzoG9bPEtWHmlzksMmQYYVBdUDu5wdvy2v8icWfjRZz7DHmh4__B914Ywgn3J9iahE7eLSpXz6HVxMuvVn5SHsBMUWknWyd5hkAiCFssDtuqh6cH6xMBaY5nboxPJFv0srRnAo6_07CGLcnTlBZHIiYAnS62BrolD2R47I_rCqma8VVXX9-_qxkNOw6cBaFLk7BztH11qz1B1nzViFbXTC3T1oJI8azF0ig0gDvfGjFjhzfrP2riUtY9DjRXQ&lib=M7U0zP2To7o9nRDSXAYhFdOK-zzuAOZUp';
let sheetsData = null;

// Authentication method: 'supabase' or 'sheets'
const AUTH_METHOD = 'sheets'; // Change to 'supabase' to use Supabase instead

// Fallback data in case Google Sheets API is not available
const fallbackSheetsData = [
    ["Алтын Орданың құлауы мен Ақ Орданың әлсіреуі барысында пайда болған мемлекеттің бірі", "Ноғай Ордасы"],
    ["Ноғай Ордасының жер аумағы", "Еділ мен Жайық аралығында болды"],
    ["Орталығы", "Жайықтың төменгі ағысы бойындағы қазіргі Атырау жанындағы Сарайшық қаласында орналасты"],
    ["Сарайшық қаласының негізін", "XIII ғасырдың екінші жартысында Жошы ұрпақтары қалады"],
    ["Сарайшықты XVI ғасырдың соңында", "Дон және Еділ казактары қаланы басып алып, тонауға ұшыратты"],
    ["Жаңа мемлекеттің атауы байланысты", "Алтын Орданың әскер басы Ноғай есімімен"],
    ["Үлкен ұлысты басқарды", "Ноғай"],
    ["Мемлекеттегі маңыздылығы жағынан екінші орындағы лауазым", "беклербек"],
    ["Маңғыт жұрты деп аталды", "Жайық пен Еділ аралығындағы тайпалар бірлестігі"],
    ["Маңғыт жұртының (Ноғай Ордасының) қалыптасуы аяқталды", "XV ғасырдың бірінші жартысында"],
    ["Ноғай Ордасының негізгі тұрғындары", "маңғыттар тайпасы"],
    ["Ноғай Ордасының тәуелсіз мемлекет ретінде қалыптасуы", "Едіге тұсында"],
    ["Ноғай Ордасы Алтын Ордадан бөліне бастады", "Едіге билік еткен тұста"],
    ["Ноғай Ордасы XV ғасырдың ортасына қарай", "Едігенің ұлы Нұраддиннің тұсында түпкілікті түрде оқшауланды"],
    ["XV ғасырдың екінші жартысына қарай ноғайлар жылжыды", "«өзбектер» жеріне"],
    ["Ұлыстар басында тұрды", "мырзалар (түркі тайпаларының басшылары)"],
    ["Үлкен кеңес", "жоғарғы билік болып табылды, оған ақсүйектер мен Едіге ұрпақтары енді"],
    ["XVI ғасырдың басында", "Ноғай Ордасында құлдырау кезеңі басталды"],
    ["XVI ғасырдың 50-жылдары", "Ноғай Ордасы бірнеше дербес иеліктерге бөлінді"],
    ["Ноғайлар мен қазақтарды «екі туысқан Орда» деп атады", "Шоқан Уәлиханов"],
    ["Ноғай Ордасы өркендеу дәуірінің белгісі болып табылады", "Едіге, Қамбар батыр, Ер Тарғын және басқа батырларға арналған эпостар"]
];

let currentUser = null;
let currentRole = 'student';
let emailConfirmed = false;

// Language selection
let currentLang = localStorage.getItem('lang') || 'kk';

// ==================== GOOGLE SHEETS USERS FUNCTIONS ====================
// Load users from Google Sheets (for backup/authentication)
async function loadUsersFromSheets() {
    try {
        console.log('Loading users from Google Sheets...');
        const response = await fetch(SHEETS_API_URL + '?action=getUsers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.values && Array.isArray(data.values)) {
            // Skip header row and return users as array of objects
            const users = data.values.slice(1).map(row => ({
                email: row[0] || '',
                password: row[1] || '',
                role: row[2] || 'student'
            })).filter(user => user.email && user.password);

            console.log('Users loaded from Google Sheets:', users.length);
            return users;
        } else if (data.error) {
            throw new Error('API returned error: ' + data.error);
        } else {
            throw new Error('Unexpected API response format');
        }

    } catch (error) {
        console.error('Error loading users from Google Sheets:', error);
        return [];
    }
}

// Save user to Google Sheets
async function saveUserToSheets(email, password, role = 'student') {
    try {
        const userData = {
            action: 'addUser',
            email: email,
            password: password, // WARNING: Plain text password!
            role: role,
            timestamp: new Date().toISOString()
        };

        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.ok === true) {
            console.log('User saved to Google Sheets successfully');
            return true;
        } else if (result.error) {
            throw new Error('API returned error: ' + result.error);
        } else {
            return true;
        }
    } catch (error) {
        console.error('Error saving user to Google Sheets:', error);
        return false;
    }
}

// Authenticate user against Google Sheets database
async function authenticateWithSheets(email, password) {
    const users = await loadUsersFromSheets();
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        console.log('User authenticated via Google Sheets:', user.email);
        return {
            email: user.email,
            role: user.role,
            confirmed: true // Sheets users are auto-confirmed
        };
    }

    return null;
}

// ==================== GOOGLE SHEETS API FUNCTIONS ====================
async function loadSheetsData() {
    try {
        console.log('Attempting to load data from Google Sheets API...');
        const response = await fetch(SHEETS_API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.values && Array.isArray(data.values)) {
            sheetsData = data.values;
            console.log('Google Sheets data loaded successfully:', sheetsData.length, 'rows');
            return sheetsData;
        } else if (data.error) {
            throw new Error('API returned error: ' + data.error);
        } else {
            throw new Error('Unexpected API response format');
        }

    } catch (error) {
        console.error('Error loading Google Sheets data:', error);
        console.log('Using fallback data instead...');
        showToast('Используются локальные данные (Google Sheets недоступен)', 'warning');

        // Use fallback data
        sheetsData = fallbackSheetsData;
        return sheetsData;
    }
}

async function saveToSheets(action, data) {
    try {
        // Prepare data to send to Google Sheets
        const timestamp = new Date().toISOString();
        const userEmail = currentUser?.email || 'anonymous';
        const userRole = currentRole || 'student';

        const sheetData = {
            timestamp,
            userEmail,
            userRole,
            action,
            ...data
        };

        console.log('Attempting to save data to Google Sheets...');

        // Send data to Google Sheets via API
        const response = await fetch(SHEETS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sheetData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.ok === true) {
            console.log('Data saved to Google Sheets successfully:', sheetData);
            return true;
        } else if (result.error) {
            throw new Error('API returned error: ' + result.error);
        } else {
            console.warn('Unexpected response from Google Sheets API:', result);
            return true; // Still consider it successful
        }
    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        // Don't show error toast for saving - just log it
        console.log('Data saving failed, but continuing...');
        return false;
    }
}

async function saveLearningResults(results) {
    const data = {
        totalScore: score,
        totalQuestions: totalQuestions,
        accuracy: totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0,
        modulesCompleted: {
            flashcards: enabledModules.flashcards,
            quiz: enabledModules.quiz,
            matching: enabledModules.matching,
            fillBlanks: enabledModules.fillBlanks
        },
        sectionScores: sectionScores,
        materialLength: factsData.length,
        language: currentLang,
        ...results
    };

    return await saveToSheets('learning_completed', data);
}

async function saveUserAction(action, details = {}) {
    const data = {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        ...details
    };

    // Don't block the app if tracking fails
    try {
        await saveToSheets(action, data);
    } catch (error) {
        console.log('User action tracking failed (non-critical):', error.message);
    }
}

// Get data from Google Sheets for use in app
function getSheetsSampleData() {
    if (!sheetsData || sheetsData.length === 0) {
        return null;
    }

    // Return a random sample from sheets data
    const randomIndex = Math.floor(Math.random() * Math.min(sheetsData.length, 10));
    const sampleRow = sheetsData[randomIndex];

    if (sampleRow && sampleRow.length >= 2) {
        return {
            name: sampleRow[0] || `Sample from Sheets ${randomIndex + 1}`,
            text: sampleRow[1] || ''
        };
    }

    return null;
}

// Load examples from Google Sheets
async function loadSheetsExamples() {
    await loadSheetsData();

    if (sheetsData && sheetsData.length > 0) {
        const sheetsExamples = sheetsData.slice(0, 5).map((row, index) => ({
            name: row[0] || `Sheets Example ${index + 1}`,
            text: row[1] || ''
        })).filter(example => example.text.trim());

        // Add to existing samples
        currentSamples = [...currentSamples, ...sheetsExamples];
        saveSamples(currentSamples);
    }
}

const i18n = {
    kk: {
        brand: '🎓 4 Қадамдық Оқыту',
        loginBtn: 'Кіру',
        signupBtn: 'Тіркелу',
        accountBtn: 'Профиль',
        homeTitle: '🎓 4 Қадамдық Оқыту',
        homeSubtitle: 'Тарихи фактілерді оқыту жүйесі',
        feature1Title: '4 Step Learning',
        feature1Desc: 'Флэш-карталар, Тест, Сәйкестендіру, Әріптер',
        feature2Title: 'Кітапхана (жақында)',
        feature2Desc: 'Сақталған материалдар және бөлісу',
        feature3Title: 'Мұғалім панелі (жақында)',
        feature3Desc: 'Студенттерді бақылау, материал тағайындау',
        inputTitle: '📝 Материалды енгізіңіз',
        placeholder: 'Материалды келесі форматта енгізіңіз:\n1. Сұрақ: Жауап\n2. Сұрақ: Жауап\n...',
        scan: '📷 Фото скан',
        upload: '📁 Файл жүктеу',
        correct: '🛠️ Форматты түзету',
        history: '📜 Тарих',
        start: '🚀 Оқытуды бастау',
        load: '📄 Мысал жүктеу',
        clear: '🗑️ Тазалау',
        formatTitle: '📌 Формат:',
        formatText: 'Әрбір жолда нөмір, сұрақ және жауап қос нүктемен бөлінген болуы керек.',
        formatExample: 'Мысалы: "1. Қазақ хандығын құрды: Керей мен Жәнібек"',
        scoreCorrect: 'Дұрыс',
        scoreTotal: 'Барлығы',
        scoreAcc: 'Дәлдік',
        prevModule: '← Алдыңғы модуль',
        nextModule: 'Келесі модуль →',
        finish: '📊 Нәтиже',
        reset: '🔄 Қайта бастау',
        faqTitle: 'FAQ',
        faqHtml: `<ol class="faq-list"><li>Аккаунтқа кіріп, email-ды растаңыз.</li><li>Материалды "Сұрақ: Жауап" форматына келтіру үшін Corrector қолданыңыз.</li><li>Скандау/жүктеу → OCR → авто түзету және одан кейін модульдерді таңдаңыз.</li><li>FAQ тек материал енгізу бетінде ашылады.</li><li>Нәтижелер мен соңғы материал профильде сақталады.</li></ol>`,
        samplesTitle: 'Мысалдар',
        sampleAdd: '➕ Қосу',
        sampleInsert: '📥 Қою',
        authLogin: 'Кіру',
        authRegister: 'Тіркелу',
        authSubmit: '▶️ Жіберу',
        accountTitle: 'Профиль',
        showPasswordLabel: 'Құпиясөзді көрсету',
        // Module modal
        moduleModalTitle: '📚 Оқыту модульдерін таңдаңыз',
        moduleFlashcards: '📇 Флэш-карталар',
        moduleQuiz: '✅ Тест (дұрыс жауап)',
        moduleMatching: '🔗 Сәйкестендіру (дайындалуда)',
        moduleFillBlanks: '✏️ Әріптерді жинау (дайындалуда)',
        moduleCancel: '❌ Болдырмау',
        moduleStart: '▶️ Бастау',
        // Learning section
        prevCard: '← Алдыңғы',
        nextCard: 'Келесі →',
        moduleTitle: 'Оқыту модулі',
        // Flashcard
        flashcardHint: '👆 Аудару үшін басыңыз',
        flashcardBackHint: '👆 Сұраққа қайту',
        flashcardKnew: '✓ Білдім',
        flashcardDidntKnow: '✗ Білмедім',
        flashcardsDone: '🎉 Барлық карталар аяқталды!',
        flashcardsNextModule: 'Келесі модульге өтіңіз',
        // Quiz
        quizQuestion: 'Сұрақ',
        // Matching
        matchingTitle: 'Сәйкестендіру',
        matchingQuestions: 'Сұрақтар',
        matchingAnswers: 'Жауаптар',
        matchingDone: '🎉 Барлығы сәйкестендірілді!',
        // Fill blanks
        fillBlanksTitle: 'Әріптерді жинап жауап құрыңыз',
        fillBlanksClear: '🗑️ Тазалау',
        fillBlanksCheck: '✓ Тексеру',
        fillBlanksSkip: 'Өткізу →',
        fillBlanksDone: '🎉 Барлық сұрақтар аяқталды!',
        fillBlanksNext: 'Келесі модульге өтіңіз',
        // Completion
        completionTitle: 'Құттықтаймыз!',
        completionSubtitle: 'Сіз барлық модульдерді аяқтадыңыз!',
        completionResultsTitle: '📊 Бөлімдер бойынша нәтижелер',
        completionCorrect: 'дұрыс',
        resultsTitle: 'Нәтижелер',
        // Auth
        forgotPassword: 'Құпиясөзді ұмыттыңыз ба? (дайындалуда)',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Құпиясөз',
        checkEmail: 'Тіркелуді растау үшін email-ді тексеріңіз.',
        registerWaitToast: 'Email-ды растаған соң тіркелген деректермен кіріңіз. Хаттағы сілтеме ашылмаса — бұл қалыпты.',
        resetPassword: 'Құпиясөзді қалпына келтіру',
        resetEmailSent: 'Қалпына келтіру сілтемесі/коды поштаға жіберілді.',
        // Account
        accountEmail: 'Email',
        accountRole: 'Рөлі',
        accountStatus: 'Күйі',
        statusConfirmed: 'Расталған',
        statusNotConfirmed: 'Расталмаған',
        logoutBtn: '🚪 Шығу',
        // Samples
        sampleNamePlaceholder: 'Мысал атауы',
        sampleTextPlaceholder: 'Мысал мәтіні',
        // Errors
        errorEmpty: 'Материалды енгізіңіз',
        errorFormat: 'Материал форматы дұрыс емес. Әрбір жолда "сұрақ: жауап" форматы болуы керек.',
        errorSelectModule: 'Кем дегенде бір модульді таңдаңыз!',
        historyEmpty: 'Тарих бос',
        // Welcome modal
        welcomeTitle: '🎓 Қош келдіңіз!',
        welcomeText1: '4 Step Learning жобасына қош келдіңіз!',
        welcomeText2: 'Бұл тегін пайдалануға арналған сынақ нұсқасы.',
        welcomeText3: 'Материалдарды оқып, білім деңгейіңізді тексеріңіз.',
        welcomeBtn: '✓ Түсіндім'
    },
    ru: {
        brand: '🎓 4 Шаговое Обучение',
        loginBtn: 'Вход',
        signupBtn: 'Регистрация',
        accountBtn: 'Профиль',
        homeTitle: '🎓 4 Шаговое Обучение',
        homeSubtitle: 'Система изучения исторических фактов',
        feature1Title: '4 Step Learning',
        feature1Desc: 'Флэш-карты, Тест, Соответствие, Сбор букв',
        feature2Title: 'Библиотека (скоро)',
        feature2Desc: 'Сохранённые материалы и шаринг',
        feature3Title: 'Панель учителя (скоро)',
        feature3Desc: 'Отслеживание учеников, выдача материалов',
        inputTitle: '📝 Введите материал',
        placeholder: 'Введите текст в формате:\n1. Вопрос: Ответ\n2. Вопрос: Ответ\n...',
        scan: '📷 Скан фото',
        upload: '📁 Загрузить файл',
        correct: '🛠️ Исправить формат',
        history: '📜 История',
        start: '🚀 Начать обучение',
        load: '📄 Загрузить пример',
        clear: '🗑️ Очистить',
        formatTitle: '📌 Формат:',
        formatText: 'Каждая строка: номер, вопрос и ответ через двоеточие.',
        formatExample: 'Например: "1. Казахское ханство основали: Керей и Жанибек"',
        scoreCorrect: 'Верно',
        scoreTotal: 'Всего',
        scoreAcc: 'Точность',
        prevModule: '← Предыдущий модуль',
        nextModule: 'Следующий модуль →',
        finish: '📊 Результат',
        reset: '🔄 Сброс',
        faqTitle: 'FAQ',
        faqHtml: `<ol class="faq-list"><li>Зарегистрируйтесь и подтвердите email перед началом.</li><li>Используйте Corrector, чтобы привести текст к формату "Вопрос: Ответ".</li><li>Скан/загрузка файла → OCR → автоисправление, затем выберите модули.</li><li>FAQ доступен только на странице ввода материала.</li><li>Результаты и последний материал хранятся в профиле.</li></ol>`,
        samplesTitle: 'Примеры',
        sampleAdd: '➕ Добавить',
        sampleInsert: '📥 Вставить',
        authLogin: 'Вход',
        authRegister: 'Регистрация',
        authSubmit: '▶️ Отправить',
        accountTitle: 'Профиль',
        showPasswordLabel: 'Показать пароль',
        // Module modal
        moduleModalTitle: '📚 Выберите модули обучения',
        moduleFlashcards: '📇 Флэш-карты',
        moduleQuiz: '✅ Тест (правильный ответ)',
        moduleMatching: '🔗 Сопоставление (в разработке)',
        moduleFillBlanks: '✏️ Сбор букв (в разработке)',
        moduleCancel: '❌ Отмена',
        moduleStart: '▶️ Начать',
        // Learning section
        prevCard: '← Назад',
        nextCard: 'Далее →',
        moduleTitle: 'Модуль обучения',
        // Flashcard
        flashcardHint: '👆 Нажмите, чтобы перевернуть',
        flashcardBackHint: '👆 Вернуться к вопросу',
        flashcardKnew: '✓ Знал',
        flashcardDidntKnow: '✗ Не знал',
        flashcardsDone: '🎉 Все карточки завершены!',
        flashcardsNextModule: 'Переходите к следующему модулю',
        // Quiz
        quizQuestion: 'Вопрос',
        // Matching
        matchingTitle: 'Сопоставление',
        matchingQuestions: 'Вопросы',
        matchingAnswers: 'Ответы',
        matchingDone: '🎉 Все сопоставлено!',
        // Fill blanks
        fillBlanksTitle: 'Соберите ответ из букв',
        fillBlanksClear: '🗑️ Очистить',
        fillBlanksCheck: '✓ Проверить',
        fillBlanksSkip: 'Пропустить →',
        fillBlanksDone: '🎉 Все вопросы завершены!',
        fillBlanksNext: 'Переходите к следующему модулю',
        // Completion
        completionTitle: 'Поздравляем!',
        completionSubtitle: 'Вы завершили все модули!',
        completionResultsTitle: '📊 Результаты по разделам',
        completionCorrect: 'верно',
        resultsTitle: 'Результаты',
        // Auth
        forgotPassword: 'Забыли пароль? (в разработке)',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Пароль',
        checkEmail: 'Проверьте email для подтверждения регистрации.',
        registerWaitToast: 'После подтверждения почты войдите с зарегистрированными данными. Если ссылка в письме не открывается — это нормально.',
        resetPassword: 'Сброс пароля',
        resetEmailSent: 'Ссылка/код для сброса отправлены на почту.',
        // Account
        accountEmail: 'Email',
        accountRole: 'Роль',
        accountStatus: 'Статус',
        statusConfirmed: 'Подтверждён',
        statusNotConfirmed: 'Не подтверждён',
        logoutBtn: '🚪 Выйти',
        // Samples
        sampleNamePlaceholder: 'Название примера',
        sampleTextPlaceholder: 'Текст примера',
        // Errors
        errorEmpty: 'Введите материал',
        errorFormat: 'Неверный формат материала. Каждая строка должна быть в формате "вопрос: ответ".',
        errorSelectModule: 'Выберите хотя бы один модуль!',
        historyEmpty: 'История пуста',
        // Welcome modal
        welcomeTitle: '🎓 Добро пожаловать!',
        welcomeText1: 'Добро пожаловать в проект 4 Step Learning!',
        welcomeText2: 'Это пробная версия для бесплатного использования.',
        welcomeText3: 'Изучайте материалы и проверяйте свои знания.',
        welcomeBtn: '✓ Понятно'
    },
    en: {
        brand: '🎓 4 Step Learning',
        loginBtn: 'Login',
        signupBtn: 'Sign up',
        accountBtn: 'Account',
        homeTitle: '🎓 4 Step Learning',
        homeSubtitle: 'AI-assisted historical facts learning',
        feature1Title: '4 Step Learning',
        feature1Desc: 'Flashcards, Quiz, Matching, Letters',
        feature2Title: 'Library (coming soon)',
        feature2Desc: 'Saved materials and sharing',
        feature3Title: 'Teacher dashboard (coming soon)',
        feature3Desc: 'Track students, assign materials',
        inputTitle: '📝 Enter material',
        placeholder: 'Use format:\n1. Question: Answer\n2. Question: Answer\n...',
        scan: '📷 Scan photo',
        upload: '📁 Upload file',
        correct: '🛠️ Correct format',
        history: '📜 History',
        start: '🚀 Start learning',
        load: '📄 Load sample',
        clear: '🗑️ Clear',
        formatTitle: '📌 Format:',
        formatText: 'Each line: number, question, and answer separated by colon.',
        formatExample: 'E.g.: "1. Founded the Kazakh Khanate: Kerei and Janibek"',
        scoreCorrect: 'Correct',
        scoreTotal: 'Total',
        scoreAcc: 'Accuracy',
        prevModule: '← Previous module',
        nextModule: 'Next module →',
        finish: '📊 Results',
        reset: '🔄 Restart',
        faqTitle: 'FAQ',
        faqHtml: `<ol class="faq-list"><li>Sign up / log in and confirm your email before learning.</li><li>Use the Corrector to normalize text into "Question: Answer".</li><li>Scan/upload → OCR → auto-fix, then pick which modules to run.</li><li>The FAQ button appears only on the material input page.</li><li>Results and last material are stored in your profile view.</li></ol>`,
        samplesTitle: 'Samples',
        sampleAdd: '➕ Add',
        sampleInsert: '📥 Insert',
        authLogin: 'Login',
        authRegister: 'Register',
        authSubmit: '▶️ Submit',
        accountTitle: 'Account',
        showPasswordLabel: 'Show password',
        // Module modal
        moduleModalTitle: '📚 Select learning modules',
        moduleFlashcards: '📇 Flashcards',
        moduleQuiz: '✅ Quiz (correct answer)',
        moduleMatching: '🔗 Matching (in progress)',
        moduleFillBlanks: '✏️ Letter collection (in progress)',
        moduleCancel: '❌ Cancel',
        moduleStart: '▶️ Start',
        // Learning section
        prevCard: '← Previous',
        nextCard: 'Next →',
        moduleTitle: 'Learning module',
        // Flashcard
        flashcardHint: '👆 Click to flip',
        flashcardBackHint: '👆 Return to question',
        flashcardKnew: '✓ Knew it',
        flashcardDidntKnow: '✗ Didn\'t know',
        flashcardsDone: '🎉 All cards completed!',
        flashcardsNextModule: 'Proceed to next module',
        // Quiz
        quizQuestion: 'Question',
        // Matching
        matchingTitle: 'Matching',
        matchingQuestions: 'Questions',
        matchingAnswers: 'Answers',
        matchingDone: '🎉 All matched!',
        // Fill blanks
        fillBlanksTitle: 'Build the answer from letters',
        fillBlanksClear: '🗑️ Clear',
        fillBlanksCheck: '✓ Check',
        fillBlanksSkip: 'Skip →',
        fillBlanksDone: '🎉 All questions completed!',
        fillBlanksNext: 'Proceed to next module',
        // Completion
        completionTitle: 'Congratulations!',
        completionSubtitle: 'You completed all modules!',
        completionResultsTitle: '📊 Results by section',
        completionCorrect: 'correct',
        resultsTitle: 'Results',
        // Auth
        forgotPassword: 'Forgot password? (in development)',
        emailPlaceholder: 'Email',
        passwordPlaceholder: 'Password',
        checkEmail: 'Check your email to confirm registration.',
        registerWaitToast: 'After confirming your email, sign in with your registered credentials. If the link in the email does not open a page, that is expected.',
        resetPassword: 'Reset password',
        resetEmailSent: 'Reset link/code sent to your email.',
        // Account
        accountEmail: 'Email',
        accountRole: 'Role',
        accountStatus: 'Status',
        statusConfirmed: 'Confirmed',
        statusNotConfirmed: 'Not confirmed',
        logoutBtn: '🚪 Logout',
        // Samples
        sampleNamePlaceholder: 'Sample name',
        sampleTextPlaceholder: 'Sample content',
        // Errors
        errorEmpty: 'Please enter material',
        errorFormat: 'Invalid material format. Each line should be "question: answer".',
        errorSelectModule: 'Select at least one module!',
        historyEmpty: 'History is empty',
        // Welcome modal
        welcomeTitle: '🎓 Welcome!',
        welcomeText1: 'Welcome to 4 Step Learning!',
        welcomeText2: 'This is a trial version for free use.',
        welcomeText3: 'Study materials and test your knowledge.',
        welcomeBtn: '✓ I understand'
    }
};

// ==================== EXAMPLE DATA ====================
const exampleText = `1. Алтын Орданың құлауы мен Ақ Орданың әлсіреуі барысында пайда болған мемлекеттің бірі: Ноғай Ордасы
2. Ноғай Ордасының жер аумағы: Еділ мен Жайық аралығында болды
3. Орталығы: Жайықтың төменгі ағысы бойындағы қазіргі Атырау жанындағы Сарайшық қаласында орналасты
4. Сарайшық қаласының негізін: XIII ғасырдың екінші жартысында Жошы ұрпақтары қалады
5. Сарайшықты XVI ғасырдың соңында: Дон және Еділ казактары қаланы басып алып, тонауға ұшыратты
6. Жаңа мемлекеттің атауы байланысты: Алтын Орданың әскер басы Ноғай есімімен
7. Үлкен ұлысты басқарды: Ноғай
8. Мемлекеттегі маңыздылығы жағынан екінші орындағы лауазым: беклербек
9. Маңғыт жұрты деп аталды: Жайық пен Еділ аралығындағы тайпалар бірлестігі
10. Маңғыт жұртының (Ноғай Ордасының) қалыптасуы аяқталды: XV ғасырдың бірінші жартысында
11. Ноғай Ордасының негізгі тұрғындары: маңғыттар тайпасы
12. Ноғай Ордасының тәуелсіз мемлекет ретінде қалыптасуы: Едіге тұсында
13. Ноғай Ордасы Алтын Ордадан бөліне бастады: Едіге билік еткен тұста
14. Ноғай Ордасы XV ғасырдың ортасына қарай: Едігенің ұлы Нұраддиннің тұсында түпкілікті түрде оқшауланды
15. XV ғасырдың екінші жартысына қарай ноғайлар жылжыды: «өзбектер» жеріне
16. Ұлыстар басында тұрды: мырзалар (түркі тайпаларының басшылары)
17. Үлкен кеңес: жоғарғы билік болып табылды, оған ақсүйектер мен Едіге ұрпақтары енді
18. XVI ғасырдың басында: Ноғай Ордасында құлдырау кезеңі басталды
19. XVI ғасырдың 50-жылдары: Ноғай Ордасы бірнеше дербес иеліктерге бөлінді
20. Ноғайлар мен қазақтарды «екі туысқан Орда» деп атады: Шоқан Уәлиханов
21. Ноғай Ордасы өркендеу дәуірінің белгісі болып табылады: Едіге, Қамбар батыр, Ер Тарғын және басқа батырларға арналған көптеген эпостар`;

// ==================== INPUT FUNCTIONS ====================
function clearInput() {
    document.getElementById('materialInput').value = '';
    hideError();
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('errorMessage').classList.add('hidden');
}

function isSectionVisible(id) {
    const el = document.getElementById(id);
    return el && !el.classList.contains('hidden');
}

function openModalById(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('modal-active');
}

function closeModalById(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
    if (!document.querySelector('.modal-overlay.active')) {
        document.body.classList.remove('modal-active');
    }
}

function updateTopActionsVisibility() {
    const faqBtn = document.getElementById('faqBtn');
    const inputVisible = isSectionVisible('inputSection');
    if (faqBtn) faqBtn.classList.toggle('hidden', !inputVisible);
}

// Navigation / language / FAQ
function enterLearning() {
    if (!currentUser || !emailConfirmed) {
        openLogin();
        return;
    }
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('slide');
        setTimeout(() => container.classList.remove('slide'), 400);
    }
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('inputSection').classList.remove('hidden');
    updateTopActionsVisibility();
}

function goBackHome() {
    document.getElementById('homeSection')?.classList.remove('hidden');
    document.getElementById('inputSection')?.classList.add('hidden');
    document.getElementById('learningSection')?.classList.add('hidden');
    updateTopActionsVisibility();
}

function openFAQ() {
    if (!isSectionVisible('inputSection')) {
        return;
    }
    openModalById('faqModal');
}
function closeFAQ() {
    closeModalById('faqModal');
}

function initLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
        btn.onclick = () => switchLang(btn.dataset.lang);
    });
}

function switchLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', currentLang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    applyTranslations();
}

// Auth modal helpers
let authMode = 'login';
let authStep = 'login'; // login | register-email | register-password | register-wait | reset-email | reset-code | reset-new
let pendingEmail = '';
let pendingPassword = '';
let pendingResetEmail = '';

function renderAuthStep() {
    const container = document.getElementById('authStepContainer');
    if (!container) return;
    let html = '';

    const backButton = (step) => `<button class="ghost-btn auth-back" onclick="setAuthStep('${step}')">←</button>`;

    if (authStep === 'login') {
        html = `
            <form onsubmit="return submitAuth(event)" autocomplete="on">
                <div class="modal-fields">
                    <input type="email" id="authEmail" placeholder="${t('emailPlaceholder')}" autocomplete="email" name="email" required>
                    <div class="password-wrapper">
                        <input type="password" id="authPassword" placeholder="${t('passwordPlaceholder')}" autocomplete="current-password" name="password" required>
                        <label class="auth-checkbox" for="showPassword">
                            <input type="checkbox" id="showPassword" onchange="togglePassword()">
                            <span class="checkmark"></span>
                            <span id="showPasswordLabel">${t('showPasswordLabel')}</span>
                        </label>
                    </div>
                    <div class="auth-inline">
                        <span class="auth-link disabled">${t('forgotPassword')}</span>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button type="submit">${t('authSubmit')}</button>
                </div>
            </form>
        `;
        document.getElementById('authModalTitle').textContent = t('authLogin');
    } else if (authStep === 'register-email') {
        html = `
            <form onsubmit="event.preventDefault(); proceedRegisterEmail();" autocomplete="on">
                <div class="modal-fields">
                    <input type="email" id="regEmail" name="email" placeholder="${t('emailPlaceholder')}" autocomplete="email" required>
                </div>
                <div class="modal-buttons">
                    <button type="submit">${t('authSubmit')}</button>
                </div>
            </form>
        `;
        document.getElementById('authModalTitle').textContent = t('authRegister');
    } else if (authStep === 'register-password') {
        html = `
            <form onsubmit="event.preventDefault(); submitRegisterPassword();" autocomplete="on">
                <div class="modal-fields">
                    ${backButton('register-email')}
                    <div class="info-text">${pendingEmail}</div>
                    <input type="hidden" name="email" value="${pendingEmail}" autocomplete="email">
                    <div class="password-wrapper">
                        <input type="password" id="regPassword" name="password" placeholder="${t('passwordPlaceholder')}" autocomplete="new-password" required>
                        <label class="auth-checkbox" for="showPasswordReg">
                            <input type="checkbox" id="showPasswordReg" onchange="togglePasswordField('regPassword','showPasswordReg')">
                            <span class="checkmark"></span>
                            <span>${t('showPasswordLabel')}</span>
                        </label>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button type="submit">${t('authSubmit')}</button>
                </div>
            </form>
        `;
        document.getElementById('authModalTitle').textContent = t('authRegister');
    } else if (authStep === 'register-wait') {
        html = `
            <div class="modal-fields">
                ${backButton('register-email')}
                <div class="info-text">${t('checkEmail')}</div>
                <div class="info-sub">${pendingEmail}</div>
            </div>
        `;
        document.getElementById('authModalTitle').textContent = t('authRegister');
    } else if (authStep === 'reset-email') {
        html = `
            <div class="modal-fields">
                ${backButton('login')}
                <input type="email" id="resetEmail" placeholder="${t('emailPlaceholder')}" autocomplete="email" required>
            </div>
            <div class="modal-buttons">
                <button type="button" onclick="proceedResetEmail()">${t('authSubmit')}</button>
            </div>
        `;
        document.getElementById('authModalTitle').textContent = t('resetPassword');
    } else if (authStep === 'reset-sent') {
        html = `
            <div class="modal-fields">
                ${backButton('login')}
                <div class="info-text">${pendingResetEmail}</div>
                <div class="info-sub">${t('resetEmailSent')}</div>
            </div>
        `;
        document.getElementById('authModalTitle').textContent = t('resetPassword');
    }
    container.innerHTML = html;
}

function setAuthStep(step) {
    authStep = step;
    renderAuthStep();
}

async function proceedRegisterEmail() {
    const input = document.getElementById('regEmail');
    if (!input) return;
    const email = input.value.trim();
    if (!email) {
        showToast(t('emailPlaceholder') + ' required', 'warning');
        return;
    }
    pendingEmail = email;
    setAuthStep('register-password');
}

async function submitRegisterPassword() {
    const passEl = document.getElementById('regPassword');
    const password = passEl ? passEl.value : '';
    if (!pendingEmail) {
        setAuthStep('register-email');
        return;
    }
    if (!password) {
        showToast(t('passwordPlaceholder') + ' required', 'warning');
        return;
    }
    pendingPassword = password;
    if (!supabaseClient) {
        showToast('Supabase not configured', 'error');
        return;
    }
    try {
        const { data, error } = await supabaseClient.auth.signUp({ email: pendingEmail, password, options: { data: { role: 'student' } } });
        if (error) {
            if (error.message && error.message.includes('registered')) {
                showToast('Email already registered. Try logging in.', 'warning');
                setAuthStep('login');
                return;
            }
            throw error;
        }
        currentUser = data.user;
        currentRole = 'student';
        emailConfirmed = !!data.user?.email_confirmed_at;
        localStorage.setItem('lastAuthEmail', pendingEmail);
        setAuthStep('register-wait');
        showToast(t('registerWaitToast'), 'info');

        // Track registration in Google Sheets
        await saveUserAction('user_registered', { email: pendingEmail });

        if (emailConfirmed) {
            await sendWelcomeEmail(pendingEmail);
            updateAuthUI();
            closeAuthModal();
        }
    } catch (err) {
        showToast('Registration error: ' + err.message, 'error');
    }
}

function proceedResetEmail() {
    const input = document.getElementById('resetEmail');
    if (!input || !supabaseClient) return;
    const email = input.value.trim();
    if (!email) {
        showToast(t('emailPlaceholder') + ' required', 'warning');
        return;
    }
    pendingResetEmail = email;
    supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
        .catch(err => console.warn('Reset email error', err));
    setAuthStep('reset-sent');
}

function openLogin() {
    authMode = 'login';
    authStep = 'login';
    openModalById('authModal');
    renderAuthStep();
}
function openRegister() {
    authMode = 'register';
    authStep = 'register-email';
    pendingEmail = '';
    pendingPassword = '';
    openModalById('authModal');
    renderAuthStep();
}
function closeAuthModal() {
    closeModalById('authModal');
}

async function logout() {
    if (AUTH_METHOD === 'supabase' && supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    // For sheets auth, just clear local state
    currentUser = null;
    currentRole = 'student';
    emailConfirmed = false;
    updateAuthUI();
    closeAccount();
    // Return to home
    document.getElementById('homeSection')?.classList.remove('hidden');
    document.getElementById('inputSection')?.classList.add('hidden');
    document.getElementById('learningSection')?.classList.add('hidden');
    updateTopActionsVisibility();
    setAuthStep('login');
}

function openAccount() {
    if (!currentUser) { openLogin(); return; }
    const info = document.getElementById('accountInfo');
    if (info) {
        const safeEmail = escapeHtml(currentUser?.email || '-');
        const safeRole = escapeHtml(currentRole || 'student');
        const statusText = emailConfirmed ? t('statusConfirmed') : t('statusNotConfirmed');
        info.innerHTML = `
            <div class="account-grid">
                <div class="account-card">
                    <div class="card-label">${t('accountEmail')}</div>
                    <div class="card-value">${safeEmail}</div>
                </div>
                <div class="account-card">
                    <div class="card-label">${t('accountRole')}</div>
                    <div class="card-value">${safeRole}</div>
                </div>
                <div class="account-card status-card ${emailConfirmed ? 'status-ok' : 'status-warn'}">
                    <div class="card-label">${t('accountStatus')}</div>
                    <div class="card-value">${statusText}</div>
                </div>
            </div>
        `;
    }
    const title = document.getElementById('accountTitle');
    if (title) title.textContent = t('accountTitle');
    openModalById('accountModal');
}
function closeAccount() {
    closeModalById('accountModal');
}

async function submitAuth(evt) {
    if (evt && evt.preventDefault) evt.preventDefault();
    const emailInput = document.getElementById('authEmail');
    const passInput = document.getElementById('authPassword');
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';
    const role = document.getElementById('authRole') ? document.getElementById('authRole').value : 'student';

    if (!email || !password) {
        showToast('Please enter email and password.', 'warning');
        return false;
    }

    try {
        if (AUTH_METHOD === 'sheets') {
            // Use Google Sheets authentication
            if (authMode === 'register') {
                // Check if user already exists
                const existingUsers = await loadUsersFromSheets();
                const userExists = existingUsers.some(u => u.email === email);

                if (userExists) {
                    showToast('Email already registered. Try Login.', 'warning');
                    return false;
                }

                // Add new user to Google Sheets
                const success = await saveUserToSheets(email, password, role);
                if (success) {
                    currentUser = { email: email, id: email };
                    currentRole = role;
                    emailConfirmed = true; // Sheets users are auto-confirmed
                    showToast('Account created successfully!', 'success');

                    // Track registration
                    await saveUserAction('user_registered', { email: email });
                } else {
                    throw new Error('Failed to create account');
                }
            } else {
                // Login with Google Sheets
                const user = await authenticateWithSheets(email, password);
                if (user) {
                    currentUser = { email: user.email, id: user.email };
                    currentRole = user.role;
                    emailConfirmed = user.confirmed;
                    showToast('Signed in as ' + user.email, 'success');

                    // Track login
                    await saveUserAction('user_login', { email: user.email, role: user.role });
                } else {
                    showToast('Invalid email or password.', 'error');
                    return false;
                }
            }
        } else {
            // Use Supabase authentication
            if (!supabaseClient) {
                showToast('Supabase not configured.', 'error');
                return false;
            }

            if (authMode === 'register') {
                const { data, error } = await supabaseClient.auth.signUp({ email, password, options: { data: { role } } });
                if (error) {
                    if (error.message && error.message.includes('registered')) {
                        showToast('Email already registered. Try Login.', 'warning');
                        return false;
                    }
                    throw error;
                }
                currentUser = data.user;
                currentRole = role;
                emailConfirmed = !!data.user?.email_confirmed_at;
            } else {
                const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) {
                    if (error.message && error.message.includes('invalid credentials')) {
                        showToast('Invalid email or password.', 'error');
                    } else if (error.message && error.message.includes('already registered')) {
                        showToast('Email already registered. Try Login.', 'warning');
                    }
                    throw error;
                }
                currentUser = data.user;
                currentRole = data.user?.user_metadata?.role || 'student';
                emailConfirmed = !!data.session?.user?.email_confirmed_at;
            }

            if (!emailConfirmed) {
                showToast(t('checkEmail'), 'info');
                await logout();
                return false;
            }
        }

        localStorage.setItem('lastAuthEmail', email);
        closeAuthModal();
        showToast('Welcome, ' + (currentUser?.email || ''), 'success');

        if (emailConfirmed) {
            await sendWelcomeEmail(email);
        }

        await syncProfile(currentRole);
        updateAuthUI();
    } catch (err) {
        showToast('Auth error: ' + err.message, 'error');
    }
    return false;
}

async function sendWelcomeEmail(email) {
    if (!supabaseClient || !email) return;
    const key = `welcomeSent:${email}`;
    if (localStorage.getItem(key)) return;
    try {
        await supabaseClient.functions.invoke('send-welcome-email', { body: { email } });
        localStorage.setItem(key, '1');
    } catch (err) {
        console.warn('Welcome email send failed', err);
    }
}

async function syncProfile(role) {
    if (!supabaseClient || !currentUser) return;
    try {
        await supabaseClient.from('profiles').upsert({
            id: currentUser.id,
            role: role || currentRole || 'student',
            email: currentUser.email
        });
    } catch (_) {}
}

async function loadSession() {
    if (AUTH_METHOD === 'supabase') {
        if (!supabaseClient) return;
        const { data } = await supabaseClient.auth.getSession();
        const session = data?.session;
        if (session?.user) {
            currentUser = session.user;
            currentRole = session.user.user_metadata?.role || 'student';
            emailConfirmed = !!session.user.email_confirmed_at;
            if (emailConfirmed) {
                await sendWelcomeEmail(currentUser.email);
            }
        } else {
            currentUser = null;
            emailConfirmed = false;
        }
    } else {
        // For Google Sheets auth, check if user was previously logged in
        // (we could store this in localStorage if needed)
        currentUser = null;
        emailConfirmed = false;
    }
    updateAuthUI();
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const accountBtn = document.getElementById('accountBtn');
    if (currentUser && emailConfirmed) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (signupBtn) signupBtn.classList.add('hidden');
        if (accountBtn) accountBtn.classList.remove('hidden');
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (signupBtn) signupBtn.classList.remove('hidden');
        if (accountBtn) accountBtn.classList.add('hidden');
    }
    updateTopActionsVisibility();
}

// ==================== MODAL FUNCTIONS ====================
function showModuleModal() {
    const material = document.getElementById('materialInput').value.trim();
    if (!currentUser) { openLogin(); return; }
    
    if (!material) {
        showError(t('errorEmpty'));
        return;
    }

    hideError();
    
    // Parse the input first
    factsData = parseInput(material);
        
    if (factsData.length === 0) {
        showError(t('errorFormat'));
        return;
    }

    // Show modal
    openModalById('moduleModal');
    applyTranslations();
}

function closeModuleModal() {
    closeModalById('moduleModal');
}

async function startLearning() {
    // Get selected modules
    enabledModules.flashcards = document.getElementById('chkFlashcards').checked;
    enabledModules.quiz = document.getElementById('chkQuiz').checked;
    enabledModules.matching = document.getElementById('chkMatching').checked;
    enabledModules.fillBlanks = document.getElementById('chkFillBlanks').checked;

    // Check if at least one module is selected
    if (!enabledModules.flashcards && !enabledModules.quiz && 
        !enabledModules.matching && !enabledModules.fillBlanks) {
        showToast(t('errorSelectModule'), 'warning');
        return;
    }

    closeModuleModal();
    
    // Reset scores
    sectionScores = {
        flashcards: { correct: 0, total: 0, answered: 0 },
        quiz: { correct: 0, total: 0, answered: 0 },
        matching: { correct: 0, total: 0, answered: 0 },
        fillBlanks: { correct: 0, total: 0, answered: 0 }
    };
    
    // Start learning
    document.getElementById('inputSection').classList.add('hidden');
    document.getElementById('learningSection').classList.remove('hidden');
    updateTopActionsVisibility();

    // Track learning start in Google Sheets
    await saveUserAction('learning_started', {
        materialLength: factsData.length,
        modulesSelected: enabledModules
    });
    
    // Reset all navigation buttons visibility for new session
    const finishRow = document.querySelector('.navigation.finish-row');
    if (finishRow) {
        finishRow.style.display = 'flex';
        finishRow.style.visibility = 'visible';
        finishRow.style.opacity = '1';
    }
    
    // Reset module state
    currentModule = -1;
    score = 0;
    totalQuestions = 0;
    matchedPairs = [];
    
    // Go to first enabled module
    nextModule();
}

// History
function saveHistory(material) {
    try {
        localStorage.setItem('lastMaterial', material);
    } catch (_) {}
}

function showHistory() {
    const last = localStorage.getItem('lastMaterial');
    if (last) {
        document.getElementById('materialInput').value = last;
    } else {
        showToast(t('historyEmpty'), 'info');
    }
}

function parseInput(material) {
    const lines = material.split('\n').filter(line => line.trim());
    const facts = [];

    lines.forEach((line, index) => {
        // Remove leading number and dot if present
        let cleanLine = line.replace(/^\d+[\.\)]\s*/, '').trim();
        
        // Split by colon
        const colonIndex = cleanLine.lastIndexOf(':');
        if (colonIndex > 0 && colonIndex < cleanLine.length - 1) {
            const question = cleanLine.substring(0, colonIndex).trim();
            const answer = cleanLine.substring(colonIndex + 1).trim();
            
            if (question && answer) {
                facts.push({
                    index: facts.length + 1,
                    question: question,
                    answer: answer,
                    original: line.trim()
                });
            }
        }
    });
    
    return facts;
}

// Material corrector: try to normalize to "n. question: answer"
function runMaterialCorrector() {
    const input = document.getElementById('materialInput');
    const raw = input.value.trim();
    if (!raw) return;
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const merged = [];
    let buffer = '';
    const numbered = /^\d+[\.\)]/;

    lines.forEach(line => {
        const isNumbered = numbered.test(line);
        const prevEndsWithColon = buffer.trim().endsWith(':');

        if (isNumbered && buffer && prevEndsWithColon) {
            buffer = `${buffer} ; ${line}`;
            return;
        }

        if (isNumbered && buffer) {
            merged.push(buffer);
            buffer = line;
            return;
        }

        if (isNumbered && !buffer) {
            buffer = line;
            return;
        }

        // Not numbered -> continuation of previous
        buffer = buffer ? `${buffer} ${line}` : line;
    });

    if (buffer) merged.push(buffer);

    const fixed = merged.map((line, idx) => {
        let text = line.replace(/^\d+[\.\)]\s*/, '').trim();
        if (!text.includes(':')) {
            const dashSplit = text.split(/[-–—]/);
            if (dashSplit.length >= 2) {
                text = dashSplit[0].trim() + ': ' + dashSplit.slice(1).join('-').trim();
            } else {
                text = text + ': ';
            }
        } else {
            const colonIndex = text.indexOf(':');
            const question = text.substring(0, colonIndex).trim();
            const answer = text.substring(colonIndex + 1).trim().replace(/\s+/g, ' ');
            text = `${question}: ${answer}`;
        }
        return `${idx + 1}. ${text}`;
    }).join('\n');

    input.value = fixed;
    saveHistory(fixed);
}

// OCR helpers
function setOcrStatus(msg) {
    const s = document.getElementById('ocrStatus');
    if (s) s.textContent = msg || '';
}

// Samples modal logic
const defaultSamples = [
    { name: 'Nogai set', text: exampleText },
    { name: 'Simple demo', text: '1. Battle of Waterloo: 1815 Belgium\n2. Great Wall purpose: Protect against invasions' }
];

function loadSamples() {
    const saved = localStorage.getItem('samples');
    if (saved) {
        try { return JSON.parse(saved); } catch (_) { return [...defaultSamples]; }
    }
    return [...defaultSamples];
}

function saveSamples(list) {
    try { localStorage.setItem('samples', JSON.stringify(list)); } catch (_) {}
}

let currentSamples = loadSamples();
let selectedSample = null;

function renderSamples() {
    const list = document.getElementById('samplesList');
    if (!list) return;
    list.innerHTML = currentSamples.map((s, idx) => `
        <div class="modal-option ${selectedSample===idx?'selected-sample':''}" onclick="selectSample(${idx})">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                <div>
                    <strong>${s.name}</strong>
                    <div style="font-size:0.85em; color:#a3b5d7; margin-top:4px;">${(s.text || '').slice(0,80)}...</div>
                </div>
                <div class="modal-option-actions">
                    <button class="mini-btn" style="padding:4px 8px;" onclick="event.stopPropagation(); editSample(${idx});">✏️</button>
                    <button class="mini-btn ghost" style="padding:4px 8px;" onclick="event.stopPropagation(); deleteSample(${idx});">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
        }

function selectSample(idx) {
    selectedSample = idx;
    renderSamples();
}

async function openSamplesModal() {
    currentSamples = loadSamples();
    // Load additional examples from Google Sheets
    await loadSheetsExamples();
    renderSamples();
    openModalById('samplesModal');
}

function togglePassword() {
    const pass = document.getElementById('authPassword');
    const show = document.getElementById('showPassword');
    if (pass && show) {
        pass.type = show.checked ? 'text' : 'password';
    }
}

function addSample() {
    const name = document.getElementById('sampleName').value.trim();
    const text = document.getElementById('sampleText').value.trim();
    if (!name || !text) return;
    currentSamples.push({ name, text });
    saveSamples(currentSamples);
    document.getElementById('sampleName').value = '';
    document.getElementById('sampleText').value = '';
    renderSamples();
}

function insertSample() {
    if (selectedSample == null || selectedSample >= currentSamples.length) return;
    const sample = currentSamples[selectedSample];
    document.getElementById('materialInput').value = sample.text;
    closeModalById('samplesModal');
}

function deleteSample(idx) {
    currentSamples.splice(idx, 1);
    if (selectedSample === idx) selectedSample = null;
    saveSamples(currentSamples);
    renderSamples();
}

function editSample(idx) {
    const sample = currentSamples[idx];
    document.getElementById('sampleName').value = sample.name;
    document.getElementById('sampleText').value = sample.text;
    selectedSample = idx;
    renderSamples();
}

function openFileImport() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput) return;
    fileInput.onchange = () => {
        if (fileInput.files && fileInput.files[0]) {
            processOCR(fileInput.files[0]);
        }
    };
    fileInput.click();
}

function openCameraImport() {
    const cameraInput = document.getElementById('cameraInput');
    if (!cameraInput) return;
    cameraInput.onchange = () => {
        if (cameraInput.files && cameraInput.files[0]) {
            processOCR(cameraInput.files[0]);
        }
    };
    cameraInput.click();
}

async function processOCR(file) {
    if (typeof Tesseract === 'undefined') {
        showToast('Tesseract.js not loaded', 'error');
        return;
    }
    setOcrStatus('OCR in progress...');
    try {
        const { data } = await Tesseract.recognize(file, 'eng+rus');
        const text = (data && data.text) ? data.text.trim() : '';
        if (text) {
            document.getElementById('materialInput').value = text;
            runMaterialCorrector();
            setOcrStatus('OCR complete');
    } else {
            setOcrStatus('OCR: no text recognized');
        }
    } catch (err) {
        console.error(err);
        setOcrStatus('OCR error: ' + err.message);
    }
}

// ==================== MODULE MANAGEMENT ====================
function getEnabledModulesList() {
    const modules = [];
    let num = 1;
    if (enabledModules.flashcards) modules.push({ id: 'flashcardsModule', titleKey: 'moduleFlashcards', init: initFlashcards, key: 'flashcards', num: num++ });
    if (enabledModules.quiz) modules.push({ id: 'quizModule', titleKey: 'moduleQuiz', init: initQuiz, key: 'quiz', num: num++ });
    if (enabledModules.matching) modules.push({ id: 'matchingModule', titleKey: 'moduleMatching', init: initMatching, key: 'matching', num: num++ });
    if (enabledModules.fillBlanks) modules.push({ id: 'fillBlanksModule', titleKey: 'moduleFillBlanks', init: initFillBlanks, key: 'fillBlanks', num: num++ });
    return modules;
}

function showModule(moduleIndex) {
    const modules = getEnabledModulesList();
    if (moduleIndex < 0 || moduleIndex >= modules.length) {
        // Mark as completion state
        currentModule = modules.length;
        document.querySelectorAll('.learning-module').forEach(m => m.classList.remove('active'));
        document.getElementById('completionModule').classList.add('active');
        document.getElementById('moduleTitle').textContent = t('resultsTitle');
        document.getElementById('prevModuleBtn').style.display = 'none';
        document.getElementById('nextModuleBtn').style.display = 'none';
        document.getElementById('finishBtn').style.display = 'none';
        showCompletion();
        updateModuleNavigation();
        return;
    }

    document.querySelectorAll('.learning-module').forEach(m => m.classList.remove('active'));
    currentModule = moduleIndex;
    const moduleInfo = modules[moduleIndex];
    document.getElementById('moduleTitle').textContent = `${moduleInfo.num}-${t('moduleTitle')}: ${t(moduleInfo.titleKey)}`;
    document.getElementById(moduleInfo.id).classList.add('active');
    updateProgress();
    updateScoreDisplay();
    updateModuleNavigation();
    moduleInfo.init();
}
        
function updateProgress() {
    const modules = getEnabledModulesList();
    const progress = modules.length > 0 ? Math.min(((currentModule + 1) / modules.length) * 100, 100) : 0;
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressBar').textContent = Math.round(progress) + '%';
}

function updateScoreDisplay() {
    document.getElementById('scoreValue').textContent = score;
    document.getElementById('totalValue').textContent = totalQuestions;
    const percent = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    document.getElementById('percentValue').textContent = percent + '%';
}

function updateModuleNavigation() {
    const modules = getEnabledModulesList();
    const prevModuleBtn = document.getElementById('prevModuleBtn');
    const nextModuleBtn = document.getElementById('nextModuleBtn');
    const finishRow = document.querySelector('.navigation.finish-row');
    const finishBtn = document.getElementById('finishBtn');
    
    // Hide navigation buttons on completion page
    if (currentModule >= modules.length) {
        if (prevModuleBtn) prevModuleBtn.style.display = 'none';
        if (nextModuleBtn) nextModuleBtn.style.display = 'none';
        if (finishRow) finishRow.style.display = 'none';
        if (finishBtn) finishBtn.style.display = 'none';
        return;
    }
    
    // Hide prev button if at first module
    if (prevModuleBtn) prevModuleBtn.style.display = currentModule <= 0 ? 'none' : 'inline-block';
    
    // Hide next button if at last module or only one module
    if (nextModuleBtn) nextModuleBtn.style.display = (currentModule >= modules.length - 1 || modules.length <= 1) ? 'none' : 'inline-block';
    
    // Always show finish button row and button in learning pages
    if (finishRow) finishRow.style.display = 'flex';
    if (finishBtn) finishBtn.style.display = 'inline-block';
}

function previousModule() {
    if (currentModule > 0) {
        showModule(currentModule - 1);
    }
}

function nextModule() {
    const modules = getEnabledModulesList();
    if (currentModule < modules.length - 1) {
        showModule(currentModule + 1);
    } else {
        showModule(modules.length); // Show completion
    }
}

// Finish and go to results - count unanswered as wrong
function finishAndShowResults() {
    // Calculate unanswered questions and count them as wrong
    
    // Flashcards - unanswered cards
    if (enabledModules.flashcards) {
        const unansweredFlash = sectionScores.flashcards.total - sectionScores.flashcards.answered;
        // Already counted in totalQuestions when answered
    }
    
    // Quiz - check for unanswered questions
    if (enabledModules.quiz) {
        const quizOptions = document.querySelectorAll('#quizContainer .options');
        quizOptions.forEach((optContainer, index) => {
            const hasAnswered = optContainer.querySelector('.option.correct') || optContainer.querySelector('.option.incorrect');
            if (!hasAnswered) {
                // Mark as unanswered (wrong)
                sectionScores.quiz.answered++;
                // totalQuestions already includes this
            }
        });
    }
    
    // Matching - unanswered matches count as wrong
    if (enabledModules.matching) {
        const unansweredMatches = sectionScores.matching.total - matchedPairs.length;
        // These are already in totalQuestions
    }
    
    // Fill blanks - unanswered
    if (enabledModules.fillBlanks) {
        // Already tracked
    }
    
    // Go to results
    const modules = getEnabledModulesList();
    showModule(modules.length);
}

function resetLearning() {
    document.getElementById('learningSection').classList.add('hidden');
    document.getElementById('homeSection').classList.add('hidden');
    document.getElementById('inputSection').classList.remove('hidden');
    document.querySelectorAll('.learning-module').forEach(m => m.classList.remove('active'));
    
    // Reset finish button visibility for next session
    const finishRow = document.querySelector('.navigation.finish-row');
    const finishBtn = document.getElementById('finishBtn');
    if (finishRow) {
        finishRow.style.display = 'flex';
        finishRow.removeAttribute('style'); // Clear all inline styles
        finishRow.style.display = 'flex'; // Re-apply flex
    }
    if (finishBtn) {
        finishBtn.style.display = 'inline-block';
        finishBtn.removeAttribute('style'); // Clear all inline styles  
    }
    
    // Reset all navigation buttons
    const prevModuleBtn = document.getElementById('prevModuleBtn');
    const nextModuleBtn = document.getElementById('nextModuleBtn');
    if (prevModuleBtn) prevModuleBtn.removeAttribute('style');
    if (nextModuleBtn) nextModuleBtn.removeAttribute('style');
    
    factsData = [];
    currentModule = 0;
    score = 0;
    totalQuestions = 0;
    matchedPairs = [];
    updateTopActionsVisibility();
}

// ==================== MODULE 1: FLASHCARDS ====================
function initFlashcards() {
    currentCard = 0;
    sectionScores.flashcards = { correct: 0, total: factsData.length, answered: 0 };
    showFlashcard(0);
}

function showFlashcard(index) {
    if (index < 0 || index >= factsData.length) return;
    
    const container = document.getElementById('flashcardContainer');
    const fact = factsData[index];
    
    document.getElementById('cardCounter').textContent = `${index + 1} / ${factsData.length}`;
    
    // Update card navigation buttons
    updateCardNavigation();
    
    container.innerHTML = `
        <div class="flashcard-wrapper">
            <div class="flashcard" id="currentFlashcard" onclick="flipCard()">
                <div class="flashcard-face flashcard-front">
                    <div class="flashcard-question">${fact.question}:</div>
                    <div class="flashcard-hint">${t('flashcardHint')}</div>
                </div>
                <div class="flashcard-face flashcard-back">
                    <div class="flashcard-answer">${fact.answer}</div>
                    <div class="flashcard-hint">${t('flashcardBackHint')}</div>
                </div>
            </div>
        </div>
        <div class="flashcard-scoring" id="flashcardScoring" style="display: none;">
            <button class="score-btn knew" onclick="scoreFlashcard(true)">${t('flashcardKnew')}</button>
            <button class="score-btn didnt-know" onclick="scoreFlashcard(false)">${t('flashcardDidntKnow')}</button>
        </div>
    `;
}

function updateCardNavigation() {
    const prevBtn = document.getElementById('prevCardBtn');
    const nextBtn = document.getElementById('nextCardBtn');
    
    if (prevBtn) {
        prevBtn.style.display = currentCard <= 0 ? 'none' : 'inline-block';
    }
    if (nextBtn) {
        nextBtn.style.display = currentCard >= factsData.length - 1 ? 'none' : 'inline-block';
    }
}

function flipCard() {
    const card = document.getElementById('currentFlashcard');
    card.classList.toggle('flipped');
    
    // Show scoring buttons when flipped to answer
    const scoringDiv = document.getElementById('flashcardScoring');
    if (card.classList.contains('flipped')) {
        scoringDiv.style.display = 'flex';
    } else {
        scoringDiv.style.display = 'none';
    }
}

function scoreFlashcard(knew) {
    totalQuestions++;
    sectionScores.flashcards.answered++;
    if (knew) {
        score++;
        sectionScores.flashcards.correct++;
    }
    updateScoreDisplay();
    
    // Auto go to next card
    if (currentCard < factsData.length - 1) {
        currentCard++;
        showFlashcard(currentCard);
    } else {
        // All cards done - show message
        document.getElementById('flashcardContainer').innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 3em; margin-bottom: 15px;">🎉</div>
                <h3 style="color: #9bf4b5;">${t('flashcardsDone')}</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">${t('flashcardsNextModule')}</p>
            </div>
        `;
        // Hide card navigation
        document.getElementById('prevCardBtn').style.display = 'none';
        document.getElementById('nextCardBtn').style.display = 'none';
    }
}

function previousCard() {
    if (currentCard > 0) {
        currentCard--;
        showFlashcard(currentCard);
    }
}

function nextCard() {
    if (currentCard < factsData.length - 1) {
        currentCard++;
        showFlashcard(currentCard);
    }
}

// ==================== MODULE 2: QUIZ ====================
function initQuiz() {
    const container = document.getElementById('quizContainer');
    container.innerHTML = '';
    
    sectionScores.quiz = { correct: 0, total: factsData.length, answered: 0 };
    totalQuestions += factsData.length;

    factsData.forEach((fact, index) => {
        const questionBox = document.createElement('div');
        questionBox.className = 'question-box';
        questionBox.dataset.answered = 'false';
        
        const options = generateQuizOptions(fact, index);
        
        questionBox.innerHTML = `
            <h3>${t('quizQuestion')} ${index + 1}</h3>
            <div class="question-text">${fact.question}:</div>
            <div class="options" id="options-${index}">
                ${options.map((opt, i) => `
                    <div class="option" onclick="checkQuizAnswer(${index}, ${i}, '${escapeHtml(fact.answer)}')">${opt}</div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(questionBox);
    });
    
    updateScoreDisplay();
}

function generateQuizOptions(fact, factIndex) {
    const correctAnswer = fact.answer;
    const options = [correctAnswer];
    
    // Generate contextually relevant wrong answers
    const wrongAnswers = generateWrongAnswers(fact, factIndex);
    
    wrongAnswers.forEach(wrong => {
        if (!options.includes(wrong) && options.length < 4) {
            options.push(wrong);
        }
    });
    
    // Fill with generic wrong answers if needed
    let attempts = 0;
    while (options.length < 4 && attempts < 50) {
        const randomFact = factsData[Math.floor(Math.random() * factsData.length)];
        if (randomFact.answer !== correctAnswer && !options.includes(randomFact.answer)) {
            options.push(randomFact.answer);
        }
        attempts++;
    }
    
    return shuffleArray(options);
}

function generateWrongAnswers(fact, factIndex) {
    const wrongAnswers = [];
    const answer = fact.answer.toLowerCase();
    const question = fact.question.toLowerCase();
    const correctAnswer = fact.answer;
    
    // Helper to create similar but wrong answers
    function addSimilarAnswers(patterns) {
        patterns.forEach(p => {
            if (!wrongAnswers.includes(p) && p.toLowerCase() !== answer) {
                wrongAnswers.push(p);
            }
        });
    }
    
    // 1. GEOGRAPHIC/LOCATION patterns - rivers, regions
    if (answer.includes('еділ') || answer.includes('жайық') || answer.includes('аралығында') ||
        question.includes('аумағы') || question.includes('жер') || question.includes('қай жерде')) {
        addSimilarAnswers([
            'Сырдария мен Амудария аралығында болды',
            'Шу мен Талас аралығында болды',
            'Ертіс пен Есіл аралығында болды',
            'Жайық пен Орал аралығында болды',
            'Дон мен Еділ аралығында болды',
            'Тобыл мен Ертіс аралығында болды'
        ]);
    }
    
    // 2. TIME/CENTURY patterns
    if (answer.includes('ғасыр') || question.includes('қашан') || question.includes('кезең') ||
        question.includes('уақыт') || answer.includes('жыл')) {
        // Extract century number if present
        const centuryMatch = answer.match(/([XIV]+)\s*ғасыр/i);
        if (centuryMatch) {
            const centuries = ['XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII'];
            const timePeriods = ['бірінші жартысында', 'екінші жартысында', 'ортасында', 'басында', 'соңында'];
            centuries.forEach(c => {
                timePeriods.forEach(t => {
                    const variant = `${c} ғасырдың ${t}`;
                    if (variant.toLowerCase() !== answer) {
                        wrongAnswers.push(variant);
                    }
                });
            });
        } else {
            addSimilarAnswers([
                'XIII ғасырдың бірінші жартысында',
                'XIV ғасырдың екінші жартысында', 
                'XV ғасырдың ортасында',
                'XVI ғасырдың басында',
                'XVII ғасырдың соңында',
                'XII ғасырдың екінші жартысында'
            ]);
        }
    }
    
    // 3. HISTORICAL FIGURES - khans, batyrs, leaders
    if (answer.includes('хан') || answer.includes('батыр') || answer.includes('бек') ||
        answer.includes('би') || question.includes('кім') || question.includes('басқарды')) {
        const historicalFigures = [
            'Едіге', 'Тоқтамыс', 'Өзбек хан', 'Жәнібек', 'Керей',
            'Абылай хан', 'Тәуке хан', 'Қасым хан', 'Есім хан',
            'Нұраддин', 'Ноғай', 'Бату хан', 'Жошы',
            'Қамбар батыр', 'Ер Тарғын', 'Қобыланды батыр'
        ];
        addSimilarAnswers(historicalFigures.filter(f => f.toLowerCase() !== answer));
    }
    
    // 4. STATE/HORDE names
    if (answer.includes('орда') || answer.includes('хандығы') || answer.includes('мемлекет') ||
        question.includes('мемлекет') || question.includes('орда')) {
        addSimilarAnswers([
            'Қазақ хандығы', 'Алтын Орда', 'Ақ Орда', 'Көк Орда',
            'Ноғай Ордасы', 'Сібір хандығы', 'Қырым хандығы',
            'Маңғыт жұрты', 'Өзбек хандығы', 'Моғолстан'
        ]);
    }
    
    // 5. CITIES/CAPITALS
    if (answer.includes('қала') || question.includes('орталығы') || question.includes('астана') ||
        answer.includes('сарайшық') || answer.includes('атырау')) {
        addSimilarAnswers([
            'Сарайшық қаласында орналасты',
            'Сығанақ қаласында орналасты',
            'Түркістан қаласында орналасты',
            'Отырар қаласында орналасты',
            'Сарай қаласында орналасты',
            'Үргеніш қаласында орналасты'
        ]);
    }
    
    // 6. TRIBAL/ETHNIC groups
    if (answer.includes('тайпа') || answer.includes('ру') || answer.includes('маңғыт') ||
        question.includes('тұрғындары') || question.includes('халқы')) {
        addSimilarAnswers([
            'маңғыттар тайпасы', 'қыпшақтар тайпасы', 'найман тайпасы',
            'керей тайпасы', 'жалайыр тайпасы', 'қоңырат тайпасы',
            'арғын тайпасы', 'дулат тайпасы'
        ]);
    }
    
    // 7. POSITIONS/TITLES
    if (answer.includes('лауазым') || answer.includes('бек') || question.includes('лауазым') ||
        question.includes('орын') || question.includes('маңызды')) {
        addSimilarAnswers([
            'беклербек', 'нұраддин', 'мырза', 'бек', 'би',
            'уәзір', 'қолбасшы', 'батыр', 'сұлтан'
        ]);
    }
    
    // 8. EVENTS/PROCESSES
    if (question.includes('болды') || question.includes('оқиға') || question.includes('себеп')) {
        // Find answers from other questions that are similar in structure
        factsData.forEach((f, i) => {
            if (i !== factIndex) {
                // Check if the answers have similar structure/length
                const answerWords = correctAnswer.split(' ').length;
                const otherWords = f.answer.split(' ').length;
                if (Math.abs(answerWords - otherWords) <= 2) {
                    wrongAnswers.push(f.answer);
                }
            }
        });
    }
    
    // 9. Find semantically similar answers from other facts
    // Prioritize answers from facts with similar question patterns
    factsData.forEach((f, i) => {
        if (i !== factIndex && wrongAnswers.length < 20) {
            // Check if questions have similar keywords
            const questionWords = question.split(' ');
            const otherQuestionWords = f.question.toLowerCase().split(' ');
            const commonWords = questionWords.filter(w => 
                w.length > 3 && otherQuestionWords.includes(w)
            );
            
            // If questions are related, the answer might be a good distractor
            if (commonWords.length >= 1 && f.answer.toLowerCase() !== answer) {
                // Insert at beginning for higher priority
                wrongAnswers.unshift(f.answer);
            }
        }
    });
    
    // 10. As last resort, add remaining answers from other facts
    factsData.forEach((f, i) => {
        if (i !== factIndex && wrongAnswers.length < 25) {
            if (!wrongAnswers.includes(f.answer) && f.answer.toLowerCase() !== answer) {
                wrongAnswers.push(f.answer);
            }
        }
    });
    
    // Shuffle and return unique answers
    return [...new Set(wrongAnswers)];
}

function checkQuizAnswer(questionIndex, optionIndex, correctAnswer) {
    const optionsContainer = document.getElementById(`options-${questionIndex}`);
    if (!optionsContainer) return;
    
    // Check if already answered
    const questionBox = optionsContainer.closest('.question-box');
    if (questionBox.dataset.answered === 'true') return;
    questionBox.dataset.answered = 'true';
    
    const options = optionsContainer.querySelectorAll('.option');
    const selectedOption = options[optionIndex];
    const selectedText = selectedOption.textContent.trim();
    
    options.forEach(option => {
        option.classList.add('disabled');
        if (option.textContent.trim() === correctAnswer) {
            option.classList.add('correct');
        }
    });
    
    sectionScores.quiz.answered++;
    
    if (selectedText === correctAnswer) {
        score++;
        sectionScores.quiz.correct++;
    } else {
        selectedOption.classList.add('incorrect');
    }
    
    updateScoreDisplay();
}

// ==================== MODULE 3: MATCHING ====================
function initMatching() {
    const container = document.getElementById('matchingContainer');
    matchedPairs = [];
    selectedMatchItem = null;
    
    sectionScores.matching = { correct: 0, total: factsData.length, answered: 0 };
    totalQuestions += factsData.length;
    
    renderMatching();
    updateScoreDisplay();
}

function renderMatching() {
    const container = document.getElementById('matchingContainer');
    
    // Get unmatched facts
    const unmatchedFacts = factsData.filter(f => !matchedPairs.includes(f.index));
    
    let html = `<h3>${t('matchingTitle')}</h3>`;
    
    // Show matched pairs at top
    if (matchedPairs.length > 0) {
        html += '<div class="matched-pairs">';
        matchedPairs.forEach(factIndex => {
            const fact = factsData.find(f => f.index === factIndex);
            html += `
                <div class="matched-pair">
                    <div class="question-side">${fact.question}</div>
                    <div class="answer-side">${fact.answer}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    // Show unmatched items
    if (unmatchedFacts.length > 0) {
        const shuffledQuestions = shuffleArray([...unmatchedFacts]);
        const shuffledAnswers = shuffleArray([...unmatchedFacts]);
        
        html += `
            <div class="matching-game">
                <div class="matching-column" id="leftColumn">
                    <h4>${t('matchingQuestions')}</h4>
                    ${shuffledQuestions.map(fact => `
                        <div class="matching-item" data-fact-index="${fact.index}" data-side="left" onclick="selectMatchItem(this)">
                            ${fact.question}
                        </div>
                    `).join('')}
                </div>
                <div class="matching-column" id="rightColumn">
                    <h4>${t('matchingAnswers')}</h4>
                    ${shuffledAnswers.map(fact => `
                        <div class="matching-item" data-fact-index="${fact.index}" data-side="right" onclick="selectMatchItem(this)">
                            ${fact.answer}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        html += `
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 3em; margin-bottom: 15px;">🎉</div>
                <h3 style="color: #28a745;">${t('matchingDone')}</h3>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function selectMatchItem(item) {
    const side = item.dataset.side;
    const factIndex = item.dataset.factIndex;
    
    if (!selectedMatchItem) {
        item.classList.add('selected');
        selectedMatchItem = { element: item, side, factIndex };
    } else if (selectedMatchItem.side === side) {
        // Same side - switch selection
        selectedMatchItem.element.classList.remove('selected');
        item.classList.add('selected');
        selectedMatchItem = { element: item, side, factIndex };
    } else {
        // Different sides - check match
        if (selectedMatchItem.factIndex === factIndex) {
            // Correct match!
            matchedPairs.push(parseInt(factIndex));
            score++;
            sectionScores.matching.correct++;
            sectionScores.matching.answered++;
            updateScoreDisplay();
            
            // Re-render to move matched pair to top
            setTimeout(() => {
                renderMatching();
            }, 300);
        } else {
            // Wrong match
            item.classList.add('wrong');
            selectedMatchItem.element.classList.add('wrong');
            
            setTimeout(() => {
                item.classList.remove('wrong');
                selectedMatchItem.element.classList.remove('wrong', 'selected');
                selectedMatchItem = null;
            }, 500);
            return;
        }
        selectedMatchItem = null;
    }
}

// ==================== MODULE 4: FILL BLANKS WITH SYMBOLS ====================
function initFillBlanks() {
    currentFillIndex = 0;
    sectionScores.fillBlanks = { correct: 0, total: factsData.length, answered: 0 };
    totalQuestions += factsData.length;
    showFillBlankQuestion(0);
    updateScoreDisplay();
}

function showFillBlankQuestion(index) {
    if (index >= factsData.length) {
        // All questions done
        const container = document.getElementById('fillBlanksContainer');
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 3em; margin-bottom: 15px;">🎉</div>
                <h3 style="color: #9bf4b5;">${t('fillBlanksDone')}</h3>
                <p style="color: var(--text-muted); margin-top: 10px;">${t('fillBlanksNext')}</p>
            </div>
        `;
        return;
    }
    
    const container = document.getElementById('fillBlanksContainer');
    const fact = factsData[index];
    currentFillIndex = index;
    
    // Get answer symbols
    const answerSymbols = fact.answer.split('');
    const shuffledSymbols = shuffleArray([...answerSymbols]);
    
    container.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 15px;">${t('fillBlanksTitle')} (${index + 1}/${factsData.length})</h3>
        <div class="fill-blank-box" data-answered="false">
            <div class="fill-question">${fact.question}:</div>
            <div class="answer-display" id="answerDisplay-${index}"></div>
            <div class="symbol-buttons" id="symbolButtons-${index}">
                ${shuffledSymbols.map((symbol, i) => `
                    <button class="symbol-btn" onclick="addSymbol(${index}, '${escapeHtml(symbol)}', this)">${symbol}</button>
                `).join('')}
            </div>
            <div class="fill-actions">
                <button onclick="clearAnswer(${index})">${t('fillBlanksClear')}</button>
                <button onclick="checkFillAnswer(${index}, '${escapeHtml(fact.answer)}')">${t('fillBlanksCheck')}</button>
                ${index < factsData.length - 1 ? `<button onclick="skipToNextFill(${index + 1})">${t('fillBlanksSkip')}</button>` : ''}
            </div>
        </div>
    `;
}

function addSymbol(index, symbol, button) {
    const display = document.getElementById(`answerDisplay-${index}`);
    if (display && !button.classList.contains('used')) {
        display.textContent += symbol;
        button.classList.add('used');
    }
}

function clearAnswer(index) {
    const display = document.getElementById(`answerDisplay-${index}`);
    const buttonsContainer = document.getElementById(`symbolButtons-${index}`);
    
    if (display) {
        display.textContent = '';
        display.classList.remove('correct', 'incorrect');
    }
    
    if (buttonsContainer) {
        buttonsContainer.querySelectorAll('.symbol-btn').forEach(btn => {
            btn.classList.remove('used');
        });
    }
}

function checkFillAnswer(index, correctAnswer) {
    const fillBox = document.querySelector(`#fillBlanksContainer .fill-blank-box`);
    if (fillBox && fillBox.dataset.answered === 'true') return;
    if (fillBox) fillBox.dataset.answered = 'true';
    
    const display = document.getElementById(`answerDisplay-${index}`);
    const userAnswer = display.textContent.trim();
    
    sectionScores.fillBlanks.answered++;
    
    if (userAnswer === correctAnswer) {
        display.classList.add('correct');
        score++;
        sectionScores.fillBlanks.correct++;
        updateScoreDisplay();
        
        // Auto go to next after delay
        setTimeout(() => {
            if (index < factsData.length - 1) {
                showFillBlankQuestion(index + 1);
            } else {
                showFillBlankQuestion(factsData.length); // Show completion message
            }
        }, 1000);
    } else {
        display.classList.add('incorrect');
        // Show correct answer after a moment
        setTimeout(() => {
            display.textContent = correctAnswer;
        }, 1000);
    }
    
    // Disable buttons
    const buttonsContainer = document.getElementById(`symbolButtons-${index}`);
    if (buttonsContainer) {
        buttonsContainer.querySelectorAll('.symbol-btn').forEach(btn => {
            btn.classList.add('used');
        });
    }
}

function skipToNextFill(nextIndex) {
    // Mark current as answered (wrong since skipped)
    sectionScores.fillBlanks.answered++;
    showFillBlankQuestion(nextIndex);
}

// ==================== COMPLETION ====================
async function showCompletion() {
    const statsContainer = document.getElementById('completionStats');

    // Save learning results to Google Sheets
    await saveLearningResults();
    
    // Update completion titles
    const completionH2 = document.querySelector('#completionModule .completion-screen h2');
    const completionP = document.querySelector('#completionModule .completion-screen > p');
    if (completionH2) completionH2.textContent = t('completionTitle');
    if (completionP) completionP.textContent = t('completionSubtitle');
    
    // Recalculate totals based on actual answered questions
    let totalCorrect = 0;
    let totalAll = 0;
    if (enabledModules.flashcards) { totalCorrect += sectionScores.flashcards.correct; totalAll += sectionScores.flashcards.total; }
    if (enabledModules.quiz) { totalCorrect += sectionScores.quiz.correct; totalAll += sectionScores.quiz.total; }
    if (enabledModules.matching) { totalCorrect += sectionScores.matching.correct; totalAll += sectionScores.matching.total; }
    if (enabledModules.fillBlanks) { totalCorrect += sectionScores.fillBlanks.correct; totalAll += sectionScores.fillBlanks.total; }
    const sectionInfo = [
        { key: 'flashcards', name: t('moduleFlashcards'), icon: '📇', enabled: enabledModules.flashcards },
        { key: 'quiz', name: t('moduleQuiz'), icon: '✅', enabled: enabledModules.quiz },
        { key: 'matching', name: t('moduleMatching'), icon: '🔗', enabled: enabledModules.matching },
        { key: 'fillBlanks', name: t('moduleFillBlanks'), icon: '✏️', enabled: enabledModules.fillBlanks }
    ];
    const gradeClass = (pct) => pct >= 80 ? 'excellent' : pct >= 60 ? 'good' : pct >= 40 ? 'average' : 'poor';

    let html = `<div class="section-results"><h3>${t('completionResultsTitle')}</h3>`;
    sectionInfo.forEach(section => {
        if (!section.enabled) return;
        const data = sectionScores[section.key];
        const pct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
        const g = gradeClass(pct);
        html += `
            <div class="section-result-item">
                <div class="section-icon">${section.icon}</div>
                <div class="section-info">
                    <div class="section-name">${section.name}</div>
                    <div class="section-score">${data.correct} / ${data.total} ${t('completionCorrect')}</div>
                    <div class="section-progress">
                        <div class="section-progress-fill ${g}" style="width:${pct}%"></div>
                    </div>
                </div>
                <div class="section-percent ${g}">${pct}%</div>
            </div>
        `;
    });
    html += '</div>';
    statsContainer.innerHTML = html;
}

// ==================== UTILITY FUNCTIONS ====================
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// ==================== WELCOME MODAL ====================
function closeWelcomeModal() {
    closeModalById('welcomeModal');
    localStorage.setItem('welcomeDismissed', '1');
}

function checkWelcomeModal() {
    const dismissed = localStorage.getItem('welcomeDismissed');
    const welcomeModal = document.getElementById('welcomeModal');
    if (!welcomeModal) return;
    
    if (!dismissed) {
        // Show welcome modal for first-time visitors
        welcomeModal.classList.add('active');
        document.body.classList.add('modal-active');
    } else {
        // Don't show for returning visitors
        welcomeModal.classList.remove('active');
    }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
    initLanguageSwitcher();
    // Default view: homeSection shown, learning hidden
    document.getElementById('homeSection')?.classList.remove('hidden');
    document.getElementById('inputSection')?.classList.add('hidden');
    applyTranslations();
    updateTopActionsVisibility();
    loadSession();
    renderAuthStep();
    checkWelcomeModal();

    // Load Google Sheets data on startup (with timeout for GitHub Pages)
    try {
        // Set a timeout for the data loading to prevent hanging on slow networks
        const dataPromise = loadSheetsData();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
        );

        await Promise.race([dataPromise, timeoutPromise]);
        console.log('Sheets data loaded successfully');
    } catch (error) {
        console.log('Sheets data loading failed, using fallback data:', error.message);
        // Ensure we have fallback data available
        if (!sheetsData || sheetsData.length === 0) {
            sheetsData = fallbackSheetsData;
        }
    }

    // Track user actions (don't fail if this doesn't work)
    try {
        await saveUserAction('app_loaded');
    } catch (error) {
        console.log('User action tracking failed:', error.message);
    }
});

function t(key) {
    return (i18n[currentLang] && i18n[currentLang][key]) || (i18n['en'] && i18n['en'][key]) || key;
}

function applyTranslations() {
    const set = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.textContent = t(key);
    };
    
    // Header buttons
    set('loginBtn', 'loginBtn');
    set('signupBtn', 'signupBtn');
    set('accountBtn', 'accountBtn');
    
    // Home section
    set('homeTitle', 'homeTitle');
    set('homeSubtitle', 'homeSubtitle');
    set('feature1Title', 'feature1Title');
    set('feature1Desc', 'feature1Desc');
    set('feature2Title', 'feature2Title');
    set('feature2Desc', 'feature2Desc');
    set('feature3Title', 'feature3Title');
    set('feature3Desc', 'feature3Desc');
    
    // Input section
    set('inputTitle', 'inputTitle');
    set('scanBtn', 'scan');
    set('uploadBtn', 'upload');
    set('correctBtn', 'correct');
    set('historyBtn', 'history');
    set('startBtn', 'start');
    set('loadBtn', 'load');
    set('clearBtn', 'clear');
    set('formatTitle', 'formatTitle');
    set('formatText', 'formatText');
    set('formatExample', 'formatExample');
    
    // Learning section
    set('scoreLabelCorrect', 'scoreCorrect');
    set('scoreLabelTotal', 'scoreTotal');
    set('scoreLabelAccuracy', 'scoreAcc');
    set('prevModuleBtn', 'prevModule');
    set('nextModuleBtn', 'nextModule');
    set('finishBtn', 'finish');
    set('resetBtn', 'reset');
    set('prevCardBtn', 'prevCard');
    set('nextCardBtn', 'nextCard');
    
    // Module modal
    const moduleModalTitle = document.querySelector('#moduleModal h3');
    if (moduleModalTitle) moduleModalTitle.textContent = t('moduleModalTitle');
    
    const chkFlashcardsLabel = document.querySelector('label[for="chkFlashcards"]');
    if (chkFlashcardsLabel) chkFlashcardsLabel.textContent = t('moduleFlashcards');
    
    const chkQuizLabel = document.querySelector('label[for="chkQuiz"]');
    if (chkQuizLabel) chkQuizLabel.textContent = t('moduleQuiz');
    
    const chkMatchingLabel = document.querySelector('label[for="chkMatching"]');
    if (chkMatchingLabel) chkMatchingLabel.textContent = t('moduleMatching');
    
    const chkFillBlanksLabel = document.querySelector('label[for="chkFillBlanks"]');
    if (chkFillBlanksLabel) chkFillBlanksLabel.textContent = t('moduleFillBlanks');
    
    const moduleButtons = document.querySelectorAll('#moduleModal .modal-buttons button');
    if (moduleButtons.length >= 2) {
        moduleButtons[0].textContent = t('moduleCancel');
        moduleButtons[1].textContent = t('moduleStart');
    }
    
    // FAQ
    set('faqTitle', 'faqTitle');
    const faqTextEl = document.getElementById('faqText');
    if (faqTextEl) {
        faqTextEl.innerHTML = t('faqHtml');
    }
    
    // Samples modal
    set('samplesTitle', 'samplesTitle');
    const sampleNameInput = document.getElementById('sampleName');
    if (sampleNameInput) sampleNameInput.placeholder = t('sampleNamePlaceholder');
    const sampleTextInput = document.getElementById('sampleText');
    if (sampleTextInput) sampleTextInput.placeholder = t('sampleTextPlaceholder');
    
    const samplesButtons = document.querySelectorAll('#samplesModal .modal-buttons button');
    if (samplesButtons.length >= 2) {
        samplesButtons[0].textContent = t('sampleAdd');
        samplesButtons[1].textContent = t('sampleInsert');
    }
    
    // Account modal
    const accountTitle = document.getElementById('accountTitle');
    if (accountTitle) accountTitle.textContent = t('accountTitle');
    
    const logoutBtnInModal = document.querySelector('#accountModal .modal-buttons button');
    if (logoutBtnInModal) logoutBtnInModal.textContent = t('logoutBtn');
    
    // Material input placeholder
    const mat = document.getElementById('materialInput');
    if (mat) mat.placeholder = t('placeholder');
    
    // Welcome modal
    set('welcomeTitle', 'welcomeTitle');
    set('welcomeText1', 'welcomeText1');
    set('welcomeText2', 'welcomeText2');
    set('welcomeText3', 'welcomeText3');
    set('welcomeBtn', 'welcomeBtn');
}
