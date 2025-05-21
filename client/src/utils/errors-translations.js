export const ERROR_TRANSLATIONS = {
  "PET-603": "El email ingresado ya está registrado.",
  "PET-604": "El teléfono ingresado ya está registrado.",
  DEFAULT: "Ha ocurrido un error, volvé a intentarlo.",
};

export const translateError = (error) => {
  const code = error?.code;

  if (code && ERROR_TRANSLATIONS[code]) {
    return ERROR_TRANSLATIONS[code];
  }

  return error?.description || error?.message || ERROR_TRANSLATIONS.DEFAULT;
};
