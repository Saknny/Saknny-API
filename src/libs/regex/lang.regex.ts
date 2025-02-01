export const LangRegex = /^[\u0600-\u065F\u066A-\u06EF\u06FA-\u06FFa-zA-Z ]+$/;
// Arabic and English Characters only
export const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[_#?!@$%^&*-]).{8,}$/; // at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and 8 characters long
export const ENLangRegex = /^[a-zA-Z\s]*$/; // English Characters, Spaces
export const ARLangRegex = /^[\u0600-\u06FF\s]*$/; // Arabic Characters, Spaces
export const EmailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const AlphaNumRegex = /^[\u0621-\u064Aa-zA-Z0-9]+$/;
