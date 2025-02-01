/**
 * @description
 * Languages in the form of a ISO 639-1 language code with optional
 * region or script modifier (e.g. de_AT). The selection available is based
 * on the [Unicode CLDR summary list](https://unicode-org.github.io/cldr-staging/charts/37/summary/root.html)
 * and includes the major spoken languages of the world and any widely-used variants.
 *
 * @docsCategory common
 */
export enum LangEnum {
  /** Afrikaans */
  AF = 'AF',
  /** Akan */
  AK = 'AK',
  /** Amharic */
  AM = 'AM',
  /** Arabic */
  AR = 'AR',
  /** Assamese */
  AS = 'AS',
  /** Azerbaijani */
  AZ = 'AZ',
  /** Belarusian */
  BE = 'BE',
  /** Bulgarian */
  BG = 'BG',
  /** Bambara */
  BM = 'BM',
  /** Bangla */
  BN = 'BN',
  /** Tibetan */
  BO = 'BO',
  /** Breton */
  BR = 'BR',
  /** Bosnian */
  BS = 'BS',
  /** Catalan */
  CA = 'CA',
  /** Chechen */
  CE = 'CE',
  /** Corsican */
  CO = 'CO',
  /** Czech */
  CS = 'CS',
  /** Church Slavic */
  CU = 'CU',
  /** Welsh */
  CY = 'CY',
  /** Danish */
  DA = 'DA',
  /** German */
  DE = 'DE',
  /** Austrian German */
  DE_AT = 'DE_AT',
  /** Swiss High German */
  DE_CH = 'DE_CH',
  /** Dzongkha */
  DZ = 'DZ',
  /** Ewe */
  EE = 'EE',
  /** Greek */
  EL = 'EL',
  /** English */
  EN = 'EN',
  /** Australian English */
  EN_AU = 'EN_AU',
  /** Canadian English */
  EN_CA = 'EN_CA',
  /** British English */
  EN_GB = 'EN_GB',
  /** American English */
  EN_US = 'EN_US',
  /** Esperanto */
  EO = 'EO',
  /** Spanish */
  ES = 'ES',
  /** European Spanish */
  ES_ES = 'ES_ES',
  /** Mexican Spanish */
  ES_MX = 'ES_MX',
  /** Estonian */
  ET = 'ET',
  /** Basque */
  EU = 'EU',
  /** Persian */
  FA = 'FA',
  /** Dari */
  FA_AF = 'FA_AF',
  /** Fulah */
  FF = 'FF',
  /** Finnish */
  FI = 'FI',
  /** Faroese */
  FO = 'FO',
  /** French */
  FR = 'FR',
  /** Canadian French */
  FR_CA = 'FR_CA',
  /** Swiss French */
  FR_CH = 'FR_CH',
  /** Western Frisian */
  FY = 'FY',
  /** Irish */
  GA = 'GA',
  /** Scottish Gaelic */
  GD = 'GD',
  /** Galician */
  GL = 'GL',
  /** Gujarati */
  GU = 'GU',
  /** Manx */
  GV = 'GV',
  /** Hausa */
  HA = 'HA',
  /** Hebrew */
  HE = 'HE',
  /** Hindi */
  HI = 'HI',
  /** Croatian */
  HR = 'HR',
  /** Haitian Creole */
  HT = 'HT',
  /** Hungarian */
  HU = 'HU',
  /** Armenian */
  HY = 'HY',
  /** Interlingua */
  IA = 'IA',
  /** Indonesian */
  ID = 'ID',
  /** Igbo */
  IG = 'IG',
  /** Sichuan Yi */
  II = 'II',
  /** Icelandic */
  IS = 'IS',
  /** Italian */
  IT = 'IT',
  /** Japanese */
  JA = 'JA',
  /** Javanese */
  JV = 'JV',
  /** Georgian */
  KA = 'KA',
  /** Kikuyu */
  KI = 'KI',
  /** Kazakh */
  KK = 'KK',
  /** Kalaallisut */
  KL = 'KL',
  /** Khmer */
  KM = 'KM',
  /** Kannada */
  KN = 'KN',
  /** Korean */
  KO = 'KO',
  /** Kashmiri */
  KS = 'KS',
  /** Kurdish */
  KU = 'KU',
  /** Cornish */
  KW = 'KW',
  /** Kyrgyz */
  KY = 'KY',
  /** Latin */
  LA = 'LA',
  /** Luxembourgish */
  LB = 'LB',
  /** Ganda */
  LG = 'LG',
  /** Lingala */
  LN = 'LN',
  /** Lao */
  LO = 'LO',
  /** Lithuanian */
  LT = 'LT',
  /** Luba-Katanga */
  LU = 'LU',
  /** Latvian */
  LV = 'LV',
  /** Malagasy */
  MG = 'MG',
  /** Maori */
  MI = 'MI',
  /** Macedonian */
  MK = 'MK',
  /** Malayalam */
  ML = 'ML',
  /** Mongolian */
  MN = 'MN',
  /** Marathi */
  MR = 'MR',
  /** Malay */
  MS = 'MS',
  /** Maltese */
  MT = 'MT',
  /** Burmese */
  MY = 'MY',
  /** Norwegian Bokmål */
  NB = 'NB',
  /** North Ndebele */
  ND = 'ND',
  /** Nepali */
  NE = 'NE',
  /** Dutch */
  NL = 'NL',
  /** Flemish */
  NL_BE = 'NL_BE',
  /** Norwegian Nynorsk */
  NN = 'NN',
  /** Nyanja */
  NY = 'NY',
  /** Oromo */
  OM = 'OM',
  /** Odia */
  OR = 'OR',
  /** Ossetic */
  OS = 'OS',
  /** Punjabi */
  PA = 'PA',
  /** Polish */
  PL = 'PL',
  /** Pashto */
  PS = 'PS',
  /** Portuguese */
  PT = 'PT',
  /** Brazilian Portuguese */
  PT_BR = 'PT_BR',
  /** European Portuguese */
  PT_PT = 'PT_PT',
  /** Quechua */
  QU = 'QU',
  /** Romansh */
  RM = 'RM',
  /** Rundi */
  RN = 'RN',
  /** Romanian */
  RO = 'RO',
  /** Moldavian */
  RO_MD = 'RO_MD',
  /** Russian */
  RU = 'RU',
  /** Kinyarwanda */
  RW = 'RW',
  /** Sanskrit */
  SA = 'SA',
  /** Sindhi */
  SD = 'SD',
  /** Northern Sami */
  SE = 'SE',
  /** Sango */
  SG = 'SG',
  /** Sinhala */
  SI = 'SI',
  /** Slovak */
  SK = 'SK',
  /** Slovenian */
  SL = 'SL',
  /** Samoan */
  SM = 'SM',
  /** Shona */
  SN = 'SN',
  /** Somali */
  SO = 'SO',
  /** Albanian */
  SQ = 'SQ',
  /** Serbian */
  SR = 'SR',
  /** Southern Sotho */
  ST = 'ST',
  /** Sundanese */
  SU = 'SU',
  /** Swedish */
  SV = 'SV',
  /** Swahili */
  SW = 'SW',
  /** Congo Swahili */
  SW_CD = 'SW_CD',
  /** Tamil */
  TA = 'TA',
  /** Telugu */
  TE = 'TE',
  /** Tajik */
  TG = 'TG',
  /** Thai */
  TH = 'TH',
  /** Tigrinya */
  TI = 'TI',
  /** Turkmen */
  TK = 'TK',
  /** Tongan */
  TO = 'TO',
  /** Turkish */
  TR = 'TR',
  /** Tatar */
  TT = 'TT',
  /** Uyghur */
  UG = 'UG',
  /** Ukrainian */
  UK = 'UK',
  /** Urdu */
  UR = 'UR',
  /** Uzbek */
  UZ = 'UZ',
  /** Vietnamese */
  VI = 'VI',
  /** Volapük */
  VO = 'VO',
  /** Wolof */
  WO = 'WO',
  /** Xhosa */
  XH = 'XH',
  /** Yiddish */
  YI = 'YI',
  /** Yoruba */
  YO = 'YO',
  /** Chinese */
  ZH = 'ZH',
  /** Simplified Chinese */
  ZH_HANS = 'ZH_HANS',
  /** Traditional Chinese */
  ZH_HANT = 'ZH_HANT',
  /** Zulu */
  ZU = 'ZU',
}
