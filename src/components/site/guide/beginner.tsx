import { useState } from "react";

type Lesson = {
  id: string;
  title: string;
  points: string[];
  videoId: string;
  start: number;
  channel: string;
  videoTitle: string;
};

const LESSONS: Lesson[] = [
  {
    id: "start",
    title: "Wie starte ich, und was ist Survival?",
    points: [
      "Survival heißt: du fängst ohne Ausrüstung an. Blöcke abbauen, Werkzeug bauen, essen, nachts überleben.",
      "Mit der Hand einen Baum schlagen. Aus dem Stamm werden Bretter, daraus die Werkbank.",
      "Java: Inventar mit E. Bedrock: die entsprechende Inventar-Taste.",
    ],
    videoId: "NPjnNQf0LDA",
    start: 35,
    channel: "SparkofPhoenix",
    videoTitle: "Der ultimative Minecraft-Anfänger-Guide",
  },
  {
    id: "night",
    title: "Die erste Nacht überleben",
    points: [
      "Holz sammeln, Werkbank bauen, eine Spitzhacke craften, Stein holen.",
      "Vor der Dunkelheit ein geschlossenes Haus oder ein Loch im Hügel. Tür oder Blöcke davor.",
      "Fackeln aus Kohle oder Holzkohle. Ein Bett aus 3 Wolle und 3 Brettern setzt den Spawn und überspringt die Nacht.",
    ],
    videoId: "e1UahPONUOI",
    start: 0,
    channel: "LarsLP",
    videoTitle: "6 einfache Starterhäuser in Survival",
  },
  {
    id: "resources",
    title: "Holz, Stein, Eisen, Diamant",
    points: [
      "Holz: Bäume. Stein: mit einer Holzspitzhacke. Eisen: unter der Erde, im Ofen schmelzen.",
      "Diamanten liegen tief, meist um Höhe -59. Dafür brauchst du mindestens eine Eisenspitzhacke.",
      "Die Reihenfolge bleibt immer gleich: Holz, Stein, Eisen, dann erst Diamant.",
    ],
    videoId: "iTJdBrdsKCo",
    start: 0,
    channel: "SparkofPhoenix",
    videoTitle: "Diamanten finden",
  },
  {
    id: "food",
    title: "Essen und Hunger",
    points: [
      "Die Hungeranzeige sinkt durch Laufen, Sprinten und Kämpfen. Bei leerem Hunger heilen die Herzen nicht nach.",
      "Rohes Fleisch bringt wenig. Im Ofen braten.",
      "Kühe, Schweine, Hühner und Schafe. Später ein Feld mit Samen, die du aus Gras abbrichst.",
    ],
    videoId: "NPjnNQf0LDA",
    start: 4296,
    channel: "SparkofPhoenix",
    videoTitle: "Essen, Felder und Tiere im Anfänger-Guide",
  },
  {
    id: "craft",
    title: "Wie funktioniert Crafting?",
    points: [
      "Im Inventar ist nur ein 2×2-Feld. Bretter, Stöcke und die Werkbank gehen dort.",
      "Die Werkbank ist 3×3. Werkzeug, Rüstung und die meisten Blöcke brauchen sie.",
      "Rezept stimmt die Form, nicht nur die Menge. Eine Spitzhacke ist drei Material über zwei Stöcken.",
    ],
    videoId: "zUZ3hrTxq4M",
    start: 0,
    channel: "EfiFly",
    videoTitle: "Wie baue ich eine Werkbank",
  },
  {
    id: "enchant",
    title: "Der Zaubertisch",
    points: [
      "Rezept: 4 Obsidian, 2 Diamanten, 1 Buch. Obsidian entsteht, wenn Wasser auf eine Lavaquelle trifft.",
      "Rundherum Bücherregale, höchstens ein Block Abstand, ohne Blöcke dazwischen. 15 Regale ergeben die starken Zauber.",
      "Zum Zaubern brauchst du Lapis und Erfahrungslevel. Das Item und das Lapis in den Tisch legen, dann einen der drei Zauber wählen.",
    ],
    videoId: "iTtNtsXuGyY",
    start: 0,
    channel: "SparkofPhoenix",
    videoTitle: "Alles über Verzauberungen",
  },
  {
    id: "villagers",
    title: "Dorfbewohner finden und handeln",
    points: [
      "Dörfer stehen auf der Oberfläche: Häuser, Felder, Wege. Dort leben die Bewohner.",
      "Neue Bewohner entstehen, wenn welche da sind, freie Betten stehen und sie genug Essen haben, zum Beispiel Brot oder Karotten.",
      "Rechtsklick öffnet den Handel. Smaragde sind die Währung. Ein Arbeitsblock neben einem Bewohner ohne Beruf gibt ihm einen Beruf, solange du noch nicht gehandelt hast.",
    ],
    videoId: "DXbfRjdtdUw",
    start: 0,
    channel: "ErikOnHisPeriod",
    videoTitle: "Handeln mit Dorfbewohnern",
  },
  {
    id: "dimensions",
    title: "Nether und End, kurz",
    points: [
      "Ein Netherportal ist ein Rahmen aus Obsidian, mindestens 4 mal 5 Blöcke, innen leer. Mit einem Feuerzeug anzünden.",
      "Im Nether ist es gefährlich. Kein Wasser, andere Monster. Von dort kommt später Netherite.",
      "Das End erreichst du über ein Portal in einer Festung unter der Erde. Dort ist der Enderdrache. Für den Start auf dem Server brauchst du das noch nicht.",
    ],
    videoId: "NPjnNQf0LDA",
    start: 5516,
    channel: "SparkofPhoenix",
    videoTitle: "Nether und der Weg zum End",
  },
];

function watchUrl(lesson: Lesson) {
  const time = lesson.start > 0 ? `&t=${lesson.start}s` : "";
  return `https://www.youtube.com/watch?v=${lesson.videoId}${time}`;
}

export function BeginnerGuide() {
  const [open, setOpen] = useState<string | null>(LESSONS[0].id);
  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-muted">
        Zuerst das Spiel. Survival, die erste Nacht, Essen, Crafting, Zaubern, Dörfer, Nether und End. Danach kommt AlpenSMP.
      </p>
      <section className="divide-y divide-line overflow-hidden rounded-lg border border-line">
        {LESSONS.map((lesson, index) => {
          const isOpen = open === lesson.id;
          return (
            <article key={lesson.id} className="faq-row bg-surface" data-open={isOpen}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : lesson.id)}
              >
                <span>
                  <span className="mr-2 text-xs text-faint">{index + 1}</span>
                  {lesson.title}
                </span>
                <span className="faq-mark text-brand" aria-hidden="true">
                  {isOpen ? "–" : "+"}
                </span>
              </button>
              {isOpen ? (
                <div className="panel-in space-y-4 px-5 pb-5">
                  <ul className="space-y-2 text-sm text-muted">
                    {lesson.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <a
                    className="grid overflow-hidden rounded-md border border-line no-underline sm:grid-cols-[220px_1fr]"
                    href={watchUrl(lesson)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${lesson.videoId}/hqdefault.jpg`}
                      alt=""
                      className="h-36 w-full object-cover sm:h-full"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className="flex flex-col justify-center gap-1 p-4">
                      <span className="text-xs text-faint">{lesson.channel}</span>
                      <span className="font-semibold text-fg">{lesson.videoTitle}</span>
                      <span className="text-sm text-brand">Auf YouTube ansehen</span>
                    </span>
                  </a>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}
