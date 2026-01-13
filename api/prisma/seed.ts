import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

interface ExpressionData {
  french: string;
  english: string;
}

interface OptionData {
  text: string;
  correct: boolean;
  error?: string;
}

interface BlankData {
  position: number;
  options: OptionData[];
}

async function main(): Promise<void> {
  console.log('🌱 Starting seed...');

  // Clear existing data (in correct order due to foreign keys)
  await prisma.option.deleteMany();
  await prisma.blank.deleteMany();
  await prisma.articleExpression.deleteMany();
  await prisma.article.deleteMany();
  await prisma.expression.deleteMany();

  console.log('🧹 Cleared existing data');

  // Create expressions
  const expressions: ExpressionData[] = [
    { french: "Tout a basculé lorsque...", english: "Everything changed when..." },
    { french: "... ont eu la frayeur de leur vie", english: "... got the fright of their lives" },
    { french: "Ils ont alors ... mais sans résultat", english: "They then (did) ... but without result" },
    { french: "Aussitôt alertées ... se sont rendues sur les lieux", english: "As soon as (they were) alerted ... went to the scene" },
    { french: "C'est alors qu'un détail a attiré l'attention des enquêteurs:", english: "That's when a detail caught the investigators' attention:" },
    { french: "Mais malgré ... a fini par échouer", english: "But despite ... ended up failing" },
    { french: "Aux alentours de ... a entendu leurs cris à l'aide", english: "In the ballpark of (specific time) ... heard their cry for help" },
    { french: "N'écoutant que son courage ...", english: "Acting solely on courage ..." },
    { french: "En l'espace de minutes chargées d'émotions ...", english: "In the space of a few emotionally charged minutes ..." },
  ];

  const createdExpressions: Array<{ id: string }> = [];
  for (const expr of expressions) {
    const created = await prisma.expression.create({ data: expr });
    createdExpressions.push(created);
  }

  console.log('✅ Seeded expressions');

  // Create article
  const article = await prisma.article.create({
    data: {
      prompt: "Un groupe de 20 couples escaladait une montagne pour se marier ensemble dans le cadre d'une quête.",
      content: "Tout a basculé lorsque [BLANK1]. La situation, jusque-là sous contrôle, a subitement dégénéré. [BLANK2] ont eu la frayeur de leur vie. Ils ont alors [BLANK3] mais sans résultat.\n\nAussitôt alertées, [BLANK4] se sont rendues sur les lieux. C'est alors qu'un détail a attiré l'attention des enquêteurs: [BLANK5]. Mais malgré [BLANK6], [BLANK7] a fini par échouer.\n\nAux alentours de [BLANK8], [BLANK9] a entendu leurs cris à l'aide. N'écoutant que son courage, [BLANK10]. En l'espace de minutes chargées d'émotions, [BLANK11].\n\nLes couples, finalement rassurés, ont continué leur randonnée et ont réussi leur objectif. « Je croyais qu'on allait mourir », dit Maria, heureuse nouvelle mariée.",
    },
  });

  console.log('✅ Created article');

  // Link expressions to article
  for (const expr of createdExpressions) {
    await prisma.articleExpression.create({
      data: {
        articleId: article.id,
        expressionId: expr.id,
      },
    });
  }

  console.log('✅ Linked expressions to article');

  // Create all 11 blanks with their options
  const blanksData: BlankData[] = [
    {
      position: 1,
      options: [
        { text: "un des couples s'est perdu sans trace", correct: true },
        { text: "un des couples se sont perdus sans trace", correct: false, error: "'un des couples' is singular, so use 's'est perdu'" },
        { text: "un des couples s'est perdue sans trace", correct: false, error: "'couples' is masculine, so 'perdu' not 'perdue'" },
        { text: "un des couples est perdu sans trace", correct: false, error: "'se perdre' uses 'être' → 's'est perdu'" },
      ],
    },
    {
      position: 2,
      options: [
        { text: "Leurs camarades", correct: true },
        { text: "Leur camarades", correct: false, error: "'camarades' is plural, so use 'Leurs' not 'Leur'" },
        { text: "Leurs camarade", correct: false, error: "'Leurs' is plural, so 'camarades' needs an 's'" },
        { text: "Son camarades", correct: false, error: "'camarades' is plural, so use 'Leurs' not 'Son'" },
      ],
    },
    {
      position: 3,
      options: [
        { text: "commencé leurs recherches", correct: true },
        { text: "commencés leurs recherches", correct: false, error: "Past participle with 'avoir' doesn't agree with subject here" },
        { text: "commencé leur recherches", correct: false, error: "'recherches' is plural, so use 'leurs' not 'leur'" },
        { text: "commencer leurs recherches", correct: false, error: "After 'ont', use past participle 'commencé' not infinitive" },
      ],
    },
    {
      position: 4,
      options: [
        { text: "les forces de la police et des sapeurs-pompiers", correct: true },
        { text: "les forces de la police et des sapeurs-pompier", correct: false, error: "'sapeurs-pompiers' needs plural 's' on both words" },
        { text: "la forces de la police et des sapeurs-pompiers", correct: false, error: "'forces' is plural, so use 'les' not 'la'" },
        { text: "les force de la police et des sapeurs-pompiers", correct: false, error: "'les' is plural, so 'forces' needs an 's'" },
      ],
    },
    {
      position: 5,
      options: [
        { text: "une pièce de leurs vêtements", correct: true },
        { text: "une pièce de leur vêtements", correct: false, error: "'vêtements' is plural, so use 'leurs' not 'leur'" },
        { text: "un pièce de leurs vêtements", correct: false, error: "'pièce' is feminine, so use 'une' not 'un'" },
        { text: "une pièce de leurs vêtement", correct: false, error: "'leurs' is plural, so 'vêtements' needs an 's'" },
      ],
    },
    {
      position: 6,
      options: [
        { text: "des heures de recherches", correct: true },
        { text: "des heures de recherche", correct: false, error: "'heures' is plural, so 'recherches' should also be plural" },
        { text: "de heures de recherches", correct: false, error: "Use 'des' not 'de' before plural noun starting with consonant" },
        { text: "des heure de recherches", correct: false, error: "'des' is plural, so 'heures' needs an 's'" },
      ],
    },
    {
      position: 7,
      options: [
        { text: "l'enquête", correct: true },
        { text: "l'enquêtes", correct: false, error: "Elision 'l'' is for singular, so 'enquête' not plural" },
        { text: "le enquête", correct: false, error: "'enquête' is feminine, use 'l'' not 'le' before vowel" },
        { text: "la enquête", correct: false, error: "Use elision 'l'' before vowel, not 'la'" },
      ],
    },
    {
      position: 8,
      options: [
        { text: "16 heures", correct: true },
        { text: "16 heure", correct: false, error: "Time expression uses plural: '16 heures'" },
        { text: "seize heure", correct: false, error: "'heure' should be plural after number greater than 1" },
        { text: "16 l'heures", correct: false, error: "No article needed with time expressions like '16 heures'" },
      ],
    },
    {
      position: 9,
      options: [
        { text: "un jeune homme du groupe, Pablo Escobar,", correct: true },
        { text: "une jeune homme du groupe, Pablo Escobar,", correct: false, error: "'homme' is masculine, so use 'un' not 'une'" },
        { text: "un jeune hommes du groupe, Pablo Escobar,", correct: false, error: "'un' is singular, so 'homme' not 'hommes'" },
        { text: "un jeune homme de groupe, Pablo Escobar,", correct: false, error: "Use 'du groupe' (de + le) not 'de groupe'" },
      ],
    },
    {
      position: 10,
      options: [
        { text: "il a suivi la source du son", correct: true },
        { text: "il a suivie la source du son", correct: false, error: "Past participle with 'avoir': 'suivi' stays invariable here" },
        { text: "il a suivi le source du son", correct: false, error: "'source' is feminine, so use 'la' not 'le'" },
        { text: "il a suivi la source de son", correct: false, error: "Use 'du son' (de + le) not 'de son'" },
      ],
    },
    {
      position: 11,
      options: [
        { text: "Pablo a retrouvé le couple perdu", correct: true },
        { text: "Pablo a retrouvée le couple perdu", correct: false, error: "Past participle with 'avoir': 'retrouvé' doesn't agree with subject" },
        { text: "Pablo a retrouvé la couple perdu", correct: false, error: "'couple' is masculine, so use 'le' not 'la'" },
        { text: "Pablo a retrouvé le couple perdue", correct: false, error: "'couple' is masculine, so 'perdu' not 'perdue'" },
      ],
    },
  ];

  for (const blankData of blanksData) {
    await prisma.blank.create({
      data: {
        position: blankData.position,
        articleId: article.id,
        options: {
          create: blankData.options,
        },
      },
    });
  }

  console.log('✅ Created all 11 blanks with options');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });