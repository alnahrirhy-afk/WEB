// Quiz logic: data-driven, easy to extend
document.addEventListener('DOMContentLoaded', () => {
  const quizContainer = document.querySelector('.quiz-container');
  if (!quizContainer) return; // no quiz section present

  // Questions store: extendable and editable
  // Each question: {id, type: 'mcq'|'tf', category: 'rulers'|'countries', difficulty: 'easy'|'medium'|'hard', question, image?, choices: [{id, text}], correct (id), explanation}
  const questions = [
    {
      id: 'q1',
      type: 'mcq',
      category: 'rulers',
      difficulty: 'easy',
      question: 'من هو القائد الذي حرر القدس عام 1187؟',
      choices: [
        { id: 'a', text: 'صلاح الدين الأيوبي' },
        { id: 'b', text: 'هارون الرشيد' },
        { id: 'c', text: 'المعز لدين الله' },
        { id: 'd', text: 'عبد الرحمن الداخل' }
      ],
      correct: 'a',
      explanation: 'صلاح الدين الأيوبي قاد الحملة التي انتهت بتحرير القدس بعد معركة حطين عام 1187.'
    },
    {
      id: 'q2',
      type: 'tf',
      category: 'countries',
      difficulty: 'easy',
      question: 'تأسست الدولة العباسية في بغداد عام 762م.',
      choices: [
        { id: 'true', text: 'صح' },
        { id: 'false', text: 'خطأ' }
      ],
      correct: 'true',
      explanation: 'أبو جعفر المنصور أسس مدينة بغداد وأصبحت عاصمة الدولة العباسية حوالي عام 762م.'
    },
    {
      id: 'q3',
      type: 'mcq',
      category: 'rulers',
      difficulty: 'medium',
      question: 'من فتح القسطنطينية عام 1453؟',
      choices: [
        { id: 'a', text: 'محمد الفاتح' },
        { id: 'b', text: 'بيبرس' },
        { id: 'c', text: 'صلاح الدين' },
        { id: 'd', text: 'هارون الرشيد' }
      ],
      correct: 'a',
      explanation: 'السلطان محمد الفاتح فتح القسطنطينية في عام 1453م.'
    }
  ];

  // State
  let currentIndex = 0;
  const userAnswers = {}; // questionId -> choiceId

  // Build base structure
  function buildBaseUI() {
    quizContainer.innerHTML = `
      <div class="quiz-top">
        <div class="quiz-progress" aria-live="polite">السؤال 1 من ${questions.length}</div>
        <div class="quiz-level small-note">المستوى: متنوع</div>
      </div>
      <div class="quiz-question" role="region" aria-label="منطقة السؤال"></div>
      <div class="quiz-footer">
        <button class="btn-quiz ghost" id="prevBtn" type="button">السابق</button>
        <div style="display:flex;gap:8px">
          <button class="btn-quiz ghost" id="resetBtn" type="button">إعادة الاختبار</button>
          <button class="btn-quiz primary" id="nextBtn" type="button">التالي</button>
        </div>
      </div>
    `;

    // Attach events
    document.getElementById('prevBtn').addEventListener('click', () => changeQuestion(currentIndex - 1));
    document.getElementById('nextBtn').addEventListener('click', () => changeQuestion(currentIndex + 1));
    document.getElementById('resetBtn').addEventListener('click', resetQuiz);
  }

  // Render a specific question
  function renderQuestion(index) {
    const region = quizContainer.querySelector('.quiz-question');
    const progress = quizContainer.querySelector('.quiz-progress');
    if (!questions[index]) return;
    const q = questions[index];

    progress.textContent = `السؤال ${index + 1} من ${questions.length}`;

    region.innerHTML = `
      <div class="question-text">${q.question}</div>
      ${q.image ? `<div class="question-image"><img src="${q.image}" alt="صورة للسؤال" style="max-width:100%;border-radius:8px;margin-bottom:8px"></div>` : ''}
      <div class="options-list" role="list"></div>
      <div class="option-meta-holder"></div>
    `;

    const optionsList = region.querySelector('.options-list');
    q.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('data-choice-id', choice.id);
      btn.setAttribute('role', 'listitem');
      btn.innerHTML = `${choice.text}`;
      btn.addEventListener('click', () => selectOption(q.id, choice.id, btn));

      // Restore selection if exists
      if (userAnswers[q.id] === choice.id) {
        btn.classList.add('selected');
      }

      optionsList.appendChild(btn);
    });

    // Buttons state
    document.getElementById('prevBtn').disabled = index === 0;
    document.getElementById('nextBtn').textContent = index === questions.length - 1 ? 'إظهار النتيجة' : 'التالي';

    // show already checked answers feedback if user answered
    if (userAnswers[q.id]) {
      revealAnswerFeedback(q, userAnswers[q.id]);
    }
  }

  // Handle option selection
  function selectOption(questionId, choiceId, btnElement) {
    userAnswers[questionId] = choiceId;

    // remove selected class from siblings
    const siblings = btnElement.parentElement.querySelectorAll('.option-btn');
    siblings.forEach(s => { s.classList.remove('selected'); });
    btnElement.classList.add('selected');

    // show immediate feedback (correct/incorrect)
    const q = questions.find(x => x.id === questionId);
    revealAnswerFeedback(q, choiceId);
  }

  function revealAnswerFeedback(question, choiceId) {
    const region = quizContainer.querySelector('.quiz-question');
    const optionButtons = region.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
      const cid = btn.getAttribute('data-choice-id');
      btn.classList.remove('correct', 'incorrect');
      if (cid === question.correct) {
        btn.classList.add('correct');
      }
      if (cid === choiceId && cid !== question.correct) {
        btn.classList.add('incorrect');
      }
      // disable buttons after answer to avoid changing answer for immediate feedback
      // but we still allow changing: comment out disabling to let users change answers before final submit
    });

    // show explanation below options
    const metaHolder = region.querySelector('.option-meta-holder');
    metaHolder.innerHTML = `<div class="small-note">${question.explanation || ''}</div>`;
  }

  // Navigate between questions
  function changeQuestion(newIndex) {
    // if index out of bounds and is at end -> show result
    if (newIndex < 0) return;
    if (newIndex >= questions.length) {
      // show results
      showResults();
      return;
    }
    currentIndex = newIndex;
    renderQuestion(currentIndex);
  }

  // Calculate results and render result page
  function showResults() {
    const total = questions.length;
    let correctCount = 0;
    const details = questions.map(q => {
      const user = userAnswers[q.id];
      const isCorrect = user === q.correct;
      if (isCorrect) correctCount++;
      return { id: q.id, question: q.question, user, correct: q.correct, explanation: q.explanation };
    });

    // Save results locally (only owner can access on same machine)
    try {
      const store = JSON.parse(localStorage.getItem('quizResults') || '[]');
      store.push({ date: new Date().toISOString(), score: correctCount, total });
      localStorage.setItem('quizResults', JSON.stringify(store));
    } catch (e) {
      // ignore storage errors
      console.warn('Storage not available', e);
    }

    // حفظ نتائج الكويز كإحصائيات للملف الشخصي (completedQuizzes, highestScore)
    try{
      const totalQ = total;
      const scorePercent = Math.round((correctCount / totalQ) * 100);
      let completed = parseInt(localStorage.getItem('completedQuizzes') || '0', 10);
      let highest = parseInt(localStorage.getItem('highestScore') || '0', 10);
      completed = completed + 1;
      if(scorePercent > highest) highest = scorePercent;
      localStorage.setItem('completedQuizzes', String(completed));
      localStorage.setItem('highestScore', String(highest));
    }catch(e){ console.warn('Failed to update quiz stats', e); }

    // Render result panel
    quizContainer.innerHTML = `
      <div class="result-panel">
        <div class="result-score">${correctCount} / ${total}</div>
        <p class="small-note">درجة الاختبار — يمكنك مراجعة التصحيح أدناه أو إعادة المحاولة.</p>
        <div class="result-list" aria-live="polite"></div>
        <div style="margin-top:1rem;display:flex;gap:8px;justify-content:center">
          <button class="btn-quiz primary" id="retryBtn">أعد الاختبار</button>
          <button class="btn-quiz ghost" id="homeBtn">العودة للرئيسية</button>
        </div>
      </div>
    `;

    const list = quizContainer.querySelector('.result-list');
    details.forEach(d => {
      const qObj = questions.find(x => x.id === d.id);
      const userText = (qObj.choices.find(c => c.id === d.user) || {}).text || 'لم يتم الإجابة';
      const correctText = (qObj.choices.find(c => c.id === d.correct) || {}).text || '';

      const item = document.createElement('div');
      item.className = 'result-item';
      item.innerHTML = `
        <div style="font-weight:700">${qObj.question}</div>
        <div style="margin-top:6px">إجابتك: ${userText}</div>
        <div class="correct-answer">الإجابة الصحيحة: ${correctText}</div>
        <div class="small-note">${qObj.explanation || ''}</div>
      `;
      list.appendChild(item);
    });

    document.getElementById('retryBtn').addEventListener('click', () => { resetQuiz(); });
    document.getElementById('homeBtn').addEventListener('click', () => { window.location.hash = '#'; location.reload(); });
  }

  // Reset quiz state
  function resetQuiz() {
    currentIndex = 0;
    for (let k in userAnswers) delete userAnswers[k];
    buildBaseUI();
    renderQuestion(0);
  }

  // Initialize UI and show first question
  buildBaseUI();
  renderQuestion(0);
});
