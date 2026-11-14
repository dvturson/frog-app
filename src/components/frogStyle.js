/**
 * Colors + outline width for the frog art style, shared by every frog / prop
 * drawing in the app. Drawing helpers live in FrogMascot.jsx (CelEllipse,
 * FrogHead, FrogIris, FrogMouth, Limb).
 */
export const FROG = {
  BODY: '#3a9a4b',
  SHADE: '#2b7a3a', // cel-shadow tone of BODY
  LIGHT: '#7fd08c', // hard highlight
  BELLY: '#bbe3c1',
  BELLY_SHADE: '#97cfa1',
  DARK: '#1c4825', // ink outlines, irises, mouths (= frog-900)
  BLUSH: '#f9a8b8',
  TONGUE: '#e86a8a',
  INK: 2.5, // outline width in a 120-unit-tall drawing; scale down for small viewBoxes
  GOLD: '#f5c242', // = gold-400
  GOLD_SHADE: '#e2a812', // = gold-500
};
