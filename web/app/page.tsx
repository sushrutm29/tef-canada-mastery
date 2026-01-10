import FrenchLearningClient from "@/components/FrenchLearningClient"

interface Expression {
  french: string
  english: string
}

interface Option {
  text: string
  correct: boolean
  error?: string
}

interface Blank {
  id: number
  options: Option[]
}

interface ArticleSegment {
  text?: string
  blank?: Blank
}

const expressions: Expression[] = [
  { french: "Tout a basculé lorsque...", english: "Everything changed when..." },
  { french: "... ont eu la frayeur de leur vie", english: "... got the fright of their lives" },
  { french: "Ils ont alors ... mais sans résultat", english: "They then (did) ... but without result" },
  { french: "Aussitôt alertées ... se sont rendues sur les lieux", english: "As soon as (they were) alerted ... went to the scene" },
  { french: "C'est alors qu'un détail a attiré l'attention des enquêteurs:", english: "That's when a detail caught the investigators' attention:" },
  { french: "Mais malgré ... a fini par échouer", english: "But despite ... ended up failing" },
  { french: "Aux alentours de ... a entendu leurs cris à l'aide", english: "In the ballpark of (specific time) ... heard their cry for help" },
  { french: "N'écoutant que son courage ...", english: "Acting solely on courage ..." },
  { french: "En l'espace de minutes chargées d'émotions ...", english: "In the space of a few emotionally charged minutes ..." },
]

const articlePrompt =
  "Un groupe de 20 couples escaladait une montagne pour se marier ensemble dans le cadre d'une quête."

