const BASE_URL = "https://www.dnd5eapi.co";

function checkResponse(res) {
  if (!res.ok) {
    return Promise.reject(`Error: ${res.status}`);
  }

  return res.json();
}

export function getSpells({ level = "", school = "" } = {}) {
  const params = new URLSearchParams();

  if (level !== "") {
    params.append("level", level);
  }

  if (school !== "") {
    params.append("school", school);
  }

  const queryString = params.toString();
  const url = `${BASE_URL}/api/2014/spells${queryString ? `?${queryString}` : ""}`;

  return fetch(url).then(checkResponse);
}

export function getSpellDetails(index) {
  return fetch(`${BASE_URL}/api/2014/spells/${index}`).then(checkResponse);
}
