/* *
 * We create a language strings object containing all of our strings.
 * The keys for each string will then be referenced in our code, e.g. handlerInput.t('WELCOME_MSG').
 * The localisation interceptor in index.js will automatically choose the strings
 * that match the request's locale.
 * */

module.exports = {
  en: {
    translation: {
      WELCOME_MSG:
        'Welcome to Colchester Bin Collection. You can ask me what bin day it is this week',
      HELLO_MSG: 'Hello World!',
      HELP_MSG: 'You can say hello to me! How can I help?',
      GOODBYE_MSG: 'Goodbye!',
      REFLECTOR_MSG: 'You just triggered {{intentName}}',
      FALLBACK_MSG:
        "Sorry, this is a bit rubbish but I don't know what you said",
      ERROR_MSG:
        'Sorry, this is a bit rubbish but I had trouble doing what you asked. Please try again.',
    },
  },
};
