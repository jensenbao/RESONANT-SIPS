import ingredientsData from './ingredients.json';
import orangeJuiceIcon from '../../Art-assets/Art assets/道具/Juice/juice_orange.png';
import lemonJuiceIcon from '../../Art-assets/Art assets/道具/Juice/juice_lemon.png';
import cranberryJuiceIcon from '../../Art-assets/Art assets/道具/Juice/juice_cranberry.png';
import mangoJuiceIcon from '../../Art-assets/Art assets/道具/Juice/juice_mango.png';
import sodaMixerIcon from '../../Art-assets/Art assets/道具/Mixer/soda.png';
import tonicMixerIcon from '../../Art-assets/Art assets/道具/Mixer/tonic.png';
import syrupMixerIcon from '../../Art-assets/Art assets/道具/Mixer/syrup.png';
import creamMixerIcon from '../../Art-assets/Art assets/道具/Mixer/cream.png';
import coffeeMixerIcon from '../../Art-assets/Art assets/道具/Mixer/coffee.png';
import tripleSecLiqueurIcon from '../../Art-assets/Art assets/道具/Liqueur/triple_sec.png';
import kahluaLiqueurIcon from '../../Art-assets/Art assets/道具/Liqueur/kahlua.png';
import baileysLiqueurIcon from '../../Art-assets/Art assets/道具/Liqueur/baileys.png';
import sambucaLiqueurIcon from '../../Art-assets/Art assets/道具/Liqueur/sambuca.png';
import vodkaSpiritIcon from '../../Art-assets/Art assets/道具/Spirit/vodka.png';
import rumSpiritIcon from '../../Art-assets/Art assets/道具/Spirit/rum.png';
import whiskeySpiritIcon from '../../Art-assets/Art assets/道具/Spirit/whiskey.png';
import tequilaSpiritIcon from '../../Art-assets/Art assets/道具/Spirit/tequila.png';

export const BASE_SPIRITS = {
  ...ingredientsData.baseSpirits,
  vodka: {
    ...ingredientsData.baseSpirits.vodka,
    iconImage: vodkaSpiritIcon
  },
  rum: {
    ...ingredientsData.baseSpirits.rum,
    iconImage: rumSpiritIcon
  },
  whiskey: {
    ...ingredientsData.baseSpirits.whiskey,
    iconImage: whiskeySpiritIcon
  },
  tequila: {
    ...ingredientsData.baseSpirits.tequila,
    iconImage: tequilaSpiritIcon
  }
};
export const JUICES = {
  ...ingredientsData.juices,
  juice_orange: {
    ...ingredientsData.juices.juice_orange,
    iconImage: orangeJuiceIcon
  },
  juice_lemon: {
    ...ingredientsData.juices.juice_lemon,
    iconImage: lemonJuiceIcon
  },
  juice_cranberry: {
    ...ingredientsData.juices.juice_cranberry,
    iconImage: cranberryJuiceIcon
  },
  juice_mango: {
    ...ingredientsData.juices.juice_mango,
    iconImage: mangoJuiceIcon
  }
};
export const MIXERS = {
  ...ingredientsData.mixers,
  soda: {
    ...ingredientsData.mixers.soda,
    iconImage: sodaMixerIcon
  },
  tonic: {
    ...ingredientsData.mixers.tonic,
    iconImage: tonicMixerIcon
  },
  syrup: {
    ...ingredientsData.mixers.syrup,
    iconImage: syrupMixerIcon
  },
  cream: {
    ...ingredientsData.mixers.cream,
    iconImage: creamMixerIcon
  },
  coffee: {
    ...ingredientsData.mixers.coffee,
    iconImage: coffeeMixerIcon
  }
};
export const LIQUEURS = {
  ...ingredientsData.liqueurs,
  triple_sec: {
    ...ingredientsData.liqueurs.triple_sec,
    iconImage: tripleSecLiqueurIcon
  },
  kahlua: {
    ...ingredientsData.liqueurs.kahlua,
    iconImage: kahluaLiqueurIcon
  },
  baileys: {
    ...ingredientsData.liqueurs.baileys,
    iconImage: baileysLiqueurIcon
  },
  sambuca: {
    ...ingredientsData.liqueurs.sambuca,
    iconImage: sambucaLiqueurIcon
  }
};

export const INGREDIENTS = {
  ...BASE_SPIRITS,
  ...JUICES,
  ...MIXERS,
  ...LIQUEURS
};

export const getIngredientsByCategory = (category) => {
  return Object.values(INGREDIENTS).filter((ingredient) => ingredient.category === category);
};

export const INGREDIENT_CATEGORIES = ingredientsData.ingredientCategories;
export const INITIAL_UNLOCKED_INGREDIENTS = ingredientsData.initialUnlockedIngredients;
export const MAX_PORTIONS_PER_INGREDIENT = ingredientsData.maxPortionsPerIngredient;
export const MAX_TOTAL_PORTIONS = ingredientsData.maxTotalPortions;
