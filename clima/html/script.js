const form = document.getElementById('form-clima');
const input = document.getElementById('input-cidade');
const erroEl = document.getElementById('erro');
const resultado = document.getElementById('resultado');

const descricoesClima = {
  0: 'Céu limpo',
  1: 'Principalmente limpo',
  2: 'Parcialmente nublado',
  3: 'Nublado',
  45: 'Neblina',
  48: 'Neblina com geada',
  51: 'Garoa fraca',
  53: 'Garoa moderada',
  55: 'Garoa forte',
  61: 'Chuva fraca',
  63: 'Chuva moderada',
  65: 'Chuva forte',
  71: 'Neve fraca',
  73: 'Neve moderada',
  75: 'Neve forte',
  80: 'Pancadas de chuva fracas',
  81: 'Pancadas de chuva moderadas',
  82: 'Pancadas de chuva fortes',
  95: 'Tempestade',
  96: 'Tempestade com granizo',
  99: 'Tempestade forte com granizo'
};

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const cidade = input.value.trim();
  if (!cidade) return;

  erroEl.textContent = '';
  resultado.classList.add('escondido');

  try {
    // Passo 1: transformar o nome da cidade em latitude/longitude
    const geoResposta = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt`
    );
    const geoDados = await geoResposta.json();

    if (!geoDados.results || geoDados.results.length === 0) {
      erroEl.textContent = 'Cidade não encontrada. Tenta digitar de outro jeito.';
      return;
    }

    const { latitude, longitude, name, country } = geoDados.results[0];

    // Passo 2: buscar o clima daquele ponto
    const climaResposta = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    );
    const climaDados = await climaResposta.json();
    const atual = climaDados.current_weather;

    document.getElementById('nome-cidade').textContent = `${name}, ${country}`;
    document.getElementById('temperatura').textContent = `${Math.round(atual.temperature)}°C`;
    document.getElementById('descricao-clima').textContent =
      descricoesClima[atual.weathercode] || 'Condição desconhecida';
    document.getElementById('vento').textContent = `Vento: ${Math.round(atual.windspeed)} km/h`;

    resultado.classList.remove('escondido');
  } catch (erro) {
    erroEl.textContent = 'Não consegui buscar o clima agora. Tenta de novo em instantes.';
  }
});
