"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  Headphones,
  Heart,
  Home,
  Languages,
  LayoutGrid,
  Menu,
  MessageCircle,
  Mic,
  Pause,
  Play,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Volume2,
  X,
} from "lucide-react";
import {
  words,
  lessons,
  letters,
  topics,
  grammarExamples,
  grammarTopics,
  grammarNotes,
  dialogues,
  comparisons,
  Word,
  Lesson,
} from "@/lib/course";
import { practice } from "@/lib/practice";
import {
  Progress,
  emptyProgress,
  completeLesson,
  loadProgress,
  saveProgress,
  schedule,
  isAnswer,
} from "@/lib/progress";
type View =
  | "home"
  | "course"
  | "alphabet"
  | "vocabulary"
  | "phrases"
  | "grammar"
  | "dialogues"
  | "review"
  | "conversation"
  | "pronunciation"
  | "compare";
const nav: { id: View; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Мой путь", icon: LayoutGrid },
  { id: "course", label: "Программа курса", icon: BookOpen },
  { id: "alphabet", label: "Арабский алфавит", icon: Languages },
  { id: "vocabulary", label: "Словарь", icon: GraduationCap },
  { id: "dialogues", label: "Диалоги", icon: MessageCircle },
  { id: "review", label: "Повторение", icon: RefreshCw },
];
function Arabic({
  children,
  small = false,
}: {
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <bdi lang="ar" dir="rtl" className={small ? "arabic small" : "arabic"}>
      {children}
    </bdi>
  );
}
export default function LearningApp() {
  const [view, setView] = useState<View>("home"),
    [lesson, setLesson] = useState<Lesson | null>(null),
    [p, setP] = useState<Progress>(emptyProgress),
    [ready, setReady] = useState(false),
    [storageError, setStorageError] = useState(false),
    [onboard, setOnboard] = useState(false),
    [mobile, setMobile] = useState(false),
    [translation, setTranslation] = useState(true),
    [translit, setTranslit] = useState(true),
    [diacritics, setDiacritics] = useState(true),
    [slow, setSlow] = useState(false),
    [settings, setSettings] = useState(false);
  useEffect(() => {
    setP(loadProgress());
    setReady(true);
  }, []);
  useEffect(() => {
    if (!onboard && !settings) return;
    const previous = document.activeElement as HTMLElement | null;
    const timer = setTimeout(
      () => document.querySelector<HTMLElement>(".modal button")?.focus(),
      0,
    );
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOnboard(false);
        setSettings(false);
      }
      if (e.key === "Tab") {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".modal button,.modal input,.modal select",
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, [onboard, settings]);
  function update(fn: (p: Progress) => Progress) {
    setP((old) => {
      const next = fn(old);
      if (!saveProgress(next)) setStorageError(true);
      return next;
    });
  }
  function go(v: View) {
    setView(v);
    setLesson(null);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openLesson(l: Lesson) {
    setLesson(l);
    setView("course");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const next = lessons.find((l) => !p.completed.includes(l.id)) || lessons[11];
  const due = Object.values(p.reviews).filter(
    (r) => r.due <= Date.now(),
  ).length;
  const learned = Object.keys(p.reviews).length;
  function favorite(id: string) {
    update((x) => ({
      ...x,
      favorites: x.favorites.includes(id)
        ? x.favorites.filter((v) => v !== id)
        : [...x.favorites, id],
    }));
  }
  function rate(id: string, rating: number) {
    update((x) => ({
      ...x,
      reviews: { ...x.reviews, [id]: schedule(x.reviews[id], rating) },
      mistakes: rating >= 2 ? x.mistakes.filter((v) => v !== id) : x.mistakes,
      daily: {
        ...x.daily,
        [new Date().toLocaleDateString("sv")]:
          (x.daily[new Date().toLocaleDateString("sv")] || 0) + 1,
      },
    }));
  }
  const audioProps = { slow };
  function wordCard(w: Word) {
    return (
      <VocabularyCard
        key={w.id}
        word={w}
        favorite={p.favorites.includes(w.id)}
        onFavorite={() => favorite(w.id)}
        onLearn={() => {
          if (!p.reviews[w.id])
            update((x) => ({
              ...x,
              reviews: {
                ...x.reviews,
                [w.id]: { interval: 0, due: Date.now(), reps: 0 },
              },
            }));
        }}
        learned={!!p.reviews[w.id]}
        translation={translation}
        translit={translit}
        diacritics={diacritics}
        {...audioProps}
      />
    );
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a
          href="#"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            go("home");
          }}
        >
          <span className="brand-mark">ع</span>
          <span>
            Arabic<span className="brand-sub">IN RIYADH</span>
          </span>
        </a>
        <div className="sidebar-label">ВАШЕ ОБУЧЕНИЕ</div>
        <nav>
          {nav.map((n) => (
            <button
              key={n.id}
              className={view === n.id ? "nav-item active" : "nav-item"}
              onClick={() => go(n.id)}
            >
              <n.icon size={19} />
              {n.label}
              {n.id === "review" && due > 0 && (
                <span className="badge">{due}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-label second">БОЛЬШЕ ПРАКТИКИ</div>
        <button
          className={`nav-item ${view === "conversation" ? "active" : ""}`}
          onClick={() => go("conversation")}
        >
          <Mic size={19} />
          Разговорный тренажёр
        </button>
        <button
          className={`nav-item ${view === "phrases" ? "active" : ""}`}
          onClick={() => go("phrases")}
        >
          <Sparkles size={19} />
          Как говорят саудовцы
        </button>
        <button className="nav-item" onClick={() => go("grammar")}>
          <BookOpen size={19} />
          Грамматика
        </button>
        <button className="nav-item" onClick={() => go("pronunciation")}>
          <Headphones size={19} />
          Произношение
        </button>
        <div className="sidebar-bottom">
          <div className="journey-card">
            <span className="tiny-star">✦</span>
            <strong>
              Маленькие шаги.
              <br />
              Большие разговоры.
            </strong>
            <p>
              Всего 10 минут в день —<br />и арабский станет ближе.
            </p>
            <span className="journey-line">رحلة الألف ميل تبدأ بخطوة</span>
          </div>
          <button className="profile" onClick={() => setSettings(true)}>
            <span className="avatar">В</span>
            <span>
              <strong>Ваше пространство</strong>
              <small>Учимся в своём темпе</small>
            </span>
            <Settings size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Открыть меню"
            onClick={() => setMobile(!mobile)}
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            Моё обучение <ChevronRight size={14} />
            <span>
              {lesson
                ? `Урок ${lesson.id}`
                : view === "home"
                  ? "Мой путь"
                  : view === "grammar"
                    ? "Грамматика"
                    : nav.find((n) => n.id === view)?.label || "Практика"}
            </span>
          </div>
          <div className="top-actions">
            <span className="language">
              <span>🇷🇺</span> Русский
            </span>
            <span className="divider" />
            <span className="day-count">
              <Flame size={18} />
              {Object.keys(p.daily).length} дней практики
            </span>
            <button
              className="avatar small-avatar"
              onClick={() => setSettings(true)}
              aria-label="Настройки обучения"
            >
              В
            </button>
          </div>
        </header>
        <main>
          {storageError && (
            <div role="alert" className="notice">
              Браузер не разрешает сохранять прогресс. Разрешите локальное
              хранилище, чтобы результаты сохранялись.
            </div>
          )}
          {!ready ? (
            <div className="empty">Загружаем ваш путь…</div>
          ) : lesson ? (
            <LessonView
              lesson={lesson}
              onBack={() => setLesson(null)}
              completed={p.completed.includes(lesson.id)}
              onComplete={() =>
                update((x) =>
                  completeLesson(
                    x,
                    lesson.id,
                    [2, 3].includes(lesson.id)
                      ? []
                      : lesson.indices.map((i) => words[i].id),
                  ),
                )
              }
              onMistake={(id) =>
                update((x) => ({
                  ...x,
                  mistakes: [...new Set([...x.mistakes, id])],
                }))
              }
              renderWord={wordCard}
              slow={slow}
            />
          ) : (
            <>
              {view === "home" && (
                <>
                  <div className="page-intro">
                    <div>
                      <div className="eyebrow">
                        <Sun size={15} /> АРАБСКИЙ ДЛЯ ВАШЕЙ ЖИЗНИ
                      </div>
                      <h1>
                        أهلاً وسهلاً <span>— добро пожаловать!</span>
                      </h1>
                      <p>
                        Каждый день — на шаг ближе к своему первому разговору.
                      </p>
                    </div>
                    <span className="level-pill">
                      <span /> Уровень{" "}
                      {p.completed.length >= 4
                        ? "A1 · Базовый"
                        : "A0 · Начинающий"}
                    </span>
                  </div>
                  <section className="hero">
                    <div className="hero-copy">
                      <span className="hero-tag">
                        <span /> ВАШ ПУТЬ НАЧИНАЕТСЯ ЗДЕСЬ
                      </span>
                      <h2>
                        Начни говорить
                        <br />
                        по-арабски <em>в Эр-Рияде</em>
                      </h2>
                      <p>
                        Изучай живой саудовский арабский с нуля: слова,
                        <br className="desktop-break" /> диалоги, произношение и
                        практика каждый день.
                      </p>
                      <div className="hero-actions">
                        <button
                          className="primary"
                          onClick={() =>
                            p.started ? openLesson(next) : setOnboard(true)
                          }
                        >
                          {p.started
                            ? "Продолжить обучение"
                            : "Начать обучение"}
                          <ArrowRight size={17} />
                        </button>
                        <button
                          className="hero-secondary"
                          onClick={() => go("course")}
                        >
                          Посмотреть программу <ArrowUpRight size={16} />
                        </button>
                      </div>
                      <div className="hero-foot">
                        <span>
                          <Check size={14} />
                          Без регистрации
                        </span>
                        <span>
                          <Check size={14} />В своём темпе
                        </span>
                        <span>
                          <Check size={14} />
                          Для реальной жизни
                        </span>
                      </div>
                    </div>
                    <RiyadhArt />
                  </section>
                  <section className="stats-grid">
                    <Stat
                      icon={GraduationCap}
                      color="green"
                      value={`${p.completed.length} / 12`}
                      label="уроков пройдено"
                    />
                    <Stat
                      icon={BookOpen}
                      color="blue"
                      value={String(learned)}
                      label="слов изучено"
                    />
                    <Stat
                      icon={RefreshCw}
                      color="orange"
                      value={String(due)}
                      label="слов для повторения"
                      action={() => go("review")}
                    />
                    <Stat
                      icon={Flame}
                      color="pink"
                      value={String(Object.keys(p.daily).length)}
                      label="дней с практикой"
                    />
                  </section>
                  <div className="dashboard-grid">
                    <section>
                      <div className="section-heading">
                        <h2>Продолжим учиться</h2>
                        <button
                          className="text-link"
                          onClick={() => go("course")}
                        >
                          Вся программа <ArrowRight size={15} />
                        </button>
                      </div>
                      <div className="continue-card">
                        <div className="lesson-illustration">
                          <span>أ</span>
                          <span>ب</span>
                          <span>ت</span>
                          <div className="illustration-caption">أهلاً</div>
                        </div>
                        <div className="continue-info">
                          <div className="eyebrow">
                            МОДУЛЬ 1 <span>•</span> УРОК{" "}
                            {String(next.id).padStart(2, "0")}
                          </div>
                          <h3>{next.title}</h3>
                          <p>{next.description}. Начнём с простого.</p>
                          <div className="lesson-meta">
                            <span>
                              <Clock size={14} />
                              {next.minutes} минут
                            </span>
                            <span>
                              <Headphones size={14} />
                              Слушаем и практикуемся
                            </span>
                          </div>
                          <button
                            className="primary small-primary"
                            onClick={() => openLesson(next)}
                          >
                            Начать урок <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="section-heading learn-heading">
                        <h2>Практика на каждый день</h2>
                        <span className="muted small-text">
                          Выберите, что интересно сегодня
                        </span>
                      </div>
                      <div className="practice-grid">
                        <button
                          className="practice-card"
                          onClick={() => go("alphabet")}
                        >
                          <span className="practice-icon arabic-icon">ب</span>
                          <h3>Знакомимся с алфавитом</h3>
                          <p>28 букв — ваш ключ к арабскому</p>
                          <span className="practice-footer">
                            Изучать буквы <ArrowUpRight size={17} />
                          </span>
                        </button>
                        <button
                          className="practice-card"
                          onClick={() => go("conversation")}
                        >
                          <span className="practice-icon">
                            <MessageCircle size={24} />
                          </span>
                          <h3>Кофе по-саудовски</h3>
                          <p>Закажите любимый напиток</p>
                          <span className="practice-footer">
                            Попробовать диалог <ArrowUpRight size={17} />
                          </span>
                        </button>
                      </div>
                    </section>
                    <aside className="dashboard-right">
                      <div className="daily-word">
                        <div className="eyebrow">
                          <Sparkles size={15} /> ВЫРАЖЕНИЕ ДНЯ
                        </div>
                        <div className="daily-ar">
                          <Arabic>هلا والله</Arabic>
                          <AudioPlayer text="هلا والله" slow={slow} />
                        </div>
                        <span className="daily-translit">hala wallāh</span>
                        <h3>Рад тебя видеть!</h3>
                        <p>
                          Тёплое саудовское приветствие.
                          <br />
                          Так встречают друзей и знакомых.
                        </p>
                        <div className="word-note">
                          <span>🇸🇦</span> Так говорят в Эр-Рияде
                        </div>
                        <button
                          className="text-link"
                          onClick={() => go("phrases")}
                        >
                          Больше живых выражений <ArrowRight size={15} />
                        </button>
                      </div>
                      <div className="review-card">
                        <div className="review-icon">
                          <RefreshCw size={21} />
                        </div>
                        <h3>Повторение — сила</h3>
                        <p>
                          Закрепите знакомые слова,
                          <br />
                          чтобы они остались с вами.
                        </p>
                        <button onClick={() => go("review")}>
                          Повторить слова <ArrowRight size={16} />
                        </button>
                      </div>
                    </aside>
                  </div>
                  <div className="course-bottom">
                    <ShieldCheck size={17} />
                    <span>
                      Живой язык. Понятные объяснения. Ваш собственный темп.
                    </span>
                    <span className="bottom-ar">خطوة بخطوة</span>
                  </div>
                </>
              )}
              {view === "course" && (
                <>
                  <PageTitle
                    eyebrow="ВАШ УЧЕБНЫЙ МАРШРУТ"
                    title="От первых букв к первым разговорам"
                    text="12 последовательных уроков A0–A1. Все материалы доступны сразу."
                  />
                  <div className="progress-track">
                    <span
                      style={{ width: `${(p.completed.length / 12) * 100}%` }}
                    />
                  </div>
                  <div className="lesson-grid">
                    {lessons.map((l) => (
                      <LessonCard
                        key={l.id}
                        lesson={l}
                        completed={p.completed.includes(l.id)}
                        onClick={() => openLesson(l)}
                      />
                    ))}
                  </div>
                  <div className="notice">
                    A2 — направление будущего развития. В текущем курсе нет
                    недоступных уроков.
                  </div>
                </>
              )}
              {view === "alphabet" && <AlphabetTrainer slow={slow} />}
              {(view === "vocabulary" || view === "phrases") && (
                <VocabularyLibrary
                  phrases={view === "phrases"}
                  renderWord={wordCard}
                  favorites={p.favorites}
                />
              )}
              {view === "grammar" && (
                <>
                  <PageTitle
                    eyebrow="ПОНЯТНО И ПО ДЕЛУ"
                    title="Грамматика живого общения"
                    text="Модели, которые можно сразу использовать в разговоре."
                  />
                  {grammarTopics.map((t, i) => (
                    <GrammarExplanation
                      key={t}
                      title={t}
                      index={i}
                      slow={slow}
                    />
                  ))}
                </>
              )}
              {view === "dialogues" && (
                <DialoguePlayer
                  translation={translation}
                  translit={translit}
                  slow={slow}
                />
              )}
              {view === "review" && (
                <ReviewTrainer
                  progress={p}
                  onRate={rate}
                  slow={slow}
                  onBrowse={() => go("vocabulary")}
                />
              )}
              {view === "conversation" && <ConversationTrainer slow={slow} />}
              {view === "pronunciation" && (
                <PronunciationPractice slow={slow} />
              )}
              {view === "compare" && (
                <>
                  <PageTitle
                    eyebrow="КАК ГОВОРЯТ В ЭР-РИЯДЕ?"
                    title="От учебника к живой речи"
                    text="Фусха уместна в формальных ситуациях. Разговорные формы помогают в повседневном общении."
                  />
                  {comparisons.map(([msa, sa, ru]) => (
                    <div className="comparison" key={msa}>
                      <div>
                        <small>ФУСХА · ФОРМАЛЬНО</small>
                        <Arabic>{msa}</Arabic>
                        <AudioPlayer text={msa} slow={slow} />
                      </div>
                      <div>
                        <small>САУДОВСКАЯ РЕЧЬ</small>
                        <Arabic>{sa}</Arabic>
                        <AudioPlayer text={sa} slow={slow} />
                      </div>
                      <p>{ru}</p>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
          {view !== "home" && (
            <div className="content-disclaimer">
              <ShieldCheck size={16} />
              Материалы редакционные: проверка носителем саудовского арабского
              ещё не выполнена. Транслитерация приблизительна.{" "}
              <button onClick={() => go("compare")}>
                Как говорят в Эр-Рияде?
              </button>
            </div>
          )}
        </main>
        <footer>
          Arabic in Riyadh <span>Сделайте арабский частью своей жизни.</span>
          <button onClick={() => setSettings(true)}>Настройки обучения</button>
        </footer>
      </div>
      {onboard && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboard-title"
          >
            <button
              className="close icon-button"
              aria-label="Закрыть"
              onClick={() => setOnboard(false)}
            >
              <X />
            </button>
            <span className="eyebrow">ВАШ ПЕРВЫЙ ШАГ</span>
            <h2 id="onboard-title">С чего начнём?</h2>
            <p>
              Подберём удобную отправную точку. Все уроки останутся доступны.
            </p>
            {[
              ["Я совсем не знаю арабский", 1],
              ["Я знаю алфавит", 4],
              ["Я знаю некоторые слова", 5],
            ].map(([label, id]) => (
              <button
                className="onboard-option"
                key={label}
                onClick={() => {
                  update((x) => ({ ...x, started: true }));
                  setOnboard(false);
                  openLesson(lessons[Number(id) - 1]);
                }}
              >
                {label}
                <ArrowRight size={18} />
              </button>
            ))}
          </section>
        </div>
      )}
      {settings && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Настройки обучения"
          >
            <button
              className="close icon-button"
              onClick={() => setSettings(false)}
              aria-label="Закрыть"
            >
              <X />
            </button>
            <h2>Учитесь так, как удобно</h2>
            {[
              ["Русский перевод", translation, setTranslation],
              ["Транслитерация", translit, setTranslit],
              ["Огласовки", diacritics, setDiacritics],
              ["Медленное аудио", slow, setSlow],
            ].map(([label, value, setter]) => (
              <label className="toggle-row" key={String(label)}>
                {String(label)}
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) =>
                    (setter as (v: boolean) => void)(e.target.checked)
                  }
                />
              </label>
            ))}
            <p className="small-text muted">
              Прогресс хранится только в этом браузере. Очистка данных сайта
              удалит его.
            </p>
            <button
              className="outline"
              onClick={() => {
                const blob = new Blob([JSON.stringify(p, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "riyadh-progress.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Скачать мой прогресс
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
function PageTitle({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="section-title">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}
function Stat({
  icon: Icon,
  color,
  value,
  label,
  action,
}: {
  icon: typeof Home;
  color: string;
  value: string;
  label: string;
  action?: () => void;
}) {
  const content = (
    <>
      <span className={`stat-icon ${color}`}>
        <Icon size={22} />
      </span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </>
  );
  return action ? (
    <button className="stat-card" onClick={action}>
      {content}
    </button>
  ) : (
    <div className="stat-card">{content}</div>
  );
}
function RiyadhArt() {
  return (
    <div className="riyadh-art" aria-hidden="true">
      <div className="art-sun" />
      <span className="art-star s1">✦</span>
      <span className="art-star s2">✧</span>
      <div className="art-orbit" />
      <div className="arabic-float">أهلاً</div>
      <svg viewBox="0 0 440 330" fill="none">
        <path d="M0 290 Q90 250 180 280 T440 270 V330H0Z" fill="#d2c6a9" />
        <path d="M0 310Q100 255 220 305T440 290V330H0Z" fill="#b7bba0" />
        <path d="M80 279V202H143V279M89 202V191H134V202" fill="#d7c4a0" />
        <path
          d="M89 220H99M113 220H124M89 239H99M113 239H124"
          stroke="#b39d78"
          strokeWidth="4"
        />
        <path d="M178 285V133L187 105H223L232 133V285Z" fill="#9baf9f" />
        <path d="M187 105Q205 152 223 105M187 106V147H223V106" fill="#f2ead4" />
        <path
          d="M190 165H220M190 177H220M190 189H220M190 201H220M190 213H220M190 225H220M190 237H220M190 249H220M190 261H220"
          stroke="#d0d6bd"
          strokeWidth="2"
        />
        <path d="M257 288L282 155L307 288Z" fill="#c5b18b" />
        <path d="M282 155V137" stroke="#b7a079" strokeWidth="2" />
        <circle cx="282" cy="216" r="7" fill="#f5ecd5" />
        <path d="M320 283V231H370V283M329 231V219H360V231" fill="#cbb997" />
        <path d="M31 303Q43 251 48 221" stroke="#647b68" strokeWidth="6" />
        <path
          d="M47 226Q19 202 10 221Q29 214 47 235M47 224Q58 194 77 207Q60 207 48 230M46 225Q33 191 21 201Q38 204 46 230M48 226Q75 218 81 234Q65 225 48 233"
          fill="#718a70"
        />
        <path d="M387 300Q381 271 387 250" stroke="#647b68" strokeWidth="4" />
        <path
          d="M387 255Q371 235 359 246Q375 244 386 261M388 253Q402 232 417 244Q402 244 388 259"
          fill="#718a70"
        />
      </svg>
      <div className="art-caption">
        <span>24.7136° N · 46.6753° E</span>
        <strong>الرياض</strong>
        <small>ВАША НОВАЯ ЯЗЫКОВАЯ ИСТОРИЯ</small>
      </div>
    </div>
  );
}
export function AudioPlayer({
  text,
  slow = false,
  word,
  audio,
}: {
  text: string;
  slow?: boolean;
  word?: Word;
  audio?: Word["audio"];
}) {
  const [status, setStatus] = useState(""),
    [playing, setPlaying] = useState(false);
  const media = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if ("speechSynthesis" in window) {
      speechSynthesis.getVoices();
      const warm = () => speechSynthesis.getVoices();
      speechSynthesis.addEventListener("voiceschanged", warm);
      return () => speechSynthesis.removeEventListener("voiceschanged", warm);
    }
  }, []);
  useEffect(
    () => () => {
      media.current?.pause();
      window.speechSynthesis?.cancel();
    },
    [],
  );
  function play() {
    if (playing) {
      window.speechSynthesis?.cancel();
      media.current?.pause();
      setPlaying(false);
      return;
    }
    const source = audio || word?.audio;
    if (source?.verified) {
      setStatus("Проверенная запись носителя · " + source.license);
      const a = new Audio(source.url);
      media.current = a;
      a.playbackRate = slow ? 0.7 : 1;
      a.onended = () => setPlaying(false);
      a.onerror = () => {
        setPlaying(false);
        setStatus("Запись недоступна. Попробуйте позже.");
      };
      a.play()
        .then(() => setPlaying(true))
        .catch(() => setStatus("Браузер не разрешил воспроизведение."));
      return;
    }
    if (!("speechSynthesis" in window)) {
      setStatus(
        "Синтез речи не поддерживается. Практикуйте чтение вручную; записи носителя пока нет.",
      );
      return;
    }
    const voices = speechSynthesis.getVoices();
    const voice =
      voices.find((v) => v.lang.toLowerCase() === "ar-sa") ||
      voices.find((v) => v.lang.startsWith("ar"));
    if (!voice) {
      setStatus(
        "Арабский голос не установлен. Добавьте арабский голос в настройках устройства. Записи носителя пока нет.",
      );
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = slow ? 0.65 : 0.9;
    u.onend = () => setPlaying(false);
    u.onerror = (e) => {
      setPlaying(false);
      if (e.error === "canceled" || e.error === "interrupted") return;
      setStatus("Не удалось воспроизвести речь. Попробуйте ещё раз.");
    };
    setStatus("Синтез речи · не эталон надждийского произношения");
    setPlaying(true);
    speechSynthesis.speak(u);
  }
  return (
    <span className="audio-wrap">
      <button
        className={`audio-button ${playing ? "playing" : ""}`}
        onClick={play}
        aria-label={playing ? "Остановить аудио" : `Прослушать ${text}`}
        title="Синтез речи, если нет проверенной записи"
      >
        {playing ? <Pause size={17} /> : <Volume2 size={17} />}
      </button>
      {status && (
        <span className="audio-status" role="status">
          {status}
          <button aria-label="Скрыть сообщение" onClick={() => setStatus("")}>
            ×
          </button>
        </span>
      )}
    </span>
  );
}
export function VocabularyCard({
  word: w,
  favorite,
  onFavorite,
  onLearn,
  learned,
  translation,
  translit,
  diacritics,
  slow,
}: {
  word: Word;
  favorite: boolean;
  onFavorite: () => void;
  onLearn: () => void;
  learned: boolean;
  translation: boolean;
  translit: boolean;
  diacritics: boolean;
  slow: boolean;
}) {
  return (
    <article className="vocab-card">
      <div className="vocab-top">
        <span className="tag">{w.register}</span>
        <button
          className={`icon-button ${favorite ? "favorited" : ""}`}
          onClick={onFavorite}
          aria-label={
            favorite ? "Убрать из избранного" : "Добавить в избранное"
          }
        >
          <Heart size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="vocab-ar">
        <Arabic>
          {diacritics ? w.ar : w.ar.replace(/[\u064B-\u065F]/g, "")}
        </Arabic>
        <AudioPlayer text={w.ar} slow={slow} word={w} />
      </div>
      {translit && <div className="translit">{w.tr}</div>}
      {translation && <h3>{w.ru}</h3>}
      <details>
        <summary>Пример и употребление</summary>
        <Arabic small>{w.example}</Arabic>
        <AudioPlayer text={w.example} slow={slow} audio={w.exampleAudio} />
        <p>{w.exampleRu}</p>
        <p>{w.usage}</p>
        {w.gender && <p>Род: {w.gender}</p>}
        {w.avoid && (
          <p>
            <strong>Когда осторожнее:</strong> {w.avoid}
          </p>
        )}
        {w.alternative && (
          <p>
            <strong>Альтернатива:</strong> {w.alternative}
          </p>
        )}
        {w.response && (
          <p>
            <strong>Ответ:</strong> {w.response}
          </p>
        )}
        <small>Saudi / Riyadh · нужна проверка носителем</small>
      </details>
      <button className="learn-word" disabled={learned} onClick={onLearn}>
        {learned ? (
          <>
            <Check size={14} />В повторении
          </>
        ) : (
          <>
            Добавить в повторение <span>+</span>
          </>
        )}
      </button>
    </article>
  );
}
function VocabularyLibrary({
  phrases,
  renderWord,
  favorites,
}: {
  phrases: boolean;
  renderWord: (w: Word) => React.ReactNode;
  favorites: string[];
}) {
  const [topic, setTopic] = useState(-1),
    [search, setSearch] = useState(""),
    [onlyFav, setOnlyFav] = useState(false),
    [flash, setFlash] = useState(false),
    [index, setIndex] = useState(0),
    [flipped, setFlipped] = useState(false);
  const pool = phrases
    ? words.filter((w) =>
        [0, 32, 42, 43, 69, 82, 83, 84, 85, 81].includes(Number(w.id.slice(1))),
      )
    : topic < 0
      ? words
      : words.slice(topics[topic][1], topics[topic][2]);
  const selected = pool.filter(
    (w) =>
      (!onlyFav || favorites.includes(w.id)) &&
      `${w.ar} ${w.ru} ${w.tr}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow={phrases ? "ЖИВОЙ ЯЗЫК" : "ВАШ ЛИЧНЫЙ СЛОВАРЬ"}
        title={phrases ? "Так говорят саудовцы" : "Слова для реальной жизни"}
        text={
          phrases
            ? "Значение зависит от ситуации и интонации. Здесь нет универсальных фраз на все случаи."
            : "Слушайте, сохраняйте любимые слова и добавляйте их в повторение."
        }
      />
      {phrases && (
        <div className="notice">
          هلا والله — для дружеского общения; وش؟ может звучать резко без
          контекста; ما شاء الله — восхищение; يعطيك العافية — благодарность за
          усилия, ответ: الله يعافيك. إن شاء الله — надежда/намерение, не точное
          обещание. Для официального письма выбирайте формальный регистр.
        </div>
      )}
      <div className="toolbar">
        <label className="search">
          <Search size={17} />
          <input
            aria-label="Поиск слов"
            placeholder="Найти слово…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIndex(0);
            }}
          />
        </label>
        {!phrases && (
          <select
            aria-label="Тема"
            value={topic}
            onChange={(e) => {
              setTopic(Number(e.target.value));
              setIndex(0);
            }}
          >
            <option value={-1}>Все темы</option>
            {topics.map((t, i) => (
              <option key={i} value={i}>
                {t[0]}
              </option>
            ))}
          </select>
        )}
        <button
          className={onlyFav ? "primary" : "outline"}
          onClick={() => {
            setOnlyFav(!onlyFav);
            setIndex(0);
          }}
        >
          <Heart size={16} />
          Избранное
        </button>
        <button
          className="outline"
          onClick={() => {
            setFlash(!flash);
            setIndex(0);
            setFlipped(false);
          }}
        >
          {flash ? "Все слова" : "Карточки"}
        </button>
      </div>
      {flash && selected.length > 0 ? (
        <div className="flashcard">
          <span className="eyebrow">
            {(index % selected.length) + 1} / {selected.length}
          </span>
          <Arabic>{selected[index % selected.length].ar}</Arabic>
          <AudioPlayer text={selected[index % selected.length].ar} />
          {flipped && <h2>{selected[index % selected.length].ru}</h2>}
          <button className="outline" onClick={() => setFlipped(!flipped)}>
            {flipped ? "Скрыть перевод" : "Показать перевод"}
          </button>
          <button
            className="primary"
            onClick={() => {
              setIndex(index + 1);
              setFlipped(false);
            }}
          >
            Следующее <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="vocab-grid">{selected.map(renderWord)}</div>
      )}
      {!selected.length && (
        <div className="empty">
          Слов пока нет. Попробуйте другую тему или добавьте слова в избранное.
        </div>
      )}
    </>
  );
}
export function LessonCard({
  lesson: l,
  completed,
  onClick,
}: {
  lesson: Lesson;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button className="lesson-card" onClick={onClick}>
      <div className="lesson-card-top">
        <span className="lesson-number">{String(l.id).padStart(2, "0")}</span>
        <span className="tag">
          {l.id < 4 ? "A0" : "A1"} · {l.category}
        </span>
        {completed && <Check className="green-text" size={20} />}
      </div>
      <h3>{l.title}</h3>
      <p>{l.description}</p>
      <div className="practice-footer">
        <span>
          <Clock size={14} />
          {l.minutes} мин
        </span>
        {completed ? "Повторить" : "Начать"}
        <ArrowRight size={17} />
      </div>
    </button>
  );
}
function LessonView({
  lesson: l,
  onBack,
  completed,
  onComplete,
  onMistake,
  renderWord,
  slow,
}: {
  lesson: Lesson;
  onBack: () => void;
  completed: boolean;
  onComplete: () => void;
  onMistake: (s: string) => void;
  renderWord: (w: Word) => React.ReactNode;
  slow: boolean;
}) {
  const [tab, setTab] = useState("Объяснение");
  useEffect(() => {
    setTab("Объяснение");
  }, [l.id]);
  return (
    <>
      <button className="text-link" onClick={onBack}>
        <ChevronLeft size={16} />К программе
      </button>
      <PageTitle
        eyebrow={`УРОК ${l.id} · ${l.id < 4 ? "A0" : "A1"} · ${l.minutes} МИНУТ`}
        title={l.title}
        text={l.description}
      />
      <div className="tabs">
        {["Объяснение", "Слова", "Практика", "Тест"].map((t) => (
          <button
            className={tab === t ? "active" : ""}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Объяснение" && (
        <>
          <div className="panel">
            <h2>После урока вы сможете</h2>
            <ul>
              {l.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <p>{l.explanation}</p>
            <div className="pattern">
              <Arabic small>{l.pattern}</Arabic>
              <AudioPlayer text={l.pattern} slow={slow} />
            </div>
            <div className="notice">Частая ошибка: {l.mistake}</div>
            <button className="primary" onClick={() => setTab("Слова")}>
              Перейти к словам <ArrowRight size={16} />
            </button>
          </div>
          {(l.id === 2 || l.id === 3) && (
            <AlphabetTrainer
              slow={slow}
              compact={l.id === 2 ? "first" : "last"}
            />
          )}
        </>
      )}
      {tab === "Слова" && (
        <>
          <div className="vocab-grid">
            {l.indices.map((i) => renderWord(words[i]))}
          </div>
          <button className="primary" onClick={() => setTab("Практика")}>
            К практике <ArrowRight size={16} />
          </button>
        </>
      )}
      {tab === "Практика" && (
        <ExerciseWorkshop lesson={l} slow={slow} onMistake={onMistake} />
      )}
      {tab === "Тест" && (
        <QuizEngine
          key={l.id}
          lesson={l}
          slow={slow}
          onMistake={onMistake}
          onComplete={onComplete}
          completed={completed}
        />
      )}
    </>
  );
}
export function AlphabetTrainer({
  slow,
  compact,
}: {
  slow: boolean;
  compact?: "first" | "last";
}) {
  const [selected, setSelected] = useState(0),
    [answer, setAnswer] = useState<number | null>(null),
    [quiz, setQuiz] = useState(0);
  const pool = compact
    ? letters.slice(compact === "first" ? 0 : 14, compact === "first" ? 14 : 28)
    : letters;
  const l = pool[selected % pool.length];
  return (
    <>
      {!compact && (
        <PageTitle
          eyebrow="ОТ АЛИФА ДО ЙА"
          title="Ваш первый шаг в арабский"
          text="28 букв. Письмо справа налево ←. Нажмите на букву, чтобы узнать её формы."
        />
      )}
      <div className="alphabet-grid" dir="rtl">
        {pool.map((v, i) => (
          <button
            className={selected === i ? "selected" : ""}
            onClick={() => {
              setSelected(i);
              setAnswer(null);
            }}
            key={v.ar}
          >
            <Arabic>{v.ar}</Arabic>
            <span>{v.name}</span>
          </button>
        ))}
      </div>
      <div className="panel letter-detail">
        <div>
          <Arabic>{l.ar}</Arabic>
          <AudioPlayer text={l.example} slow={slow} />
          <h2>
            {l.name} · {l.sound}
          </h2>
          <p>{l.note}</p>
        </div>
        <div>
          <div className="letter-forms">
            {[
              ["Отдельно", l.ar],
              ["В начале", l.initial],
              ["В середине", l.medial],
              ["В конце", l.final],
            ].map(([label, form]) => (
              <div key={label}>
                <Arabic>{form}</Arabic>
                <small>{label}</small>
              </div>
            ))}
          </div>
          <p>
            Пример: <Arabic>{l.example}</Arabic>
          </p>
          <small>
            Формы ا د ذ ر ز و не соединяются со следующей слева буквой.
          </small>
        </div>
      </div>
      <div className="panel">
        <h3>Проверьте себя: найдите букву «{pool[quiz % pool.length].name}»</h3>
        <div className="answers">
          {[0, 1, 2, 3].map((offset) => {
            const idx = (quiz + offset * 3) % pool.length;
            return (
              <button
                key={offset}
                onClick={() => setAnswer(idx)}
                className={
                  answer === idx
                    ? idx === quiz % pool.length
                      ? "correct"
                      : "incorrect"
                    : ""
                }
              >
                <Arabic>{pool[idx].ar}</Arabic>
              </button>
            );
          })}
        </div>
        {answer !== null && (
          <p role="status">
            {answer === quiz % pool.length
              ? "Верно!"
              : "Посмотрите на точки и форму: правильная буква " +
                pool[quiz % pool.length].ar}
          </p>
        )}
        <button
          className="outline"
          onClick={() => {
            setQuiz((quiz + 1) % pool.length);
            setAnswer(null);
          }}
        >
          Следующая буква
        </button>
      </div>
      <details className="panel">
        <summary>Гласные и важные знаки</summary>
        <p>
          Фатха َ — a, касра ِ — i, дамма ُ — u. Долгие ā / ī / ū часто
          обозначают ا / ي / و. Сукун ْ — без гласного, шадда ّ — удвоенный
          согласный. ء — хамза, гортанная смычка. لا — сочетание ل и ا.
          Произношение дифтонгов в диалекте может отличаться от фусхи: بَيْت →
          bēt.
        </p>
      </details>
    </>
  );
}
export function GrammarExplanation({
  title,
  index,
  slow,
}: {
  title: string;
  index: number;
  slow: boolean;
}) {
  const n = grammarNotes[index];
  return (
    <details className="panel grammar">
      <summary>
        <span className="lesson-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        {title}
        <ChevronRight size={18} />
      </summary>
      <h3>{n[0]}</h3>
      <div className="pattern">
        <Arabic small>{n[1]}</Arabic>
        <AudioPlayer text={n[1]} slow={slow} />
      </div>
      <p>{n[2]}</p>
      {grammarExamples[index].map(([ar, ru]) => (
        <div className="grammar-example" key={ar}>
          <div>
            <Arabic small>{ar}</Arabic>
            <AudioPlayer text={ar} slow={slow} />
          </div>
          <p>{ru}</p>
        </div>
      ))}
      <p className="muted">
        Ошибка: не переносите русскую структуру дословно. Сначала найдите
        разговорную модель и проверьте род собеседника.
      </p>
      <MiniGrammarQuiz index={index} />
    </details>
  );
}
function MiniGrammarQuiz({ index }: { index: number }) {
  const [a, setA] = useState<number | null>(null);
  return (
    <div>
      <p>Какая фраза соответствует модели «{grammarTopics[index]}»?</p>
      <div className="answers">
        {[grammarNotes[index][1], grammarNotes[(index + 1) % 15][1]].map(
          (v, i) => (
            <button key={i} onClick={() => setA(i)}>
              <Arabic small>{v}</Arabic>
            </button>
          ),
        )}
      </div>
      {a !== null && (
        <p role="status">
          {a === 0
            ? "Верно: " + grammarNotes[index][2]
            : "Здесь другая модель. Нужный пример: " + grammarNotes[index][1]}
        </p>
      )}
    </div>
  );
}
export function QuizEngine({
  lesson,
  slow,
  onMistake,
  onComplete,
  completed,
}: {
  lesson: Lesson;
  slow: boolean;
  onMistake: (s: string) => void;
  onComplete: () => void;
  completed: boolean;
}) {
  const [index, setIndex] = useState(0),
    [answer, setAnswer] = useState<number | null>(null),
    [score, setScore] = useState(0);
  const alphabetLesson = lesson.id === 2 || lesson.id === 3;
  const letterPool = letters.slice(
    lesson.id === 3 ? 14 : 0,
    lesson.id === 3 ? 28 : 14,
  );
  const items = alphabetLesson
    ? letterPool
        .slice(0, 5)
        .map((l, i) => ({ ...words[i], ar: l.ar, ru: `Буква «${l.name}»` }))
    : lesson.indices.slice(0, 5).map((i) => words[i]);
  const [finished, setFinished] = useState(false);
  const w = items[index];
  const correctIndex = (index + 1) % 4;
  const options = Array.from({ length: 4 }, (_, i) =>
    i === correctIndex
      ? w
      : alphabetLesson
        ? {
            ...words[0],
            ru: `Буква «${letterPool[(index + i + 5) % letterPool.length].name}»`,
          }
        : words[(Number(w.id.slice(1)) + i + 9) % words.length],
  );
  if (finished)
    return (
      <div className="panel quiz-result">
        <span className="result-icon">{score >= 4 ? "✓" : "↻"}</span>
        <h2>{score >= 4 ? "Отличная работа!" : "Ещё немного практики"}</h2>
        <p>
          Правильных ответов: {score} из {items.length}. Для завершения нужно не
          менее 4.
        </p>
        {score >= 4 ? (
          <p>
            {completed ? "Урок завершён и сохранён." : "Результат сохранён."}
          </p>
        ) : (
          <p>Ошибки добавлены в очередь повторения.</p>
        )}
        <button
          className="primary"
          onClick={() => {
            setFinished(false);
            setIndex(0);
            setScore(0);
            setAnswer(null);
          }}
        >
          Повторить тест
        </button>
      </div>
    );
  return (
    <div className="panel quiz">
      <div className="eyebrow">
        ИТОГОВЫЙ ТЕСТ · {index + 1} / {items.length}
      </div>
      <h2>Выберите перевод</h2>
      <div className="quiz-ar">
        <Arabic>{w.ar}</Arabic>
        <AudioPlayer text={w.ar} slow={slow} />
      </div>
      <div className="answers">
        {options.map((o, i) => (
          <button
            disabled={answer !== null}
            className={
              answer === i
                ? i === correctIndex
                  ? "correct"
                  : "incorrect"
                : answer !== null && i === correctIndex
                  ? "correct"
                  : ""
            }
            key={i}
            onClick={() => {
              setAnswer(i);
              if (i === correctIndex) setScore(score + 1);
              else onMistake(w.id);
            }}
          >
            {o.ru}
          </button>
        ))}
      </div>
      {answer !== null && (
        <>
          <p role="status">
            {answer === correctIndex
              ? "Верно!"
              : `Правильный ответ: ${w.ru}. ${w.usage}`}
          </p>
          <button
            className="primary"
            onClick={() => {
              if (index === items.length - 1) {
                setFinished(true);
                if (score >= 4) onComplete();
              } else {
                setIndex(index + 1);
                setAnswer(null);
              }
            }}
          >
            {index === items.length - 1 ? "Результат" : "Следующий вопрос"}
            <ArrowRight size={16} />
          </button>
        </>
      )}
    </div>
  );
}
const exerciseNames = [
  "Перевод",
  "Найдите пару",
  "Пропуск",
  "Соберите фразу",
  "На слух",
  "Напишите перевод",
  "Ответ в диалоге",
  "Узнайте букву",
  "Порядок реплик",
  "Повторение слов",
];
function ExerciseWorkshop({
  lesson,
  slow,
  onMistake,
}: {
  lesson: Lesson;
  slow: boolean;
  onMistake: (id: string) => void;
}) {
  const [type, setType] = useState(0),
    [input, setInput] = useState(""),
    [result, setResult] = useState<boolean | null>(null),
    [arranged, setArranged] = useState<number[]>([]);
  const w = words[lesson.indices[0]];
  const exercise = practice[lesson.id - 1];
  const tokens =
    type === 8
      ? ["السلام عليكم", "وعليكم السلام", exercise.prompt, exercise.response]
      : exercise.sentence.split(" ");
  const order = tokens.map((_, i) => i).reverse();
  function check(ok: boolean) {
    setResult(ok);
    if (!ok) onMistake(w.id);
  }
  function reset(t: number) {
    setType(t);
    setInput("");
    setResult(null);
    setArranged([]);
  }
  return (
    <div className="panel">
      <div className="exercise-types">
        {exerciseNames.map((n, i) => (
          <button
            className={type === i ? "active" : ""}
            key={n}
            onClick={() => reset(i)}
          >
            {n}
          </button>
        ))}
      </div>
      <h2>{exerciseNames[type]}</h2>
      {type === 1 && (
        <MatchingExercise
          key={lesson.id}
          items={lesson.indices.slice(0, 3).map((i) => words[i])}
          onMistake={onMistake}
        />
      )}
      {[0, 4, 9].includes(type) && (
        <>
          <p>
            {type === 4
              ? "Прослушайте и выберите значение:"
              : type === 1
                ? "Соедините слово с его значением:"
                : "Что означает это слово?"}
          </p>
          {type !== 4 && <Arabic>{w.ar}</Arabic>}
          <AudioPlayer text={w.ar} slow={slow} />
          <div className="answers">
            {[
              words[(lesson.indices[0] + 15) % words.length].ru,
              w.ru,
              words[(lesson.indices[0] + 24) % words.length].ru,
            ].map((o, i) => (
              <button
                key={i}
                disabled={result !== null}
                onClick={() => check(i === 1)}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
      {[2, 5].includes(type) && (
        <>
          <p>
            {type === 2
              ? "Вставьте пропущенное: " + exercise.blank
              : "Напишите арабский вариант: " + w.ru}
          </p>
          <input
            className="answer-input"
            dir="auto"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="Ваш ответ"
          />
          <button
            className="primary"
            onClick={() =>
              check(
                isAnswer(input, type === 2 ? [exercise.answer] : [w.ar, w.tr]),
              )
            }
          >
            Проверить
          </button>
        </>
      )}
      {[3, 8].includes(type) && (
        <>
          <p>
            {type === 8
              ? "Восстановите беседу: приветствие → ответ → вопрос → ответ."
              : "Соберите: «" + exercise.ru + "»"}
          </p>
          <div className="arrange-output" dir={type === 3 ? "rtl" : "ltr"}>
            {arranged.map((i) => (
              <span key={i}>
                <Arabic small>{tokens[i]}</Arabic>
              </span>
            ))}
          </div>
          <div className="answers">
            {order.map((i) => (
              <button
                key={i}
                disabled={arranged.includes(i)}
                onClick={() => setArranged([...arranged, i])}
              >
                <Arabic small>{tokens[i]}</Arabic>
              </button>
            ))}
          </div>
          <button
            className="outline"
            onClick={() => {
              setArranged([]);
              setResult(null);
            }}
          >
            Сбросить
          </button>
          <button
            className="primary"
            onClick={() =>
              check(
                arranged.length === tokens.length &&
                  arranged.every((v, i) => v === i),
              )
            }
          >
            Проверить порядок
          </button>
        </>
      )}
      {type === 6 && (
        <>
          <p>
            Вам говорят: <Arabic small>{exercise.prompt}</Arabic>
          </p>
          <div className="answers">
            {[exercise.other, exercise.response, "شكرا"].map((s, i) => (
              <button key={s} onClick={() => check(i === 1)}>
                <Arabic small>{s}</Arabic>
              </button>
            ))}
          </div>
        </>
      )}
      {type === 7 && (
        <>
          <p>Какая буква называется «ба»?</p>
          <div className="answers">
            {["ت", "ن", "ب"].map((s, i) => (
              <button key={s} onClick={() => check(i === 2)}>
                <Arabic>{s}</Arabic>
              </button>
            ))}
          </div>
        </>
      )}
      {result !== null && (
        <div
          className={result ? "feedback correct" : "feedback incorrect"}
          role="status"
        >
          {result
            ? "Верно! Отличная работа."
            : `Попробуйте ещё раз. Правильный вариант: ${type === 2 ? exercise.answer : type === 3 ? tokens.join(" ") : type === 8 ? tokens.join(" → ") : type === 6 ? exercise.response : type === 7 ? "ب" : w.ar + " — " + w.ru}`}
          <button className="text-link" onClick={() => reset(type)}>
            Ещё раз
          </button>
        </div>
      )}
    </div>
  );
}
export function DialoguePlayer({
  translation,
  translit,
  slow,
}: {
  translation: boolean;
  translit: boolean;
  slow: boolean;
}) {
  const [selected, setSelected] = useState(0),
    [hideRu, setHideRu] = useState(false),
    [hideTr, setHideTr] = useState(false),
    [roleplay, setRoleplay] = useState(false),
    [revealed, setRevealed] = useState<number[]>([]),
    [comprehension, setComprehension] = useState<number | null>(null),
    [message, setMessage] = useState("");
  const d = dialogues[selected];
  const fullAudio = useRef<HTMLAudioElement | null>(null);
  useEffect(
    () => () => {
      fullAudio.current?.pause();
      window.speechSynthesis?.cancel();
    },
    [],
  );
  function playAll() {
    fullAudio.current?.pause();
    if (d.audio?.verified) {
      window.speechSynthesis?.cancel();
      const a = new Audio(d.audio.url);
      fullAudio.current = a;
      a.playbackRate = slow ? 0.7 : 1;
      a.play().catch(() =>
        setMessage("Запись диалога недоступна. Попробуйте реплики отдельно."),
      );
      a.onerror = () => setMessage("Не удалось загрузить запись диалога.");
      setMessage("Проверенная запись носителя · " + d.audio.license);
      return;
    }
    if (!("speechSynthesis" in window)) {
      setMessage("Синтез речи недоступен. Читайте реплики по ролям.");
      return;
    }
    const voice = speechSynthesis
      .getVoices()
      .find((v) => v.lang.startsWith("ar"));
    if (!voice) {
      setMessage(
        "Установите арабский голос в настройках устройства. Записи носителя пока нет.",
      );
      return;
    }
    speechSynthesis.cancel();
    d.lines.forEach((l) => {
      const u = new SpeechSynthesisUtterance(l.ar);
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = slow ? 0.65 : 0.9;
      speechSynthesis.speak(u);
    });
    setMessage("Синтез речи · не запись носителя");
  }
  return (
    <>
      <PageTitle
        eyebrow="СЛУШАЙТЕ. ПОНИМАЙТЕ. ОТВЕЧАЙТЕ."
        title="Разговоры из жизни Эр-Рияда"
        text="Выберите ситуацию, послушайте реплики и попробуйте ответить за одного из участников."
      />
      <div className="toolbar">
        <select
          aria-label="Выберите диалог"
          value={selected}
          onChange={(e) => {
            setSelected(Number(e.target.value));
            setRevealed([]);
            setComprehension(null);
          }}
        >
          {dialogues.map((v, i) => (
            <option key={v.title} value={i}>
              {v.title}
            </option>
          ))}
        </select>
        <button className="outline" onClick={() => setHideRu(!hideRu)}>
          {hideRu ? "Показать" : "Скрыть"} перевод
        </button>
        <button className="outline" onClick={() => setHideTr(!hideTr)}>
          {hideTr ? "Показать" : "Скрыть"} транслитерацию
        </button>
        <button
          className={roleplay ? "primary" : "outline"}
          onClick={() => setRoleplay(!roleplay)}
        >
          По ролям
        </button>
      </div>
      <div className="panel dialogue">
        <div className="section-heading">
          <h2>{d.title}</h2>
          <button className="outline" onClick={playAll}>
            <Play size={15} />
            Слушать всё
          </button>
          <button
            className="icon-button"
            aria-label="Остановить диалог"
            onClick={() => {
              window.speechSynthesis?.cancel();
              fullAudio.current?.pause();
            }}
          >
            <Pause size={18} />
          </button>
        </div>
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        {d.lines.map((l, i) => (
          <div className={`dialogue-line ${i % 2 ? "own" : ""}`} key={i}>
            <span className="speaker">{l.speaker}</span>
            {roleplay && i % 2 === 1 && !revealed.includes(i) ? (
              <button
                className="outline"
                onClick={() => setRevealed([...revealed, i])}
              >
                Ответьте вслух, затем откройте реплику
              </button>
            ) : (
              <>
                <div>
                  <Arabic>{l.ar}</Arabic>
                  <AudioPlayer text={l.ar} slow={slow} audio={l.audio} />
                </div>
                {translit && !hideTr && (
                  <span className="translit">{l.tr}</span>
                )}
                {translation && !hideRu && <p>{l.ru}</p>}
              </>
            )}
          </div>
        ))}
        <div className="notice">
          Модель: вопрос → короткий ответ → вежливая благодарность. Словарь: أبي
          — хочу; عندي — у меня; بكم — сколько стоит; لو سمحت — пожалуйста.
          Обращения различаются по роду.
        </div>
        <h3>Проверка понимания</h3>
        <p>Какая ситуация разыгрывается?</p>
        <div className="answers">
          {[d.title, dialogues[(selected + 1) % dialogues.length].title].map(
            (v, i) => (
              <button key={v} onClick={() => setComprehension(i)}>
                {v}
              </button>
            ),
          )}
        </div>
        {comprehension !== null && (
          <p role="status">
            {comprehension === 0
              ? "Верно. Попробуйте воспроизвести разговор без перевода."
              : "Прочитайте реплики ещё раз: ситуация — " + d.title}
          </p>
        )}
      </div>
    </>
  );
}
export function ReviewTrainer({
  progress: p,
  onRate,
  slow,
  onBrowse,
}: {
  progress: Progress;
  onRate: (id: string, r: number) => void;
  slow: boolean;
  onBrowse: () => void;
}) {
  const [reveal, setReveal] = useState(false),
    [done, setDone] = useState<string[]>([]);
  const pool = words.filter(
    (w) =>
      !done.includes(w.id) &&
      ((p.reviews[w.id]?.due ?? Infinity) <= Date.now() ||
        p.mistakes.includes(w.id)),
  );
  const w = pool[0];
  return (
    <>
      <PageTitle
        eyebrow="ПУСТЬ СЛОВА ОСТАНУТСЯ С ВАМИ"
        title="Ежедневное повторение"
        text={`${pool.length} слов ожидают практики. Сначала вспомните значение, затем оцените ответ.`}
      />
      {w ? (
        <div className="panel flashcard">
          <Arabic>{w.ar}</Arabic>
          <AudioPlayer text={w.ar} slow={slow} />
          {reveal ? (
            <>
              <h2>{w.ru}</h2>
              <p className="translit">{w.tr}</p>
              <div className="rating-buttons">
                {["Не знаю", "Сложно", "Помню", "Легко"].map((label, i) => (
                  <button
                    key={label}
                    className="outline"
                    onClick={() => {
                      onRate(w.id, i);
                      setDone([...done, w.id]);
                      setReveal(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button className="primary" onClick={() => setReveal(true)}>
              Показать ответ
            </button>
          )}
        </div>
      ) : (
        <div className="panel empty">
          <span className="result-icon">✓</span>
          <h2>На сегодня всё!</h2>
          <p>
            {Object.keys(p.reviews).length
              ? "Следующее повторение появится в назначенное время."
              : "Добавьте слова из словаря, чтобы начать повторение."}
          </p>
          <button className="primary" onClick={onBrowse}>
            Открыть словарь <ArrowRight size={16} />
          </button>
        </div>
      )}
      <details className="panel">
        <summary>Как работает повторение?</summary>
        <p>
          Простой алгоритм интервалов: «Не знаю» — через 10 минут; «Сложно» —
          через день; «Помню» — предыдущий интервал × 2 (минимум 2 дня); «Легко»
          — × 3 (минимум 4 дня). Новое слово попадает в очередь после
          добавления. Интервал 0 — изучается, 1–3 дня — знакомое, от 4 дней —
          закреплённое. Просроченные слова требуют повторения. Это учебная
          эвристика, не SM-2.
        </p>
      </details>
      <div className="vocab-grid">
        {words
          .filter((w) => p.reviews[w.id])
          .map((w) => (
            <div key={w.id} className="panel">
              <Arabic small>{w.ar}</Arabic>
              <p>{w.ru}</p>
              <small>
                {p.reviews[w.id].interval >= 4
                  ? "Закреплено"
                  : p.reviews[w.id].interval === 0
                    ? "Изучается"
                    : "Знакомое"}{" "}
                · {new Date(p.reviews[w.id].due).toLocaleString("ru-RU")}
              </small>
            </div>
          ))}
      </div>
    </>
  );
}
export function ConversationTrainer({ slow }: { slow: boolean }) {
  const [step, setStep] = useState(0),
    [mistakes, setMistakes] = useState(0),
    [feedback, setFeedback] = useState(""),
    [branch, setBranch] = useState(""),
    [water, setWater] = useState(false);
  const price =
    branch === "tea" ? (water ? "عشرة" : "ثمانية") : water ? "اثناعشر" : "عشرة";
  const prompts = [
    "هلا، وش تبي؟",
    branch === "tea" ? "تبي الشاي بسكر؟" : "تبي القهوة بسكر؟",
    "شي ثاني؟",
    `الحساب ${price} ريال`,
  ];
  const choices = [
    [
      ["أبي قهوة، لو سمحت", "coffee"],
      ["أبي شاي، لو سمحت", "tea"],
      ["مع السلامة", "wrong"],
    ],
    [
      ["بدون سكر، لو سمحت", "ok"],
      ["إيه، بسكر", "ok"],
      ["أنا من روسيا", "wrong"],
    ],
    [
      ["لا، شكرا", "ok"],
      ["وموية، لو سمحت", "water"],
      ["وين المطار؟", "wrong"],
    ],
    [
      ["تفضل، شكرا", "ok"],
      ["ما أفهم، ممكن تعيد؟", "repeat"],
    ],
  ];
  return (
    <>
      <PageTitle
        eyebrow="БЕЗОПАСНАЯ ПРАКТИКА"
        title="Ваш заказ в кофейне"
        text="Сценарный тренажёр с ветвлением. Это не живой AI: ваши ответы выбирают следующую реплику."
      />
      <div className="panel conversation">
        <span className="tag">Ситуация · Кофейня в Эр-Рияде</span>
        {step < 4 ? (
          <>
            <h3>Бариста</h3>
            <div className="conversation-prompt">
              <Arabic>{prompts[step]}</Arabic>
              <AudioPlayer text={prompts[step]} slow={slow} />
            </div>
            <p>Выберите подходящий ответ:</p>
            <div className="answers">
              {choices[step].map(([label, action]) => (
                <button
                  key={label}
                  onClick={() => {
                    if (action === "wrong") {
                      setMistakes(mistakes + 1);
                      setFeedback(
                        "Эта фраза не отвечает на вопрос. Попробуйте ещё раз: сейчас обсуждаем заказ.",
                      );
                    } else if (action === "repeat") {
                      setFeedback(
                        `Бариста повторяет: الحساب ${price} ريال. Цены учебные.`,
                      );
                    } else {
                      if (step === 0) setBranch(action);
                      if (action === "water") setWater(true);
                      setFeedback(
                        action === "water"
                          ? "Бариста: تمام، وموية — хорошо, и вода."
                          : "Подходит! Продолжим.",
                      );
                      setStep(step + 1);
                    }
                  }}
                >
                  <Arabic small>{label}</Arabic>
                </button>
              ))}
            </div>
            {feedback && (
              <p className="notice" role="status">
                {feedback}
              </p>
            )}
          </>
        ) : (
          <>
            <span className="result-icon">✓</span>
            <h2>Заказ готов!</h2>
            <p>
              Вы заказали {branch === "tea" ? "чай" : "кофе"} и завершили
              разговор. Неподходящих ответов: {mistakes}.
            </p>
            <p>
              Полезные фразы: أبي… — хочу…; بدون سكر — без сахара; شي ثاني؟ —
              что-нибудь ещё? Альтернатива: أبغى قهوة لو سمحت.
            </p>
            <p>
              Повторите слова: قهوة، شاي، سكر، الحساب. Попробуйте этот же диалог
              вслух.
            </p>
            <button
              className="primary"
              onClick={() => {
                setStep(0);
                setMistakes(0);
                setFeedback("");
                setBranch("");
                setWater(false);
              }}
            >
              Попробовать ещё раз
            </button>
          </>
        )}
      </div>
    </>
  );
}
function PronunciationPractice({ slow }: { slow: boolean }) {
  const [recording, setRecording] = useState(false),
    [url, setUrl] = useState(""),
    [error, setError] = useState(""),
    [text, setText] = useState("أبي قهوة، لو سمحت");
  const recorder = useRef<MediaRecorder | null>(null),
    stream = useRef<MediaStream | null>(null),
    currentUrl = useRef("");
  useEffect(
    () => () => {
      stream.current?.getTracks().forEach((t) => t.stop());
      if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
    },
    [],
  );
  async function record() {
    if (recording) {
      recorder.current?.stop();
      setRecording(false);
      return;
    }
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError(
        "Запись недоступна. Слушайте пример и повторяйте вслух; используйте диктофон устройства.",
      );
      return;
    }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const r = new MediaRecorder(stream.current);
      recorder.current = r;
      const chunks: BlobPart[] = [];
      r.ondataavailable = (e) => chunks.push(e.data);
      r.onerror = () => {
        setError("Ошибка записи. Попробуйте диктофон устройства.");
        stream.current?.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      r.onstop = () => {
        if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
        const u = URL.createObjectURL(new Blob(chunks, { type: r.mimeType }));
        currentUrl.current = u;
        setUrl(u);
        stream.current?.getTracks().forEach((t) => t.stop());
      };
      r.start();
      setRecording(true);
    } catch {
      setError(
        "Нет доступа к микрофону. Разрешите его в настройках сайта или повторяйте фразу без записи.",
      );
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="СЛУШАЙТЕ СЕБЯ"
        title="Практика произношения"
        text="Сравнивайте на слух. Автоматической оценки надждийского акцента здесь нет."
      />
      <div className="panel pronunciation">
        <label>
          Фраза для тренировки
          <select value={text} onChange={(e) => setText(e.target.value)}>
            {[
              "أبي قهوة، لو سمحت",
              "السلام عليكم",
              "يعطيك العافية",
              "أنا من روسيا",
            ].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <div>
          <Arabic>{text}</Arabic>
          <AudioPlayer text={text} slow={slow} />
        </div>
        <div className="notice">
          Браузерный синтез — вспомогательная озвучка. Проверенные записи
          носителей пока не добавлены.
        </div>
        <button
          className={recording ? "recording primary" : "primary"}
          onClick={record}
        >
          <Mic size={18} />
          {recording ? "Остановить запись" : "Записать свой голос"}
        </button>
        {url && (
          <div>
            <h3>Ваша запись</h3>
            <audio controls src={url} />
            <p>
              Сравните длину гласных и ритм. Запись хранится только в памяти
              вкладки.
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="notice">
            {error}
          </p>
        )}
        <p>
          Ручная практика: прослушайте → повторите 3 раза → запишите → сравните.
          Для ع и ح нет точного русского эквивалента. Оценку акцента лучше
          получить у преподавателя.
        </p>
      </div>
    </>
  );
}
function MatchingExercise({
  items,
  onMistake,
}: {
  items: Word[];
  onMistake: (id: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null),
    [matched, setMatched] = useState<string[]>([]),
    [feedback, setFeedback] = useState("");
  return (
    <>
      <p>Выберите арабское слово, затем его перевод.</p>
      <div className="matching-grid">
        <div>
          {items.map((w) => (
            <button
              className={`match-item ${selected === w.id ? "selected" : ""} ${matched.includes(w.id) ? "correct" : ""}`}
              disabled={matched.includes(w.id)}
              key={w.id}
              onClick={() => setSelected(w.id)}
            >
              <Arabic small>{w.ar}</Arabic>
              {matched.includes(w.id) && <Check size={14} />}
            </button>
          ))}
        </div>
        <div>
          {[items[2], items[0], items[1]].map((w) => (
            <button
              className={`match-item ${matched.includes(w.id) ? "correct" : ""}`}
              disabled={matched.includes(w.id)}
              key={w.id}
              onClick={() => {
                if (!selected) {
                  setFeedback("Сначала выберите арабское слово.");
                  return;
                }
                if (selected === w.id) {
                  setMatched([...matched, w.id]);
                  setFeedback("Верная пара!");
                  setSelected(null);
                } else {
                  onMistake(selected);
                  setFeedback(
                    "Эта пара не подходит. Перевод выбранного слова: " +
                      items.find((v) => v.id === selected)?.ru,
                  );
                }
              }}
            >
              {w.ru}
            </button>
          ))}
        </div>
      </div>
      <p role="status">
        {matched.length === items.length ? "Все пары найдены!" : feedback}
      </p>
      <button
        className="outline"
        onClick={() => {
          setSelected(null);
          setMatched([]);
          setFeedback("");
        }}
      >
        Повторить
      </button>
    </>
  );
}
