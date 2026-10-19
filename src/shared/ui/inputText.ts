// Android centres a single-line TextInput's text and placeholder only when the font padding is off and the
// vertical alignment is explicit; otherwise custom fonts (Inter) sit a few px high. iOS ignores both keys.
export const singleLineText = { textAlignVertical: "center", includeFontPadding: false } as const;
export const multiLineText = { textAlignVertical: "top", includeFontPadding: false } as const;