const articleSegments: ArticleSegment[] = [
  { text: "Tout a basculé lorsque " },
  {
    blank: {
      id: 1,
      options: [
        { text: "un des couples s'est perdu sans trace", correct: true },
        {
          text: "un des couples se sont perdus sans trace",
          correct: false,
          error: "'un des couples' is singular, so use 's'est perdu'",
        },
        {
          text: "un des couples s'est perdue sans trace",
          correct: false,
          error: "'couples' is masculine, so 'perdu' not 'perdue'",
        },
        {
          text: "un des couples est perdu sans trace",
          correct: false,
          error: "'se perdre' uses 'être' → 's'est perdu'",
        },
      ],
    },
  },
  { text: ". La situation, jusque-là sous contrôle, a subitement dégénéré. " },
  {
    blank: {
      id: 2,
      options: [
        { text: "Leurs camarades", correct: true },
        {
          text: "Leur camarades",
          correct: false,
          error: "'camarades' is plural, so use 'Leurs' not 'Leur'",
        },
        {
          text: "Leurs camarade",
          correct: false,
          error: "'Leurs' is plural, so 'camarades' needs an 's'",
        },
        {
          text: "Son camarades",
          correct: false,
          error: "'camarades' is plural, so use 'Leurs' not 'Son'",
        },
      ],
    },
  },
  { text: " ont eu la frayeur de leur vie. Ils ont alors " },
  {
    blank: {
      id: 3,
      options: [
        { text: "commencé leurs recherches", correct: true },
        {
          text: "commencés leurs recherches",
          correct: false,
          error: "Past participle with 'avoir' doesn't agree with subject here",
        },
        {
          text: "commencé leur recherches",
          correct: false,
          error: "'recherches' is plural, so use 'leurs' not 'leur'",
        },
        {
          text: "commencer leurs recherches",
          correct: false,
          error: "After 'ont', use past participle 'commencé' not infinitive",
        },
      ],
    },
  },
  { text: " mais sans résultat.\n\n" },
  { text: "Aussitôt alertées, " },
  {
    blank: {
      id: 4,
      options: [
        { text: "les forces de la police et des sapeurs-pompiers", correct: true },
        {
          text: "les forces de la police et des sapeurs-pompier",
          correct: false,
          error: "'sapeurs-pompiers' needs plural 's' on both words",
        },
        {
          text: "la forces de la police et des sapeurs-pompiers",
          correct: false,
          error: "'forces' is plural, so use 'les' not 'la'",
        },
        {
          text: "les force de la police et des sapeurs-pompiers",
          correct: false,
          error: "'les' is plural, so 'forces' needs an 's'",
        },
      ],
    },
  },
  { text: " se sont rendues sur les lieux. C'est alors qu'un détail a attiré l'attention des enquêteurs: " },
  {
    blank: {
      id: 5,
      options: [
        { text: "une pièce de leurs vêtements", correct: true },
        {
          text: "une pièce de leur vêtements",
          correct: false,
          error: "'vêtements' is plural, so use 'leurs' not 'leur'",
        },
        {
          text: "un pièce de leurs vêtements",
          correct: false,
          error: "'pièce' is feminine, so use 'une' not 'un'",
        },
        {
          text: "une pièce de leurs vêtement",
          correct: false,
          error: "'leurs' is plural, so 'vêtements' needs an 's'",
        },
      ],
    },
  },
  { text: ". Mais malgré " },
  {
    blank: {
      id: 6,
      options: [
        { text: "des heures de recherches", correct: true },
        {
          text: "des heures de recherche",
          correct: false,
          error: "'heures' is plural, so 'recherches' should also be plural",
        },
        {
          text: "de heures de recherches",
          correct: false,
          error: "Use 'des' not 'de' before plural noun starting with consonant",
        },
        {
          text: "des heure de recherches",
          correct: false,
          error: "'des' is plural, so 'heures' needs an 's'",
        },
      ],
    },
  },
  { text: ", " },
  {
    blank: {
      id: 7,
      options: [
        { text: "l'enquête", correct: true },
        {
          text: "l'enquêtes",
          correct: false,
          error: "Elision 'l'' is for singular, so 'enquête' not plural",
        },
        {
          text: "le enquête",
          correct: false,
          error: "'enquête' is feminine, use 'l'' not 'le' before vowel",
        },
        {
          text: "la enquête",
          correct: false,
          error: "Use elision 'l'' before vowel, not 'la'",
        },
      ],
    },
  },
  { text: " a fini par échouer.\n\n" },
  { text: "Aux alentours de " },
  {
    blank: {
      id: 8,
      options: [
        { text: "16 heures", correct: true },
        {
          text: "16 heure",
          correct: false,
          error: "Time expression uses plural: '16 heures'",
        },
        {
          text: "seize heure",
          correct: false,
          error: "'heure' should be plural after number greater than 1",
        },
        {
          text: "16 l'heures",
          correct: false,
          error: "No article needed with time expressions like '16 heures'",
        },
      ],
    },
  },
  { text: ", " },
  {
    blank: {
      id: 9,
      options: [
        { text: "un jeune homme du groupe, Pablo Escobar,", correct: true },
        {
          text: "une jeune homme du groupe, Pablo Escobar,",
          correct: false,
          error: "'homme' is masculine, so use 'un' not 'une'",
        },
        {
          text: "un jeune hommes du groupe, Pablo Escobar,",
          correct: false,
          error: "'un' is singular, so 'homme' not 'hommes'",
        },
        {
          text: "un jeune homme de groupe, Pablo Escobar,",
          correct: false,
          error: "Use 'du groupe' (de + le) not 'de groupe'",
        },
      ],
    },
  },
  { text: " a entendu leurs cris à l'aide. N'écoutant que son courage, " },
  {
    blank: {
      id: 10,
      options: [
        { text: "il a suivi la source du son", correct: true },
        {
          text: "il a suivie la source du son",
          correct: false,
          error: "Past participle with 'avoir': 'suivi' stays invariable here",
        },
        {
          text: "il a suivi le source du son",
          correct: false,
          error: "'source' is feminine, so use 'la' not 'le'",
        },
        {
          text: "il a suivi la source de son",
          correct: false,
          error: "Use 'du son' (de + le) not 'de son'",
        },
      ],
    },
  },
  { text: ". En l'espace de minutes chargées d'émotions, " },
  {
    blank: {
      id: 11,
      options: [
        { text: "Pablo a retrouvé le couple perdu", correct: true },
        {
          text: "Pablo a retrouvée le couple perdu",
          correct: false,
          error: "Past participle with 'avoir': 'retrouvé' doesn't agree with subject",
        },
        {
          text: "Pablo a retrouvé la couple perdu",
          correct: false,
          error: "'couple' is masculine, so use 'le' not 'la'",
        },
        {
          text: "Pablo a retrouvé le couple perdue",
          correct: false,
          error: "'couple' is masculine, so 'perdu' not 'perdue'",
        },
      ],
    },
  },
  { text: ".\n\n" },
  {
    text: "Les couples, finalement rassurés, ont continué leur randonnée et ont réussi leur objectif. « Je croyais qu'on allait mourir », dit Maria, heureuse nouvelle mariée.",
  },
]

// Server Component - shuffles data once on server
export default function FrenchLearningApp() {
  // Shuffle options for each blank (happens on server only)
  const shuffledBlanks = articleSegments
    .filter((seg) => seg.blank)
    .map((seg) => {
      const blank = seg.blank!
      const shuffledOptions = [...blank.options].sort(() => Math.random() - 0.5)
      return { ...blank, options: shuffledOptions }
    })

  return (
    <FrenchLearningClient
      expressions={expressions}
      articlePrompt={articlePrompt}
      articleSegments={articleSegments}
      shuffledBlanks={shuffledBlanks}
    />
  )
}
