const LANGUAGES_API = "https://emkc.org/api/v2/piston/runtimes";
const EXECUTE_API = "https://emkc.org/api/v2/piston/execute";

let languages = [];

function fetchLanguages() {
  fetch(LANGUAGES_API)
    .then((resp) => resp.json())
    .then((data) => {
      languages = data;
      languages.sort((a, b) => (a.value < b.value ? 1 : -1));
      const languageSelector =
        this.document.getElementById("language-selector");
      languageSelector.innerHTML = "";
      for (const obj of languages) {
        let option = document.createElement("option");
        option.text = obj.language[0].toUpperCase() + obj.language.substring(1);
        option.value = obj.language;
        if (option.value == preferredLanguage) option.defaultSelected = true;
        languageSelector.add(option);
      }
    });
}

function executeCode(code, selectedLanguage, stdin) {
  let languageVersion = languages.find(
    (x) => x.language == selectedLanguage
  ).version;

  let codeRunRequest = {
    language: selectedLanguage,
    version: languageVersion,
    files: [
      {
        content: code,
      },
    ],
    stdin: stdin,
  };
  return fetch(EXECUTE_API, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(codeRunRequest),
  });
}
