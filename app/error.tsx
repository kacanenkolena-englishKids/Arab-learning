"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main>
      <section className="panel">
        <h1>Не удалось открыть урок</h1>
        <p>
          Попробуйте загрузить приложение ещё раз. Сохранённый прогресс
          останется в браузере.
        </p>
        <button className="primary" onClick={reset}>
          Повторить
        </button>
      </section>
    </main>
  );
}
