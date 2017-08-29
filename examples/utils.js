export function addTemplate({ html = '', title = '', description = '' }) {
  const root = document.getElementById('root');
  const template = document.createElement('div');
  const h2 = document.createElement('h2');
  const p = document.createElement('p');

  h2.innerHTML = title;
  p.innerHTML = description;
  template.innerHTML = html;
  root.appendChild(h2);
  root.appendChild(p);
  root.appendChild(template);

  const train = template.querySelector('.train');
  const track = template.querySelector('.track');
  const cars = [...template.querySelectorAll('.car')];

  return {
    root: template,
    train,
    track,
    cars,
  };
}
