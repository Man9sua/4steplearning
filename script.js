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
function loadExample() {
    document.getElementById('materialInput').value = exampleText;
}

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

// ==================== MODAL FUNCTIONS ====================
function showModuleModal() {
    const material = document.getElementById('materialInput').value.trim();
    
    if (!material) {
        showError('Материалды енгізіңіз');
        return;
    }

    hideError();
    
    // Parse the input first
    factsData = parseInput(material);
    
    if (factsData.length === 0) {
        showError('Материал форматы дұрыс емес. Әрбір жолда "сұрақ: жауап" форматы болуы керек.');
        return;
    }

    // Show modal
    document.getElementById('moduleModal').classList.add('active');
}

function closeModal() {
    document.getElementById('moduleModal').classList.remove('active');
}

function startLearning() {
    // Get selected modules
    enabledModules.flashcards = document.getElementById('chkFlashcards').checked;
    enabledModules.quiz = document.getElementById('chkQuiz').checked;
    enabledModules.matching = document.getElementById('chkMatching').checked;
    enabledModules.fillBlanks = document.getElementById('chkFillBlanks').checked;

    // Check if at least one module is selected
    if (!enabledModules.flashcards && !enabledModules.quiz && 
        !enabledModules.matching && !enabledModules.fillBlanks) {
        alert('Кем дегенде бір модульді таңдаңыз!');
        return;
    }

    closeModal();
    
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
    
    currentModule = -1;
    score = 0;
    totalQuestions = 0;
    matchedPairs = [];
    
    // Go to first enabled module
    nextModule();
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

// ==================== MODULE MANAGEMENT ====================
function getEnabledModulesList() {
    const modules = [];
    if (enabledModules.flashcards) modules.push({ id: 'flashcardsModule', title: '1-модуль: Флэш-карталар', init: initFlashcards, key: 'flashcards' });
    if (enabledModules.quiz) modules.push({ id: 'quizModule', title: '2-модуль: Тест', init: initQuiz, key: 'quiz' });
    if (enabledModules.matching) modules.push({ id: 'matchingModule', title: '3-модуль: Сәйкестендіру', init: initMatching, key: 'matching' });
    if (enabledModules.fillBlanks) modules.push({ id: 'fillBlanksModule', title: '4-модуль: Әріптерді жинау', init: initFillBlanks, key: 'fillBlanks' });
    return modules;
}

function showModule(moduleIndex) {
    const modules = getEnabledModulesList();
    
    if (moduleIndex < 0 || moduleIndex >= modules.length) {
        // Mark as completion state
        currentModule = modules.length;
        // Show completion
        document.querySelectorAll('.learning-module').forEach(m => m.classList.remove('active'));
        document.getElementById('completionModule').classList.add('active');
        document.getElementById('moduleTitle').textContent = 'Нәтижелер';
        // Hide navigation buttons on results screen
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
    
    document.getElementById('moduleTitle').textContent = moduleInfo.title;
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
    const finishBtn = document.getElementById('finishBtn');
    
    // Hide navigation buttons on completion page
    if (currentModule >= modules.length) {
        prevModuleBtn.style.display = 'none';
        nextModuleBtn.style.display = 'none';
        finishBtn.style.display = 'none';
        return;
    }
    
    // Hide prev button if at first module
    if (currentModule <= 0) {
        prevModuleBtn.style.display = 'none';
    } else {
        prevModuleBtn.style.display = 'inline-block';
    }
    
    // Hide next button if at last module or only one module
    if (currentModule >= modules.length - 1 || modules.length <= 1) {
        nextModuleBtn.style.display = 'none';
    } else {
        nextModuleBtn.style.display = 'inline-block';
    }
    
    // Show finish button
    finishBtn.style.display = 'inline-block';
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
    document.getElementById('inputSection').classList.remove('hidden');
    document.querySelectorAll('.learning-module').forEach(m => m.classList.remove('active'));
    factsData = [];
    currentModule = 0;
    score = 0;
    totalQuestions = 0;
    matchedPairs = [];
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
                    <div class="flashcard-hint">👆 Аудару үшін басыңыз</div>
                </div>
                <div class="flashcard-face flashcard-back">
                    <div class="flashcard-answer">${fact.answer}</div>
                    <div class="flashcard-hint">👆 Сұраққа қайту</div>
                </div>
            </div>
        </div>
        <div class="flashcard-scoring" id="flashcardScoring" style="display: none;">
            <button class="score-btn knew" onclick="scoreFlashcard(true)">✓ Білдім</button>
            <button class="score-btn didnt-know" onclick="scoreFlashcard(false)">✗ Білмедім</button>
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
                <h3 style="color: #667eea;">Барлық карталар аяқталды!</h3>
                <p style="color: #666; margin-top: 10px;">Келесі модульге өтіңіз</p>
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
            <h3>Сұрақ ${index + 1}</h3>
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
    
    // Check if answer contains location/river names
    if (answer.includes('еділ') || answer.includes('жайық') || answer.includes('аралығында')) {
        wrongAnswers.push(
            'Дунай мен Еділ аралығында болды',
            'Шу мен Талас аралығында болды',
            'Сырдариядан Әмударияға дейін болды',
            'Ертіс пен Есіл аралығында болды'
        );
    }
    
    // Check if answer contains century/time
    if (answer.includes('ғасыр') || answer.includes('жыл')) {
        wrongAnswers.push(
            'XIV ғасырдың бірінші жартысында',
            'XVI ғасырдың ортасында',
            'XII ғасырдың соңында',
            'XVII ғасырдың басында'
        );
    }
    
    // Check if answer is a name/title
    if (answer.includes('хан') || answer.includes('батыр') || answer.includes('бек')) {
        wrongAnswers.push(
            'Абылай хан',
            'Тәуке хан',
            'Қасым хан',
            'Есім хан'
        );
    }
    
    // Check for state/orda names
    if (answer.includes('орда') || answer.includes('хандығы')) {
        wrongAnswers.push(
            'Қазақ хандығы',
            'Алтын Орда',
            'Ақ Орда',
            'Көк Орда'
        );
    }
    
    // Get answers from other facts
    factsData.forEach((f, i) => {
        if (i !== factIndex && wrongAnswers.length < 15) {
            wrongAnswers.push(f.answer);
        }
    });
    
    return wrongAnswers;
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
    
    let html = '<h3>Сәйкестендіру</h3>';
    
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
                    <h4>Сұрақтар</h4>
                    ${shuffledQuestions.map(fact => `
                        <div class="matching-item" data-fact-index="${fact.index}" data-side="left" onclick="selectMatchItem(this)">
                            ${fact.question}
                        </div>
                    `).join('')}
                </div>
                <div class="matching-column" id="rightColumn">
                    <h4>Жауаптар</h4>
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
                <h3 style="color: #28a745;">Барлығы сәйкестендірілді!</h3>
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
                <h3 style="color: #667eea;">Барлық сұрақтар аяқталды!</h3>
                <p style="color: #666; margin-top: 10px;">Келесі модульге өтіңіз</p>
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
        <h3 style="text-align: center; margin-bottom: 15px;">Әріптерді жинап жауап құрыңыз (${index + 1}/${factsData.length})</h3>
        <div class="fill-blank-box" data-answered="false">
            <div class="fill-question">${fact.question}:</div>
            <div class="answer-display" id="answerDisplay-${index}"></div>
            <div class="symbol-buttons" id="symbolButtons-${index}">
                ${shuffledSymbols.map((symbol, i) => `
                    <button class="symbol-btn" onclick="addSymbol(${index}, '${escapeHtml(symbol)}', this)">${symbol}</button>
                `).join('')}
            </div>
            <div class="fill-actions">
                <button onclick="clearAnswer(${index})">🗑️ Тазалау</button>
                <button onclick="checkFillAnswer(${index}, '${escapeHtml(fact.answer)}')">✓ Тексеру</button>
                ${index < factsData.length - 1 ? `<button onclick="skipToNextFill(${index + 1})">Өткізу →</button>` : ''}
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
function showCompletion() {
    const statsContainer = document.getElementById('completionStats');
    
    // Recalculate totals based on actual answered questions
    let totalCorrect = 0;
    let totalAll = 0;
    
    if (enabledModules.flashcards) {
        totalCorrect += sectionScores.flashcards.correct;
        totalAll += sectionScores.flashcards.total;
    }
    if (enabledModules.quiz) {
        totalCorrect += sectionScores.quiz.correct;
        totalAll += sectionScores.quiz.total;
    }
    if (enabledModules.matching) {
        totalCorrect += sectionScores.matching.correct;
        totalAll += sectionScores.matching.total;
    }
    if (enabledModules.fillBlanks) {
        totalCorrect += sectionScores.fillBlanks.correct;
        totalAll += sectionScores.fillBlanks.total;
    }
    
    const percent = totalAll > 0 ? Math.round((totalCorrect / totalAll) * 100) : 0;
    
    // Get grade class based on percentage
    function getGradeClass(pct) {
        if (pct >= 80) return 'excellent';
        if (pct >= 60) return 'good';
        if (pct >= 40) return 'average';
        return 'poor';
    }
    
    let html = `
        <div class="results-summary">
            <div class="summary-item">
                <div class="value">${totalCorrect}/${totalAll}</div>
                <div class="label">Жалпы ұпай</div>
            </div>
            <div class="summary-item">
                <div class="value">${percent}%</div>
                <div class="label">Дәлдік</div>
            </div>
        </div>
        
        <div class="section-results">
            <h3>📊 Бөлімдер бойынша нәтижелер</h3>
    `;
    
    // Section details
    const sectionInfo = [
        { key: 'flashcards', name: 'Флэш-карталар', icon: '📇', enabled: enabledModules.flashcards },
        { key: 'quiz', name: 'Тест', icon: '✅', enabled: enabledModules.quiz },
        { key: 'matching', name: 'Сәйкестендіру', icon: '🔗', enabled: enabledModules.matching },
        { key: 'fillBlanks', name: 'Әріптерді жинау', icon: '✏️', enabled: enabledModules.fillBlanks }
    ];
    
    sectionInfo.forEach(section => {
        if (section.enabled) {
            const sectionData = sectionScores[section.key];
            const sectionPct = sectionData.total > 0 ? Math.round((sectionData.correct / sectionData.total) * 100) : 0;
            const gradeClass = getGradeClass(sectionPct);
            
            html += `
                <div class="section-result-item">
                    <div class="section-icon">${section.icon}</div>
                    <div class="section-info">
                        <div class="section-name">${section.name}</div>
                        <div class="section-score">${sectionData.correct} / ${sectionData.total} дұрыс</div>
                        <div class="section-progress">
                            <div class="section-progress-fill ${gradeClass}" style="width: ${sectionPct}%"></div>
                        </div>
                    </div>
                    <div class="section-percent ${gradeClass}">${sectionPct}%</div>
                </div>
            `;
        }
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
