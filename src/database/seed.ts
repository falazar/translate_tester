import dotenv from 'dotenv';
import { closeDatabase, getDatabase } from './connection';

dotenv.config();

const LEVELS_DATA = [
  { level_number: 1, name: 'Basic Nouns & Actions', 
    description: 'Common everyday objects and basic verbs' },
  { level_number: 2, name: 'People & Places', 
    description: 'Family members and locations' },
  { level_number: 3, name: 'Pronouns & Grammar', 
    description: 'Essential pronouns, articles, and common adverbs', 
    total_words: 27 },
  { level_number: 4, name: 'Food & Dining', 
    description: 'Common foods and eating vocabulary' },
  { level_number: 5, name: 'Time & Weather', 
    description: 'Days, seasons, and weather terms' },
  { level_number: 6, name: 'Body & Health', 
    description: 'Body parts and health-related words' },
  { level_number: 7, name: 'Clothes & Colors', 
    description: 'Clothing items and colors' },
  { level_number: 8, name: 'House & Furniture', 
    description: 'Rooms and household items' },
  { level_number: 9, name: 'Travel & Transport', 
    description: 'Transportation and travel vocabulary' },
  { level_number: 10, name: 'Work & School', 
    description: 'Professional and educational terms' },
  { level_number: 11, name: 'Hobbies & Leisure', 
    description: 'Activities and entertainment' }
];

const WORDS_DATA = [
  // Level 1: Basic Nouns & Actions
  { french: 'le chat', english: 'cat', word_type: 'noun', 
    level: 1, gender: 'le' },
  { french: 'le chien', english: 'dog', word_type: 'noun', 
    level: 1, gender: 'le' },
  { french: 'la maison', english: 'house', word_type: 'noun', 
    level: 1, gender: 'la' },
  { french: 'le livre', english: 'book', word_type: 'noun', 
    level: 1, gender: 'le' },
  { french: 'la table', english: 'table', word_type: 'noun', 
    level: 1, gender: 'la' },
  { french: 'la chaise', english: 'chair', word_type: 'noun', 
    level: 1, gender: 'la' },
  { french: 'le pain', english: 'bread', word_type: 'noun', 
    level: 1, gender: 'le' },
  { french: 'l\'eau', english: 'water', word_type: 'noun', 
    level: 1, gender: 'la' },
  { french: 'la porte', english: 'door', word_type: 'noun', 
    level: 1, gender: 'la' },
  { french: 'le lit', english: 'bed', word_type: 'noun', 
    level: 1, gender: 'le' },
  { french: 'manger', english: 'to eat', word_type: 'verb', 
    level: 1, gender: null },
  { french: 'boire', english: 'to drink', word_type: 'verb', 
    level: 1, gender: null },
  { french: 'dormir', english: 'to sleep', word_type: 'verb', 
    level: 1, gender: null },
  { french: 'parler', english: 'to speak', word_type: 'verb', 
    level: 1, gender: null },
  { french: 'écouter', english: 'to listen', word_type: 'verb', 
    level: 1, gender: null },
  { french: 'regarder', english: 'to watch', word_type: 'verb', 
    level: 1, gender: null },
  { french: 'aimer', english: 'to like/love', word_type: 'verb', 
    level: 1, gender: null },
  { french: 'avoir', english: 'to have', word_type: 'verb', 
    level: 1, gender: null },
  { french: 'être', english: 'to be', word_type: 'verb', 
    level: 1, gender: null },
  { french: 'aller', english: 'to go', word_type: 'verb', 
    level: 1, gender: null },

  // Level 2: People & Places
  { french: 'la mère', english: 'mother', word_type: 'noun', 
    level: 2, gender: 'la' },
  { french: 'le père', english: 'father', word_type: 'noun', 
    level: 2, gender: 'le' },
  { french: 'le frère', english: 'brother', word_type: 'noun', 
    level: 2, gender: 'le' },
  { french: 'la soeur', english: 'sister', word_type: 'noun', 
    level: 2, gender: 'la' },
  { french: 'l\'ami', english: 'friend', word_type: 'noun', 
    level: 2, gender: 'le' },
  { french: 'la ville', english: 'city', word_type: 'noun', 
    level: 2, gender: 'la' },
  { french: 'le pays', english: 'country', word_type: 'noun', 
    level: 2, gender: 'le' },
  { french: 'la rue', english: 'street', word_type: 'noun', 
    level: 2, gender: 'la' },
  { french: 'le parc', english: 'park', word_type: 'noun', 
    level: 2, gender: 'le' },
  { french: 'l\'école', english: 'school', word_type: 'noun', 
    level: 2, gender: 'la' },
  { french: 'habiter', english: 'to live', word_type: 'verb', 
    level: 2, gender: null },
  { french: 'visiter', english: 'to visit', word_type: 'verb', 
    level: 2, gender: null },
  { french: 'rencontrer', english: 'to meet', word_type: 'verb', 
    level: 2, gender: null },
  { french: 'connaître', english: 'to know', word_type: 'verb', 
    level: 2, gender: null },
  { french: 'appeler', english: 'to call', word_type: 'verb', 
    level: 2, gender: null },
  { french: 'marcher', english: 'to walk', word_type: 'verb', 
    level: 2, gender: null },
  { french: 'courir', english: 'to run', word_type: 'verb', 
    level: 2, gender: null },
  { french: 'venir', english: 'to come', word_type: 'verb', 
    level: 2, gender: null },
  { french: 'partir', english: 'to leave', word_type: 'verb', 
    level: 2, gender: null },
  { french: 'rester', english: 'to stay', word_type: 'verb', 
    level: 2, gender: null },

  // Level 3: Pronouns & Grammar (27 words)
  // Subject pronouns
  { french: 'je', english: 'I', word_type: 'pronoun', 
    level: 3, gender: null },
  { french: 'tu', english: 'you (informal)', word_type: 'pronoun', 
    level: 3, gender: null },
  { french: 'il', english: 'he', word_type: 'pronoun', 
    level: 3, gender: null },
  { french: 'elle', english: 'she', word_type: 'pronoun', 
    level: 3, gender: null },
  { french: 'nous', english: 'we', word_type: 'pronoun', 
    level: 3, gender: null },
  { french: 'vous', english: 'you (formal/plural)', 
    word_type: 'pronoun', level: 3, gender: null },
  { french: 'ils', english: 'they (masculine)', 
    word_type: 'pronoun', level: 3, gender: null },
  { french: 'elles', english: 'they (feminine)', 
    word_type: 'pronoun', level: 3, gender: null },
  // Possessives
  { french: 'mon', english: 'my (masculine)', 
    word_type: 'possessive', level: 3, gender: null },
  { french: 'ma', english: 'my (feminine)', 
    word_type: 'possessive', level: 3, gender: null },
  { french: 'ton', english: 'your (informal, masculine)', 
    word_type: 'possessive', level: 3, gender: null },
  { french: 'ta', english: 'your (informal, feminine)', 
    word_type: 'possessive', level: 3, gender: null },
  { french: 'son', english: 'his/her (masculine)', 
    word_type: 'possessive', level: 3, gender: null },
  { french: 'sa', english: 'his/her (feminine)', 
    word_type: 'possessive', level: 3, gender: null },
  // Demonstratives
  { french: 'ce', english: 'this (masculine)', 
    word_type: 'demonstrative', level: 3, gender: null },
  { french: 'cette', english: 'this (feminine)', 
    word_type: 'demonstrative', level: 3, gender: null },
  { french: 'ces', english: 'these', word_type: 'demonstrative', 
    level: 3, gender: null },
  // Articles
  { french: 'un', english: 'a/an (masculine)', 
    word_type: 'article', level: 3, gender: null },
  { french: 'une', english: 'a/an (feminine)', 
    word_type: 'article', level: 3, gender: null },
  { french: 'des', english: 'some', word_type: 'article', 
    level: 3, gender: null },
  { french: 'le', english: 'the (masculine)', 
    word_type: 'article', level: 3, gender: null },
  { french: 'la', english: 'the (feminine)', 
    word_type: 'article', level: 3, gender: null },
  // Common adverbs
  { french: 'beaucoup', english: 'much/a lot', 
    word_type: 'adverb', level: 3, gender: null },
  { french: 'peu', english: 'little/few', word_type: 'adverb', 
    level: 3, gender: null },
  { french: 'très', english: 'very', word_type: 'adverb', 
    level: 3, gender: null },
  { french: 'aussi', english: 'also/too', word_type: 'adverb', 
    level: 3, gender: null },
  { french: 'maintenant', english: 'now', word_type: 'adverb', 
    level: 3, gender: null },

  // Level 4: Food & Dining (was Level 3)
  { french: 'le fromage', english: 'cheese', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'le fruit', english: 'fruit', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'le légume', english: 'vegetable', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'la viande', english: 'meat', word_type: 'noun', 
    level: 4, gender: 'la' },
  { french: 'le poisson', english: 'fish', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'le vin', english: 'wine', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'le café', english: 'coffee', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'le thé', english: 'tea', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'le repas', english: 'meal', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'la cuisine', english: 'kitchen/cooking', 
    word_type: 'noun', level: 4, gender: 'la' },
  { french: 'cuisiner', english: 'to cook', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'préparer', english: 'to prepare', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'goûter', english: 'to taste', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'commander', english: 'to order', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'servir', english: 'to serve', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'acheter', english: 'to buy', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'vendre', english: 'to sell', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'payer', english: 'to pay', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'choisir', english: 'to choose', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'préférer', english: 'to prefer', word_type: 'verb', 
    level: 4, gender: null },

  // Level 5: Time & Weather
  { french: 'le jour', english: 'day', word_type: 'noun', 
    level: 5, gender: 'le' },
  { french: 'la nuit', english: 'night', word_type: 'noun', 
    level: 5, gender: 'la' },
  { french: 'la semaine', english: 'week', word_type: 'noun', 
    level: 5, gender: 'la' },
  { french: 'le mois', english: 'month', word_type: 'noun', 
    level: 5, gender: 'le' },
  { french: 'l\'année', english: 'year', word_type: 'noun', 
    level: 5, gender: 'la' },
  { french: 'le temps', english: 'time/weather', word_type: 'noun', 
    level: 5, gender: 'le' },
  { french: 'le soleil', english: 'sun', word_type: 'noun', 
    level: 5, gender: 'le' },
  { french: 'la pluie', english: 'rain', word_type: 'noun', 
    level: 5, gender: 'la' },
  { french: 'le vent', english: 'wind', word_type: 'noun', 
    level: 5, gender: 'le' },
  { french: 'la neige', english: 'snow', word_type: 'noun', 
    level: 5, gender: 'la' },
  { french: 'attendre', english: 'to wait', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'commencer', english: 'to start', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'finir', english: 'to finish', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'durer', english: 'to last', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'changer', english: 'to change', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'pleuvoir', english: 'to rain', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'neiger', english: 'to snow', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'briller', english: 'to shine', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'faire', english: 'to do/make', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'passer', english: 'to spend/pass', word_type: 'verb', 
    level: 5, gender: null },

  // Level 6: Body & Health
  { french: 'la tête', english: 'head', word_type: 'noun', 
    level: 6, gender: 'la' },
  { french: 'le bras', english: 'arm', word_type: 'noun', 
    level: 6, gender: 'le' },
  { french: 'la main', english: 'hand', word_type: 'noun', 
    level: 6, gender: 'la' },
  { french: 'la jambe', english: 'leg', word_type: 'noun', 
    level: 6, gender: 'la' },
  { french: 'le pied', english: 'foot', word_type: 'noun', 
    level: 6, gender: 'le' },
  { french: 'l\'oeil', english: 'eye', word_type: 'noun', 
    level: 6, gender: 'le' },
  { french: 'la bouche', english: 'mouth', word_type: 'noun', 
    level: 6, gender: 'la' },
  { french: 'le coeur', english: 'heart', word_type: 'noun', 
    level: 6, gender: 'le' },
  { french: 'le corps', english: 'body', word_type: 'noun', 
    level: 6, gender: 'le' },
  { french: 'la santé', english: 'health', word_type: 'noun', 
    level: 6, gender: 'la' },
  { french: 'soigner', english: 'to care for', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'guérir', english: 'to heal', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'sentir', english: 'to feel', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'toucher', english: 'to touch', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'voir', english: 'to see', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'entendre', english: 'to hear', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'respirer', english: 'to breathe', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'bouger', english: 'to move', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'tomber', english: 'to fall', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'lever', english: 'to lift/raise', word_type: 'verb', 
    level: 6, gender: null },

  // Level 7: Clothes & Colors
  { french: 'le vêtement', english: 'clothing', word_type: 'noun', 
    level: 7, gender: 'le' },
  { french: 'la chemise', english: 'shirt', word_type: 'noun', 
    level: 7, gender: 'la' },
  { french: 'le pantalon', english: 'pants', word_type: 'noun', 
    level: 7, gender: 'le' },
  { french: 'la robe', english: 'dress', word_type: 'noun', 
    level: 7, gender: 'la' },
  { french: 'le chapeau', english: 'hat', word_type: 'noun', 
    level: 7, gender: 'le' },
  { french: 'la chaussure', english: 'shoe', word_type: 'noun', 
    level: 7, gender: 'la' },
  { french: 'la couleur', english: 'color', word_type: 'noun', 
    level: 7, gender: 'la' },
  { french: 'le rouge', english: 'red', word_type: 'adjective', 
    level: 7, gender: 'le' },
  { french: 'le bleu', english: 'blue', word_type: 'adjective', 
    level: 7, gender: 'le' },
  { french: 'le blanc', english: 'white', word_type: 'adjective', 
    level: 7, gender: 'le' },
  { french: 'porter', english: 'to wear', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'mettre', english: 'to put on', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'enlever', english: 'to take off', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'essayer', english: 'to try on', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'plier', english: 'to fold', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'laver', english: 'to wash', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'sécher', english: 'to dry', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'repasser', english: 'to iron', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'coudre', english: 'to sew', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'nettoyer', english: 'to clean', word_type: 'verb', 
    level: 7, gender: null },

  // Level 8: House & Furniture
  { french: 'la chambre', english: 'bedroom', word_type: 'noun', 
    level: 8, gender: 'la' },
  { french: 'le salon', english: 'living room', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'la salle', english: 'room', word_type: 'noun', 
    level: 8, gender: 'la' },
  { french: 'le mur', english: 'wall', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'la fenêtre', english: 'window', word_type: 'noun', 
    level: 8, gender: 'la' },
  { french: 'le toit', english: 'roof', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'le meuble', english: 'furniture', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'le canapé', english: 'sofa', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'l\'armoire', english: 'wardrobe', word_type: 'noun', 
    level: 8, gender: 'la' },
  { french: 'le miroir', english: 'mirror', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'ouvrir', english: 'to open', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'fermer', english: 'to close', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'ranger', english: 'to tidy', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'décorer', english: 'to decorate', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'construire', english: 'to build', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'réparer', english: 'to repair', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'peindre', english: 'to paint', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'louer', english: 'to rent', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'déménager', english: 'to move', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'habiter', english: 'to inhabit', word_type: 'verb', 
    level: 8, gender: null },

  // Level 9: Travel & Transport
  { french: 'le voyage', english: 'trip', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'la voiture', english: 'car', word_type: 'noun', 
    level: 9, gender: 'la' },
  { french: 'le train', english: 'train', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'l\'avion', english: 'airplane', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'le bus', english: 'bus', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'le vélo', english: 'bike', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'la route', english: 'road', word_type: 'noun', 
    level: 9, gender: 'la' },
  { french: 'la gare', english: 'station', word_type: 'noun', 
    level: 9, gender: 'la' },
  { french: 'l\'aéroport', english: 'airport', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'le billet', english: 'ticket', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'voyager', english: 'to travel', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'conduire', english: 'to drive', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'prendre', english: 'to take', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'monter', english: 'to get on', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'descendre', english: 'to get off', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'arriver', english: 'to arrive', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'partir', english: 'to depart', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'réserver', english: 'to reserve', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'chercher', english: 'to look for', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'trouver', english: 'to find', word_type: 'verb', 
    level: 9, gender: null },

  // Level 10: Work & School
  { french: 'le travail', english: 'work', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'le bureau', english: 'office', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'l\'étudiant', english: 'student', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'le professeur', english: 'teacher', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'la leçon', english: 'lesson', word_type: 'noun', 
    level: 10, gender: 'la' },
  { french: 'l\'examen', english: 'exam', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'le stylo', english: 'pen', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'le papier', english: 'paper', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'l\'ordinateur', english: 'computer', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'le projet', english: 'project', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'travailler', english: 'to work', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'étudier', english: 'to study', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'apprendre', english: 'to learn', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'enseigner', english: 'to teach', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'écrire', english: 'to write', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'lire', english: 'to read', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'comprendre', english: 'to understand', 
    word_type: 'verb', level: 9, gender: null },
  { french: 'réussir', english: 'to succeed', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'essayer', english: 'to try', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'créer', english: 'to create', word_type: 'verb', 
    level: 10, gender: null },

  // Level 11: Hobbies & Leisure
  { french: 'le loisir', english: 'leisure', word_type: 'noun', 
    level: 11, gender: 'le' },
  { french: 'le sport', english: 'sport', word_type: 'noun', 
    level: 11, gender: 'le' },
  { french: 'la musique', english: 'music', word_type: 'noun', 
    level: 11, gender: 'la' },
  { french: 'le film', english: 'movie', word_type: 'noun', 
    level: 11, gender: 'le' },
  { french: 'le jeu', english: 'game', word_type: 'noun', 
    level: 11, gender: 'le' },
  { french: 'la danse', english: 'dance', word_type: 'noun', 
    level: 11, gender: 'la' },
  { french: 'la photo', english: 'photo', word_type: 'noun', 
    level: 11, gender: 'la' },
  { french: 'le concert', english: 'concert', word_type: 'noun', 
    level: 11, gender: 'le' },
  { french: 'le cinéma', english: 'cinema', word_type: 'noun', 
    level: 11, gender: 'le' },
  { french: 'la fête', english: 'party', word_type: 'noun', 
    level: 11, gender: 'la' },
  { french: 'jouer', english: 'to play', word_type: 'verb', 
    level: 11, gender: null },
  { french: 'danser', english: 'to dance', word_type: 'verb', 
    level: 11, gender: null },
  { french: 'chanter', english: 'to sing', word_type: 'verb', 
    level: 11, gender: null },
  { french: 'dessiner', english: 'to draw', word_type: 'verb', 
    level: 11, gender: null },
  { french: 'photographier', english: 'to photograph', 
    word_type: 'verb', level: 10, gender: null },
  { french: 'nager', english: 'to swim', word_type: 'verb', 
    level: 11, gender: null },
  { french: 'sauter', english: 'to jump', word_type: 'verb', 
    level: 11, gender: null },
  { french: 'rire', english: 'to laugh', word_type: 'verb', 
    level: 11, gender: null },
  { french: 's\'amuser', english: 'to have fun', word_type: 'verb', 
    level: 11, gender: null },
  { french: 'profiter', english: 'to enjoy', word_type: 'verb', 
    level: 11, gender: null }
];

