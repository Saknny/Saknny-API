export enum ErrorCodeEnum {
  PERMISSION_DENIED = 403,
  NOT_FOUND = 404,
  NOT_ALLOWED = 405,
  UNAUTHORIZED = 600,
  EMAIL_ALREADY_EXISTS = 601,
  PHONE_ALREADY_EXISTS = 602,
  INVALID_CREDENTIALS = 603,
  BLOCKED_USER = 604,
  USER_DOES_NOT_EXIST = 605,
  USER_IS_NOT_VERIFIED = 606,
  VERIFICATION_CODE_NOT_EXIST = 607,
  EXPIRED_VERIFICATION_CODE = 608,
  WRONG_PASSWORD = 609,
  CONFIGURATION_SHOULD_HAS_UNIQUE_KEY = 610,
  CONFIGURATION_NOT_EXISTS = 611,
  NOTIFICATION_DOES_NOT_EXIST = 612,
  USER_PHONE_ALREADY_VERIFIED = 613,
  INCORRECT_DATE = 614,
  FROM_VALUE_HIGHER_THAN_OR_EQUAL_TO_VALUE = 615,
  PROVIDE_AVAILABILITY_FOR_ALL_DAYS = 616,
  SECURITY_GROUP_NAME_ALREADY_EXISTS = 617,
  SECURITY_GROUP_DOES_NOT_EXIST = 618,
  CONFIRM_PASSWORD_DOESN_T_MATCH = 619,
  SAME_OLD_PASSWORD = 650,
  INVALID_EMAIL = 620,
  INVALID_APPOINTMENT_MESSAGE_TYPE = 621,
  BANK_INFORMATION_DOES_NOT_EXIST = 622,
  CONTACT_MESSAGE_NOT_EXIST = 623,
  FAQ_DOES_NOT_EXIST = 624,
  PAYMENT_ERROR = 625,
  STORED_PAYMENT_METHOD_NOT_EXIST = 626,
  CANT_DELETE_SUPER_ADMIN_GROUP = 627,
  USER_NAME_EXISTS = 628,
  UNKNOWN_ERROR = 629,
  ACCOUNT_EXISTS = 630,
  INVALID_PLATFORM = 631,
  PASSWORD_MATCH = 670,
  INVALID_INFO = 732,
  PROVIDED_CREDENTIALS_ALREADY_EXISTS = 733,
  USER_EMAIL_ALREADY_VERIFIED = 734,
  INVALID_EMAIL_OR_PASSWORD = 835,
  REGISTRATION_NOT_COMPLETED = 836,
  INVALID_USER_NAME = 837,
  INVALID_NAME = 838,
  INVALID_PASSWORD = 839,
  ALREADY_HAVE_WEEKLY_PLANER = 840,
  DO_NOT_HAVE_WEEKLY_PLANER = 841,
  INVALID_USER_REMEMBER_THINGS_INPUT = 842,
  INVALID_USER_STRENGTHS_INPUT = 843,
  WEEKLY_PLANER_NOT_EXIST = 844,
  WEEKLY_PLANER_EXPIRED = 845,
  WEEKLY_PLANER_ALREADY_FEEDBACK = 846,
  ACTIONS_FIELD_MUST_BE_THREE = 847,
  YOU_ALLOWED_TO_CHOOSE_PERIOD_OR_END_DATE = 848,
  INVALID_LANGUAGE = 900,
  INVALID_FIRSTNAME = 901,
  INVALID_LASTNAME = 902,
  SOCIAL_ACCOUNT_EXISTS = 903,
  MERGE_UNAUTHORIZED = 904,
  DISCONNECTION_FAILED = 905,
  NO_PASSWORD = 906,
  SAME_OLD_EMAIL = 907,
  INVALID_PHONE_NUMBER = 908,
  INVALID_EMERGENCY_CONTACT = 920,
  THEME_NOT_FOUND = 909,
  ACCOUNT_USED_BY_TOURIST = 910,
  PROVIDER_COMPLETE_REGISTRATION = 911,
  REGISTERATION_REQUEST_ALREADY_EXISTS = 912,
  REQUEST_NOT_FOUND = 913,
  REQUEST_REJECTED = 914,
  REQUEST_PENDING = 915,
  PROVIDER_DOES_NOT_EXIST = 916,
  INVALID_NATIONALITY = 918,
  INVALID_ARABIC_FIRSTNAME = 930,
  INVALID_ARABIC_LASTNAME = 931,
  SAME_OLD_PHONENUMBER = 932,
  USERNAME_ALREADY_EXISTS = 933,
  PROFILE_ALREADY_VERIFIED = 934,
  INVALID_CITY = 935,
  INVALID_STATE = 936,
  INVALID_COUNTRY = 937,
  MISMATCH_ADDRESS = 938,
  INVALID_CURRENT_USERNAME = 939,
  CONFIRM_EMAIL_DOESN_T_MATCH = 940,
  DEPARTMENTS_NOT_FOUND = 941,
  SPECIALITY_NOT_FOUND = 942,
  FACILITY_NOT_FOUND = 943,
  SOCIAL_ACCOUNT_DOESNOT_EXIST = 944,
  USER_IS_NOT_MEMBER = 945,
  MISMATCH_PROVIDER_STRATEGY = 946,
  ADMIN_IN_SECURITY_GROUP = 947,
  INVALID_COMPANY_NAME = 948,
  COMPANY_IS_REQUIRED = 949,
  PASSWORD_LENGTH = 950,
  PASSWORD_PATTERN = 951,
  ACTION_DENIED = 952,
  INVALID_IDENTIFIER = 953,
  STRATEGY_NOT_FOUND = 954,
  BRAND_LOGO_UPLOAD_IS_INVALID = 955,
  SAMPLE_SERVICE_UPLOAD_IS_INVALID = 956,
  SERVICE_ALREADY_EXISTS_IN_BUSINESS_TYPE = 957,
  SERVICE_DOES_NOT_EXIST_IN_BUSINESS_TYPE = 958,
  PROVIDER_NOT_FOUND_OR_NOT_PENDING_NOR_REJECTED = 959,
  PROVIDER_IS_NOT_ACTIVE_YET = 960,
  ADDRESS_NOT_FOUND = 961,
  INCORRECT_PHONE_OR_PASSWORD = 862,
  USER_ALREADY_JOINED_CAMPAIGN = 963,
  REQUEST_ALREADY_ACCEPTED = 964,
  INTERNAL_SERVER_ERROR = 500,
  USERNAME_EXISTS = 965,
  FILE_NEEDED_ERROR = 966,
  FILE_MAX_SIZE_ERROR = 967,
  FILE_EXTENSION_ERROR = 968,
  FILE_MAX_ERROR = 969,
  SENDER_RECEIVER_SAME = 970,
  REQUEST_NOT_PENDING = 971,
  ALREADY_FRIENDS = 972,
  NOT_YOUR_FRIEND = 973,
  EMAIL_EXISTS = 974,
  INVALID_OTP = 975,
  ORGANIZATION_PROFILE_REQUIRED = 976,
  INDIVIDUAL_PROFILE_REQUIRED = 977,
  USER_PROFILE_MiSSING = 978,
  ONBOARDING_ALREADY_COMPLETED = 979,
  CHAT_FORBIDDEN = 980,
  RECEIVER_NOT_FOUND = 981,
  MESSAGE_FORBIDDEN = 982,
  MESSAGE_UPDATE_TIME_EXPIRED = 983,
  CANT_SEND_TO_YOURSELF = 984,
  BAD_ROLE_TYPE = 985,
  TAG_NOT_FOUND = 986,
  INDIVIDUAL_DOES_NOT_EXIST = 987,
  ORGANIZATION_DOES_NOT_EXIST = 988,
  ERROR_IN_PRESETTING_THE_RESOURCE = 989,
  FILE_NOT_FOUND = 999,
  IMAGE_UPLOAD_IS_INVALID = 1000,
  FILE_UPLOAD_IS_INVALID = 1001,
  MISSING_DOWNLOAD_DIRECTORY = 1002,
  PROFILE_NOT_FOUND = 1003,
}
