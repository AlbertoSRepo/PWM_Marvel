// shared/uiHelpers.js
export function updateNavbarCredits(credits) {
  const creditsElement = document.getElementById('user-credits');
  if (creditsElement) {
    creditsElement.textContent = `Crediti: ${credits}`;
  }
  const creditCount = document.getElementById('credit-count');
  if (creditCount) {
    creditCount.textContent = credits;
  }
}

export function showSpinner(spinnerId = 'loading-spinner') {
  const spinner = document.getElementById(spinnerId);
  if (spinner) spinner.style.display = 'block';
}

export function hideSpinner(spinnerId = 'loading-spinner') {
  const spinner = document.getElementById(spinnerId);
  if (spinner) spinner.style.display = 'none';
}

export function toggleContainer(show, containerSelector = '.card-container') {
  const container = document.querySelector(containerSelector);
  if (container) {
    if (show) {
      container.classList.remove('d-none');
    } else {
      container.classList.add('d-none');
    }
  }
}