function seedDatabase() {
  console.log('Seeding database...');
  
  try {
    const db = getDatabase();

    // UPSERT mode: updates existing, inserts new
    // This preserves word IDs so your progress stays intact!
    console.log('Upserting curriculum data...');

    // Upsert levels
    console.log('Upserting levels...');
    const upsertLevel = db.prepare(`
      INSERT INTO levels (level_number, name, description, 
                          required_pass_rate, total_words)
      VALUES (?, ?, ?, 90, ?)
      ON CONFLICT(level_number) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        total_words = excluded.total_words
    `);

    for (const level of LEVELS_DATA) {
      upsertLevel.run(
        level.level_number, 
        level.name, 
        level.description,
        level.total_words || 20
      );
    }

    // Upsert words
    console.log('Upserting words...');
    const upsertWord = db.prepare(`
      INSERT INTO words (french, english, word_type, level_id, gender)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(french, level_id) DO UPDATE SET
        english = excluded.english,
        word_type = excluded.word_type,
        gender = excluded.gender
    `);

    // Get level IDs for lookup
    const getLevelId = db.prepare(
      'SELECT id FROM levels WHERE level_number = ?'
    );

    for (const word of WORDS_DATA) {
      const levelRow = getLevelId.get(word.level) as 
        { id: number } | undefined;
      if (!levelRow) {
        throw new Error(`Level ${word.level} not found`);
      }

      upsertWord.run(
        word.french,
        word.english,
        word.word_type,
        levelRow.id,  // Use actual level ID, not level number
        word.gender
      );
    }

    // Insert example sentences (3 per word for first 20 words)
    console.log('Inserting example sentences...');
    const exampleSentences = [
      // Level 1 examples
      { word: 'le chat', sentences: [
        { fr: 'Le chat est mignon.', en: 'The cat is cute.', 
          replace: 'chat' },
        { fr: 'J\'aime mon chat.', en: 'I love my cat.', 
          replace: 'chat' },
        { fr: 'Le chat dort sur le lit.', 
          en: 'The cat sleeps on the bed.', replace: 'chat' }
      ]},
      { word: 'le chien', sentences: [
        { fr: 'Le chien est grand.', en: 'The dog is big.', 
          replace: 'chien' },
        { fr: 'Mon chien joue dehors.', en: 'My dog plays outside.', 
          replace: 'chien' },
        { fr: 'Le chien aime courir.', en: 'The dog likes to run.', 
          replace: 'chien' }
      ]},
      { word: 'la maison', sentences: [
        { fr: 'La maison est belle.', en: 'The house is beautiful.', 
          replace: 'maison' },
        { fr: 'J\'habite dans une maison.', en: 'I live in a house.', 
          replace: 'maison' },
        { fr: 'La maison a trois chambres.', 
          en: 'The house has three bedrooms.', replace: 'maison' }
      ]},
      { word: 'le livre', sentences: [
        { fr: 'Je lis un livre.', en: 'I am reading a book.', 
          replace: 'livre' },
        { fr: 'Le livre est sur la table.', 
          en: 'The book is on the table.', replace: 'livre' },
        { fr: 'C\'est un bon livre.', en: 'It is a good book.', 
          replace: 'livre' }
      ]},
      { word: 'manger', sentences: [
        { fr: 'Je mange du pain.', en: 'I eat bread.', 
          replace: 'mange' },
        { fr: 'Il mange des fruits.', en: 'He eats fruits.', 
          replace: 'mange' },
        { fr: 'Elle mange des légumes.', en: 'She eats vegetables.', 
          replace: 'mange' },
        { fr: 'Ils mangent au restaurant.', en: 'They eat at the restaurant.', 
          replace: 'mangent' },
        { fr: 'Nous mangeons ensemble.', en: 'We eat together.', 
          replace: 'mangeons' },
        { fr: 'Vous mangez bien.', en: 'You eat well.', 
          replace: 'mangez' }
      ]},
      { word: 'boire', sentences: [
        { fr: 'Je bois de l\'eau.', en: 'I drink water.', 
          replace: 'bois' },
        { fr: 'Il boit du café.', en: 'He drinks coffee.', 
          replace: 'boit' },
        { fr: 'Elle boit du café.', en: 'She drinks coffee.', 
          replace: 'boit' },
        { fr: 'Ils boivent du thé.', en: 'They drink tea.', 
          replace: 'boivent' },
        { fr: 'Nous buvons du vin.', en: 'We drink wine.', 
          replace: 'buvons' },
        { fr: 'Vous buvez souvent.', en: 'You drink often.', 
          replace: 'buvez' }
      ]},
      { word: 'être', sentences: [
        { fr: 'Je suis étudiant.', en: 'I am a student.', 
          replace: 'suis' },
        { fr: 'Il est grand.', en: 'He is tall.', 
          replace: 'est' },
        { fr: 'Elle est heureuse.', en: 'She is happy.', 
          replace: 'est' },
        { fr: 'Ils sont amis.', en: 'They are friends.', 
          replace: 'sont' },
        { fr: 'Nous sommes amis.', en: 'We are friends.', 
          replace: 'sommes' },
        { fr: 'Vous êtes ici.', en: 'You are here.', 
          replace: 'êtes' }
      ]},
      { word: 'avoir', sentences: [
        { fr: 'J\'ai un chat.', en: 'I have a cat.', replace: 'ai' },
        { fr: 'Il a vingt ans.', en: 'He is twenty years old.', 
          replace: 'a' },
        { fr: 'Elle a une voiture.', en: 'She has a car.', 
          replace: 'a' },
        { fr: 'Ils ont des enfants.', en: 'They have children.', 
          replace: 'ont' },
        { fr: 'Nous avons du temps.', en: 'We have time.', 
          replace: 'avons' },
        { fr: 'Vous avez raison.', en: 'You are right.', 
          replace: 'avez' }
      ]},
      { word: 'la table', sentences: [
        { fr: 'La table est grande.', en: 'The table is big.', 
          replace: 'table' },
        { fr: 'Le livre est sur la table.', 
          en: 'The book is on the table.', replace: 'table' },
        { fr: 'Nous mangeons à table.', en: 'We eat at the table.', 
          replace: 'table' }
      ]},
      { word: 'la chaise', sentences: [
        { fr: 'La chaise est confortable.', 
          en: 'The chair is comfortable.', replace: 'chaise' },
        { fr: 'Il y a une chaise ici.', en: 'There is a chair here.', 
          replace: 'chaise' },
        { fr: 'Je cherche une chaise.', en: 'I am looking for a chair.', 
          replace: 'chaise' }
      ]},
      { word: 'le pain', sentences: [
        { fr: 'Le pain est frais.', en: 'The bread is fresh.', 
          replace: 'pain' },
        { fr: 'J\'achète du pain.', en: 'I buy bread.', 
          replace: 'pain' },
        { fr: 'Le pain français est délicieux.', 
          en: 'French bread is delicious.', replace: 'pain' }
      ]},
      { word: 'l\'eau', sentences: [
        { fr: 'L\'eau est froide.', en: 'The water is cold.', 
          replace: 'eau' },
        { fr: 'Je bois de l\'eau.', en: 'I drink water.', 
          replace: 'eau' },
        { fr: 'L\'eau est importante.', en: 'Water is important.', 
          replace: 'eau' }
      ]},
      { word: 'la porte', sentences: [
        { fr: 'La porte est ouverte.', en: 'The door is open.', 
          replace: 'porte' },
        { fr: 'Ferme la porte.', en: 'Close the door.', 
          replace: 'porte' },
        { fr: 'La porte est rouge.', en: 'The door is red.', 
          replace: 'porte' }
      ]},
      { word: 'le lit', sentences: [
        { fr: 'Le lit est grand.', en: 'The bed is big.', 
          replace: 'lit' },
        { fr: 'Je dors dans mon lit.', en: 'I sleep in my bed.', 
          replace: 'lit' },
        { fr: 'Le lit est confortable.', en: 'The bed is comfortable.', 
          replace: 'lit' }
      ]},
      { word: 'dormir', sentences: [
        { fr: 'Je dors bien.', en: 'I sleep well.', 
          replace: 'dors' },
        { fr: 'Il dort beaucoup.', en: 'He sleeps a lot.', 
          replace: 'dort' },
        { fr: 'Elle dort tard.', en: 'She sleeps late.', 
          replace: 'dort' },
        { fr: 'Ils dorment au camping.', en: 'They sleep at the campsite.', 
          replace: 'dorment' },
        { fr: 'Nous dormons bien.', en: 'We sleep well.', 
          replace: 'dormons' },
        { fr: 'Vous dormez peu.', en: 'You sleep little.', 
          replace: 'dormez' }
      ]},
      { word: 'parler', sentences: [
        { fr: 'Je parle français.', en: 'I speak French.', 
          replace: 'parle' },
        { fr: 'Il parle anglais.', en: 'He speaks English.', 
          replace: 'parle' },
        { fr: 'Elle parle bien.', en: 'She speaks well.', 
          replace: 'parle' },
        { fr: 'Ils parlent fort.', en: 'They speak loudly.', 
          replace: 'parlent' },
        { fr: 'Nous parlons ensemble.', en: 'We speak together.', 
          replace: 'parlons' },
        { fr: 'Vous parlez anglais.', en: 'You speak English.', 
          replace: 'parlez' }
      ]},
      { word: 'écouter', sentences: [
        { fr: 'J\'écoute de la musique.', en: 'I listen to music.', 
          replace: 'écoute' },
        { fr: 'Il écoute la radio.', en: 'He listens to the radio.', 
          replace: 'écoute' },
        { fr: 'Elle écoute attentivement.', en: 'She listens carefully.', 
          replace: 'écoute' },
        { fr: 'Ils écoutent le professeur.', en: 'They listen to the teacher.', 
          replace: 'écoutent' },
        { fr: 'Nous écoutons le professeur.', 
          en: 'We listen to the teacher.', replace: 'écoutons' },
        { fr: 'Vous écoutez bien.', en: 'You listen well.', 
          replace: 'écoutez' }
      ]},
      { word: 'regarder', sentences: [
        { fr: 'Je regarde la télévision.', en: 'I watch television.', 
          replace: 'regarde' },
        { fr: 'Il regarde le match.', en: 'He watches the game.', 
          replace: 'regarde' },
        { fr: 'Elle regarde par la fenêtre.', 
          en: 'She looks out the window.', replace: 'regarde' },
        { fr: 'Ils regardent le match.', en: 'They watch the game.', 
          replace: 'regardent' },
        { fr: 'Nous regardons un film.', en: 'We watch a movie.', 
          replace: 'regardons' },
        { fr: 'Vous regardez souvent.', en: 'You watch often.', 
          replace: 'regardez' }
      ]},
      { word: 'aimer', sentences: [
        { fr: 'J\'aime le chocolat.', en: 'I love chocolate.', 
          replace: 'aime' },
        { fr: 'Il aime la musique.', en: 'He loves music.', 
          replace: 'aime' },
        { fr: 'Elle aime lire.', en: 'She loves to read.', 
          replace: 'aime' },
        { fr: 'Ils aiment la musique.', en: 'They love music.', 
          replace: 'aiment' },
        { fr: 'Nous aimons voyager.', en: 'We love to travel.', 
          replace: 'aimons' },
        { fr: 'Vous aimez bien.', en: 'You like well.', 
          replace: 'aimez' }
      ]},
      { word: 'aller', sentences: [
        { fr: 'Je vais à l\'école.', en: 'I go to school.', 
          replace: 'vais' },
        { fr: 'Il va bien.', en: 'He is doing well.', 
          replace: 'va' },
        { fr: 'Elle va au cinéma.', en: 'She goes to the cinema.', 
          replace: 'va' },
        { fr: 'Ils vont au parc.', en: 'They go to the park.', 
          replace: 'vont' },
        { fr: 'Nous allons au parc.', en: 'We go to the park.', 
          replace: 'allons' },
        { fr: 'Vous allez souvent.', en: 'You go often.', 
          replace: 'allez' }
      ]},
      
      // Level 2: People & Places
      { word: 'la mère', sentences: [
        { fr: 'Ma mère est gentille.', en: 'My mother is kind.', 
          replace: 'mère' },
        { fr: 'La mère prépare le dîner.', 
          en: 'The mother prepares dinner.', replace: 'mère' },
        { fr: 'J\'aime ma mère.', en: 'I love my mother.', 
          replace: 'mère' },
        { fr: 'La mère de Paul travaille.', 
          en: 'Paul\'s mother works.', replace: 'mère' }
      ]},
      { word: 'le père', sentences: [
        { fr: 'Mon père est grand.', en: 'My father is tall.', 
          replace: 'père' },
        { fr: 'Le père travaille beaucoup.', 
          en: 'The father works a lot.', replace: 'père' },
        { fr: 'J\'aide mon père.', en: 'I help my father.', 
          replace: 'père' },
        { fr: 'Le père lit le journal.', 
          en: 'The father reads the newspaper.', replace: 'père' }
      ]},
      { word: 'le frère', sentences: [
        { fr: 'Mon frère est jeune.', en: 'My brother is young.', 
          replace: 'frère' },
        { fr: 'Le frère joue au football.', 
          en: 'The brother plays soccer.', replace: 'frère' },
        { fr: 'J\'ai un frère.', en: 'I have a brother.', 
          replace: 'frère' },
        { fr: 'Le frère est à l\'école.', 
          en: 'The brother is at school.', replace: 'frère' }
      ]},
      { word: 'la soeur', sentences: [
        { fr: 'Ma soeur est petite.', en: 'My sister is small.', 
          replace: 'soeur' },
        { fr: 'La soeur chante bien.', 
          en: 'The sister sings well.', replace: 'soeur' },
        { fr: 'J\'aime ma soeur.', en: 'I love my sister.', 
          replace: 'soeur' },
        { fr: 'La soeur étudie beaucoup.', 
          en: 'The sister studies a lot.', replace: 'soeur' }
      ]},
      { word: 'l\'ami', sentences: [
        { fr: 'Mon ami s\'appelle Pierre.', 
          en: 'My friend is called Pierre.', replace: 'ami' },
        { fr: 'L\'ami vient ce soir.', 
          en: 'The friend is coming tonight.', replace: 'ami' },
        { fr: 'J\'ai un bon ami.', en: 'I have a good friend.', 
          replace: 'ami' },
        { fr: 'L\'ami habite près d\'ici.', 
          en: 'The friend lives nearby.', replace: 'ami' }
      ]},
      { word: 'la ville', sentences: [
        { fr: 'La ville est grande.', en: 'The city is big.', 
          replace: 'ville' },
        { fr: 'J\'habite en ville.', en: 'I live in the city.', 
          replace: 'ville' },
        { fr: 'La ville est belle.', en: 'The city is beautiful.', 
          replace: 'ville' },
        { fr: 'Nous visitons la ville.', 
          en: 'We visit the city.', replace: 'ville' }
      ]},
      { word: 'le pays', sentences: [
        { fr: 'Le pays est grand.', en: 'The country is big.', 
          replace: 'pays' },
        { fr: 'J\'aime mon pays.', en: 'I love my country.', 
          replace: 'pays' },
        { fr: 'Le pays est beau.', en: 'The country is beautiful.', 
          replace: 'pays' },
        { fr: 'Nous visitons le pays.', 
          en: 'We visit the country.', replace: 'pays' }
      ]},
      { word: 'la rue', sentences: [
        { fr: 'La rue est longue.', en: 'The street is long.', 
          replace: 'rue' },
        { fr: 'Je marche dans la rue.', 
          en: 'I walk on the street.', replace: 'rue' },
        { fr: 'La rue est calme.', en: 'The street is quiet.', 
          replace: 'rue' },
        { fr: 'Il habite dans cette rue.', 
          en: 'He lives on this street.', replace: 'rue' }
      ]},
      { word: 'le parc', sentences: [
        { fr: 'Le parc est grand.', en: 'The park is big.', 
          replace: 'parc' },
        { fr: 'Nous allons au parc.', en: 'We go to the park.', 
          replace: 'parc' },
        { fr: 'Le parc est joli.', en: 'The park is pretty.', 
          replace: 'parc' },
        { fr: 'Je cours dans le parc.', 
          en: 'I run in the park.', replace: 'parc' }
      ]},
      { word: 'l\'école', sentences: [
        { fr: 'L\'école est grande.', en: 'The school is big.', 
          replace: 'école' },
        { fr: 'Je vais à l\'école.', en: 'I go to school.', 
          replace: 'école' },
        { fr: 'L\'école commence à huit heures.', 
          en: 'School starts at eight o\'clock.', replace: 'école' },
        { fr: 'J\'aime mon école.', en: 'I love my school.', 
          replace: 'école' }
      ]},
      { word: 'habiter', sentences: [
        { fr: 'J\'habite à Paris.', en: 'I live in Paris.', 
          replace: 'habite' },
        { fr: 'Il habite en ville.', en: 'He lives in the city.', 
          replace: 'habite' },
        { fr: 'Elle habite ici.', en: 'She lives here.', 
          replace: 'habite' },
        { fr: 'Ils habitent dans une maison.', 
          en: 'They live in a house.', replace: 'habitent' },
        { fr: 'Nous habitons en France.', 
          en: 'We live in France.', replace: 'habitons' },
        { fr: 'Vous habitez où?', en: 'Where do you live?', 
          replace: 'habitez' }
      ]},
      { word: 'visiter', sentences: [
        { fr: 'Je visite Paris.', en: 'I visit Paris.', 
          replace: 'visite' },
        { fr: 'Il visite le musée.', en: 'He visits the museum.', 
          replace: 'visite' },
        { fr: 'Elle visite sa famille.', 
          en: 'She visits her family.', replace: 'visite' },
        { fr: 'Ils visitent la ville.', 
          en: 'They visit the city.', replace: 'visitent' },
        { fr: 'Nous visitons le musée.', 
          en: 'We visit the museum.', replace: 'visitons' },
        { fr: 'Vous visitez souvent.', en: 'You visit often.', 
          replace: 'visitez' }
      ]},
      { word: 'rencontrer', sentences: [
        { fr: 'Je rencontre un ami.', en: 'I meet a friend.', 
          replace: 'rencontre' },
        { fr: 'Il rencontre Paul.', en: 'He meets Paul.', 
          replace: 'rencontre' },
        { fr: 'Elle rencontre Paul.', en: 'She meets Paul.', 
          replace: 'rencontre' },
        { fr: 'Ils se rencontrent au parc.', 
          en: 'They meet at the park.', replace: 'rencontrent' },
        { fr: 'Nous rencontrons des gens.', 
          en: 'We meet people.', replace: 'rencontrons' },
        { fr: 'Vous rencontrez qui?', en: 'Who do you meet?', 
          replace: 'rencontrez' }
      ]},
      { word: 'connaître', sentences: [
        { fr: 'Je connais Paul.', en: 'I know Paul.', 
          replace: 'connais' },
        { fr: 'Il connaît mon frère.', en: 'He knows my brother.', 
          replace: 'connaît' },
        { fr: 'Elle connaît mon frère.', 
          en: 'She knows my brother.', replace: 'connaît' },
        { fr: 'Ils connaissent le chemin.', 
          en: 'They know the way.', replace: 'connaissent' },
        { fr: 'Nous connaissons la ville.', 
          en: 'We know the city.', replace: 'connaissons' },
        { fr: 'Vous connaissez bien.', en: 'You know well.', 
          replace: 'connaissez' }
      ]},
      { word: 'appeler', sentences: [
        { fr: 'Je m\'appelle Marie.', en: 'My name is Marie.', 
          replace: 'appelle' },
        { fr: 'Il appelle sa mère.', en: 'He calls his mother.', 
          replace: 'appelle' },
        { fr: 'Elle appelle sa mère.', 
          en: 'She calls her mother.', replace: 'appelle' },
        { fr: 'Ils appellent le docteur.', 
          en: 'They call the doctor.', replace: 'appellent' },
        { fr: 'Nous appelons nos amis.', 
          en: 'We call our friends.', replace: 'appelons' },
        { fr: 'Vous appelez souvent.', en: 'You call often.', 
          replace: 'appelez' }
      ]},
      { word: 'marcher', sentences: [
        { fr: 'Je marche vite.', en: 'I walk fast.', 
          replace: 'marche' },
        { fr: 'Il marche dans le parc.', en: 'He walks in the park.', 
          replace: 'marche' },
        { fr: 'Elle marche dans le parc.', 
          en: 'She walks in the park.', replace: 'marche' },
        { fr: 'Ils marchent lentement.', 
          en: 'They walk slowly.', replace: 'marchent' },
        { fr: 'Nous marchons ensemble.', 
          en: 'We walk together.', replace: 'marchons' },
        { fr: 'Vous marchez bien.', en: 'You walk well.', 
          replace: 'marchez' }
      ]},
      { word: 'courir', sentences: [
        { fr: 'Je cours vite.', en: 'I run fast.', 
          replace: 'cours' },
        { fr: 'Il court tous les jours.', en: 'He runs every day.', 
          replace: 'court' },
        { fr: 'Elle court tous les jours.', 
          en: 'She runs every day.', replace: 'court' },
        { fr: 'Ils courent ensemble.', 
          en: 'They run together.', replace: 'courent' },
        { fr: 'Nous courons au parc.', 
          en: 'We run in the park.', replace: 'courons' },
        { fr: 'Vous courez souvent.', en: 'You run often.', 
          replace: 'courez' }
      ]},
      { word: 'venir', sentences: [
        { fr: 'Je viens demain.', en: 'I come tomorrow.', 
          replace: 'viens' },
        { fr: 'Il vient de Paris.', en: 'He comes from Paris.', 
          replace: 'vient' },
        { fr: 'Elle vient de Paris.', 
          en: 'She comes from Paris.', replace: 'vient' },
        { fr: 'Ils viennent à huit heures.', 
          en: 'They come at eight o\'clock.', replace: 'viennent' },
        { fr: 'Nous venons ce soir.', 
          en: 'We come tonight.', replace: 'venons' },
        { fr: 'Vous venez souvent.', en: 'You come often.', 
          replace: 'venez' }
      ]},
      { word: 'partir', sentences: [
        { fr: 'Je pars demain.', en: 'I leave tomorrow.', 
          replace: 'pars' },
        { fr: 'Il part ce soir.', en: 'He leaves tonight.', 
          replace: 'part' },
        { fr: 'Elle part ce soir.', 
          en: 'She leaves tonight.', replace: 'part' },
        { fr: 'Ils partent tôt.', en: 'They leave early.', 
          replace: 'partent' },
        { fr: 'Nous partons en vacances.', 
          en: 'We leave on vacation.', replace: 'partons' },
        { fr: 'Vous partez quand?', en: 'When do you leave?', 
          replace: 'partez' }
      ]},
      { word: 'rester', sentences: [
        { fr: 'Je reste ici.', en: 'I stay here.', 
          replace: 'reste' },
        { fr: 'Il reste avec moi.', en: 'He stays with me.', 
          replace: 'reste' },
        { fr: 'Elle reste avec moi.', en: 'She stays with me.', 
          replace: 'reste' },
        { fr: 'Ils restent au parc.', 
          en: 'They stay at the park.', replace: 'restent' },
        { fr: 'Nous restons à la maison.', 
          en: 'We stay at home.', replace: 'restons' },
        { fr: 'Vous restez longtemps.', en: 'You stay a long time.', 
          replace: 'restez' }
      ]},

      // Level 3: Pronouns & Grammar
      { word: 'je', sentences: [
        { fr: 'Je suis content.', en: 'I am happy.', replace: 'Je' },
        { fr: 'Je mange du pain.', en: 'I eat bread.', replace: 'Je' },
        { fr: 'Je parle français.', en: 'I speak French.', replace: 'Je' },
        { fr: 'Je vais à l\'école.', en: 'I go to school.', replace: 'Je' }
      ]},
      { word: 'tu', sentences: [
        { fr: 'Tu es mon ami.', en: 'You are my friend.', replace: 'Tu' },
        { fr: 'Tu aimes le chocolat.', en: 'You like chocolate.', replace: 'Tu' },
        { fr: 'Tu vas bien?', en: 'Are you well?', replace: 'Tu' },
        { fr: 'Tu habites ici.', en: 'You live here.', replace: 'Tu' }
      ]},
      { word: 'il', sentences: [
        { fr: 'Il est grand.', en: 'He is tall.', replace: 'Il' },
        { fr: 'Il mange une pomme.', en: 'He eats an apple.', replace: 'Il' },
        { fr: 'Il parle beaucoup.', en: 'He talks a lot.', replace: 'Il' },
        { fr: 'Il court vite.', en: 'He runs fast.', replace: 'Il' }
      ]},
      { word: 'elle', sentences: [
        { fr: 'Elle est gentille.', en: 'She is kind.', replace: 'Elle' },
        { fr: 'Elle aime lire.', en: 'She likes to read.', replace: 'Elle' },
        { fr: 'Elle travaille ici.', en: 'She works here.', replace: 'Elle' },
        { fr: 'Elle chante bien.', en: 'She sings well.', replace: 'Elle' }
      ]},
      { word: 'nous', sentences: [
        { fr: 'Nous sommes amis.', en: 'We are friends.', replace: 'Nous' },
        { fr: 'Nous allons au parc.', en: 'We go to the park.', replace: 'Nous' },
        { fr: 'Nous mangeons ensemble.', en: 'We eat together.', replace: 'Nous' },
        { fr: 'Nous parlons français.', en: 'We speak French.', replace: 'Nous' }
      ]},
      { word: 'vous', sentences: [
        { fr: 'Vous êtes très gentils.', en: 'You are very kind.', replace: 'Vous' },
        { fr: 'Vous parlez français?', en: 'Do you speak French?', replace: 'Vous' },
        { fr: 'Vous allez bien?', en: 'Are you well?', replace: 'Vous' },
        { fr: 'Vous habitez où?', en: 'Where do you live?', replace: 'Vous' }
      ]},
      { word: 'ils', sentences: [
        { fr: 'Ils sont contents.', en: 'They are happy.', replace: 'Ils' },
        { fr: 'Ils jouent au football.', en: 'They play soccer.', replace: 'Ils' },
        { fr: 'Ils arrivent demain.', en: 'They arrive tomorrow.', replace: 'Ils' },
        { fr: 'Ils travaillent beaucoup.', en: 'They work a lot.', replace: 'Ils' }
      ]},
      { word: 'elles', sentences: [
        { fr: 'Elles sont belles.', en: 'They are beautiful.', replace: 'Elles' },
        { fr: 'Elles dansent bien.', en: 'They dance well.', replace: 'Elles' },
        { fr: 'Elles parlent ensemble.', en: 'They talk together.', replace: 'Elles' },
        { fr: 'Elles vont à l\'école.', en: 'They go to school.', replace: 'Elles' }
      ]},
      { word: 'mon', sentences: [
        { fr: 'Mon chat est mignon.', en: 'My cat is cute.', replace: 'Mon' },
        { fr: 'Mon ami arrive.', en: 'My friend arrives.', replace: 'Mon' },
        { fr: 'Mon livre est ici.', en: 'My book is here.', replace: 'Mon' },
        { fr: 'Mon père travaille.', en: 'My father works.', replace: 'Mon' }
      ]},
      { word: 'ma', sentences: [
        { fr: 'Ma mère est gentille.', en: 'My mother is kind.', replace: 'Ma' },
        { fr: 'Ma maison est grande.', en: 'My house is big.', replace: 'Ma' },
        { fr: 'Ma sœur chante.', en: 'My sister sings.', replace: 'Ma' },
        { fr: 'Ma voiture est rouge.', en: 'My car is red.', replace: 'Ma' }
      ]},
      { word: 'ton', sentences: [
        { fr: 'Ton chien est mignon.', en: 'Your dog is cute.', replace: 'Ton' },
        { fr: 'Ton livre est intéressant.', en: 'Your book is interesting.', replace: 'Ton' },
        { fr: 'Ton frère arrive.', en: 'Your brother arrives.', replace: 'Ton' },
        { fr: 'Ton ami est gentil.', en: 'Your friend is kind.', replace: 'Ton' }
      ]},
      { word: 'ta', sentences: [
        { fr: 'Ta maison est belle.', en: 'Your house is beautiful.', replace: 'Ta' },
        { fr: 'Ta sœur est là.', en: 'Your sister is here.', replace: 'Ta' },
        { fr: 'Ta voiture est neuve.', en: 'Your car is new.', replace: 'Ta' },
        { fr: 'Ta mère appelle.', en: 'Your mother is calling.', replace: 'Ta' }
      ]},
      { word: 'son', sentences: [
        { fr: 'Son chat dort.', en: 'His/her cat sleeps.', replace: 'Son' },
        { fr: 'Son livre est ici.', en: 'His/her book is here.', replace: 'Son' },
        { fr: 'Son ami arrive.', en: 'His/her friend arrives.', replace: 'Son' },
        { fr: 'Son père travaille.', en: 'His/her father works.', replace: 'Son' }
      ]},
      { word: 'sa', sentences: [
        { fr: 'Sa maison est grande.', en: 'His/her house is big.', replace: 'Sa' },
        { fr: 'Sa voiture est rouge.', en: 'His/her car is red.', replace: 'Sa' },
        { fr: 'Sa mère est gentille.', en: 'His/her mother is kind.', replace: 'Sa' },
        { fr: 'Sa sœur chante.', en: 'His/her sister sings.', replace: 'Sa' }
      ]},
      { word: 'ce', sentences: [
        { fr: 'Ce livre est bon.', en: 'This book is good.', replace: 'Ce' },
        { fr: 'Ce chat est mignon.', en: 'This cat is cute.', replace: 'Ce' },
        { fr: 'Ce parc est grand.', en: 'This park is big.', replace: 'Ce' },
        { fr: 'Ce pain est frais.', en: 'This bread is fresh.', replace: 'Ce' }
      ]},
      { word: 'cette', sentences: [
        { fr: 'Cette maison est belle.', en: 'This house is beautiful.', replace: 'Cette' },
        { fr: 'Cette table est grande.', en: 'This table is big.', replace: 'Cette' },
        { fr: 'Cette rue est calme.', en: 'This street is quiet.', replace: 'Cette' },
        { fr: 'Cette voiture est neuve.', en: 'This car is new.', replace: 'Cette' }
      ]},
      { word: 'ces', sentences: [
        { fr: 'Ces livres sont bons.', en: 'These books are good.', replace: 'Ces' },
        { fr: 'Ces chats sont mignons.', en: 'These cats are cute.', replace: 'Ces' },
        { fr: 'Ces enfants jouent.', en: 'These children play.', replace: 'Ces' },
        { fr: 'Ces fleurs sont belles.', en: 'These flowers are beautiful.', replace: 'Ces' }
      ]},
      { word: 'un', sentences: [
        { fr: 'Un chat dort.', en: 'A cat sleeps.', replace: 'Un' },
        { fr: 'Un ami arrive.', en: 'A friend arrives.', replace: 'Un' },
        { fr: 'Un livre est ici.', en: 'A book is here.', replace: 'Un' },
        { fr: 'Un chien court.', en: 'A dog runs.', replace: 'Un' }
      ]},
      { word: 'une', sentences: [
        { fr: 'Une maison est grande.', en: 'A house is big.', replace: 'Une' },
        { fr: 'Une table est ronde.', en: 'A table is round.', replace: 'Une' },
        { fr: 'Une voiture passe.', en: 'A car passes.', replace: 'Une' },
        { fr: 'Une porte est ouverte.', en: 'A door is open.', replace: 'Une' }
      ]},
      { word: 'des', sentences: [
        { fr: 'Des enfants jouent.', en: 'Children play.', replace: 'Des' },
        { fr: 'Des livres sont ici.', en: 'Books are here.', replace: 'Des' },
        { fr: 'Des chats dorment.', en: 'Cats sleep.', replace: 'Des' },
        { fr: 'Des amis arrivent.', en: 'Friends arrive.', replace: 'Des' }
      ]},
      { word: 'le', sentences: [
        { fr: 'Le chat dort.', en: 'The cat sleeps.', replace: 'Le' },
        { fr: 'Le livre est bon.', en: 'The book is good.', replace: 'Le' },
        { fr: 'Le pain est frais.', en: 'The bread is fresh.', replace: 'Le' },
        { fr: 'Le chien court.', en: 'The dog runs.', replace: 'Le' }
      ]},
      { word: 'la', sentences: [
        { fr: 'La maison est grande.', en: 'The house is big.', replace: 'La' },
        { fr: 'La table est ronde.', en: 'The table is round.', replace: 'La' },
        { fr: 'La porte est fermée.', en: 'The door is closed.', replace: 'La' },
        { fr: 'La voiture est rouge.', en: 'The car is red.', replace: 'La' }
      ]},
      { word: 'beaucoup', sentences: [
        { fr: 'Il mange beaucoup.', en: 'He eats a lot.', replace: 'beaucoup' },
        { fr: 'J\'aime beaucoup lire.', en: 'I like reading a lot.', replace: 'beaucoup' },
        { fr: 'Elle parle beaucoup.', en: 'She talks a lot.', replace: 'beaucoup' },
        { fr: 'Nous travaillons beaucoup.', en: 'We work a lot.', replace: 'beaucoup' }
      ]},
      { word: 'peu', sentences: [
        { fr: 'Il mange peu.', en: 'He eats little.', replace: 'peu' },
        { fr: 'J\'ai peu de temps.', en: 'I have little time.', replace: 'peu' },
        { fr: 'Elle parle peu.', en: 'She talks little.', replace: 'peu' },
        { fr: 'Nous dormons peu.', en: 'We sleep little.', replace: 'peu' }
      ]},
      { word: 'très', sentences: [
        { fr: 'Il est très grand.', en: 'He is very tall.', replace: 'très' },
        { fr: 'C\'est très bon.', en: 'It\'s very good.', replace: 'très' },
        { fr: 'Elle est très gentille.', en: 'She is very kind.', replace: 'très' },
        { fr: 'Nous sommes très contents.', en: 'We are very happy.', replace: 'très' }
      ]},
      { word: 'aussi', sentences: [
        { fr: 'Je viens aussi.', en: 'I\'m coming too.', replace: 'aussi' },
        { fr: 'Il parle aussi français.', en: 'He also speaks French.', replace: 'aussi' },
        { fr: 'Elle est aussi contente.', en: 'She is also happy.', replace: 'aussi' },
        { fr: 'Nous aimons aussi ça.', en: 'We also like that.', replace: 'aussi' }
      ]},
      { word: 'maintenant', sentences: [
        { fr: 'Je pars maintenant.', en: 'I\'m leaving now.', replace: 'maintenant' },
        { fr: 'Nous mangeons maintenant.', en: 'We eat now.', replace: 'maintenant' },
        { fr: 'Il travaille maintenant.', en: 'He works now.', replace: 'maintenant' },
        { fr: 'C\'est maintenant ou jamais.', en: 'It\'s now or never.', replace: 'maintenant' }
      ]},

      // Level 4: Food & Dining
      { word: 'le fromage', sentences: [
        { fr: 'Le fromage est délicieux.', en: 'The cheese is delicious.', replace: 'fromage' },
        { fr: 'J\'aime le fromage français.', en: 'I like French cheese.', replace: 'fromage' },
        { fr: 'Le fromage est sur la table.', en: 'The cheese is on the table.', replace: 'fromage' },
        { fr: 'Nous mangeons du fromage.', en: 'We eat cheese.', replace: 'fromage' },
        { fr: 'Ce fromage est très bon.', en: 'This cheese is very good.', replace: 'fromage' }
      ]},
      { word: 'le fruit', sentences: [
        { fr: 'Le fruit est mûr.', en: 'The fruit is ripe.', replace: 'fruit' },
        { fr: 'Je mange un fruit.', en: 'I eat a fruit.', replace: 'fruit' },
        { fr: 'Les fruits sont sains.', en: 'Fruits are healthy.', replace: 'fruits' },
        { fr: 'Ce fruit est sucré.', en: 'This fruit is sweet.', replace: 'fruit' },
        { fr: 'J\'achète des fruits.', en: 'I buy fruits.', replace: 'fruits' }
      ]},
      { word: 'le légume', sentences: [
        { fr: 'Le légume est frais.', en: 'The vegetable is fresh.', replace: 'légume' },
        { fr: 'Je cuisine des légumes.', en: 'I cook vegetables.', replace: 'légumes' },
        { fr: 'Les légumes sont bons.', en: 'Vegetables are good.', replace: 'légumes' },
        { fr: 'Ce légume est vert.', en: 'This vegetable is green.', replace: 'légume' },
        { fr: 'Nous mangeons des légumes.', en: 'We eat vegetables.', replace: 'légumes' }
      ]},
      { word: 'la viande', sentences: [
        { fr: 'La viande est cuite.', en: 'The meat is cooked.', replace: 'viande' },
        { fr: 'Je mange de la viande.', en: 'I eat meat.', replace: 'viande' },
        { fr: 'La viande est tendre.', en: 'The meat is tender.', replace: 'viande' },
        { fr: 'Cette viande est bonne.', en: 'This meat is good.', replace: 'viande' },
        { fr: 'Nous cuisinons la viande.', en: 'We cook the meat.', replace: 'viande' }
      ]},
      { word: 'le poisson', sentences: [
        { fr: 'Le poisson est frais.', en: 'The fish is fresh.', replace: 'poisson' },
        { fr: 'Je mange du poisson.', en: 'I eat fish.', replace: 'poisson' },
        { fr: 'Le poisson nage.', en: 'The fish swims.', replace: 'poisson' },
        { fr: 'Ce poisson est gros.', en: 'This fish is big.', replace: 'poisson' },
        { fr: 'Nous pêchons le poisson.', en: 'We fish for fish.', replace: 'poisson' }
      ]},
      { word: 'le vin', sentences: [
        { fr: 'Le vin est rouge.', en: 'The wine is red.', replace: 'vin' },
        { fr: 'Je bois du vin.', en: 'I drink wine.', replace: 'vin' },
        { fr: 'Le vin français est bon.', en: 'French wine is good.', replace: 'vin' },
        { fr: 'Ce vin est délicieux.', en: 'This wine is delicious.', replace: 'vin' },
        { fr: 'Nous servons du vin.', en: 'We serve wine.', replace: 'vin' }
      ]},
      { word: 'le café', sentences: [
        { fr: 'Le café est chaud.', en: 'The coffee is hot.', replace: 'café' },
        { fr: 'Je bois du café.', en: 'I drink coffee.', replace: 'café' },
        { fr: 'Le café est bon.', en: 'The coffee is good.', replace: 'café' },
        { fr: 'Ce café est fort.', en: 'This coffee is strong.', replace: 'café' },
        { fr: 'Nous préparons le café.', en: 'We prepare coffee.', replace: 'café' }
      ]},
      { word: 'le thé', sentences: [
        { fr: 'Le thé est chaud.', en: 'The tea is hot.', replace: 'thé' },
        { fr: 'Je bois du thé.', en: 'I drink tea.', replace: 'thé' },
        { fr: 'Le thé est bon.', en: 'The tea is good.', replace: 'thé' },
        { fr: 'Ce thé est vert.', en: 'This tea is green.', replace: 'thé' },
        { fr: 'Nous servons du thé.', en: 'We serve tea.', replace: 'thé' }
      ]},
      { word: 'le repas', sentences: [
        { fr: 'Le repas est prêt.', en: 'The meal is ready.', replace: 'repas' },
        { fr: 'Je mange le repas.', en: 'I eat the meal.', replace: 'repas' },
        { fr: 'Le repas est bon.', en: 'The meal is good.', replace: 'repas' },
        { fr: 'Ce repas est délicieux.', en: 'This meal is delicious.', replace: 'repas' },
        { fr: 'Nous préparons le repas.', en: 'We prepare the meal.', replace: 'repas' }
      ]},
      { word: 'la cuisine', sentences: [
        { fr: 'La cuisine est grande.', en: 'The kitchen is big.', replace: 'cuisine' },
        { fr: 'Je cuisine bien.', en: 'I cook well.', replace: 'cuisine' },
        { fr: 'La cuisine française est bonne.', en: 'French cooking is good.', replace: 'cuisine' },
        { fr: 'Cette cuisine est moderne.', en: 'This kitchen is modern.', replace: 'cuisine' },
        { fr: 'Nous aimons la cuisine.', en: 'We like cooking.', replace: 'cuisine' }
      ]},
      { word: 'cuisiner', sentences: [
        { fr: 'Je cuisine le dîner.', en: 'I cook dinner.', replace: 'cuisine' },
        { fr: 'Il cuisine souvent.', en: 'He cooks often.', replace: 'cuisine' },
        { fr: 'Elle cuisine bien.', en: 'She cooks well.', replace: 'cuisine' },
        { fr: 'Ils cuisinent ensemble.', en: 'They cook together.', replace: 'cuisinent' },
        { fr: 'Nous cuisinons ensemble.', en: 'We cook together.', replace: 'cuisinons' },
        { fr: 'Vous cuisinez délicieusement.', en: 'You cook deliciously.', replace: 'cuisinez' }
      ]},
      { word: 'préparer', sentences: [
        { fr: 'Je prépare le repas.', en: 'I prepare the meal.', replace: 'prépare' },
        { fr: 'Il prépare le petit-déjeuner.', en: 'He prepares breakfast.', replace: 'prépare' },
        { fr: 'Elle prépare le café.', en: 'She prepares coffee.', replace: 'prépare' },
        { fr: 'Ils préparent le dîner.', en: 'They prepare dinner.', replace: 'préparent' },
        { fr: 'Nous préparons le dîner.', en: 'We prepare dinner.', replace: 'préparons' },
        { fr: 'Vous préparez bien.', en: 'You prepare well.', replace: 'préparez' }
      ]},
      { word: 'goûter', sentences: [
        { fr: 'Je goûte le plat.', en: 'I taste the dish.', replace: 'goûte' },
        { fr: 'Il goûte le dessert.', en: 'He tastes the dessert.', replace: 'goûte' },
        { fr: 'Elle goûte le vin.', en: 'She tastes the wine.', replace: 'goûte' },
        { fr: 'Ils goûtent le fromage.', en: 'They taste the cheese.', replace: 'goûtent' },
        { fr: 'Nous goûtons le fromage.', en: 'We taste the cheese.', replace: 'goûtons' },
        { fr: 'Vous goûtez délicieusement.', en: 'You taste deliciously.', replace: 'goûtez' }
      ]},
      { word: 'commander', sentences: [
        { fr: 'Je commande un café.', en: 'I order a coffee.', replace: 'commande' },
        { fr: 'Il commande le dessert.', en: 'He orders dessert.', replace: 'commande' },
        { fr: 'Elle commande le plat.', en: 'She orders the dish.', replace: 'commande' },
        { fr: 'Ils commandent le repas.', en: 'They order the meal.', replace: 'commandent' },
        { fr: 'Nous commandons le repas.', en: 'We order the meal.', replace: 'commandons' },
        { fr: 'Vous commandez souvent.', en: 'You order often.', replace: 'commandez' }
      ]},
      { word: 'choisir', sentences: [
        { fr: 'Je choisis le plat.', en: 'I choose the dish.', replace: 'choisis' },
        { fr: 'Il choisit bien.', en: 'He chooses well.', replace: 'choisit' },
        { fr: 'Elle choisit le vin.', en: 'She chooses the wine.', replace: 'choisit' },
        { fr: 'Ils choisissent le dessert.', en: 'They choose dessert.', replace: 'choisissent' },
        { fr: 'Nous choisissons le dessert.', en: 'We choose dessert.', replace: 'choisissons' },
        { fr: 'Vous choisissez souvent.', en: 'You choose often.', replace: 'choisissez' }
      ]},
      { word: 'préférer', sentences: [
        { fr: 'Je préfère le café.', en: 'I prefer coffee.', replace: 'préfère' },
        { fr: 'Il préfère les fruits.', en: 'He prefers fruits.', replace: 'préfère' },
        { fr: 'Elle préfère le thé.', en: 'She prefers tea.', replace: 'préfère' },
        { fr: 'Ils préfèrent le vin.', en: 'They prefer wine.', replace: 'préfèrent' },
        { fr: 'Nous préférons le vin.', en: 'We prefer wine.', replace: 'préférons' },
        { fr: 'Vous préférez le fromage.', en: 'You prefer cheese.', replace: 'préférez' }
      ]},
      { word: 'servir', sentences: [
        { fr: 'Je sers le repas.', en: 'I serve the meal.', replace: 'sers' },
        { fr: 'Il sert le vin.', en: 'He serves wine.', replace: 'sert' },
        { fr: 'Elle sert le café.', en: 'She serves coffee.', replace: 'sert' },
        { fr: 'Ils servent le dîner.', en: 'They serve dinner.', replace: 'servent' },
        { fr: 'Nous servons le dîner.', en: 'We serve dinner.', replace: 'servons' },
        { fr: 'Vous servez bien.', en: 'You serve well.', replace: 'servez' }
      ]},
      { word: 'acheter', sentences: [
        { fr: 'J\'achète du pain.', en: 'I buy bread.', replace: 'achète' },
        { fr: 'Il achète du vin.', en: 'He buys wine.', replace: 'achète' },
        { fr: 'Elle achète des fruits.', en: 'She buys fruits.', replace: 'achète' },
        { fr: 'Ils achètent le repas.', en: 'They buy the meal.', replace: 'achètent' },
        { fr: 'Nous achetons le repas.', en: 'We buy the meal.', replace: 'achetons' },
        { fr: 'Vous achetez souvent.', en: 'You buy often.', replace: 'achetez' }
      ]},
      { word: 'vendre', sentences: [
        { fr: 'Je vends du pain.', en: 'I sell bread.', replace: 'vends' },
        { fr: 'Il vend du vin.', en: 'He sells wine.', replace: 'vend' },
        { fr: 'Elle vend des fruits.', en: 'She sells fruits.', replace: 'vend' },
        { fr: 'Ils vendent le repas.', en: 'They sell the meal.', replace: 'vendent' },
        { fr: 'Nous vendons le repas.', en: 'We sell the meal.', replace: 'vendons' },
        { fr: 'Vous vendez bien.', en: 'You sell well.', replace: 'vendez' }
      ]},
      { word: 'payer', sentences: [
        { fr: 'Je paie le repas.', en: 'I pay for the meal.', replace: 'paie' },
        { fr: 'Il paie le vin.', en: 'He pays for wine.', replace: 'paie' },
        { fr: 'Elle paie le café.', en: 'She pays for coffee.', replace: 'paie' },
        { fr: 'Ils paient le dîner.', en: 'They pay for dinner.', replace: 'paient' },
        { fr: 'Nous payons le dîner.', en: 'We pay for dinner.', replace: 'payons' },
        { fr: 'Vous payez souvent.', en: 'You pay often.', replace: 'payez' }
      ]},

      // Level 5: Time & Weather
      { word: 'le jour', sentences: [
        { fr: 'Le jour est beau.', en: 'The day is beautiful.', replace: 'jour' },
        { fr: 'Je travaille le jour.', en: 'I work during the day.', replace: 'jour' },
        { fr: 'Ce jour est spécial.', en: 'This day is special.', replace: 'jour' },
        { fr: 'Le jour commence tôt.', en: 'The day starts early.', replace: 'jour' },
        { fr: 'Nous profitons du jour.', en: 'We enjoy the day.', replace: 'jour' }
      ]},
      { word: 'la nuit', sentences: [
        { fr: 'La nuit est calme.', en: 'The night is quiet.', replace: 'nuit' },
        { fr: 'Je dors la nuit.', en: 'I sleep at night.', replace: 'nuit' },
        { fr: 'Cette nuit est froide.', en: 'This night is cold.', replace: 'nuit' },
        { fr: 'La nuit tombe.', en: 'Night falls.', replace: 'nuit' },
        { fr: 'Nous sortons la nuit.', en: 'We go out at night.', replace: 'nuit' }
      ]},
      { word: 'la semaine', sentences: [
        { fr: 'La semaine est longue.', en: 'The week is long.', replace: 'semaine' },
        { fr: 'Je travaille cette semaine.', en: 'I work this week.', replace: 'semaine' },
        { fr: 'Cette semaine est occupée.', en: 'This week is busy.', replace: 'semaine' },
        { fr: 'La semaine commence lundi.', en: 'The week starts Monday.', replace: 'semaine' },
        { fr: 'Nous voyageons cette semaine.', en: 'We travel this week.', replace: 'semaine' }
      ]},
      { word: 'le mois', sentences: [
        { fr: 'Le mois est court.', en: 'The month is short.', replace: 'mois' },
        { fr: 'Je voyage ce mois.', en: 'I travel this month.', replace: 'mois' },
        { fr: 'Ce mois est froid.', en: 'This month is cold.', replace: 'mois' },
        { fr: 'Le mois de janvier.', en: 'The month of January.', replace: 'mois' },
        { fr: 'Nous économisons ce mois.', en: 'We save this month.', replace: 'mois' }
      ]},
      { word: 'l\'année', sentences: [
        { fr: 'L\'année est nouvelle.', en: 'The year is new.', replace: 'année' },
        { fr: 'Je voyage cette année.', en: 'I travel this year.', replace: 'année' },
        { fr: 'Cette année est bonne.', en: 'This year is good.', replace: 'année' },
        { fr: 'L\'année commence.', en: 'The year begins.', replace: 'année' },
        { fr: 'Nous célébrons l\'année.', en: 'We celebrate the year.', replace: 'année' }
      ]},
      { word: 'le matin', sentences: [
        { fr: 'Le matin est tôt.', en: 'The morning is early.', replace: 'matin' },
        { fr: 'Je me lève le matin.', en: 'I get up in the morning.', replace: 'matin' },
        { fr: 'Ce matin est froid.', en: 'This morning is cold.', replace: 'matin' },
        { fr: 'Le matin commence.', en: 'The morning begins.', replace: 'matin' },
        { fr: 'Nous travaillons le matin.', en: 'We work in the morning.', replace: 'matin' }
      ]},
      { word: 'l\'après-midi', sentences: [
        { fr: 'L\'après-midi est chaud.', en: 'The afternoon is hot.', replace: 'après-midi' },
        { fr: 'Je travaille l\'après-midi.', en: 'I work in the afternoon.', replace: 'après-midi' },
        { fr: 'Cet après-midi est libre.', en: 'This afternoon is free.', replace: 'après-midi' },
        { fr: 'L\'après-midi commence.', en: 'The afternoon begins.', replace: 'après-midi' },
        { fr: 'Nous nous reposons l\'après-midi.', en: 'We rest in the afternoon.', replace: 'après-midi' }
      ]},
      { word: 'le soir', sentences: [
        { fr: 'Le soir est calme.', en: 'The evening is quiet.', replace: 'soir' },
        { fr: 'Je me détends le soir.', en: 'I relax in the evening.', replace: 'soir' },
        { fr: 'Ce soir est spécial.', en: 'This evening is special.', replace: 'soir' },
        { fr: 'Le soir tombe.', en: 'Evening falls.', replace: 'soir' },
        { fr: 'Nous dînons le soir.', en: 'We have dinner in the evening.', replace: 'soir' }
      ]},
      { word: 'le temps', sentences: [
        { fr: 'Le temps est beau.', en: 'The weather is nice.', replace: 'temps' },
        { fr: 'Je regarde le temps.', en: 'I watch the weather.', replace: 'temps' },
        { fr: 'Ce temps est mauvais.', en: 'This weather is bad.', replace: 'temps' },
        { fr: 'Le temps change.', en: 'The weather changes.', replace: 'temps' },
        { fr: 'Nous parlons du temps.', en: 'We talk about the weather.', replace: 'temps' }
      ]},
      { word: 'le soleil', sentences: [
        { fr: 'Le soleil brille.', en: 'The sun shines.', replace: 'soleil' },
        { fr: 'Je vois le soleil.', en: 'I see the sun.', replace: 'soleil' },
        { fr: 'Ce soleil est chaud.', en: 'This sun is hot.', replace: 'soleil' },
        { fr: 'Le soleil se lève.', en: 'The sun rises.', replace: 'soleil' },
        { fr: 'Nous profitons du soleil.', en: 'We enjoy the sun.', replace: 'soleil' }
      ]},
      { word: 'la pluie', sentences: [
        { fr: 'La pluie tombe.', en: 'The rain falls.', replace: 'pluie' },
        { fr: 'Je reste à cause de la pluie.', en: 'I stay because of the rain.', replace: 'pluie' },
        { fr: 'Cette pluie est forte.', en: 'This rain is heavy.', replace: 'pluie' },
        { fr: 'La pluie commence.', en: 'The rain begins.', replace: 'pluie' },
        { fr: 'Nous attendons la pluie.', en: 'We wait for the rain.', replace: 'pluie' }
      ]},
      { word: 'le vent', sentences: [
        { fr: 'Le vent souffle.', en: 'The wind blows.', replace: 'vent' },
        { fr: 'Je sens le vent.', en: 'I feel the wind.', replace: 'vent' },
        { fr: 'Ce vent est fort.', en: 'This wind is strong.', replace: 'vent' },
        { fr: 'Le vent change.', en: 'The wind changes.', replace: 'vent' },
        { fr: 'Nous entendons le vent.', en: 'We hear the wind.', replace: 'vent' }
      ]},
      { word: 'la neige', sentences: [
        { fr: 'La neige tombe.', en: 'The snow falls.', replace: 'neige' },
        { fr: 'Je vois la neige.', en: 'I see the snow.', replace: 'neige' },
        { fr: 'Cette neige est blanche.', en: 'This snow is white.', replace: 'neige' },
        { fr: 'La neige commence.', en: 'The snow begins.', replace: 'neige' },
        { fr: 'Nous jouons dans la neige.', en: 'We play in the snow.', replace: 'neige' }
      ]},
      { word: 'être', sentences: [
        { fr: 'Je suis content.', en: 'I am happy.', replace: 'suis' },
        { fr: 'Il est grand.', en: 'He is tall.', replace: 'est' },
        { fr: 'Elle est gentille.', en: 'She is kind.', replace: 'est' },
        { fr: 'Ils sont amis.', en: 'They are friends.', replace: 'sont' },
        { fr: 'Nous sommes amis.', en: 'We are friends.', replace: 'sommes' },
        { fr: 'Vous êtes ici.', en: 'You are here.', replace: 'êtes' }
      ]},
      { word: 'avoir', sentences: [
        { fr: 'J\'ai un chat.', en: 'I have a cat.', replace: 'ai' },
        { fr: 'Il a vingt ans.', en: 'He is twenty years old.', replace: 'a' },
        { fr: 'Elle a une voiture.', en: 'She has a car.', replace: 'a' },
        { fr: 'Ils ont des enfants.', en: 'They have children.', replace: 'ont' },
        { fr: 'Nous avons du temps.', en: 'We have time.', replace: 'avons' },
        { fr: 'Vous avez raison.', en: 'You are right.', replace: 'avez' }
      ]},
      { word: 'attendre', sentences: [
        { fr: 'J\'attends le bus.', en: 'I wait for the bus.', replace: 'attends' },
        { fr: 'Il attend longtemps.', en: 'He waits a long time.', replace: 'attend' },
        { fr: 'Elle attend son ami.', en: 'She waits for her friend.', replace: 'attend' },
        { fr: 'Ils attendent le bus.', en: 'They wait for the bus.', replace: 'attendent' },
        { fr: 'Nous attendons le train.', en: 'We wait for the train.', replace: 'attendons' },
        { fr: 'Vous attendez ici.', en: 'You wait here.', replace: 'attendez' }
      ]},
      { word: 'commencer', sentences: [
        { fr: 'Je commence le travail.', en: 'I start work.', replace: 'commence' },
        { fr: 'Il commence tôt.', en: 'He starts early.', replace: 'commence' },
        { fr: 'Elle commence à lire.', en: 'She starts reading.', replace: 'commence' },
        { fr: 'Ils commencent le travail.', en: 'They start work.', replace: 'commencent' },
        { fr: 'Nous commençons demain.', en: 'We start tomorrow.', replace: 'commençons' },
        { fr: 'Vous commencez bien.', en: 'You start well.', replace: 'commencez' }
      ]},
      { word: 'finir', sentences: [
        { fr: 'Je finis le travail.', en: 'I finish work.', replace: 'finis' },
        { fr: 'Il finit tard.', en: 'He finishes late.', replace: 'finit' },
        { fr: 'Elle finit le livre.', en: 'She finishes the book.', replace: 'finit' },
        { fr: 'Ils finissent le travail.', en: 'They finish work.', replace: 'finissent' },
        { fr: 'Nous finissons ensemble.', en: 'We finish together.', replace: 'finissons' },
        { fr: 'Vous finissez bien.', en: 'You finish well.', replace: 'finissez' }
      ]},
      { word: 'durer', sentences: [
        { fr: 'Je dure longtemps.', en: 'I last a long time.', replace: 'dure' },
        { fr: 'Il dure peu de temps.', en: 'It lasts a short time.', replace: 'dure' },
        { fr: 'Elle dure longtemps.', en: 'She lasts a long time.', replace: 'dure' },
        { fr: 'Ils durent longtemps.', en: 'They last a long time.', replace: 'durent' },
        { fr: 'Nous durons toute la journée.', en: 'We last all day.', replace: 'durons' },
        { fr: 'Vous durez longtemps.', en: 'You last a long time.', replace: 'durez' }
      ]},
      { word: 'changer', sentences: [
        { fr: 'Je change d\'avis.', en: 'I change my mind.', replace: 'change' },
        { fr: 'Il change souvent.', en: 'He changes often.', replace: 'change' },
        { fr: 'Elle change de robe.', en: 'She changes her dress.', replace: 'change' },
        { fr: 'Ils changent de voiture.', en: 'They change cars.', replace: 'changent' },
        { fr: 'Nous changeons de voiture.', en: 'We change cars.', replace: 'changeons' },
        { fr: 'Vous changez bien.', en: 'You change well.', replace: 'changez' }
      ]},
      { word: 'pleuvoir', sentences: [
        { fr: 'Je pleus des larmes.', en: 'I cry tears.', replace: 'pleus' },
        { fr: 'Il pleut aujourd\'hui.', en: 'It rains today.', replace: 'pleut' },
        { fr: 'Elle pleut des larmes.', en: 'She cries tears.', replace: 'pleut' },
        { fr: 'Ils pleuvent des larmes.', en: 'They cry tears.', replace: 'pleuvent' },
        { fr: 'Nous pleuvons des larmes.', en: 'We cry tears.', replace: 'pleuvons' },
        { fr: 'Vous pleuvez des larmes.', en: 'You cry tears.', replace: 'pleuvez' }
      ]},
      { word: 'neiger', sentences: [
        { fr: 'Je neige des flocons.', en: 'I snow flakes.', replace: 'neige' },
        { fr: 'Il neige en hiver.', en: 'It snows in winter.', replace: 'neige' },
        { fr: 'Elle neige des flocons.', en: 'She snows flakes.', replace: 'neige' },
        { fr: 'Ils neigent des flocons.', en: 'They snow flakes.', replace: 'neigent' },
        { fr: 'Nous neigeons des flocons.', en: 'We snow flakes.', replace: 'neigeons' },
        { fr: 'Vous neigez des flocons.', en: 'You snow flakes.', replace: 'neigez' }
      ]},
      { word: 'briller', sentences: [
        { fr: 'Je brille de bonheur.', en: 'I shine with happiness.', replace: 'brille' },
        { fr: 'Il brille de bonheur.', en: 'He shines with happiness.', replace: 'brille' },
        { fr: 'Elle brille de bonheur.', en: 'She shines with happiness.', replace: 'brille' },
        { fr: 'Ils brillent de joie.', en: 'They shine with joy.', replace: 'brillent' },
        { fr: 'Nous brillons ensemble.', en: 'We shine together.', replace: 'brillons' },
        { fr: 'Vous brillez toujours.', en: 'You always shine.', replace: 'brillez' }
      ]},
      { word: 'faire', sentences: [
        { fr: 'Je fais le ménage.', en: 'I do the housework.', replace: 'fais' },
        { fr: 'Il fait beau.', en: 'The weather is nice.', replace: 'fait' },
        { fr: 'Elle fait du sport.', en: 'She does sports.', replace: 'fait' },
        { fr: 'Ils font du sport.', en: 'They do sports.', replace: 'font' },
        { fr: 'Nous faisons un gâteau.', en: 'We make a cake.', replace: 'faisons' },
        { fr: 'Vous faites bien.', en: 'You do well.', replace: 'faites' }
      ]},
      { word: 'passer', sentences: [
        { fr: 'Je passe du temps ici.', en: 'I spend time here.', replace: 'passe' },
        { fr: 'Il passe la journée.', en: 'He spends the day.', replace: 'passe' },
        { fr: 'Elle passe l\'examen.', en: 'She passes the exam.', replace: 'passe' },
        { fr: 'Ils passent du temps.', en: 'They spend time.', replace: 'passent' },
        { fr: 'Nous passons les vacances.', en: 'We spend the holidays.', replace: 'passons' },
        { fr: 'Vous passez souvent.', en: 'You pass often.', replace: 'passez' }
      ]},

      // Level 6: Body & Health
      { word: 'la tête', sentences: [
        { fr: 'J\'ai mal à la tête.', en: 'I have a headache.', replace: 'tête' },
        { fr: 'Elle secoue la tête.', en: 'She shakes her head.', replace: 'tête' },
        { fr: 'La tête est importante.', en: 'The head is important.', replace: 'tête' }
      ]},
      { word: 'le bras', sentences: [
        { fr: 'Il lève le bras.', en: 'He raises his arm.', replace: 'bras' },
        { fr: 'Mon bras me fait mal.', en: 'My arm hurts.', replace: 'bras' },
        { fr: 'Le bras est fort.', en: 'The arm is strong.', replace: 'bras' }
      ]},
      { word: 'la main', sentences: [
        { fr: 'Je donne la main.', en: 'I give my hand.', replace: 'main' },
        { fr: 'Elle serre la main.', en: 'She shakes hands.', replace: 'main' },
        { fr: 'La main est propre.', en: 'The hand is clean.', replace: 'main' }
      ]},
      { word: 'la jambe', sentences: [
        { fr: 'Il court avec les jambes.', en: 'He runs with his legs.', replace: 'jambes' },
        { fr: 'Ma jambe est cassée.', en: 'My leg is broken.', replace: 'jambe' },
        { fr: 'La jambe est longue.', en: 'The leg is long.', replace: 'jambe' }
      ]},
      { word: 'le pied', sentences: [
        { fr: 'Je marche sur le pied.', en: 'I walk on foot.', replace: 'pied' },
        { fr: 'Il a mal au pied.', en: 'He has a sore foot.', replace: 'pied' },
        { fr: 'Le pied est petit.', en: 'The foot is small.', replace: 'pied' }
      ]},
      { word: 'l\'oeil', sentences: [
        { fr: 'Je ferme l\'oeil.', en: 'I close my eye.', replace: 'oeil' },
        { fr: 'L\'oeil voit bien.', en: 'The eye sees well.', replace: 'oeil' },
        { fr: 'Il a les yeux bleus.', en: 'He has blue eyes.', replace: 'yeux' }
      ]},
      { word: 'la bouche', sentences: [
        { fr: 'Elle ouvre la bouche.', en: 'She opens her mouth.', replace: 'bouche' },
        { fr: 'La bouche mange.', en: 'The mouth eats.', replace: 'bouche' },
        { fr: 'Je ferme la bouche.', en: 'I close my mouth.', replace: 'bouche' }
      ]},
      { word: 'le coeur', sentences: [
        { fr: 'Le coeur bat fort.', en: 'The heart beats strongly.', replace: 'coeur' },
        { fr: 'J\'ai mal au coeur.', en: 'I have heart pain.', replace: 'coeur' },
        { fr: 'Le coeur est important.', en: 'The heart is important.', replace: 'coeur' }
      ]},
      { word: 'le corps', sentences: [
        { fr: 'Le corps est en forme.', en: 'The body is in shape.', replace: 'corps' },
        { fr: 'Je prends soin du corps.', en: 'I take care of the body.', replace: 'corps' },
        { fr: 'Le corps est fort.', en: 'The body is strong.', replace: 'corps' }
      ]},
      { word: 'la santé', sentences: [
        { fr: 'La santé est importante.', en: 'Health is important.', replace: 'santé' },
        { fr: 'Je prends soin de ma santé.', en: 'I take care of my health.', replace: 'santé' },
        { fr: 'Bonne santé à vous!', en: 'Good health to you!', replace: 'santé' }
      ]},
      { word: 'soigner', sentences: [
        { fr: 'Je soigne mon enfant.', en: 'I care for my child.', replace: 'soigne' },
        { fr: 'Il soigne sa blessure.', en: 'He treats his wound.', replace: 'soigne' },
        { fr: 'Elle soigne les malades.', en: 'She cares for the sick.', replace: 'soigne' },
        { fr: 'Ils soignent les blessés.', en: 'They care for the wounded.', replace: 'soignent' },
        { fr: 'Nous soignons bien.', en: 'We care well.', replace: 'soignons' },
        { fr: 'Vous soignez avec amour.', en: 'You care with love.', replace: 'soignez' }
      ]},
      { word: 'guérir', sentences: [
        { fr: 'Je guéris rapidement.', en: 'I heal quickly.', replace: 'guéris' },
        { fr: 'Il guérit de sa maladie.', en: 'He recovers from his illness.', replace: 'guérit' },
        { fr: 'Elle guérit les patients.', en: 'She heals patients.', replace: 'guérit' },
        { fr: 'Ils guérissent vite.', en: 'They heal quickly.', replace: 'guérissent' },
        { fr: 'Nous guérissons ensemble.', en: 'We heal together.', replace: 'guérissons' },
        { fr: 'Vous guérissez bien.', en: 'You heal well.', replace: 'guérissez' }
      ]},
      { word: 'sentir', sentences: [
        { fr: 'Je sens le parfum.', en: 'I smell the perfume.', replace: 'sens' },
        { fr: 'Il sent le danger.', en: 'He feels the danger.', replace: 'sent' },
        { fr: 'Elle sent la fleur.', en: 'She smells the flower.', replace: 'sent' },
        { fr: 'Ils sentent le parfum.', en: 'They smell the perfume.', replace: 'sentent' },
        { fr: 'Nous sentons l\'odeur.', en: 'We smell the odor.', replace: 'sentons' },
        { fr: 'Vous sentez la différence.', en: 'You feel the difference.', replace: 'sentez' }
      ]},
      { word: 'toucher', sentences: [
        { fr: 'Je touche le mur.', en: 'I touch the wall.', replace: 'touche' },
        { fr: 'Il touche le livre.', en: 'He touches the book.', replace: 'touche' },
        { fr: 'Elle touche sa main.', en: 'She touches her hand.', replace: 'touche' },
        { fr: 'Ils touchent le mur.', en: 'They touch the wall.', replace: 'touchent' },
        { fr: 'Nous touchons le tissu.', en: 'We touch the fabric.', replace: 'touchons' },
        { fr: 'Vous touchez doucement.', en: 'You touch gently.', replace: 'touchez' }
      ]},
      { word: 'voir', sentences: [
        { fr: 'Je vois le soleil.', en: 'I see the sun.', replace: 'vois' },
        { fr: 'Il voit ses amis.', en: 'He sees his friends.', replace: 'voit' },
        { fr: 'Elle voit le film.', en: 'She sees the movie.', replace: 'voit' },
        { fr: 'Ils voient le problème.', en: 'They see the problem.', replace: 'voient' },
        { fr: 'Nous voyons la mer.', en: 'We see the sea.', replace: 'voyons' },
        { fr: 'Vous voyez clairement.', en: 'You see clearly.', replace: 'voyez' }
      ]},
      { word: 'entendre', sentences: [
        { fr: 'J\'entends la musique.', en: 'I hear the music.', replace: 'entends' },
        { fr: 'Il entend la voix.', en: 'He hears the voice.', replace: 'entend' },
        { fr: 'Elle entend le bruit.', en: 'She hears the noise.', replace: 'entend' },
        { fr: 'Ils entendent la musique.', en: 'They hear the music.', replace: 'entendent' },
        { fr: 'Nous entendons bien.', en: 'We hear well.', replace: 'entendons' },
        { fr: 'Vous entendez tout.', en: 'You hear everything.', replace: 'entendez' }
      ]},
      { word: 'respirer', sentences: [
        { fr: 'Je respire profondément.', en: 'I breathe deeply.', replace: 'respire' },
        { fr: 'Il respire calmement.', en: 'He breathes calmly.', replace: 'respire' },
        { fr: 'Elle respire l\'air frais.', en: 'She breathes fresh air.', replace: 'respire' },
        { fr: 'Ils respirent l\'air pur.', en: 'They breathe pure air.', replace: 'respirent' },
        { fr: 'Nous respirons ensemble.', en: 'We breathe together.', replace: 'respirons' },
        { fr: 'Vous respirez bien.', en: 'You breathe well.', replace: 'respirez' }
      ]},
      { word: 'bouger', sentences: [
        { fr: 'Je bouge beaucoup.', en: 'I move a lot.', replace: 'bouge' },
        { fr: 'Il bouge rapidement.', en: 'He moves quickly.', replace: 'bouge' },
        { fr: 'Elle bouge ses bras.', en: 'She moves her arms.', replace: 'bouge' },
        { fr: 'Ils bougent souvent.', en: 'They move often.', replace: 'bougent' },
        { fr: 'Nous bougeons ensemble.', en: 'We move together.', replace: 'bougeons' },
        { fr: 'Vous bougez bien.', en: 'You move well.', replace: 'bougez' }
      ]},
      { word: 'tomber', sentences: [
        { fr: 'Je tombe par terre.', en: 'I fall to the ground.', replace: 'tombe' },
        { fr: 'Il tombe en marchant.', en: 'He falls while walking.', replace: 'tombe' },
        { fr: 'Elle tombe de l\'arbre.', en: 'She falls from the tree.', replace: 'tombe' },
        { fr: 'Ils tombent ensemble.', en: 'They fall together.', replace: 'tombent' },
        { fr: 'Nous tombons souvent.', en: 'We fall often.', replace: 'tombons' },
        { fr: 'Vous tombez rarement.', en: 'You rarely fall.', replace: 'tombez' }
      ]},
      { word: 'lever', sentences: [
        { fr: 'Je lève la main.', en: 'I raise my hand.', replace: 'lève' },
        { fr: 'Il lève le poids.', en: 'He lifts the weight.', replace: 'lève' },
        { fr: 'Elle lève les yeux.', en: 'She raises her eyes.', replace: 'lève' },
        { fr: 'Ils lèvent les bras.', en: 'They raise their arms.', replace: 'lèvent' },
        { fr: 'Nous levons le drapeau.', en: 'We raise the flag.', replace: 'levons' },
        { fr: 'Vous levez bien.', en: 'You lift well.', replace: 'levez' }
      ]},

      // Level 7: Clothes & Colors
      { word: 'le vêtement', sentences: [
        { fr: 'Le vêtement est propre.', en: 'The clothing is clean.', replace: 'vêtement' },
        { fr: 'J\'achète un vêtement.', en: 'I buy clothing.', replace: 'vêtement' },
        { fr: 'Le vêtement coûte cher.', en: 'The clothing costs a lot.', replace: 'vêtement' }
      ]},
      { word: 'la chemise', sentences: [
        { fr: 'Je porte une chemise.', en: 'I wear a shirt.', replace: 'chemise' },
        { fr: 'La chemise est blanche.', en: 'The shirt is white.', replace: 'chemise' },
        { fr: 'Il achète une chemise.', en: 'He buys a shirt.', replace: 'chemise' }
      ]},
      { word: 'le pantalon', sentences: [
        { fr: 'Le pantalon est noir.', en: 'The pants are black.', replace: 'pantalon' },
        { fr: 'Je mets le pantalon.', en: 'I put on the pants.', replace: 'pantalon' },
        { fr: 'Le pantalon est confortable.', en: 'The pants are comfortable.', replace: 'pantalon' }
      ]},
      { word: 'la robe', sentences: [
        { fr: 'Elle porte une robe.', en: 'She wears a dress.', replace: 'robe' },
        { fr: 'La robe est jolie.', en: 'The dress is pretty.', replace: 'robe' },
        { fr: 'Je choisis une robe.', en: 'I choose a dress.', replace: 'robe' }
      ]},
      { word: 'le chapeau', sentences: [
        { fr: 'Je mets le chapeau.', en: 'I put on the hat.', replace: 'chapeau' },
        { fr: 'Le chapeau est rouge.', en: 'The hat is red.', replace: 'chapeau' },
        { fr: 'Il enlève le chapeau.', en: 'He removes the hat.', replace: 'chapeau' }
      ]},
      { word: 'la chaussure', sentences: [
        { fr: 'La chaussure est neuve.', en: 'The shoe is new.', replace: 'chaussure' },
        { fr: 'Je lace la chaussure.', en: 'I lace the shoe.', replace: 'chaussure' },
        { fr: 'Les chaussures sont confortables.', en: 'The shoes are comfortable.', replace: 'chaussures' }
      ]},
      { word: 'la couleur', sentences: [
        { fr: 'La couleur est belle.', en: 'The color is beautiful.', replace: 'couleur' },
        { fr: 'Je choisis la couleur.', en: 'I choose the color.', replace: 'couleur' },
        { fr: 'Quelle couleur préférez-vous?', en: 'What color do you prefer?', replace: 'couleur' }
      ]},
      { word: 'le rouge', sentences: [
        { fr: 'Le rouge est vif.', en: 'Red is bright.', replace: 'rouge' },
        { fr: 'J\'aime le rouge.', en: 'I like red.', replace: 'rouge' },
        { fr: 'La voiture est rouge.', en: 'The car is red.', replace: 'rouge' }
      ]},
      { word: 'le bleu', sentences: [
        { fr: 'Le bleu est calme.', en: 'Blue is calm.', replace: 'bleu' },
        { fr: 'Le ciel est bleu.', en: 'The sky is blue.', replace: 'bleu' },
        { fr: 'Elle porte du bleu.', en: 'She wears blue.', replace: 'bleu' }
      ]},
      { word: 'le blanc', sentences: [
        { fr: 'Le blanc est pur.', en: 'White is pure.', replace: 'blanc' },
        { fr: 'La neige est blanche.', en: 'The snow is white.', replace: 'blanche' },
        { fr: 'Je porte du blanc.', en: 'I wear white.', replace: 'blanc' }
      ]},
      { word: 'porter', sentences: [
        { fr: 'Je porte un manteau.', en: 'I wear a coat.', replace: 'porte' },
        { fr: 'Il porte un costume.', en: 'He wears a suit.', replace: 'porte' },
        { fr: 'Elle porte une jupe.', en: 'She wears a skirt.', replace: 'porte' },
        { fr: 'Ils portent des chapeaux.', en: 'They wear hats.', replace: 'portent' },
        { fr: 'Nous portons des lunettes.', en: 'We wear glasses.', replace: 'portons' },
        { fr: 'Vous portez bien.', en: 'You wear well.', replace: 'portez' }
      ]},
      { word: 'mettre', sentences: [
        { fr: 'Je mets mes chaussures.', en: 'I put on my shoes.', replace: 'mets' },
        { fr: 'Il met son manteau.', en: 'He puts on his coat.', replace: 'met' },
        { fr: 'Elle met sa robe.', en: 'She puts on her dress.', replace: 'met' },
        { fr: 'Ils mettent leurs chaussures.', en: 'They put on their shoes.', replace: 'mettent' },
        { fr: 'Nous mettons nos chapeaux.', en: 'We put on our hats.', replace: 'mettons' },
        { fr: 'Vous mettez vos gants.', en: 'You put on your gloves.', replace: 'mettez' }
      ]},
      { word: 'enlever', sentences: [
        { fr: 'J\'enlève mes chaussures.', en: 'I take off my shoes.', replace: 'enlève' },
        { fr: 'Il enlève ses lunettes.', en: 'He takes off his glasses.', replace: 'enlève' },
        { fr: 'Elle enlève son chapeau.', en: 'She takes off her hat.', replace: 'enlève' },
        { fr: 'Ils enlèvent leurs chapeaux.', en: 'They take off their hats.', replace: 'enlèvent' },
        { fr: 'Nous enlevons nos manteaux.', en: 'We take off our coats.', replace: 'enlevons' },
        { fr: 'Vous enlevez vos gants.', en: 'You take off your gloves.', replace: 'enlevez' }
      ]},
      { word: 'essayer', sentences: [
        { fr: 'J\'essaie cette robe.', en: 'I try on this dress.', replace: 'essaie' },
        { fr: 'Il essaie le costume.', en: 'He tries on the suit.', replace: 'essaie' },
        { fr: 'Elle essaie les chaussures.', en: 'She tries on the shoes.', replace: 'essaie' },
        { fr: 'Ils essaient les chaussures.', en: 'They try on the shoes.', replace: 'essaient' },
        { fr: 'Nous essayons les pantalons.', en: 'We try on the pants.', replace: 'essayons' },
        { fr: 'Vous essayez le manteau.', en: 'You try on the coat.', replace: 'essayez' }
      ]},
      { word: 'plier', sentences: [
        { fr: 'Je plie les vêtements.', en: 'I fold the clothes.', replace: 'plie' },
        { fr: 'Il plie ses pantalons.', en: 'He folds his pants.', replace: 'plie' },
        { fr: 'Elle plie la chemise.', en: 'She folds the shirt.', replace: 'plie' },
        { fr: 'Ils plient les chemises.', en: 'They fold the shirts.', replace: 'plient' },
        { fr: 'Nous plions le linge.', en: 'We fold the laundry.', replace: 'plions' },
        { fr: 'Vous pliez bien.', en: 'You fold well.', replace: 'pliez' }
      ]},
      { word: 'laver', sentences: [
        { fr: 'Je lave mes vêtements.', en: 'I wash my clothes.', replace: 'lave' },
        { fr: 'Il lave ses mains.', en: 'He washes his hands.', replace: 'lave' },
        { fr: 'Elle lave la chemise.', en: 'She washes the shirt.', replace: 'lave' },
        { fr: 'Ils lavent leurs vêtements.', en: 'They wash their clothes.', replace: 'lavent' },
        { fr: 'Nous lavons le linge.', en: 'We wash the laundry.', replace: 'lavons' },
        { fr: 'Vous lavez bien.', en: 'You wash well.', replace: 'lavez' }
      ]},
      { word: 'sécher', sentences: [
        { fr: 'Je sèche mes cheveux.', en: 'I dry my hair.', replace: 'sèche' },
        { fr: 'Il sèche ses mains.', en: 'He dries his hands.', replace: 'sèche' },
        { fr: 'Elle sèche les vêtements.', en: 'She dries the clothes.', replace: 'sèche' },
        { fr: 'Ils sèchent leurs cheveux.', en: 'They dry their hair.', replace: 'sèchent' },
        { fr: 'Nous séchons le linge.', en: 'We dry the laundry.', replace: 'séchons' },
        { fr: 'Vous séchez rapidement.', en: 'You dry quickly.', replace: 'séchez' }
      ]},
      { word: 'repasser', sentences: [
        { fr: 'Je repasse ma chemise.', en: 'I iron my shirt.', replace: 'repasse' },
        { fr: 'Il repasse sa robe.', en: 'He irons his dress.', replace: 'repasse' },
        { fr: 'Elle repasse les vêtements.', en: 'She irons the clothes.', replace: 'repasse' },
        { fr: 'Ils repassent leurs chemises.', en: 'They iron their shirts.', replace: 'repassent' },
        { fr: 'Nous repassons le linge.', en: 'We iron the laundry.', replace: 'repassons' },
        { fr: 'Vous repassez bien.', en: 'You iron well.', replace: 'repassez' }
      ]},
      { word: 'coudre', sentences: [
        { fr: 'Je couds un bouton.', en: 'I sew a button.', replace: 'couds' },
        { fr: 'Il coud rapidement.', en: 'He sews quickly.', replace: 'coud' },
        { fr: 'Elle coud une robe.', en: 'She sews a dress.', replace: 'coud' },
        { fr: 'Ils cousent des boutons.', en: 'They sew buttons.', replace: 'cousent' },
        { fr: 'Nous cousons ensemble.', en: 'We sew together.', replace: 'cousons' },
        { fr: 'Vous cousez bien.', en: 'You sew well.', replace: 'cousez' }
      ]},
      { word: 'nettoyer', sentences: [
        { fr: 'Je nettoie mes chaussures.', en: 'I clean my shoes.', replace: 'nettoie' },
        { fr: 'Il nettoie sa voiture.', en: 'He cleans his car.', replace: 'nettoie' },
        { fr: 'Elle nettoie les vêtements.', en: 'She cleans the clothes.', replace: 'nettoie' },
        { fr: 'Ils nettoient leurs chaussures.', en: 'They clean their shoes.', replace: 'nettoient' },
        { fr: 'Nous nettoyons la maison.', en: 'We clean the house.', replace: 'nettoyons' },
        { fr: 'Vous nettoyez bien.', en: 'You clean well.', replace: 'nettoyez' }
      ]}
    ];

    // Upsert example sentences
    console.log('Upserting example sentences...');
    const upsertExample = db.prepare(`
      INSERT INTO example_sentences 
      (word_id, french_sentence, english_translation, 
       word_to_replace, difficulty)
      VALUES (?, ?, ?, ?, 'simple')
      ON CONFLICT(word_id, french_sentence) DO UPDATE SET
        english_translation = excluded.english_translation,
        word_to_replace = excluded.word_to_replace,
        difficulty = excluded.difficulty
    `);

    const getWordId = db.prepare(
      'SELECT id FROM words WHERE french = ?'
    );

    for (const item of exampleSentences) {
      const wordRow = getWordId.get(item.word) as 
        { id: number } | undefined;
      if (wordRow) {
        for (const sentence of item.sentences) {
          upsertExample.run(
            wordRow.id, 
            sentence.fr, 
            sentence.en, 
            sentence.replace
          );
        }
      }
    }

    console.log('Database seeded successfully!');
    console.log('- 10 levels created');
    console.log('- 200 words added (20 per level)');
    console.log('- Example sentences added for key words');
    console.log('\nYou can now run: npm run dev');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };

