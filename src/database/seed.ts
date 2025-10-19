import dotenv from 'dotenv';
import { getDatabase, closeDatabase } from './connection';

dotenv.config();

const LEVELS_DATA = [
  { level_number: 1, name: 'Basic Nouns & Actions', 
    description: 'Common everyday objects and basic verbs' },
  { level_number: 2, name: 'People & Places', 
    description: 'Family members and locations' },
  { level_number: 3, name: 'Food & Dining', 
    description: 'Common foods and eating vocabulary' },
  { level_number: 4, name: 'Time & Weather', 
    description: 'Days, seasons, and weather terms' },
  { level_number: 5, name: 'Body & Health', 
    description: 'Body parts and health-related words' },
  { level_number: 6, name: 'Clothes & Colors', 
    description: 'Clothing items and colors' },
  { level_number: 7, name: 'House & Furniture', 
    description: 'Rooms and household items' },
  { level_number: 8, name: 'Travel & Transport', 
    description: 'Transportation and travel vocabulary' },
  { level_number: 9, name: 'Work & School', 
    description: 'Professional and educational terms' },
  { level_number: 10, name: 'Hobbies & Leisure', 
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
  { french: 'la sœur', english: 'sister', word_type: 'noun', 
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

  // Level 3: Food & Dining
  { french: 'le fromage', english: 'cheese', word_type: 'noun', 
    level: 3, gender: 'le' },
  { french: 'le fruit', english: 'fruit', word_type: 'noun', 
    level: 3, gender: 'le' },
  { french: 'le légume', english: 'vegetable', word_type: 'noun', 
    level: 3, gender: 'le' },
  { french: 'la viande', english: 'meat', word_type: 'noun', 
    level: 3, gender: 'la' },
  { french: 'le poisson', english: 'fish', word_type: 'noun', 
    level: 3, gender: 'le' },
  { french: 'le vin', english: 'wine', word_type: 'noun', 
    level: 3, gender: 'le' },
  { french: 'le café', english: 'coffee', word_type: 'noun', 
    level: 3, gender: 'le' },
  { french: 'le thé', english: 'tea', word_type: 'noun', 
    level: 3, gender: 'le' },
  { french: 'le repas', english: 'meal', word_type: 'noun', 
    level: 3, gender: 'le' },
  { french: 'la cuisine', english: 'kitchen/cooking', 
    word_type: 'noun', level: 3, gender: 'la' },
  { french: 'cuisiner', english: 'to cook', word_type: 'verb', 
    level: 3, gender: null },
  { french: 'préparer', english: 'to prepare', word_type: 'verb', 
    level: 3, gender: null },
  { french: 'goûter', english: 'to taste', word_type: 'verb', 
    level: 3, gender: null },
  { french: 'commander', english: 'to order', word_type: 'verb', 
    level: 3, gender: null },
  { french: 'servir', english: 'to serve', word_type: 'verb', 
    level: 3, gender: null },
  { french: 'acheter', english: 'to buy', word_type: 'verb', 
    level: 3, gender: null },
  { french: 'vendre', english: 'to sell', word_type: 'verb', 
    level: 3, gender: null },
  { french: 'payer', english: 'to pay', word_type: 'verb', 
    level: 3, gender: null },
  { french: 'choisir', english: 'to choose', word_type: 'verb', 
    level: 3, gender: null },
  { french: 'préférer', english: 'to prefer', word_type: 'verb', 
    level: 3, gender: null },

  // Level 4: Time & Weather
  { french: 'le jour', english: 'day', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'la nuit', english: 'night', word_type: 'noun', 
    level: 4, gender: 'la' },
  { french: 'la semaine', english: 'week', word_type: 'noun', 
    level: 4, gender: 'la' },
  { french: 'le mois', english: 'month', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'l\'année', english: 'year', word_type: 'noun', 
    level: 4, gender: 'la' },
  { french: 'le temps', english: 'time/weather', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'le soleil', english: 'sun', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'la pluie', english: 'rain', word_type: 'noun', 
    level: 4, gender: 'la' },
  { french: 'le vent', english: 'wind', word_type: 'noun', 
    level: 4, gender: 'le' },
  { french: 'la neige', english: 'snow', word_type: 'noun', 
    level: 4, gender: 'la' },
  { french: 'attendre', english: 'to wait', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'commencer', english: 'to start', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'finir', english: 'to finish', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'durer', english: 'to last', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'changer', english: 'to change', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'pleuvoir', english: 'to rain', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'neiger', english: 'to snow', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'briller', english: 'to shine', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'faire', english: 'to do/make', word_type: 'verb', 
    level: 4, gender: null },
  { french: 'passer', english: 'to spend/pass', word_type: 'verb', 
    level: 4, gender: null },

  // Level 5: Body & Health
  { french: 'la tête', english: 'head', word_type: 'noun', 
    level: 5, gender: 'la' },
  { french: 'le bras', english: 'arm', word_type: 'noun', 
    level: 5, gender: 'le' },
  { french: 'la main', english: 'hand', word_type: 'noun', 
    level: 5, gender: 'la' },
  { french: 'la jambe', english: 'leg', word_type: 'noun', 
    level: 5, gender: 'la' },
  { french: 'le pied', english: 'foot', word_type: 'noun', 
    level: 5, gender: 'le' },
  { french: 'l\'œil', english: 'eye', word_type: 'noun', 
    level: 5, gender: 'le' },
  { french: 'la bouche', english: 'mouth', word_type: 'noun', 
    level: 5, gender: 'la' },
  { french: 'le cœur', english: 'heart', word_type: 'noun', 
    level: 5, gender: 'le' },
  { french: 'le corps', english: 'body', word_type: 'noun', 
    level: 5, gender: 'le' },
  { french: 'la santé', english: 'health', word_type: 'noun', 
    level: 5, gender: 'la' },
  { french: 'soigner', english: 'to care for', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'guérir', english: 'to heal', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'sentir', english: 'to feel', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'toucher', english: 'to touch', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'voir', english: 'to see', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'entendre', english: 'to hear', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'respirer', english: 'to breathe', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'bouger', english: 'to move', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'tomber', english: 'to fall', word_type: 'verb', 
    level: 5, gender: null },
  { french: 'lever', english: 'to lift/raise', word_type: 'verb', 
    level: 5, gender: null },

  // Level 6: Clothes & Colors
  { french: 'le vêtement', english: 'clothing', word_type: 'noun', 
    level: 6, gender: 'le' },
  { french: 'la chemise', english: 'shirt', word_type: 'noun', 
    level: 6, gender: 'la' },
  { french: 'le pantalon', english: 'pants', word_type: 'noun', 
    level: 6, gender: 'le' },
  { french: 'la robe', english: 'dress', word_type: 'noun', 
    level: 6, gender: 'la' },
  { french: 'le chapeau', english: 'hat', word_type: 'noun', 
    level: 6, gender: 'le' },
  { french: 'la chaussure', english: 'shoe', word_type: 'noun', 
    level: 6, gender: 'la' },
  { french: 'la couleur', english: 'color', word_type: 'noun', 
    level: 6, gender: 'la' },
  { french: 'le rouge', english: 'red', word_type: 'adjective', 
    level: 6, gender: 'le' },
  { french: 'le bleu', english: 'blue', word_type: 'adjective', 
    level: 6, gender: 'le' },
  { french: 'le blanc', english: 'white', word_type: 'adjective', 
    level: 6, gender: 'le' },
  { french: 'porter', english: 'to wear', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'mettre', english: 'to put on', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'enlever', english: 'to take off', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'essayer', english: 'to try on', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'changer', english: 'to change', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'laver', english: 'to wash', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'sécher', english: 'to dry', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'repasser', english: 'to iron', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'coudre', english: 'to sew', word_type: 'verb', 
    level: 6, gender: null },
  { french: 'nettoyer', english: 'to clean', word_type: 'verb', 
    level: 6, gender: null },

  // Level 7: House & Furniture
  { french: 'la chambre', english: 'bedroom', word_type: 'noun', 
    level: 7, gender: 'la' },
  { french: 'le salon', english: 'living room', word_type: 'noun', 
    level: 7, gender: 'le' },
  { french: 'la salle', english: 'room', word_type: 'noun', 
    level: 7, gender: 'la' },
  { french: 'le mur', english: 'wall', word_type: 'noun', 
    level: 7, gender: 'le' },
  { french: 'la fenêtre', english: 'window', word_type: 'noun', 
    level: 7, gender: 'la' },
  { french: 'le toit', english: 'roof', word_type: 'noun', 
    level: 7, gender: 'le' },
  { french: 'le meuble', english: 'furniture', word_type: 'noun', 
    level: 7, gender: 'le' },
  { french: 'le canapé', english: 'sofa', word_type: 'noun', 
    level: 7, gender: 'le' },
  { french: 'l\'armoire', english: 'wardrobe', word_type: 'noun', 
    level: 7, gender: 'la' },
  { french: 'le miroir', english: 'mirror', word_type: 'noun', 
    level: 7, gender: 'le' },
  { french: 'ouvrir', english: 'to open', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'fermer', english: 'to close', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'ranger', english: 'to tidy', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'décorer', english: 'to decorate', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'construire', english: 'to build', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'réparer', english: 'to repair', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'peindre', english: 'to paint', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'louer', english: 'to rent', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'déménager', english: 'to move', word_type: 'verb', 
    level: 7, gender: null },
  { french: 'habiter', english: 'to inhabit', word_type: 'verb', 
    level: 7, gender: null },

  // Level 8: Travel & Transport
  { french: 'le voyage', english: 'trip', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'la voiture', english: 'car', word_type: 'noun', 
    level: 8, gender: 'la' },
  { french: 'le train', english: 'train', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'l\'avion', english: 'airplane', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'le bus', english: 'bus', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'le vélo', english: 'bike', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'la route', english: 'road', word_type: 'noun', 
    level: 8, gender: 'la' },
  { french: 'la gare', english: 'station', word_type: 'noun', 
    level: 8, gender: 'la' },
  { french: 'l\'aéroport', english: 'airport', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'le billet', english: 'ticket', word_type: 'noun', 
    level: 8, gender: 'le' },
  { french: 'voyager', english: 'to travel', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'conduire', english: 'to drive', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'prendre', english: 'to take', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'monter', english: 'to get on', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'descendre', english: 'to get off', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'arriver', english: 'to arrive', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'partir', english: 'to depart', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'réserver', english: 'to reserve', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'chercher', english: 'to look for', word_type: 'verb', 
    level: 8, gender: null },
  { french: 'trouver', english: 'to find', word_type: 'verb', 
    level: 8, gender: null },

  // Level 9: Work & School
  { french: 'le travail', english: 'work', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'le bureau', english: 'office', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'l\'étudiant', english: 'student', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'le professeur', english: 'teacher', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'la leçon', english: 'lesson', word_type: 'noun', 
    level: 9, gender: 'la' },
  { french: 'l\'examen', english: 'exam', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'le stylo', english: 'pen', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'le papier', english: 'paper', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'l\'ordinateur', english: 'computer', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'le projet', english: 'project', word_type: 'noun', 
    level: 9, gender: 'le' },
  { french: 'travailler', english: 'to work', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'étudier', english: 'to study', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'apprendre', english: 'to learn', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'enseigner', english: 'to teach', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'écrire', english: 'to write', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'lire', english: 'to read', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'comprendre', english: 'to understand', 
    word_type: 'verb', level: 9, gender: null },
  { french: 'réussir', english: 'to succeed', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'essayer', english: 'to try', word_type: 'verb', 
    level: 9, gender: null },
  { french: 'créer', english: 'to create', word_type: 'verb', 
    level: 9, gender: null },

  // Level 10: Hobbies & Leisure
  { french: 'le loisir', english: 'leisure', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'le sport', english: 'sport', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'la musique', english: 'music', word_type: 'noun', 
    level: 10, gender: 'la' },
  { french: 'le film', english: 'movie', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'le jeu', english: 'game', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'la danse', english: 'dance', word_type: 'noun', 
    level: 10, gender: 'la' },
  { french: 'la photo', english: 'photo', word_type: 'noun', 
    level: 10, gender: 'la' },
  { french: 'le concert', english: 'concert', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'le cinéma', english: 'cinema', word_type: 'noun', 
    level: 10, gender: 'le' },
  { french: 'la fête', english: 'party', word_type: 'noun', 
    level: 10, gender: 'la' },
  { french: 'jouer', english: 'to play', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'danser', english: 'to dance', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'chanter', english: 'to sing', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'dessiner', english: 'to draw', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'photographier', english: 'to photograph', 
    word_type: 'verb', level: 10, gender: null },
  { french: 'nager', english: 'to swim', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'sauter', english: 'to jump', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'rire', english: 'to laugh', word_type: 'verb', 
    level: 10, gender: null },
  { french: 's\'amuser', english: 'to have fun', word_type: 'verb', 
    level: 10, gender: null },
  { french: 'profiter', english: 'to enjoy', word_type: 'verb', 
    level: 10, gender: null }
];

function seedDatabase() {
  console.log('Seeding database...');
  
  try {
    const db = getDatabase();

    // Temporarily disable foreign keys to update curriculum
    db.exec('PRAGMA foreign_keys = OFF');

    // Clear only curriculum data (preserve users & progress)
    console.log('Clearing curriculum data...');
    db.exec('DELETE FROM example_sentences');
    db.exec('DELETE FROM words');
    db.exec('DELETE FROM levels');
    // Note: Preserving users, sessions, and user_word_progress

    // Insert levels
    console.log('Inserting levels...');
    const insertLevel = db.prepare(`
      INSERT INTO levels (level_number, name, description, 
                          required_pass_rate, total_words)
      VALUES (?, ?, ?, 90, 20)
    `);

    for (const level of LEVELS_DATA) {
      insertLevel.run(
        level.level_number, 
        level.name, 
        level.description
      );
    }

    // Insert words
    console.log('Inserting words...');
    const insertWord = db.prepare(`
      INSERT INTO words (french, english, word_type, level_id, gender)
      VALUES (?, ?, ?, ?, ?)
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

      insertWord.run(
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
        { fr: 'J\'aime manger du pain.', en: 'I like to eat bread.', 
          replace: 'manger' },
        { fr: 'Nous mangeons ensemble.', en: 'We eat together.', 
          replace: 'mangeons' },
        { fr: 'Il faut manger des légumes.', 
          en: 'One must eat vegetables.', replace: 'manger' }
      ]},
      { word: 'boire', sentences: [
        { fr: 'Je veux boire de l\'eau.', 
          en: 'I want to drink water.', replace: 'boire' },
        { fr: 'Elle boit du café.', en: 'She drinks coffee.', 
          replace: 'boit' },
        { fr: 'Nous buvons du vin.', en: 'We drink wine.', 
          replace: 'buvons' }
      ]},
      { word: 'être', sentences: [
        { fr: 'Je suis étudiant.', en: 'I am a student.', 
          replace: 'suis' },
        { fr: 'Elle est heureuse.', en: 'She is happy.', 
          replace: 'est' },
        { fr: 'Nous sommes amis.', en: 'We are friends.', 
          replace: 'sommes' }
      ]},
      { word: 'avoir', sentences: [
        { fr: 'J\'ai un chat.', en: 'I have a cat.', replace: 'ai' },
        { fr: 'Tu as raison.', en: 'You are right.', replace: 'as' },
        { fr: 'Il a vingt ans.', en: 'He is twenty years old.', 
          replace: 'a' }
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
        { fr: 'J\'aime dormir.', en: 'I like to sleep.', 
          replace: 'dormir' },
        { fr: 'Il dort beaucoup.', en: 'He sleeps a lot.', 
          replace: 'dort' },
        { fr: 'Nous dormons bien.', en: 'We sleep well.', 
          replace: 'dormons' }
      ]},
      { word: 'parler', sentences: [
        { fr: 'Je parle français.', en: 'I speak French.', 
          replace: 'parle' },
        { fr: 'Nous parlons ensemble.', en: 'We speak together.', 
          replace: 'parlons' },
        { fr: 'Elle parle bien.', en: 'She speaks well.', 
          replace: 'parle' }
      ]},
      { word: 'écouter', sentences: [
        { fr: 'J\'écoute de la musique.', en: 'I listen to music.', 
          replace: 'écoute' },
        { fr: 'Nous écoutons le professeur.', 
          en: 'We listen to the teacher.', replace: 'écoutons' },
        { fr: 'Il écoute la radio.', en: 'He listens to the radio.', 
          replace: 'écoute' }
      ]},
      { word: 'regarder', sentences: [
        { fr: 'Je regarde la télévision.', en: 'I watch television.', 
          replace: 'regarde' },
        { fr: 'Nous regardons un film.', en: 'We watch a movie.', 
          replace: 'regardons' },
        { fr: 'Elle regarde par la fenêtre.', 
          en: 'She looks out the window.', replace: 'regarde' }
      ]},
      { word: 'aimer', sentences: [
        { fr: 'J\'aime le chocolat.', en: 'I love chocolate.', 
          replace: 'aime' },
        { fr: 'Nous aimons voyager.', en: 'We love to travel.', 
          replace: 'aimons' },
        { fr: 'Tu aimes lire.', en: 'You like to read.', 
          replace: 'aimes' }
      ]},
      { word: 'aller', sentences: [
        { fr: 'Je vais à l\'école.', en: 'I go to school.', 
          replace: 'vais' },
        { fr: 'Nous allons au parc.', en: 'We go to the park.', 
          replace: 'allons' },
        { fr: 'Il va bien.', en: 'He is doing well.', 
          replace: 'va' }
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
      { word: 'la sœur', sentences: [
        { fr: 'Ma sœur est petite.', en: 'My sister is small.', 
          replace: 'sœur' },
        { fr: 'La sœur chante bien.', 
          en: 'The sister sings well.', replace: 'sœur' },
        { fr: 'J\'aime ma sœur.', en: 'I love my sister.', 
          replace: 'sœur' },
        { fr: 'La sœur étudie beaucoup.', 
          en: 'The sister studies a lot.', replace: 'sœur' }
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
        { fr: 'Nous habitons en France.', 
          en: 'We live in France.', replace: 'habitons' },
        { fr: 'Elle habite ici.', en: 'She lives here.', 
          replace: 'habite' },
        { fr: 'Ils habitent dans une maison.', 
          en: 'They live in a house.', replace: 'habitent' }
      ]},
      { word: 'visiter', sentences: [
        { fr: 'Je visite Paris.', en: 'I visit Paris.', 
          replace: 'visite' },
        { fr: 'Nous visitons le musée.', 
          en: 'We visit the museum.', replace: 'visitons' },
        { fr: 'Elle visite sa famille.', 
          en: 'She visits her family.', replace: 'visite' },
        { fr: 'Ils visitent la ville.', 
          en: 'They visit the city.', replace: 'visitent' }
      ]},
      { word: 'rencontrer', sentences: [
        { fr: 'Je rencontre un ami.', en: 'I meet a friend.', 
          replace: 'rencontre' },
        { fr: 'Nous rencontrons des gens.', 
          en: 'We meet people.', replace: 'rencontrons' },
        { fr: 'Elle rencontre Paul.', en: 'She meets Paul.', 
          replace: 'rencontre' },
        { fr: 'Ils se rencontrent au parc.', 
          en: 'They meet at the park.', replace: 'rencontrent' }
      ]},
      { word: 'connaître', sentences: [
        { fr: 'Je connais Paul.', en: 'I know Paul.', 
          replace: 'connais' },
        { fr: 'Nous connaissons la ville.', 
          en: 'We know the city.', replace: 'connaissons' },
        { fr: 'Elle connaît mon frère.', 
          en: 'She knows my brother.', replace: 'connaît' },
        { fr: 'Ils connaissent le chemin.', 
          en: 'They know the way.', replace: 'connaissent' }
      ]},
      { word: 'appeler', sentences: [
        { fr: 'Je m\'appelle Marie.', en: 'My name is Marie.', 
          replace: 'appelle' },
        { fr: 'Nous appelons nos amis.', 
          en: 'We call our friends.', replace: 'appelons' },
        { fr: 'Elle appelle sa mère.', 
          en: 'She calls her mother.', replace: 'appelle' },
        { fr: 'Ils appellent le docteur.', 
          en: 'They call the doctor.', replace: 'appellent' }
      ]},
      { word: 'marcher', sentences: [
        { fr: 'Je marche vite.', en: 'I walk fast.', 
          replace: 'marche' },
        { fr: 'Nous marchons ensemble.', 
          en: 'We walk together.', replace: 'marchons' },
        { fr: 'Elle marche dans le parc.', 
          en: 'She walks in the park.', replace: 'marche' },
        { fr: 'Ils marchent lentement.', 
          en: 'They walk slowly.', replace: 'marchent' }
      ]},
      { word: 'courir', sentences: [
        { fr: 'Je cours vite.', en: 'I run fast.', 
          replace: 'cours' },
        { fr: 'Nous courons au parc.', 
          en: 'We run in the park.', replace: 'courons' },
        { fr: 'Elle court tous les jours.', 
          en: 'She runs every day.', replace: 'court' },
        { fr: 'Ils courent ensemble.', 
          en: 'They run together.', replace: 'courent' }
      ]},
      { word: 'venir', sentences: [
        { fr: 'Je viens demain.', en: 'I come tomorrow.', 
          replace: 'viens' },
        { fr: 'Nous venons ce soir.', 
          en: 'We come tonight.', replace: 'venons' },
        { fr: 'Elle vient de Paris.', 
          en: 'She comes from Paris.', replace: 'vient' },
        { fr: 'Ils viennent à huit heures.', 
          en: 'They come at eight o\'clock.', replace: 'viennent' }
      ]},
      { word: 'partir', sentences: [
        { fr: 'Je pars demain.', en: 'I leave tomorrow.', 
          replace: 'pars' },
        { fr: 'Nous partons en vacances.', 
          en: 'We leave on vacation.', replace: 'partons' },
        { fr: 'Elle part ce soir.', 
          en: 'She leaves tonight.', replace: 'part' },
        { fr: 'Ils partent tôt.', en: 'They leave early.', 
          replace: 'partent' }
      ]},
      { word: 'rester', sentences: [
        { fr: 'Je reste ici.', en: 'I stay here.', 
          replace: 'reste' },
        { fr: 'Nous restons à la maison.', 
          en: 'We stay at home.', replace: 'restons' },
        { fr: 'Elle reste avec moi.', en: 'She stays with me.', 
          replace: 'reste' },
        { fr: 'Ils restent au parc.', 
          en: 'They stay at the park.', replace: 'restent' }
      ]}
    ];

    const insertExample = db.prepare(`
      INSERT INTO example_sentences 
      (word_id, french_sentence, english_translation, 
       word_to_replace, difficulty)
      VALUES (?, ?, ?, ?, 'simple')
    `);

    const getWordId = db.prepare(
      'SELECT id FROM words WHERE french = ?'
    );

    for (const item of exampleSentences) {
      const wordRow = getWordId.get(item.word) as 
        { id: number } | undefined;
      if (wordRow) {
        for (const sentence of item.sentences) {
          insertExample.run(
            wordRow.id, 
            sentence.fr, 
            sentence.en, 
            sentence.replace
          );
        }
      }
    }

    // Clean up orphaned progress entries for deleted words
    console.log('Cleaning up orphaned progress entries...');
    db.exec(`
      DELETE FROM user_word_progress 
      WHERE word_id NOT IN (SELECT id FROM words)
    `);
    db.exec(`
      DELETE FROM session_answers 
      WHERE word_id NOT IN (SELECT id FROM words)
    `);

    // Re-enable foreign keys
    db.exec('PRAGMA foreign_keys = ON');

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

