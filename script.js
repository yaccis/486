const themeToggle = document.getElementById('theme-toggle');

const savedTheme = localStorage.getItem('kami-theme');
if (savedTheme === 'dark') document.body.classList.add('dark');

function updateThemeButton() {
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '☼' : '◐';
  themeToggle.setAttribute('aria-label', isDark ? '切换到浅色主题' : '切换到深色主题');
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('kami-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  updateThemeButton();
});

updateThemeButton();
