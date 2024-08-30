// TODO: put this somewhere central and create a place where all languages can co-exist :prayge:
// TODO: fix this so it actually represents all available languages in the app / supported by piston api

const js = "js"
const ts = "ts"
const py = "py"
const rb = "rb"
const php = "php"
const cs = "cs"

export const languageKeys = {
    js,
    ts,
    py,
    rb,
    php,
    cs
} as const
export const languageToLabelMap = {
    [js]: "JavaScript",
    [ts]: "TypeScript",
    [py]: "Python",
    [rb]: "Ruby",
    [php]: "PHP",
    [cs]: "C-Sharp"
} as const;
export type Language = keyof typeof languageToLabelMap;
export type LanguageLabel = typeof languageToLabelMap[Language];
export const DEFAULT_LANGUAGE = py;

export function getLanguageLabel(language: Language): LanguageLabel {
    return languageToLabelMap[language];
}
export const languages: Language[] = Object.values(languageKeys)