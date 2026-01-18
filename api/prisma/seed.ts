import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.option.deleteMany();
  await prisma.blank.deleteMany();
  await prisma.articleSegment.deleteMany();
  await prisma.articleExpression.deleteMany();
  await prisma.expression.deleteMany();
  await prisma.article.deleteMany();

  console.log('Creating expressions...');
  
  // Create expressions
  const expressions = await Promise.all([
    prisma.expression.create({
      data: { french: "Tout a basculé lorsque...", english: "Everything changed when..." },
    }),
    prisma.expression.create({
      data: { french: "... ont eu la frayeur de leur vie", english: "... got the fright of their lives" },
    }),
    prisma.expression.create({
      data: { french: "Ils ont alors ... mais sans résultat", english: "They then (did) ... but without result" },
    }),
    prisma.expression.create({
      data: { french: "Aussitôt alertées ... se sont rendues sur les lieux", english: "As soon as (they were) alerted ... went to the scene" },
    }),
    prisma.expression.create({
      data: { french: "C'est alors qu'un détail a attiré l'attention des enquêteurs:", english: "That's when a detail caught the investigators' attention:" },
    }),
    prisma.expression.create({
      data: { french: "Mais malgré ... a fini par échouer", english: "But despite ... ended up failing" },
    }),
    prisma.expression.create({
      data: { french: "Aux alentours de ... a entendu leurs cris à l'aide", english: "In the ballpark of (specific time) ... heard their cry for help" },
    }),
    prisma.expression.create({
      data: { french: "N'écoutant que son courage ...", english: "Acting solely on courage ..." },
    }),
    prisma.expression.create({
      data: { french: "En l'espace de minutes chargées d'émotions ...", english: "In the space of a few emotionally charged minutes ..." },
    }),
  ]);

  console.log(`Created ${expressions.length} expressions`);

  // Create article
  const article = await prisma.article.create({
    data: {
      prompt: "Un groupe de 20 couples escaladait une montagne pour se marier ensemble dans le cadre d'une quête.",
      published: true,
      expressions: {
        create: expressions.map(expr => ({ expressionId: expr.id })),
      },
    },
  });

  console.log(`Created article: ${article.prompt}`);

  // Create segments with their blanks
  const segmentsData = [
    { order: 0, type: 'TEXT' as const, content: "Tout a basculé lorsque " },
    {
      order: 1,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "un des couples s'est perdu sans trace", correct: true },
        { text: "un des couples se sont perdus sans trace", correct: false, error: "'un des couples' is singular, so use 's'est perdu'" },
        { text: "un des couples s'est perdue sans trace", correct: false, error: "'couples' is masculine, so 'perdu' not 'perdue'" },
        { text: "un des couples est perdu sans trace", correct: false, error: "'se perdre' uses 'être' → 's'est perdu'" },
      ],
    },
    { order: 2, type: 'TEXT' as const, content: ". La situation, jusque-là sous contrôle, a subitement dégénéré. " },
    {
      order: 3,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "Leurs camarades", correct: true },
        { text: "Leur camarades", correct: false, error: "'camarades' is plural, so use 'Leurs' not 'Leur'" },
        { text: "Leurs camarade", correct: false, error: "'Leurs' is plural, so 'camarades' needs an 's'" },
        { text: "Son camarades", correct: false, error: "'camarades' is plural, so use 'Leurs' not 'Son'" },
      ],
    },
    { order: 4, type: 'TEXT' as const, content: " ont eu la frayeur de leur vie. Ils ont alors " },
    {
      order: 5,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "commencé leurs recherches", correct: true },
        { text: "commencés leurs recherches", correct: false, error: "Past participle with 'avoir' doesn't agree with subject here" },
        { text: "commencé leur recherches", correct: false, error: "'recherches' is plural, so use 'leurs' not 'leur'" },
        { text: "commencer leurs recherches", correct: false, error: "After 'ont', use past participle 'commencé' not infinitive" },
      ],
    },
    { order: 6, type: 'TEXT' as const, content: " mais sans résultat.\n\n" },
    { order: 7, type: 'TEXT' as const, content: "Aussitôt alertées, " },
    {
      order: 8,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "les forces de la police et des sapeurs-pompiers", correct: true },
        { text: "les forces de la police et des sapeurs-pompier", correct: false, error: "'sapeurs-pompiers' needs plural 's' on both words" },
        { text: "la forces de la police et des sapeurs-pompiers", correct: false, error: "'forces' is plural, so use 'les' not 'la'" },
        { text: "les force de la police et des sapeurs-pompiers", correct: false, error: "'les' is plural, so 'forces' needs an 's'" },
      ],
    },
    { order: 9, type: 'TEXT' as const, content: " se sont rendues sur les lieux. C'est alors qu'un détail a attiré l'attention des enquêteurs: " },
    {
      order: 10,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "une pièce de leurs vêtements", correct: true },
        { text: "une pièce de leur vêtements", correct: false, error: "'vêtements' is plural, so use 'leurs' not 'leur'" },
        { text: "un pièce de leurs vêtements", correct: false, error: "'pièce' is feminine, so use 'une' not 'un'" },
        { text: "une pièce de leurs vêtement", correct: false, error: "'leurs' is plural, so 'vêtements' needs an 's'" },
      ],
    },
    { order: 11, type: 'TEXT' as const, content: ". Mais malgré " },
    {
      order: 12,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "des heures de recherches", correct: true },
        { text: "des heures de recherche", correct: false, error: "'heures' is plural, so 'recherches' should also be plural" },
        { text: "de heures de recherches", correct: false, error: "Use 'des' not 'de' before plural noun starting with consonant" },
        { text: "des heure de recherches", correct: false, error: "'des' is plural, so 'heures' needs an 's'" },
      ],
    },
    { order: 13, type: 'TEXT' as const, content: ", " },
    {
      order: 14,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "l'enquête", correct: true },
        { text: "l'enquêtes", correct: false, error: "Elision 'l'' is for singular, so 'enquête' not plural" },
        { text: "le enquête", correct: false, error: "'enquête' is feminine, use 'l'' not 'le' before vowel" },
        { text: "la enquête", correct: false, error: "Use elision 'l'' before vowel, not 'la'" },
      ],
    },
    { order: 15, type: 'TEXT' as const, content: " a fini par échouer.\n\n" },
    { order: 16, type: 'TEXT' as const, content: "Aux alentours de " },
    {
      order: 17,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "16 heures", correct: true },
        { text: "16 heure", correct: false, error: "Time expression uses plural: '16 heures'" },
        { text: "seize heure", correct: false, error: "'heure' should be plural after number greater than 1" },
        { text: "16 l'heures", correct: false, error: "No article needed with time expressions like '16 heures'" },
      ],
    },
    { order: 18, type: 'TEXT' as const, content: ", " },
    {
      order: 19,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "un jeune homme du groupe, Pablo Escobar,", correct: true },
        { text: "une jeune homme du groupe, Pablo Escobar,", correct: false, error: "'homme' is masculine, so use 'un' not 'une'" },
        { text: "un jeune hommes du groupe, Pablo Escobar,", correct: false, error: "'un' is singular, so 'homme' not 'hommes'" },
        { text: "un jeune homme de groupe, Pablo Escobar,", correct: false, error: "Use 'du groupe' (de + le) not 'de groupe'" },
      ],
    },
    { order: 20, type: 'TEXT' as const, content: " a entendu leurs cris à l'aide. N'écoutant que son courage, " },
    {
      order: 21,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "il a suivi la source du son", correct: true },
        { text: "il a suivie la source du son", correct: false, error: "Past participle with 'avoir': 'suivi' stays invariable here" },
        { text: "il a suivi le source du son", correct: false, error: "'source' is feminine, so use 'la' not 'le'" },
        { text: "il a suivi la source de son", correct: false, error: "Use 'du son' (de + le) not 'de son'" },
      ],
    },
    { order: 22, type: 'TEXT' as const, content: ". En l'espace de minutes chargées d'émotions, " },
    {
      order: 23,
      type: 'BLANK' as const,
      blankOptions: [
        { text: "Pablo a retrouvé le couple perdu", correct: true },
        { text: "Pablo a retrouvée le couple perdu", correct: false, error: "Past participle with 'avoir': 'retrouvé' doesn't agree with subject" },
        { text: "Pablo a retrouvé la couple perdu", correct: false, error: "'couple' is masculine, so use 'le' not 'la'" },
        { text: "Pablo a retrouvé le couple perdue", correct: false, error: "'couple' is masculine, so 'perdu' not 'perdue'" },
      ],
    },
    { order: 24, type: 'TEXT' as const, content: ".\n\n" },
    { order: 25, type: 'TEXT' as const, content: "Les couples, finalement rassurés, ont continué leur randonnée et ont réussi leur objectif. « Je croyais qu'on allait mourir », dit Maria, heureuse nouvelle mariée." },
  ];

  console.log('Creating segments and blanks...');

  for (const segData of segmentsData) {
    if (segData.type === 'TEXT') {
      await prisma.articleSegment.create({
        data: {
          articleId: article.id,
          order: segData.order,
          type: segData.type,
          content: segData.content,
        },
      });
    } else {
      // Create segment with nested blank create
      await prisma.articleSegment.create({
        data: {
          articleId: article.id,
          order: segData.order,
          type: segData.type,
          blank: {
            create: {
              options: {
                create: segData.blankOptions!,
              },
            },
          },
        },
      });
    }
  }

  console.log('Seed completed successfully!');
  console.log(`Created article with ${segmentsData.length} segments (11 blanks, 15 text segments)`);
  console.log(`Total expressions: ${expressions.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });