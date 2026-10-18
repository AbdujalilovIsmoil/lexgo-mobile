// One gradient pair per direction, picked from its id: a direction always keeps its colour, in the grid and on the page.
const TONES: readonly (readonly [string, string])[] = [["#1668F0", "#00CFE8"], ["#7A5CFF", "#B197FC"], ["#00A870", "#5EDDB0"], ["#E0457F", "#FF9AB8"], ["#C2680A", "#F5B455"], ["#0E7FD0", "#7CC7FF"]];

export const serviceTone = (id: string): readonly [string, string] => TONES[[...id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % TONES.length];
