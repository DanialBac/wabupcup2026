/**
 * Indonesian Number to Words (Terbilang) Utility
 * Converts numeric amounts into Indonesian spelled-out text (e.g. 350000 -> "Tiga Ratus Lima Puluh Ribu Rupiah")
 */

export function terbilang(n: number): string {
  const num = Math.floor(Math.abs(n));
  if (num === 0) return 'Nol Rupiah';

  function convert(val: number): string {
    const units = [
      '',
      'Satu',
      'Dua',
      'Tiga',
      'Empat',
      'Lima',
      'Enam',
      'Tujuh',
      'Delapan',
      'Sembilan',
      'Sepuluh',
      'Sebelas',
    ];

    if (val < 12) {
      return units[val];
    } else if (val < 20) {
      return convert(val - 10) + ' Belas';
    } else if (val < 100) {
      return convert(Math.floor(val / 10)) + ' Puluh ' + convert(val % 10);
    } else if (val < 200) {
      return 'Seratus ' + convert(val - 100);
    } else if (val < 1000) {
      return convert(Math.floor(val / 100)) + ' Ratus ' + convert(val % 100);
    } else if (val < 2000) {
      return 'Seribu ' + convert(val - 1000);
    } else if (val < 1000000) {
      return convert(Math.floor(val / 1000)) + ' Ribu ' + convert(val % 1000);
    } else if (val < 1000000000) {
      return convert(Math.floor(val / 1000000)) + ' Juta ' + convert(val % 1000000);
    } else if (val < 1000000000000) {
      return convert(Math.floor(val / 1000000000)) + ' Miliar ' + convert(val % 1000000000);
    }
    return val.toString();
  }

  const result = convert(num).replace(/\s+/g, ' ').trim();
  return result + ' Rupiah';
}
