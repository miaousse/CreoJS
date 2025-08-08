// Get the current page filename
const currentPage = window.location.pathname.split('/').pop();

const navContainer = document.getElementById('main-navbar');
const navDiv = document.createElement('div');
navDiv.className = 'nav-buttons';

navButtons.forEach(btn => {
  const button = document.createElement('button');
  button.id = btn.id;
  button.className = 'actionButton';
  button.textContent = btn.label;

  if (btn.href === currentPage) {
    button.disabled = true; // Disable if it's the current page
  } else {
    button.onclick = () => window.location.href = btn.href;
  }

  navDiv.appendChild(button);
});

navContainer.appendChild(navDiv);
