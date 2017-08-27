export function addTemplate(templateString = '', title = '', description = '') {
  const root = document.getElementById('root');
  const div = document.createElement('div');
  const h2 = document.createElement('h2');
  const p = document.createElement('p');

  h2.innerHTML = title;
  p.innerHTML = description;
  div.innerHTML = templateString;
  root.appendChild(h2);
  root.appendChild(p);
  root.appendChild(div);

  return div;
}
