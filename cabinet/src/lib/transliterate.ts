// Uzbek Latin → Kirill transliteratsiya
const DIGRAPHS: [string, string][] = [
  ["O'", 'Ў'], ["G'", 'Ғ'], ["Sh", 'Ш'], ["Ch", 'Ч'],
  ["SH", 'Ш'], ["CH", 'Ч'], ["NG", 'НГ'],
  ["o'", 'ў'], ["g'", 'ғ'], ["sh", 'ш'], ["ch", 'ч'], ["ng", 'нг'],
];

const SINGLES: Record<string, string> = {
  A:'А', B:'Б', D:'Д', E:'Е', F:'Ф', G:'Г', H:'Ҳ', I:'И', J:'Ж',
  K:'К', L:'Л', M:'М', N:'Н', O:'О', P:'П', Q:'Қ', R:'Р', S:'С',
  T:'Т', U:'У', V:'В', X:'Х', Y:'Й', Z:'З',
  a:'а', b:'б', d:'д', e:'е', f:'ф', g:'г', h:'ҳ', i:'и', j:'ж',
  k:'к', l:'л', m:'м', n:'н', o:'о', p:'п', q:'қ', r:'р', s:'с',
  t:'т', u:'у', v:'в', x:'х', y:'й', z:'з',
  "'": 'ъ',
};

export function latinToKrill(text: string): string {
  let result = '';
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const [lat, kril] of DIGRAPHS) {
      if (text.startsWith(lat, i)) {
        result += kril;
        i += lat.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += SINGLES[text[i]] ?? text[i];
      i++;
    }
  }
  return result;
}
