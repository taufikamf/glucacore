export interface FoodOption {
  name: string;
  gram: number;
}

// Karbohidrat options based on the provided table
export const karbohidratOptions: FoodOption[] = [
  { name: "Nasi", gram: 100 },
  { name: "Nasi tim", gram: 200 },
  { name: "Bubur beras", gram: 400 },
  { name: "Nasi jagung", gram: 100 },
  { name: "Talas", gram: 125 },
  { name: "Ubi", gram: 150 },
  { name: "Roti putih", gram: 80 },
];

// Protein Hewani options based on the provided table
export const proteinHewaniOptions: FoodOption[] = [
  { name: "Daging sapi", gram: 50 },
  { name: "Daging ayam", gram: 50 },
  { name: "Telur ayam", gram: 50 },
  { name: "Ikan segar", gram: 50 },
  { name: "Udang basah", gram: 50 },
  { name: "Ikan asin", gram: 25 },
  { name: "Ikan teri", gram: 25 },
  { name: "Telur bebek", gram: 60 },
  { name: "Bakso daging", gram: 100 },
];

// Protein Nabati options based on the provided table
export const proteinNabatiOptions: FoodOption[] = [
  { name: "Kacang hijau", gram: 25 },
  { name: "Kacang kedelai", gram: 25 },
  { name: "Kacang merah", gram: 25 },
  { name: "Oncom", gram: 50 },
  { name: "Tahu", gram: 100 },
  { name: "Tempe", gram: 50 },
];

// Sayuran options (dummy data to be replaced later)
export const sayuranOptions: FoodOption[] = [
  { name: "Bayam", gram: 100 },
  { name: "Brokoli", gram: 100 },
  { name: "Kangkung", gram: 100 },
  { name: "Kacang panjang", gram: 100 },
  { name: "Wortel", gram: 100 },
];

// Minyak options based on the provided table
export const minyakOptions: FoodOption[] = [
  { name: "Minyak goreng", gram: 5 },
  { name: "Minyak ikan", gram: 5 },
  { name: "Margarin", gram: 5 },
  { name: "Kelapa", gram: 30 },
  { name: "Kelapa parut", gram: 30 },
  { name: "Lemak sapi", gram: 5 },
];

// Buah-buahan options based on the provided table
export const buahBuahanOptions: FoodOption[] = [
  { name: "Alpukat", gram: 50 },
  { name: "Apel", gram: 75 },
  { name: "Belimbing", gram: 125 },
  { name: "Duku", gram: 75 },
  { name: "Jambu air", gram: 100 },
  { name: "Jambu biji", gram: 100 },
  { name: "Jeruk manis", gram: 100 },
  { name: "Mangga", gram: 50 },
  { name: "Nanas", gram: 75 },
  { name: "Pepaya", gram: 100 },
  { name: "Pir", gram: 100 },
  { name: "Pisang ambon", gram: 50 },
  { name: "Pisang raja", gram: 50 },
  { name: "Semangka", gram: 150 },
];

// Susu options based on the provided table
export const susuOptions: FoodOption[] = [
  { name: "Susu sapi", gram: 200 },
  { name: "Susu Kambing", gram: 150 },
  { name: "Susu kental manis", gram: 100 },
  { name: "Tepung susu skim", gram: 20 },
  { name: "Yoghurt", gram: 200 },
];